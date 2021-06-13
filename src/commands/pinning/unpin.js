const { controllerContractAddress } = require('./../../constants');
const isInitialized = require('../../util/isInitialized');
const waitForReceipt = require('../../util/waitForReciept');
const signAndSendTx = require('../../util/signAndSendTx');

module.exports = function unpin(client, privateKey, hostingContractAddress) {
    isInitialized(client);
    if (!hostingContractAddress) throw new Error('hostingContractAddress value is required for removing an upload contract from ethoFS');

    const getEthofsContentHash = () => new Promise((resolve, reject) => {
        client.ethoFSContract.methods.GetMainContentHash(hostingContractAddress).call()
            .then(resolve)
            .catch(reject);
    });

    return new Promise((resolve, reject) => {
        client.accountExists()
            .then((exists) => {
                if (exists) {
                    getEthofsContentHash()
                        .then((ipfsHash) => {
                            const tx = {
                                to: controllerContractAddress,
                                from: client.web3.eth.defaultAccount,
                                gas: '6000000',
                                data: client.ethoFSContract.methods.RemoveHostingContract(hostingContractAddress, ipfsHash).encodeABI()
                            };

                            const sendReceipt = (txHash) => {
                                waitForReceipt(client, txHash)
                                    .then((txResult) => {
                                        resolve({
                                            ethoTxHash: txResult.transactionHash
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
                } else reject(new Error('ethoFS User Not Found'));
            })
            .catch(reject);
    });
};
