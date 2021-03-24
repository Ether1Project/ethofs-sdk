import { validateEthofsKey, validateEthofsDataFilter } from '../../../util/validators';
import { baseUrl, controllerContractAddress, controllerABI } from '../../../constants';
import Web3 from 'web3';

export default function pinList(ethofsKey, options) {

    var web3 = new Web3(`${baseUrl}`);

    validateEthofsKey(ethofsKey);

    if (options) {
        if (options.ethofsDataFilter) {
            validateEthofsDataFilter(options.ethofsDataFilter);
        }
    }

    async function getEthofsUploadContract(ethofsContract, hostingContractAddress) {

        const contractData = {
            address: hostingContractAddress,
            data: await ethofsContract.methods.GetHostingContractName(hostingContractAddress).call(),
            ipfsHash: await ethofsContract.methods.GetMainContentHash(hostingContractAddress).call(),
            uploadBlock: await ethofsContract.methods.GetHostingContractDeployedBlockHeight(hostingContractAddress).call(),
            expirationBlock: await ethofsContract.methods.GetHostingContractExpirationBlockHeight(hostingContractAddress).call()
        };

        return await contractData;
    };

    return new Promise((resolve, reject) => {

        web3.eth.net.isListening()
            .then(function () {

            var account = web3.eth.accounts.privateKeyToAccount('0x' + ethofsKey);
            var ethofsContract = new web3.eth.Contract(controllerABI, controllerContractAddress);

            const uploadContractArray = [];

            web3.eth.accounts.wallet.add(account);
            web3.eth.defaultAccount = account.address;

            ethofsContract.methods.GetUserAccountTotalContractCount(web3.eth.defaultAccount).call(function (error, contractCount) {
                if (!error) {
                    if (contractCount) {

                        let expiredContractCount = 0;

                        let filteredContractCount = 0;

                        if (contractCount === 0) {
                            resolve(uploadContractArray);
                        }

                        for (let contractIndex = 0; contractIndex < contractCount; contractIndex++) {

                            ethofsContract.methods.GetHostingContractAddress(web3.eth.defaultAccount, contractIndex).call().then((hostingContractAddress) => {
                                getEthofsUploadContract(ethofsContract, hostingContractAddress).then((result) => {
                                    if (result.expirationBlock === '0') { // contract is deleted/expired

                                        expiredContractCount++;

                                    } else if (options.ethofsDataFilter) {

                                        let filteredContract = false;

                                        let data;

                                        try {
                                            data = JSON.parse(result.data);

                                            for (const property in options.ethofsDataFilter) {
                                                if (filteredContract) { break; }
                                                if (`${options.ethofsDataFilter[property]}` === `${data[property]}`) {
                                                    uploadContractArray.push(result);
                                                    filteredContract = true;
                                                    break;
                                                } else {
                                                    for (const key in options.property) {
                                                        if (`${options.ethofsDataFilter[property][key]}` === `${data[property][key]}`) {
                                                            uploadContractArray.push(result);
                                                            filteredContract = true;
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
                                        } catch (e) {

                                        }

                                        if (!filteredContract) {
                                            filteredContractCount++;
                                        }
                                    } else {

                                        uploadContractArray.push(result);

                                    }

                                    if (uploadContractArray.length >= (contractCount - (expiredContractCount + filteredContractCount))) {

                                        resolve(uploadContractArray);
                                    }
                                });
                            });

                        }
                    } else {
                        reject(new Error('ethoFS User Not Found'));
                    }
                } else {
                    reject(new Error('Ether-1 RPC Access Error: ${error}'));
                }
            });
        });
    });
}
