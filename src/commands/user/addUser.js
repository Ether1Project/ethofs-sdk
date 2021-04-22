import { baseUrl, controllerContractAddress, controllerABI } from './../../constants';
import { validateEthofsKey } from '../../util/validators';
import Web3 from 'web3';

export default function addUser(ethofsKey, userName) {

    var web3 = new Web3(`${baseUrl}`);

    validateEthofsKey(ethofsKey);

    if (!userName) {
        throw new Error('User name is required for registering a new ethoFS upload address');
    }

    function waitForReceipt(hash, cb) {
        web3.eth.getTransactionReceipt(hash, function (err, receipt) {
            web3.eth.getBlock('latest', function (e, res) {
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
                    waitForReceipt(hash, cb);
                }, 5000);
            }
        });
    }

    return new Promise((resolve, reject) => {

        web3.eth.net.isListening()
        .then(function () {

            var account = web3.eth.accounts.privateKeyToAccount('0x' + ethofsKey);
            var privateKey = '0x' + ethofsKey;
            var ethofsContract = new web3.eth.Contract(controllerABI, controllerContractAddress);

            web3.eth.accounts.wallet.add(account);
            web3.eth.defaultAccount = account.address;

            const tx = {
                to: controllerContractAddress,
                from: web3.eth.defaultAccount,
                gas: 3000000,
                data: ethofsContract.methods.AddNewUserPublic(userName).encodeABI()
            };

            ethofsContract.methods.CheckAccountExistence(web3.eth.defaultAccount).call(function (error, ethofsResult) {
                if (!error) {
                    if (ethofsResult) {

                        reject(new Error('ethoFS User Already Exists'));

                    } else {

                        web3.eth.accounts.signTransaction(tx, privateKey)
                        .then(function (signedTransactionData) {
                            web3.eth.sendSignedTransaction(signedTransactionData.rawTransaction, function (error, ethoResult) {
                                if (!error) {
                                    if (ethoResult) {
                                        waitForReceipt(ethoResult, function (receipt) {
                                            resolve({
                                                ethoTxHash: ethoResult
                                            });
                                        });
                                    } else {
                                        reject(new Error('There was a problem adding new user'));
                                    }
                                } else {
                                    reject(error);
                                }
                            });
                        });
                    }
                } else {
                    reject(new Error('Ether-1 RPC Access Error: ${error}'));
                }
            });
        }).catch((error) => {
            reject(error);
        });
    });
}
