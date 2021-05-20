import { baseUrl, controllerContractAddress, controllerABI } from './../../constants';
import { validateEthofsKey, validateEthofsConnections } from '../../util/validators';
import Web3 from 'web3';

export default function testAuthentication(ethofsKey, connections) {

    var endpoint = `${baseUrl}`;

    validateEthofsKey(ethofsKey);

    if (connections) {
        validateEthofsConnections(connections);
    }

    //  test authentication to make sure that the user's provided keys are legit

    if (connections && connections.rpc) {
        endpoint = connections.rpc;
    }

    return new Promise((resolve, reject) => {

        var web3 = new Web3(endpoint);

        web3.eth.net.isListening()
            .then(function () {

            var account = web3.eth.accounts.privateKeyToAccount('0x' + ethofsKey);
            var ethoFSAccounts = new web3.eth.Contract(controllerABI, controllerContractAddress);

            web3.eth.accounts.wallet.add(account);
            web3.eth.defaultAccount = account.address;

            ethoFSAccounts.methods.CheckAccountExistence(web3.eth.defaultAccount).call(function (error, result) {
                if (!error) {
                    if (result) {
                        resolve({
                            authenticated: true
                        });
                    } else {
                        reject(new Error('ethoFS User Not Found'));
                    }
                } else {
                    reject(new Error('Ether-1 RPC Access Error: ${error}'));
                }
            });
        });
    });
};
