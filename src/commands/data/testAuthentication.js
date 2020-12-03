import axios from 'axios';
import { baseUrl, controllerContractAddress, controllerABI } from './../../constants';
import {validateApiKeys} from '../../util/validators';

export default function testAuthentication(ethofsKey) {
    validateEthofsKey(ethofsKey);
    
    //  test authentication to make sure that the user's provided keys are legit
    const endpoint = `${baseUrl}`;

    return new Promise((resolve, reject) => {
        var web3 = new Web3(endpoint);
        web3.eth.net.isListening()
            .then(function() {
                let account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
                web3.eth.accounts.wallet.add(account)
                web3.eth.defaultAccount = account.address
            
                var ethoFSAccounts = new web3.eth.Contract(GlobalControllerABI, GlobalControllerContractAddress);            
                ethoFSAccounts.methods.CheckAccountExistence(web3.eth.defaultAccount).call(function(error, result) {
                    if (!error) {
                        if (result) {
                            console.log("ethoFS User Found");
                            resolve({
                                authenticated: true
                            });
                        } else {
                            console.log("ethoFS User Not Found");
                            reject(new Error(`ethoFS User Not Found`));
                        }
                    } else {
                        console.log("Ether-1 RPC Access Error");
                        reject(new Error(`Ether-1 RPC Access Error: ${error}`));
                    }
                });
            });
    });
};
