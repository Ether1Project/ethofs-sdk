/* eslint-disable newline-after-var */
const initMetaMask = require('./commands/init/metmask');
const initPrivateKey = require('./commands/init/privateKey');

const calculateCost = require('./commands/pinning/calculateCost');
const nodeLocations = require('./commands/data/networkStats/nodeLocations');
const networkStats = require('./commands/data/networkStats/networkStats');

const accountExists = require('./commands/user/accountExists');
const addUser = require('./commands/user/addUser');
const updateUser = require('./commands/user/updateUser');
const getBalance = require('./commands/data/getBalance');
const sendEther = require('./commands/wallet/sendEther');
const testAuthentication = require('./commands/data/testAuthentication');

const pinList = require('./commands/data/pinList/pinList');
const pinFileToIPFS = require('./commands/pinning/pinFileToIPFS');
const pinFolderToIPFS = require('./commands/pinning/pinFolderToIPFS');
const unpin = require('./commands/pinning/unpin');
const extendPin = require('./commands/pinning/extendPin');

let privateKey = null;

const client = {
    // Work without Init
    calculateCost: (options) => calculateCost(client, options),
    nodeLocations: nodeLocations,
    networkStats: networkStats,

    // Init SDK
    init: (ethoKey, connections) => new Promise((resolve, reject) => {
        // Store Private Key for future reference
        if (ethoKey) {
            const lowerCaseKey = ethoKey.toLowerCase();
            privateKey = lowerCaseKey.indexOf('0x') > -1 ? lowerCaseKey : `0x${lowerCaseKey}`;
            ethoKey = lowerCaseKey.indexOf('0x') === 0 ? String(ethoKey).substr(2) : lowerCaseKey;
        }

        try {
            if (window) {
                if (!ethoKey) {
                    if (window.ethereum) {
                        initMetaMask(client, connections)
                            .then(resolve)
                            .catch(reject);
                    } else reject(new Error('Please install an Ethereum-compatible browser or MetaMask extension or provide ethoFSKey.'));
                } else {
                    initPrivateKey(client, ethoKey, connections);
                    resolve(true);
                }
            }
        } catch {
            initPrivateKey(client, ethoKey, connections);
            resolve(true);
        }
    }),

    // Work Only After Init
    accountExists: () => accountExists(client),
    addUser: (userName) => addUser(client, privateKey, userName),
    updateUser: (userName) => updateUser(client, privateKey, userName),
    getBalance: () => getBalance(client),
    getWalletAddress: () => client.web3.eth.defaultAccount,
    sendEther: (options) => sendEther(client, privateKey, options),
    testAuthentication: () => testAuthentication(client),

    // Work Only After Init and AddUser
    pinList: (filters) => pinList(client, filters),
    pinFileToIPFS: (readableStream, options) => pinFileToIPFS(client, privateKey, readableStream, options),
    pinFolderToIPFS: (readableStream, options) => pinFolderToIPFS(client, privateKey, readableStream, options),
    pinFromFS: (sourcePath, options) => require('./commands/pinning/pinFromFS')(client, sourcePath, options),
    unpin: (uploadContractAddress) => unpin(client, privateKey, uploadContractAddress),
    extendPin: (uploadContractAddress, options) => extendPin(client, privateKey, uploadContractAddress, options)
};

module.exports = client;
