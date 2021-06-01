module.exports = function signAndSendTx(client, tx, privateKey) {
    return new Promise((resolve, reject) => {
        client.web3.eth.accounts.signTransaction(tx, privateKey)
            .then((signedTransactionData) => {
                client.web3.eth.sendSignedTransaction(signedTransactionData.rawTransaction)
                    .then((result) => {
                        if (result.status) resolve(result.transactionHash);
                        else reject(new Error(`There was an unknown Error sending signed TX. Hash: ${result.transactionHash}`));
                    })
                    .catch(reject);
            })
            .catch(reject);
    });
};
