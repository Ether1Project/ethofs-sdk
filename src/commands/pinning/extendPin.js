const { controllerContractAddress } = require('./../../constants');
const { validateEthofsOptions } = require('../../util/validators');
const isInitialized = require('../../util/isInitialized');
const waitForReceipt = require('../../util/waitForReciept');
const signAndSendTx = require('../../util/signAndSendTx');

module.exports = function extendPin(client, privateKey, hostingContractAddress, options) {
    isInitialized(client);

    if (!hostingContractAddress) throw new Error('hostingContractAddress value is required for removing an upload contract from ethoFS');

    if (options) {
        if (options.ethofsOptions) {
            validateEthofsOptions(options.ethofsOptions);
        }
    }

    return new Promise((resolve, reject) => {
        client.accountExists()
            .then((exists) => {
                if (exists) {
                    client.ethoFSContract.methods.GetHostingContractStorageUsed(hostingContractAddress).call()
                        .then((result) => {
                            client.calculateCost({
                                ethofsOptions: {
                                    hostingContractDuration: options.ethofsOptions.hostingContractDuration,
                                    hostingContractSize: result
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
                                            .then((result) => {
                                                resolve({
                                                    ethoTxHash: result.transactionHash,
                                                    extensionCost,
                                                    initiationBlock: result.blockNumber,
                                                    expirationBlock: (result.blockNumber + options.ethofsOptions.hostingContractDuration)
                                                });
                                            })
                                            .catch(reject);
                                    };

                                    if (client.metamask) {
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
