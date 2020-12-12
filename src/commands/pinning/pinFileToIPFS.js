//import axios from 'axios';
import ipfsClient from 'ipfs-http-client';
import { apiBaseUrl, baseUrl, controllerContractAddress, controllerABI } from './../../constants';
//import NodeFormData from 'form-data';
import stream from 'stream';
//import { validateEthofsKey, validateMetadata, validateEthofsOptions } from '../../util/validators';
import { validateEthofsKey } from '../../util/validators';
import Web3 from 'web3';

//export default function pinFileToIPFS(ethofsKey, readStream, options) {
export default function pinFileToIPFS(ethofsKey, readStream, hostingContractName) {

    var web3 = new Web3(`${baseUrl}`);
    var minimumContractCost = 10000000000000000;
    var hostingCost = 1.0;
    var hostingCostWei = hostingCost * 1000000000000000000;
    var hostingContractDuration = 100000;

    validateEthofsKey(ethofsKey);

    const apiEndpoint = `${apiBaseUrl}`;
    const ipfs = ipfsClient({host: apiEndpoint, port: '5001', protocol: 'https'});

    async function uploadToIPFS(readStream) {

        return await ipfs.add(readStream);

    };
    function waitForReceipt(hash, cb) {
        web3.eth.getTransactionReceipt(hash, function (err, receipt) {
            console.log('Waiting For Transaction Confirmation');
            web3.eth.getBlock('latest', function (e, res) {
                if (!e) {
                    console.log('New ETHO Block Received - Block Number: ' + res.number);
                }
            });
            if (err) {
                console.log('Error connecting to Ether-1 Network: ' + err);
                console.error(err);
            }
            if (receipt !== null) {
                console.log('Ether-1 transaction has been confirmed');
                if (cb) {
                    cb(receipt);
                }
            } else {
                setTimeout(function () {
                    waitForReceipt(hash, cb);
                }, 10000);
            }
        });
    }
    function calculateCost(contractSize, contractDuration, hostingCost) {
        var cost = ((((contractSize / 1048576) * hostingCost) * (contractDuration / 46522)));

        if (cost < minimumContractCost) {
            cost = minimumContractCost;
        }
        return cost;
    }

    return new Promise((resolve, reject) => {

        if (!(readStream instanceof stream.Readable)) {
            reject(new Error('readStream is not a readable stream'));
        }

        uploadToIPFS(readStream).then((result) => {

            console.log('Path: ' + result.path.toString());
            console.log('Size: ' + result.size.toString());
            console.log('Name: ' + hostingContractName);
            console.log('Duration: ' + hostingContractDuration.toString());

            web3.eth.net.isListening()
            .then(function () {

                var account = web3.eth.accounts.privateKeyToAccount('0x' + ethofsKey);
                var privateKey = '0x' + ethofsKey;
                var ethofsContract = new web3.eth.Contract(controllerABI, controllerContractAddress);
                var contentHashString = 'ethoFSPinningChannel_alpha11:' + result.path.toString();
                var contentPathString = 'ethoFSPinningChannel_alpha11:';
                var contractCost = calculateCost(result.size, hostingContractDuration, hostingCostWei);

                console.log('ContentHashString: ' + contentHashString);
                console.log('ContentPathString: ' + contentPathString);

                web3.eth.accounts.wallet.add(account);
                web3.eth.defaultAccount = account.address;

                const tx = {
                    to: controllerContractAddress,
                    from: web3.eth.defaultAccount,
                    value: contractCost,
                    gas: 6000000,
                    data: ethofsContract.methods.AddNewContract(result.path.toString(), hostingContractName, hostingContractDuration, result.size.toString(), result.size.toString(), contentHashString, contentPathString).encodeABI()
                };

                ethofsContract.methods.CheckAccountExistence(web3.eth.defaultAccount).call(function (error, ethofsResult) {
                    if (!error) {
                        if (ethofsResult) {
                            //console.log('ethoFS User Found');
                            /*resolve({
                                authenticated: true
                            });*/
                            web3.eth.accounts.signTransaction(tx, privateKey)
                            .then(function (signedTransactionData) {
                                web3.eth.sendSignedTransaction(signedTransactionData.rawTransaction, function (error, result) {
                                    if (!error) {
                                        if (result) {
                                            waitForReceipt(result, function (receipt) {
                                                console.log('Transaction Has Been Mined: ' + receipt);
                                                resolve(result);
                                            });
                                        } else {
                                            console.log('There was a problem adding new contract');
                                        }
                                    } else {
                                        console.error(error);
                                    }
                                });
                            });
                        } else {
                            //console.log('ethoFS User Not Found');
                            reject(new Error('ethoFS User Not Found'));
                        }
                    } else {
                        //console.log('Ether-1 RPC Access Error');
                        reject(new Error('Ether-1 RPC Access Error: ${error}'));
                        //reject(new Error('Ether-1 RPC Access Error'));
                    }
                });
            });
        }).catch((error) => {
            reject(error);
        });
    });
}
