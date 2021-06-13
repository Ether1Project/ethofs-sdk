module.exports = function waitForReceipt(client, hash) {
    const fetchReceipt = (resolve, reject) => {
        client.web3.eth.getTransactionReceipt(hash)
            .then((txResult) => {
                console.log('Checking for Receipt');
                if (txResult) {
                    if (txResult.status) resolve(txResult);
                    else reject(new Error(`There was an unknown Error in the TX. Hash: ${txResult.transactionHash}`));
                } else {
                    setTimeout(() => {
                        fetchReceipt(resolve, reject);
                    }, 5000);
                }
            })
            .catch(reject);
    };

    return new Promise((resolve, reject) => {
        fetchReceipt(resolve, reject);
    });
};
