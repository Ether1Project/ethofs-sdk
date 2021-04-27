import { baseUrl, configContractAddress, configContractABI } from './../../constants';
import { validateEthofsOptions } from '../../util/validators';
import Web3 from 'web3';

export default function calculateCost(options) {

    var web3 = new Web3(`${baseUrl}`);

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
