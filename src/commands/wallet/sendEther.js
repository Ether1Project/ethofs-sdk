const isInitialized = require('../../util/isInitialized');
const waitForReceipt = require('../../util/waitForReciept');
const signAndSendTx = require('../../util/signAndSendTx');

module.exports = function sendEther(client, privateKey, options) {
    isInitialized(client);

    if (!options) throw new Error('options not defined');
    if (options) {
        if (!options.to) throw new Error('options.to is not defined');
        if (!options.value) throw new Error('options.value is not defined');
    }

    return new Promise((resolve, reject) => {
        client.web3.eth.net.isListening()
            .then(() => {
                const valueTX = client.web3.utils.toWei(String(options.value), 'ether');

                const tx = {
                    from: client.web3.eth.defaultAccount,
                    to: options.to,
                    value: client.web3.utils.toHex(valueTX),
                    gas: 21000,
                    chainId: '1313114',
                    networkId: '1313114'
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

                    client.providerMM.request({ method: 'eth_sendTransaction', params: [tx]})
                        .then(sendReceipt)
                        .catch(reject);

                } else {
                    signAndSendTx(client, tx, privateKey)
                        .then(sendReceipt)
                        .catch(reject);
                }
            })
            .catch(reject);
    });
};
