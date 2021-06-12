const { controllerContractAddress } = require('./../../constants');
const { validateEthofsData } = require('../../util/validators');
const isInitialized = require('../../util/isInitialized');
const waitForReceipt = require('../../util/waitForReciept');
const signAndSendTx = require('../../util/signAndSendTx');

module.exports = function pinFileToIPFS(client, privateKey, readStream, options) {
    isInitialized(client);
    let data;

    if (options) {
        if (options.ethofsData) {
            validateEthofsData(options.ethofsData);
            data = JSON.stringify(options.ethofsData);
        }
    }

    return new Promise((resolve, reject) => {
        client.accountExists()
            .then((exists) => {
                if (exists) {
                    client.ipfs.add(readStream)
                        .then((result) => {
                            const contentHashString = 'ethoFSPinningChannel_alpha11:' + result.path.toString();
                            const contentPathString = 'ethoFSPinningChannel_alpha11:';

                            client.calculateCost({
                                ethofsOptions: {
                                    hostingContractDuration: options.ethofsOptions.hostingContractDuration,
                                    hostingContractSize: result.size
                                }
                            })
                                .then(({ uploadCost }) => {
                                    const tx = {
                                        to: controllerContractAddress,
                                        from: client.web3.eth.defaultAccount,
                                        value: String(uploadCost),
                                        gas: '6000000',
                                        data: client.ethoFSContract.methods.AddNewContract(result.path.toString(), data, options.ethofsOptions.hostingContractDuration, result.size.toString(), result.size.toString(), contentHashString, contentPathString).encodeABI()
                                    };

                                    const sendReceipt = (txHash) => {
                                        waitForReceipt(client, txHash)
                                            .then((result) => {
                                                resolve(Object.assign(result, {
                                                    ethoTxHash: result.transactionHash,
                                                    ipfsHash: result.path,
                                                    uploadCost: uploadCost,
                                                    initiationBlock: result.blockNumber,
                                                    expirationBlock: (result.blockNumber + options.ethofsOptions.hostingContractDuration)
                                                }));
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
