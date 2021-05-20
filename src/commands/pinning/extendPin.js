import { baseUrl, controllerContractAddress, controllerABI, configContractAddress, configContractABI } from './../../constants';
import { validateEthofsKey, validateEthofsOptions, validateEthofsConnections } from '../../util/validators';
import Web3 from 'web3';

export default function extendPin(ethofsKey, hostingContractAddress, options) {

    var endpoint = `${baseUrl}`;

    validateEthofsKey(ethofsKey);

    if (options && options.connections) {
        validateEthofsConnections(options.connections);
    }

    if (options && options.connections && options.connections.rpc) {
        endpoint = options.connections.rpc;
    }

    if (!hostingContractAddress) {
        throw new Error('hostingContractAddress value is required for removing an upload contract from ethoFS');
    }

    if (options) {
        if (options.ethofsOptions) {
            validateEthofsOptions(options.ethofsOptions);
        }
    }

    const web3 = new Web3(endpoint);

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

    async function getEthofsContentSize(ethofsContract, hostingContractAddress) {

        return await ethofsContract.methods.GetHostingContractStorageUsed(hostingContractAddress).call();
    };

    async function getEthofsUploadCost() {

        var ethofsConfig = new web3.eth.Contract(configContractABI, configContractAddress);

        return await ethofsConfig.methods.uintMap(0).call();
    };

    return new Promise((resolve, reject) => {

        web3.eth.net.isListening()
        .then(function () {

            var account = web3.eth.accounts.privateKeyToAccount('0x' + ethofsKey);
            var privateKey = '0x' + ethofsKey;
            var ethofsContract = new web3.eth.Contract(controllerABI, controllerContractAddress);

            web3.eth.accounts.wallet.add(account);
            web3.eth.defaultAccount = account.address;

            getEthofsContentSize(ethofsContract, hostingContractAddress).then((result) => {

                getEthofsUploadCost().then((hostingCost) => {

                    var extensionCost = calculateContractCost(result, options.ethofsOptions.hostingContractDuration, hostingCost);

                    const tx = {
                        to: controllerContractAddress,
                        from: web3.eth.defaultAccount,
                        value: extensionCost,
                        gas: 6000000,
                        data: ethofsContract.methods.ExtendContract(hostingContractAddress, options.ethofsOptions.hostingContractDuration).encodeABI()
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
                                                        ethoTxHash: ethoResult
                                                    });
                                                });
                                            } else {
                                                reject(new Error('There was a problem extending hosting contract'));
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
            });
        }).catch((error) => {
            reject(error);
        });

    });
}
