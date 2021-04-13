import { hostingCost } from './../../constants';
import { validateEthofsOptions } from '../../util/validators';

export default function calculateCost(readStream, options) {

    var hostingCostWei = hostingCost * 1000000000000000000;

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

        return cost;
    }

    return new Promise((resolve, reject) => {

        let costEstimate = calculateContractCost(options.ethofsOptions.hostingContractSize, options.ethofsOptions.hostingContractDuration, hostingCostWei);

        resolve({
            uploadSize: options.ethofsOptions.hostingContractSize,
            uploadDuration: options.ethofsOptions.hostingContractDuration,
            uploadCost: costEstimate
        });
    });
}
