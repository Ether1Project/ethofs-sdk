const { controllerContractAddress } = require('./../../constants');
const isInitialized = require('../../util/isInitialized');
const waitForReceipt = require('../../util/waitForReciept');
const signAndSendTx = require('../../util/signAndSendTx');

module.exports = function addUser(client, privateKey, userName) {
    isInitialized(client);
    if (!userName) throw new Error('User name is required for registering a new ethoFS upload address');

    return new Promise((resolve, reject) => {
        client.accountExists()
            .then((exists) => {
                if (exists) reject(new Error('ethoFS User Already Exists'));
                else {
                    const tx = {
                        to: controllerContractAddress,
                        from: client.web3.eth.defaultAccount,
                        gas: 3000000,
                        data: client.ethoFSContract.methods.AddNewUserPublic(userName).encodeABI()
                    };

                    const sendReceipt = (txHash) => {
                        waitForReceipt(client, txHash, function () {
                            resolve({ ethoTxHash: txHash });
                        });
                    };

                    if (client.metamask) {
                        delete tx.gas;

                        client.providerMM.request({ method: 'eth_signTransaction', params: tx})
                            .then(sendReceipt)
                            .catch(reject);

                    } else {
                        signAndSendTx(client, tx, privateKey)
                            .then(sendReceipt)
                            .catch(reject);
                    }
                }
            })
            .catch(reject);
    });
};
