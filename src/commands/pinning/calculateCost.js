const Web3 = require('web3');

const { baseUrl, configContractAddress, configContractABI } = require('./../../constants');
const { validateEthofsOptions } = require('../../util/validators');

module.exports = function calculateCost(client, options) {
    if (options) {
        if (options.ethofsOptions) {
            validateEthofsOptions(options.ethofsOptions);
        }
    }
    const web3 = client.web3 || new Web3(baseUrl);

    const calculateContractCost = (contractSize, contractDuration, hostingCost) => {
        const cost = ((((contractSize / 1048576) * hostingCost) * (contractDuration / 46522)));

        return Math.round(cost);
    };

    const getEthofsUploadCost = () => new Promise((resolve, reject) => {
        const ethofsConfig = new web3.eth.Contract(configContractABI, configContractAddress);

        ethofsConfig.methods.uintMap(0).call()
            .then(resolve)
            .catch(reject);
    });

    return new Promise((resolve, reject) => {
        getEthofsUploadCost()
            .then((hostingCost) => {
                const costEstimate = calculateContractCost(options.ethofsOptions.hostingContractSize + 8, options.ethofsOptions.hostingContractDuration, hostingCost);
                const extensionCost = calculateContractCost(options.ethofsOptions.hostingContractSize, options.ethofsOptions.hostingContractDuration, hostingCost);

                resolve({
                    // Upload
                    uploadSize: options.ethofsOptions.hostingContractSize + 8,
                    uploadDuration: options.ethofsOptions.hostingContractDuration,
                    uploadCost: costEstimate,

                    // Extension
                    extensionSize: options.ethofsOptions.hostingContractSize,
                    extensionDuration: options.ethofsOptions.hostingContractDuration,
                    extensionCost
                });
            })
            .catch(reject);
    });
};
