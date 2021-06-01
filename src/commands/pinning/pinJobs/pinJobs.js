const axios = require('axios');

const { baseUrl } = require('./../../../constants');
const { validateEthofsKey } = require('../../../util/validators');
const queryBuilder = require('./queryBuilder');

module.exports = function pinJobs(client, ethofsKey, filters) {
    if (client.metamask) throw new Error('Metamask does not provide private key, hence, this method is not supported in MetaMask mode');

    validateEthofsKey(ethofsKey);

    let endpoint = `${baseUrl}/pinning/pinJobs`;

    if (filters) endpoint = queryBuilder(endpoint, filters);

    return new Promise((resolve, reject) => {
        axios.get(endpoint,
        {
            withCredentials: true,
            headers: {
                'ethofs_key': ethofsKey
            }
        })
            .then(function (result) {
                if (result.status !== 200) reject(new Error(`unknown server response while attempting to retrieve pin jobs: ${result}`));
                resolve(result.data);
            })
            .catch(function (error) {
                //  handle error here
                if (error && error.response && error.response && error.response.data && error.response.data.error) {
                    reject(new Error(error.response.data.error));
                } else reject(error);
            });
    });
};
