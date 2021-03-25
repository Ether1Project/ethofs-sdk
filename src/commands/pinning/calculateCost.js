import stream from 'stream';
import { validateEthofsOptions } from '../../util/validators';

export default function calculateCost(readStream, options) {

    var minimumContractCost = 10000000000000000;
    var hostingCost = 1.0;
    var hostingCostWei = hostingCost * 1000000000000000000;

    if (options) {
        if (options.ethofsOptions) {
            validateEthofsOptions(options.ethofsOptions);
        }
    }

    function calculateContractCost(contractSize, contractDuration, hostingCost) {
        var cost = ((((contractSize / 1048576) * hostingCost) * (contractDuration / 46522)));

        if (cost < minimumContractCost) {
            cost = minimumContractCost;
        }
        return cost;
    }

    return new Promise((resolve, reject) => {

        var totalSize = 0;

        if (!(readStream instanceof stream.Readable)) {
            reject(new Error('readStream is not a readable stream'));
        }

        readStream.on('readable', () => {
            let chunk;

            while ((chunk = readStream.read()) !== null) {
                totalSize += chunk.length;
                console.log(`Read ${chunk.length} bytes of data...`);
            }
        });

        readStream.on('end', () => {
            console.log('Reached end of stream.');
            let costEstimate = calculateContractCost(totalSize, options.ethofsOptions.hostingContractDuration, hostingCostWei);

            resolve({
                uploadSize: totalSize,
                uploadDuration: options.ethofsOptions.hostingContractDuration,
                uploadCost: costEstimate
            });
        });
    });
}
