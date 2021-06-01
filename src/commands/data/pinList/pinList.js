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
                            contractCount = Number(contractCount);
                            const uploadContractArray = [];

                            if (contractCount === 0) resolve(uploadContractArray);
                            else if (contractCount > 0) {
                                let expiredContractCount = 0;

                                let filteredContractCount = 0;

                                Promise.all(new Array(contractCount)
                                    .map((i, contractIndex) => {
                                        return client.ethoFSContract.methods.GetHostingContractAddress(client.web3.eth.defaultAccount, contractIndex).call()
                                            .then((hostingContractAddress) => {
                                                getEthofsUploadContract(hostingContractAddress)
                                                    .then((result) => {
                                                        if (result.expirationBlock === '0') expiredContractCount++;
                                                        else if (options && (options.ethofsDataFilter)) {
                                                            let filteredContract = false;

                                                            try {
                                                                const data = JSON.parse(result.data);

                                                                for (const property in options.ethofsDataFilter) {
                                                                    if (filteredContract) break;

                                                                    if (String(options.ethofsDataFilter[property]) === String(data[property])) {
                                                                        uploadContractArray.push(result);
                                                                        filteredContract = true;
                                                                        break;
                                                                    } else {
                                                                        for (const key in options.property) {
                                                                            if (String(options.ethofsDataFilter[property][key]) === String(data[property][key])) {
                                                                                uploadContractArray.push(result);
                                                                                filteredContract = true;
                                                                                break;
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            } catch {}

                                                            if (!filteredContract) filteredContractCount++;
                                                        } else uploadContractArray.push(result);
                                                    })
                                                    .catch(reject);
                                            })
                                            .catch(reject);
                                    }))
                                        .then(() => {
                                            if (uploadContractArray.length >= (contractCount - (expiredContractCount + filteredContractCount))) resolve(uploadContractArray);
                                            else reject('Unable to retrieve contracts against provided filters. Try filtering to smaller amounts.');
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
