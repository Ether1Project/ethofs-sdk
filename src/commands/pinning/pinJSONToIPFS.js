import axios from 'axios';
import { baseUrl } from './../../constants';
import { validateEthofsKey, validateMetadata, validateEthofsOptions } from '../../util/validators';

export default function pinJSONToIPFS(ethofsKey, body, options) {
    validateEthofsKey(ethofsKey);

    let requestBody = body;

    if (typeof body !== 'object') {
        throw new Error('body must be a valid JSON object');
    }

    if (options) {
        requestBody = {
            ethofsContent: body
        };
        if (options.ethofsMetadata) {
            validateMetadata(options.ethofsMetadata);
            requestBody.ethofsMetadata = options.ethofsMetadata;
        }
        if (options.ethofsOptions) {
            validateEthofsOptions(options.ethofsOptions);
            requestBody.ethofsOptions = options.ethofsOptions;
        }
    }

    const endpoint = `${baseUrl}/pinning/pinJSONToIPFS`;

    return new Promise((resolve, reject) => {
        axios.post(
            endpoint,
            requestBody,
            {
                withCredentials: true,
                headers: {
                    'ethofs_key': ethofsKey
                }
            }).then(function (result) {
            if (result.status !== 200) {
                reject(new Error(`unknown server response while pinning JSON to IPFS: ${result}`));
            }
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
