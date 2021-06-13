const { controllerContractAddress } = require('./../../constants');
const isInitialized = require('../../util/isInitialized');
const waitForReceipt = require('../../util/waitForReciept');
const signAndSendTx = require('../../util/signAndSendTx');

module.exports = function extendPin(client, privateKey, hostingContractAddress, options) {
    isInitialized(client);

    if (!hostingContractAddress) throw new Error('hostingContractAddress value is required for removing an upload contract from ethoFS');

    return new Promise((resolve, reject) => {
        client.accountExists()
            .then((exists) => {
                if (exists) {
                    client.ethoFSContract.methods.GetHostingContractStorageUsed(hostingContractAddress).call()
                        .then((result) => {
                            client.calculateCost({
                                ethofsOptions: {
                                    hostingContractDuration: options.ethofsOptions.hostingContractDuration,
                                    hostingContractSize: Number(result)
                                }
                            })
                                .then(({ extensionCost }) => {

                                    const tx = {
                                        to: controllerContractAddress,
                                        from: client.web3.eth.defaultAccount,
                                        value: String(extensionCost),
                                        gas: '6000000',
                                        data: client.ethoFSContract.methods.ExtendContract(hostingContractAddress, options.ethofsOptions.hostingContractDuration).encodeABI()
                                    };

                                    const sendReceipt = (txHash) => {
                                        waitForReceipt(client, txHash)
                                            .then((txResult) => {
                                                resolve({
                                                    ethoTxHash: txResult.transactionHash,
                                                    extensionCost: extensionCost,
                                                    initiationBlock: txResult.blockNumber,
                                                    expirationBlock: (txResult.blockNumber + options.ethofsOptions.hostingContractDuration)
                                                });
                                            })
                                            .catch(reject);
                                    };

                                    if (client.providerMM) {
                                        delete tx.gas;

                                        client.providerMM.request({ method: 'eth_sendTransaction', params: [tx] })
                                            .then(sendReceipt)
                                            .catch(reject);
                                    } else {
                                        signAndSendTx(client, tx, privateKey)
                                            .then(sendReceipt)
                                            .catch(reject);
                                    }
                                })
                                .catch(reject);
                        })
                        .catch(reject);
                } else reject(new Error('ethoFS User Not Found'));
            })
            .catch(reject);
    });
};
