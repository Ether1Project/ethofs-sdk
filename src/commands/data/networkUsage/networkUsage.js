import { baseUrl, pinStorageABI, pinStorageContractAddress } from './../../../constants';
import Web3 from 'web3';

export default function networkUsage() {

var web3 = new Web3(`${baseUrl}`);

    return new Promise((resolve, reject) => {

        web3.eth.net.isListening()
            .then(function () {

            var ethofsContract = new web3.eth.Contract(pinStorageABI, pinStorageContractAddress);

            ethofsContract.methods.PinCount.call(function (error, pinCount) {
                if (!error) {
                    if (pinCount) {
                        resolve({
                            activeUploadContracts: pinCount
                        });
                    } else {
                        reject(error);
                    }
                } else {
                    reject(error);
                }
            });
        }).catch(function (error) {
            reject(error);
        });
    });
}
