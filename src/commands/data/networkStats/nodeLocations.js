import axios from 'axios';

export default function nodeLocations() {

    const endpoint = 'https://api.ethoprotocol.com/ethofsapi.php?api=node_locations';

    return new Promise((resolve, reject) => {
        axios.get(endpoint).then(function (result) {
            if (result.status !== 200) {
                reject(new Error(`unknown server response while attempting to retrieve node location list: ${result}`));
            }
            //data = JSON.parse(result.data);
            resolve(result.data);
        }).catch(function (error) {
            //  handle error here
            if (error && error.response && error.response && error.response.data && error.response.data.error) {
                reject(new Error(error.response.data.error));
            } else {
                reject(error);
            }
        });
    });
}
