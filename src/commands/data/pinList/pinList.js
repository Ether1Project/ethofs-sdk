const { validateEthofsDataFilter } = require('../../../util/validators');

module.exports = function pinList(client, options) {
    if (options) {
        if (options.ethofsDataFilter) {
            validateEthofsDataFilter(options.ethofsDataFilter);
        }
    }

    const getEthofsUploadContract = (hostingContractAddress) => new Promise((resolve, reject) => {
        const contractData = {
            address: hostingContractAddress,
            data: null,
            ipfsHash: null,
            initiationBlock: null,
            expirationBlock: null
        };

        Promise.all([
            client.ethoFSContract.methods.GetHostingContractName(hostingContractAddress).call()
                .then((result) => {
                    contractData.data = result;
                })
                .catch(reject),
            client.ethoFSContract.methods.GetMainContentHash(hostingContractAddress).call()
                .then((result) => {
                    contractData.ipfsHash = result;
                })
                .catch(reject),
            client.ethoFSContract.methods.GetHostingContractDeployedBlockHeight(hostingContractAddress).call()
                .then((result) => {
                    contractData.initiationBlock = result;
                })
                .catch(reject),
            client.ethoFSContract.methods.GetHostingContractExpirationBlockHeight(hostingContractAddress).call()
                .then((result) => {
                    contractData.expirationBlock = result;
                })
                .catch(reject)
        ])
            .then(() => {
                resolve(contractData);
            })
            .catch(reject);
    });

    return new Promise((resolve, reject) => {
        client.accountExists()
            .then((exists) => {
                if (exists) {
                    client.ethoFSContract.methods.GetUserAccountTotalContractCount(client.web3.eth.defaultAccount).call()
                        .then((contractCount) => {
                            const conLength = Number(contractCount);

                            if (conLength < 1) resolve([]);
                            else {
                                const promiseArray = new Array(conLength);

                                for (let index = 0; index < conLength; index++) {
                                    promiseArray[index] = client.ethoFSContract.methods.GetHostingContractAddress(client.web3.eth.defaultAccount, index).call()
                                        .then((result) => {
                                            promiseArray[index] = result;
                                        })
                                        .catch(reject);
                                }

                                Promise.all(promiseArray)
                                    .then(() => {
                                        promiseArray.forEach((hostingContractAddress, index) => {
                                            promiseArray[index] = getEthofsUploadContract(hostingContractAddress)
                                                .then((result) => {
                                                    promiseArray[index] = result;
                                                })
                                                .catch(reject);
                                        });
                                        Promise.all(promiseArray)
                                            .then(() => {
                                                resolve(promiseArray);
                                                let expiredContractCount = 0;

                                                let filteredContractCount = 0;

                                                const resultArray = [];

                                                promiseArray.forEach((result) => {
                                                    if (result.expirationBlock === '0') expiredContractCount++;
                                                    else if (options && (options.ethofsDataFilter)) {
                                                        let filteredContract = false;

                                                        try {
                                                            const data = JSON.parse(result.data);

                                                            for (const property in options.ethofsDataFilter) {
                                                                if (filteredContract) break;

                                                                if (String(options.ethofsDataFilter[property]) === String(data[property])) {
                                                                    resultArray.push(result);
                                                                    filteredContract = true;
                                                                    break;
                                                                } else {
                                                                    for (const key in options.property) {
                                                                        if (String(options.ethofsDataFilter[property][key]) === String(data[property][key])) {
                                                                            resultArray.push(result);
                                                                            filteredContract = true;
                                                                            break;
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        } catch {}

                                                        if (!filteredContract) filteredContractCount++;
                                                    } else resultArray.push(result);
                                                });

                                                if (resultArray.length >= (contractCount - (expiredContractCount + filteredContractCount))) resolve(resultArray);
                                                else reject('Unable to retrieve any contracts against provided filters.');
                                            })
                                            .catch(reject);
                                    })
                                    .catch(reject);
                            };
                        })
                        .catch(reject);
                } else reject(new Error('ethoFS User Not Found'));
            })
            .catch(reject);
    });
};
