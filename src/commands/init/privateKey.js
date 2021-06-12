const Web3 = require('web3');
const ipfsClient = require('ipfs-http-client');

const { baseUrl, apiBaseUrl, controllerABI, controllerContractAddress } = require('../../constants');
const { validateEthofsKey, validateEthofsConnections } = require('../../util/validators');

module.exports = (client, ethoKey, connections) => {
    validateEthofsKey(ethoKey);

    let endPoint = baseUrl;

    let apiEndpoint = apiBaseUrl;

    if (connections) {
        validateEthofsConnections(connections);
        if (connections.gateway) apiEndpoint = connections.gateway;
    }

    client.web3 = new Web3(endPoint);
    client.ipfs = ipfsClient({ host: apiEndpoint, port: '5001', protocol: 'https' });
    client.ethoFSContract = new client.web3.eth.Contract(controllerABI, controllerContractAddress);

    const account = client.web3.eth.accounts.privateKeyToAccount(`0x${ethoKey}`);

    client.web3.eth.accounts.wallet.add(account);
    client.web3.eth.defaultAccount = account.address;
};
