module.exports = function signAndSendTx(client, tx, privateKey) {
    return new Promise((resolve, reject) => {
        client.web3.eth.accounts.signTransaction(tx, privateKey)
            .then((signedTransactionData) => {
                client.web3.eth.sendSignedTransaction(signedTransactionData.rawTransaction, function (error, ethoResult) {
                    if (!error) {
                        if (ethoResult) resolve(ethoResult);
                        else reject(new Error('There was an unknown Error sending signed TX'));
                    } else reject(error);
                });
            })
            .catch(reject);
    });
};
