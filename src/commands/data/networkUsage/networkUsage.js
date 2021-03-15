import { baseUrl, pinStorageABI, pinStorageContractAddress } from './../../../constants';
import Web3 from 'web3';

export default function networkUsage() {

var web3 = new Web3(`${baseUrl}`);

    return new Promise((resolve, reject) => {
        //console.log('Entering Promise');
        web3.eth.net.isListening()
            .then(function () {
            var ethofsContract = new web3.eth.Contract(pinStorageABI, pinStorageContractAddress);
            var totalNetworkStorageUsed = 0;
            var pinCount;
            var responseCount = 0;
            var i;

            //console.log('ETHO RPC Is Listening');
            //console.log('Contract Found');
            ethofsContract.methods.PinCount().call().then(response => {
                //console.log(response);
                if (response) {
                    pinCount = response;
                    for (i = 0; i < pinCount; i++) {
                        ethofsContract.methods.Pins(i).call().then(response => {
                            ethofsContract.methods.GetPinSize(response).call().then(response => {
                                totalNetworkStorageUsed += response;
                                responseCount++;
                                if (responseCount >= (pinCount - 1)) {
                                    resolve({
                                        activeUploadContracts: pinCount,
                                        totalNetworkStorageUsed: totalNetworkStorageUsed
                                    });
                                }
                            });
                        });
                    }
                } else {
                    console.log('Error retrieving contract data');
                    reject('Error retrieving contract data');
                }
            }).catch(function (error) {
                    reject(error);
            });
        }).catch(function (error) {
            reject(error);
        });
    });
}
