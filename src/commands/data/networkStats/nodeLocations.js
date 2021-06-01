const axios = require('axios');

module.exports = function nodeLocations() {
    return new Promise((resolve, reject) => {
        const endpoint = 'https://api.ether1.org/ethofsapi.php?api=node_locations';

        axios.get(endpoint).then((result) => {
            if (result.status !== 200) reject(new Error(`unknown server response while attempting to retrieve node location list: ${result}`));
            resolve(result.data);
        }).catch(function (error) {
            //  handle error here
            if (error && error.response && error.response && error.response.data && error.response.data.error) reject(new Error(error.response.data.error));
            else reject(error);
        });
    });
};
