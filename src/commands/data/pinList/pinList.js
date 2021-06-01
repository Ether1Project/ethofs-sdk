const { validateEthofsDataFilter } = require('../../../util/validators');

module.exports = function pinList(client, options) {
    if (options) {
        if (options.ethofsDataFilter) {
            validateEthofsDataFilter(options.ethofsDataFilter);
        }
    }

    async function getEthofsUploadContract(hostingContractAddress) {
        const contractData = {
            address: hostingContractAddress,
            data: await client.ethoFSContract.methods.GetHostingContractName(hostingContractAddress).call(),
            ipfsHash: await client.ethoFSContract.methods.GetMainContentHash(hostingContractAddress).call(),
            initiationBlock: await client.ethoFSContract.methods.GetHostingContractDeployedBlockHeight(hostingContractAddress).call(),
            expirationBlock: await client.ethoFSContract.methods.GetHostingContractExpirationBlockHeight(hostingContractAddress).call()
        };

        return await contractData;
    };

    return new Promise((resolve, reject) => {
        client.accountExists()
            .then((exists) => {
                if (exists) {
                    client.ethoFSContract.methods.GetUserAccountTotalContractCount(client.web3.eth.defaultAccount).call((error, contractCount) => {
                        if (!error) {
                            if (contractCount) {
                                const uploadContractArray = [];

                                let expiredContractCount = 0;

                                let filteredContractCount = 0;

                                if (contractCount === 0) resolve(uploadContractArray);

                                for (let contractIndex = 0; contractIndex < contractCount; contractIndex++) {
                                    client.ethoFSContract.methods.GetHostingContractAddress(client.web3.eth.defaultAccount, contractIndex).call()
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

                                                    if (uploadContractArray.length >= (contractCount - (expiredContractCount + filteredContractCount))) {
                                                        resolve(uploadContractArray);
                                                    }
                                                });
                                        })
                                        .catch(reject);

                                }
                            } else reject(new Error('ethoFS User Not Found'));
                        } else reject(new Error(`Ether-1 RPC Access Error: ${error}`));
                    })
                    .catch(console.log);
                } else reject(new Error('ethoFS User Not Found'));
            })
            .catch(reject);
    });
};
