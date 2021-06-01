const axios = require('axios');

module.exports = function networkStats() {
    return new Promise((resolve, reject) => {
        const endpoint = 'https://api.ether1.org/ethofsapi.php?api=network_stats';

        axios.get(endpoint).then((result) => {
            if (result.status !== 200) reject(new Error(`unknown server response while attempting to retrieve network stats: ${result}`));
            resolve(result.data);
        }).catch(function (error) {
            //  handle error here
            if (error && error.response && error.response && error.response.data && error.response.data.error) reject(new Error(error.response.data.error));
            else reject(error);
        });
    });
};
