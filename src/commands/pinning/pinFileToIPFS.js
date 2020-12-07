//import axios from 'axios';
import ipfsClient from 'ipfs-http-client';
//import { apiBaseUrl } from './../../constants';
//import NodeFormData from 'form-data';
import stream from 'stream';
//import { validateEthofsKey, validateMetadata, validateEthofsOptions } from '../../util/validators';
import { validateEthofsKey } from '../../util/validators';

//export default function pinFileToIPFS(ethofsKey, readStream, options) {
export default function pinFileToIPFS(ethofsKey, readStream) {
    validateEthofsKey(ethofsKey);

    const ipfs = ipfsClient({host: 'ipfs.infura.io', port: '5001', protocol: 'https'});

    async function uploadToIPFS(readStream) {

        return await ipfs.add(readStream);

    };

    return new Promise((resolve, reject) => {

        if (!(readStream instanceof stream.Readable)) {
            reject(new Error('readStream is not a readable stream'));
        }

        uploadToIPFS(readStream).then((result) => {
            resolve(result);
        }).catch((error) => {
            reject(error);
        });
    });
}
