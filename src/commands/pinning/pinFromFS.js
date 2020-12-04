import axios from 'axios';
import { baseUrl } from './../../constants';
import NodeFormData from 'form-data';
import {validateEthofsKey, validateMetadata, validateEthofsOptions} from '../../util/validators';
import basePathConverter from 'base-path-converter';
const fs = require('fs');
const recursive = require('recursive-fs');

export default function pinFromFS(ethofsKey, sourcePath, options) {
    validateEthofsKey(ethofsKey);

    return new Promise((resolve, reject) => {
        const endpoint = `${baseUrl}/pinning/pinFileToIPFS`;

        fs.lstat(sourcePath, (err, stats) => {
            if (err) {
                reject(err);
            }
            if (stats.isFile()) {
                //we need to create a single read stream instead of reading the directory recursively
                const data = new NodeFormData();

                data.append('file', fs.createReadStream(sourcePath));

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
                        maxContentLength: 'Infinity', //this is needed to prevent axios from erroring out with large directories
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
                    if (error && error.response && error.response && error.response.data && error.response.data.error) {
                        reject(new Error(error.response.data.error));
                    } else {
                        reject(error);
                    }
                });
            } else {
                recursive.readdirr(sourcePath, function (err, dirs, files) {
                    if (err) {
                        reject(new Error(err));
                    }

                    let data = new NodeFormData();

                    files.forEach((file) => {
                        //for each file stream, we need to include the correct relative file path
                        data.append('file', fs.createReadStream(file), {
                            filepath: basePathConverter(sourcePath, file)
                        });
                    });

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
                            maxContentLength: 'Infinity', //this is needed to prevent axios from erroring out with large directories
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
                        if (error && error.response && error.response && error.response.data && error.response.data.error) {
                            reject(new Error(error.response.data.error));
                        } else {
                            reject(error);
                        }
                    });
                });
            }
        });
    });
}
