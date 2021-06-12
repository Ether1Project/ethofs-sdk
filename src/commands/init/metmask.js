const Web3 = require('web3');
const ipfsClient = require('ipfs-http-client');
const detectEthereumProvider = require('@metamask/detect-provider');

const { apiBaseUrl, controllerABI, controllerContractAddress } = require('../../constants');
const { validateEthofsConnections } = require('../../util/validators');

module.exports = (client, connections) => {
    return new Promise((resolve, reject) => {

        let apiEndpoint = apiBaseUrl;

        if (connections) {
            validateEthofsConnections(connections);
            if (connections.gateway) apiEndpoint = connections.gateway;
        }

        client.web3 = new Web3(window.ethereum);
        client.ipfs = ipfsClient({ host: apiEndpoint, port: '5001', protocol: 'https' });
        client.ethoFSContract = new client.web3.eth.Contract(controllerABI, controllerContractAddress);

        detectEthereumProvider()
            .then((providerMM) => {
                client.providerMM = providerMM;

                window.ethereum.enable()
                    .then(() => {
                        client.providerMM.request({ method: 'eth_requestAccounts' })
                            .then((response) => {
                                client.web3.eth.defaultAccount = response[0];

                                resolve(true);
                            }).catch(reject);
                    })
                    .catch(reject);
            })
            .catch(reject);
    });
};
