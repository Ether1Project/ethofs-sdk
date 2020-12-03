import axios from 'axios';
import { baseUrl } from './../../constants';
import { validateApiKeys, validateMetadata } from '../../util/validators';
import isIPFS from 'is-ipfs';

export default function pinByHash(ethofsKey, hashToPin, options) {
    validateEthofsKey(ethofsKey);

    if (!hashToPin) {
        throw new Error('hashToPin value is required for pinning by hash');
    }
    if (!isIPFS.cid(hashToPin)) {
        throw new Error('hashToPin value is an invalid IPFS CID');
    }

    const endpoint = `${baseUrl}/pinning/pinByHash`;
    const body = {
        hashToPin: hashToPin,
        ethofsOptions: {}
    };

    if (options) {
        if (options.ethofsOptions) {
            body.ethofsOptions = options.ethofsOptions;
        }
        if (options.ethofsMetadata) {
            validateMetadata(options.ethofsMetadata);
            body.ethofsMetadata = options.ethofsMetadata;
        }
    }

    return new Promise((resolve, reject) => {
        axios.post(
            endpoint,
            body,
            {
                withCredentials: true,
                headers: {
                    'ethofs_key': ethofsKey
                }
            }).then(function (result) {
            if (result.status !== 200) {
                reject(new Error(`unknown server response while adding to pin queue: ${result}`));
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
