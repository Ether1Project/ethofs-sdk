import { baseUrl, configContractAddress, configContractABI } from './../../constants';
import { validateEthofsOptions, validateEthofsConnections } from '../../util/validators';
import Web3 from 'web3';

export default function calculateCost(options) {

    var endpoint = `${baseUrl}`;

    if (options && options.connections) {
        validateEthofsConnections(options.connections);
    }

    if (options && options.connections && options.connections.rpc) {
        endpoint = options.connections.rpc;
    }

    if (!options || !options.ethofsOptions || !options.ethofsOptions.hostingContractSize || !options.ethofsOptions.hostingContractDuration) {
        throw new Error('Properly formatted ethofs options containing hostingContractSize and hostingContractDuration required');
    }

    if (options) {
        if (options.ethofsOptions) {
            validateEthofsOptions(options.ethofsOptions);
        }
    }

    function calculateContractCost(contractSize, contractDuration, hostingCost) {
        var cost = ((((contractSize / 1048576) * hostingCost) * (contractDuration / 46522)));

        return Math.round(cost);
    }

     async function getEthofsUploadCost() {

        var web3 = new Web3(endpoint);
        var ethofsConfig = new web3.eth.Contract(configContractABI, configContractAddress);

        return await ethofsConfig.methods.uintMap(0).call();
    };

    return new Promise((resolve, reject) => {

        getEthofsUploadCost().then((hostingCost) => {

            let costEstimate = calculateContractCost((options.ethofsOptions.hostingContractSize + 8), options.ethofsOptions.hostingContractDuration, hostingCost);

            resolve({
                uploadSize: options.ethofsOptions.hostingContractSize,
                uploadDuration: options.ethofsOptions.hostingContractDuration,
                uploadCost: costEstimate
            });
        });

    });
}
