//import axios from 'axios';
import ipfsClient from 'ipfs-http-client';
import { apiBaseUrl, baseUrl, controllerContractAddress, controllerABI } from './../../constants';
//import NodeFormData from 'form-data';
import stream from 'stream';
//import { validateEthofsKey, validateMetadata, validateEthofsOptions } from '../../util/validators';
import { validateEthofsKey } from '../../util/validators';
import Web3 from 'web3';

//export default function pinFileToIPFS(ethofsKey, readStream, options) {
export default function pinFileToIPFS(ethofsKey, readStream) {
    validateEthofsKey(ethofsKey);

    const endpoint = `${baseUrl}`;
    const apiEndpoint = `${apiBaseUrl}`;
    const ipfs = ipfsClient({host: apiEndpoint, port: '5001', protocol: 'https'});

    async function uploadToIPFS(readStream) {

        return await ipfs.add(readStream);

    };

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
                            //console.log('ethoFS User Found');
                            /*resolve({
                                authenticated: true
                            });*/

                            if (!(readStream instanceof stream.Readable)) {
                                reject(new Error('readStream is not a readable stream'));
                            }

                            uploadToIPFS(readStream).then((result) => {
                                resolve(result);
                            }).catch((error) => {
                                reject(error);
                            });

                        } else {
                            //console.log('ethoFS User Not Found');
                            reject(new Error('ethoFS User Not Found'));
                        }
                    } else {
                        //console.log('Ether-1 RPC Access Error');
                        reject(new Error('Ether-1 RPC Access Error: ${error}'));
                        //reject(new Error('Ether-1 RPC Access Error'));
                    }
                });
            });
    });
}
