import ipfsClient from 'ipfs-http-client';
import { hostingCost, apiBaseUrl, baseUrl, controllerContractAddress, controllerABI } from './../../constants';
import { validateEthofsKey, validateEthofsData, validateEthofsOptions } from '../../util/validators';
import Web3 from 'web3';
const bs58 = require('bs58');

export default function pinFolderToIPFS(ethofsKey, readStream, options) {

    var web3 = new Web3(`${baseUrl}`);
    var hostingCostWei = hostingCost * 1000000000000000000;
    var data;

    validateEthofsKey(ethofsKey);

    const apiEndpoint = `${apiBaseUrl}`;
    const ipfs = ipfsClient({host: apiEndpoint, port: '5001', protocol: 'https'});

    if (options) {
        if (options.ethofsData) {
            validateEthofsData(options.ethofsData);
            data = JSON.stringify(options.ethofsData);
        }
        if (options.ethofsOptions) {
            validateEthofsOptions(options.ethofsOptions);
        }
    }

    async function uploadToIPFS(readStream) {

        return await ipfs.add(readStream);

    };
    function waitForReceipt(hash, cb) {
        web3.eth.getTransactionReceipt(hash, function (err, receipt) {
            web3.eth.getBlock('latest', function (e, res) {
                if (!e) {
                }
            });
            if (err) {
                console.log('Error connecting to Ether-1 Network: ' + err);
                console.error(err);
            }
            if (receipt !== null) {
                if (cb) {
                    cb(receipt);
                }
            } else {
                setTimeout(function () {
                    waitForReceipt(hash, cb);
                }, 5000);
            }
        });
    }
    function calculateContractCost(contractSize, contractDuration, hostingCost) {
        var cost = ((((contractSize / 1048576) * hostingCost) * (contractDuration / 46522)));

        return Math.round(cost);
    }

    return new Promise((resolve, reject) => {

        uploadToIPFS(readStream).then((result) => {

            web3.eth.net.isListening()
            .then(function () {

                var account = web3.eth.accounts.privateKeyToAccount('0x' + ethofsKey);
                var privateKey = '0x' + ethofsKey;
                var ethofsContract = new web3.eth.Contract(controllerABI, controllerContractAddress);
                var contentHashString = 'ethoFSPinningChannel_alpha11:' + result.path.toString();
                var contentPathString = 'ethoFSPinningChannel_alpha11:';
                var contractCost = calculateContractCost(result.size, options.ethofsOptions.hostingContractDuration, hostingCostWei);

                web3.eth.accounts.wallet.add(account);
                web3.eth.defaultAccount = account.address;

                const tx = {
                    to: controllerContractAddress,
                    from: web3.eth.defaultAccount,
                    value: contractCost,
                    gas: 6000000,
                    data: ethofsContract.methods.AddNewContract(result.path.toString(), data, options.ethofsOptions.hostingContractDuration, result.size.toString(), result.size.toString(), contentHashString, contentPathString).encodeABI()
                };

                ethofsContract.methods.CheckAccountExistence(web3.eth.defaultAccount).call(function (error, ethofsResult) {
                    if (!error) {
                        if (ethofsResult) {
                            web3.eth.accounts.signTransaction(tx, privateKey)
                            .then(function (signedTransactionData) {
                                web3.eth.sendSignedTransaction(signedTransactionData.rawTransaction, function (error, ethoResult) {
                                    if (!error) {
                                        if (ethoResult) {
                                            waitForReceipt(ethoResult, function (receipt) {
                                                resolve({
                                                    ipfsHash: bs58.encode(result.cid.multihash),
                                                    ethoTxHash: ethoResult,
                                                    uploadCost: contractCost,
                                                    initiationBlock: receipt.blockNumber,
                                                    expirationBlock: (receipt.blockNumber + options.ethofsOptions.hostingContractDuration)
                                                });
                                            });
                                        } else {
                                            reject(new Error('There was a problem adding new contract'));
                                        }
                                    } else {
                                        reject(error);
                                    }
                                });
                            });
                        } else {
                            reject(new Error('ethoFS User Not Found'));
                        }
                    } else {
                        reject(new Error('Ether-1 RPC Access Error: ${error}'));
                    }
                });
            });
        }).catch((error) => {
            reject(error);
        });
    });
}
