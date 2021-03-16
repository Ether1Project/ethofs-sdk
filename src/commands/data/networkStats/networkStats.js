import axios from 'axios';
//import { baseUrl } from './../../../constants';

export default function networkStats() {

    const endpoint = 'https://api.ether1.org/ethofsapi.php?api=network_stats';

    return new Promise((resolve, reject) => {
        axios.get(endpoint).then(function (result) {
            if (result.status !== 200) {
                reject(new Error(`unknown server response while attempting to retrieve network stats: ${result}`));
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
