import axios from 'axios';
import { baseUrl } from './../../constants';
import { validateEthofsKey, validateMetadata } from '../../util/validators';
import isIPFS from 'is-ipfs';

export default function hashMetadata(ethofsKey, ipfsPinHash, metadata) {
    validateEthofsKey(ethofsKey);

    if (!ipfsPinHash) {
        throw new Error('ipfsPinHash value is required for changing the pin policy of a pin');
    }

    if (!isIPFS.cid(ipfsPinHash)) {
        throw new Error('ipfsPinHash value is an invalid IPFS CID');
    }

    if (!metadata) {
        throw new Error('no metadata object provided');
    }

    validateMetadata(metadata);

    const endpoint = `${baseUrl}/pinning/hashMetadata`;
    const body = {
        ipfsPinHash: ipfsPinHash
    };

    if (metadata.name) {
        body.name = metadata.name;
    }

    if (metadata.keyvalues) {
        body.keyvalues = metadata.keyvalues;
    }

    return new Promise((resolve, reject) => {
        axios.put(
            endpoint,
            body,
            {
                withCredentials: true,
                headers: {
                    'ethofs_key': ethofsKey
                }
            }).then(function (result) {
            if (result.status !== 200) {
                reject(new Error(`unknown server response while changing metadata for hash: ${result}`));
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
