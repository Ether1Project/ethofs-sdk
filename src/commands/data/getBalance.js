module.exports = function (client) {
    return new Promise((resolve, reject) => {
        client.web3.eth.net.isListening()
            .then(function () {
                client.web3.eth.getBalance(client.web3.eth.defaultAccount)
                    .then((result) => {
                        resolve(client.web3.utils.fromWei(String(result), 'ether'));
                    })
                    .catch(reject);;
            })
            .catch(reject);
    });
};
