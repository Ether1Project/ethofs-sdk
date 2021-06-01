module.exports = function waitForReceipt(client, hash, cb) {
    client.web3.eth.getTransactionReceipt(hash, function (err, receipt) {
        client.web3.eth.getBlock('latest', function (e, res) {
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
                waitForReceipt(client, hash, cb);
            }, 5000);
        }
    });
};
