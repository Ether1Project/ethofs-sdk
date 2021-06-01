const isInitialized = require('../../util/isInitialized');

module.exports = function accountExists(client) {
    isInitialized(client);

    return new Promise((resolve, reject) => {
        client.web3.eth.net.isListening()
            .then(() => {
                client.ethoFSContract.methods.CheckAccountExistence(client.web3.eth.defaultAccount).call((error, ethofsResult) => {
                    if (!error) resolve(ethofsResult);
                    else reject(new Error(`Ether-1 RPC Access Error: ${error}`));
                })
                .catch(console.log);
            })
            .catch(reject);
    });
};
