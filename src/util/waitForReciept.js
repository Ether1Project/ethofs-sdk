module.exports = function waitForReceipt(client, hash) {
    const fetchReceipt = (resolve, reject) => {
        client.web3.eth.getTransactionReceipt(hash)
            .then((result) => {
                console.log('Checking for Receipt');
                if (result) {
                    if (result.status) resolve(result);
                    else reject(new Error(`There was an unknown Error in the TX. Hash: ${result.transactionHash}`));
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
