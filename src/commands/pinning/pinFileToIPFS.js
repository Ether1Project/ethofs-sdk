import axios from 'axios';
import { baseUrl } from './../../constants';
import NodeFormData from 'form-data';
import stream from 'stream';
import {validateEthofsKey, validateMetadata, validateEthofsOptions} from '../../util/validators';

export default function pinFileToIPFS(ethofsKey, readStream, options) {
    validateEthofsKey(ethofsKey);

    return new Promise((resolve, reject) => {

        const data = new NodeFormData();

        data.append('file', readStream);

        const endpoint = `${baseUrl}/pinning/pinFileToIPFS`;

        if (!(readStream instanceof stream.Readable)) {
            reject(new Error('readStream is not a readable stream'));
        }

        if (options) {
            if (options.ethofsMetadata) {
                validateMetadata(options.ethofsMetadata);
                data.append('ethofsMetadata', JSON.stringify(options.ethofsMetadata));
            }
            if (options.ethofsOptions) {
                validateEthofsOptions(options.ethofsOptions);
                data.append('ethofsOptions', JSON.stringify(options.ethofsOptions));
            }
        }

        axios.post(
            endpoint,
            data,
            {
                withCredentials: true,
                maxContentLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
                headers: {
                    'Content-type': `multipart/form-data; boundary= ${data._boundary}`,
                    'ethofs_key': ethofsKey
                }
            }).then(function (result) {
            if (result.status !== 200) {
                reject(new Error(`unknown server response while pinning File to IPFS: ${result}`));
            }
            resolve(result.data);
        }).catch(function (error) {
            //  handle error here
            if (error && error.response && error.response.data && error.response.data.error) {
                reject(new Error(error.response.data.error));
            } else {
                reject(error);
            }
        });
    });
}
