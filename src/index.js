/* eslint-disable newline-after-var */
const Web3 = require('web3');
const detectEthereumProvider = require('@metamask/detect-provider');
const { baseUrl, controllerContractAddress, controllerABI } = require('./constants');
const { validateEthofsKey } = require('./util/validators');

const calculateCost = require('./commands/pinning/calculateCost');
const nodeLocations = require('./commands/data/networkStats/nodeLocations');
const networkStats = require('./commands/data/networkStats/networkStats');

const accountExists = require('./commands/user/accountExists');
const addUser = require('./commands/user/addUser');
const getBalance = require('./commands/data/getBalance');
const sendEther = require('./commands/wallet/sendEther');
const testAuthentication = require('./commands/data/testAuthentication');

const pinList = require('./commands/data/pinList/pinList');
const pinFileToIPFS = require('./commands/pinning/pinFileToIPFS');
const pinFolderToIPFS = require('./commands/pinning/pinFolderToIPFS');
const unpin = require('./commands/pinning/unpin');
const extendPin = require('./commands/pinning/extendPin');
const pinJobs = require('./commands/pinning/pinJobs/pinJobs');

let privateKey = null;
let ethoFSKey = null;

const client = {
    // Work without Init
    calculateCost: (options) => calculateCost(options),
    nodeLocations: nodeLocations,
    networkStats: networkStats,

    // Init SDK
    init: (ethoKey) => new Promise((resolve, reject) => {
        if (!ethoKey) {
            if (window.ethereum) {
                client.web3 = new Web3(window.ethereum);

                detectEthereumProvider()
                    .then((providerMM) => {
                        client.providerMM = providerMM;

                        window.ethereum.enable()
                            .then(() => {
                                client.providerMM.request({ method: 'eth_requestAccounts' })
                                    .then((response) => {
                                        client.web3.eth.defaultAccount = response[0];
                                        client.metamask = true;

                                        client.ethoFSContract = new client.web3.eth.Contract(controllerABI, controllerContractAddress);
                                        resolve(true);
                                    }).catch(reject);
                            })
                            .catch((err) => {
                                if (err.code === -32002) reject(new Error('Please provide Metamask access to site by logging in to your Metamask'));
                                reject(new Error(err));
                            });
                    })
                    .catch(reject);
            } else reject(new Error('Please install an Ethereum-compatible browser or MetaMask extension or provide ethoFSKey.'));
        } else {
            client.web3 = new Web3(baseUrl);
            validateEthofsKey(ethoKey); // Add the minimum and maximum number of digits in client function

            const lowerCaseKey = ethoKey.toLowerCase();

            privateKey = lowerCaseKey.indexOf('0x') > -1 ? lowerCaseKey : `0x${lowerCaseKey}`;
            ethoFSKey = lowerCaseKey.indexOf('0x') > -1 ? lowerCaseKey.substr(2) : lowerCaseKey;

            const account = client.web3.eth.accounts.privateKeyToAccount(privateKey);

            client.web3.eth.accounts.wallet.add(account);
            client.web3.eth.defaultAccount = account.address;

            client.ethoFSContract = new client.web3.eth.Contract(controllerABI, controllerContractAddress);

            resolve(true);
        }
    }),

    // Work Only After Init
    accountExists: () => accountExists(client),
    addUser: (userName) => addUser(client, privateKey, userName),
    getBalance: () => getBalance(client),
    getWalletAddress: () => client.web3.eth.defaultAccount,
    sendEther: (options) => sendEther(client, privateKey, options),
    testAuthentication: () => testAuthentication(client),

    // Work Only After Init and AddUser
    pinList: (filters) => pinList(client, filters),
    pinFileToIPFS: (readableStream, options) => pinFileToIPFS(client, privateKey, readableStream, options),
    pinFolderToIPFS: (readableStream, options) => pinFolderToIPFS(client, privateKey, readableStream, options),
    unpin: (uploadContractAddress) => unpin(client, privateKey, uploadContractAddress),
    extendPin: (uploadContractAddress, options) => extendPin(client, privateKey, uploadContractAddress, options),
    pinJobs: (filters) => pinJobs(client, ethoFSKey, filters)
};

module.exports = client;
