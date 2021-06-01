const ipfsClient = require('ipfs-http-client');
const bs58 = require('bs58');

const { apiBaseUrl, controllerContractAddress } = require('./../../constants');
const { validateEthofsData, validateEthofsOptions } = require('../../util/validators');
const isInitialized = require('../../util/isInitialized');
const waitForReceipt = require('../../util/waitForReciept');
const signAndSendTx = require('../../util/signAndSendTx');

module.exports = function pinFolderToIPFS(client, privateKey, readStream, options) {
    isInitialized(client);

    let data;

    const apiEndpoint = apiBaseUrl;
    const ipfs = ipfsClient({host: apiEndpoint, port: '5001', protocol: 'https'});

    if (options) {
        if (options.ethofsData) {
            validateEthofsData(options.ethofsData);
            data = JSON.stringify(options.ethofsData);
        }
        if (options.ethofsOptions) {
            validateEthofsOptions(options.ethofsOptions);
        }
    }

    async function uploadToIPFS(readStream) {
        return await ipfs.add(readStream);
    };

    return new Promise((resolve, reject) => {
        client.accountExists()
            .then((exists) => {
                if (exists) {
                    uploadToIPFS(readStream)
                        .then((result) => {
                            var contentHashString = 'ethoFSPinningChannel_alpha11:' + result.path.toString();
                            var contentPathString = 'ethoFSPinningChannel_alpha11:';

                            client.calculateCost({
                                ethofsOptions: {
                                    hostingContractDuration: options.ethofsOptions.hostingContractDuration,
                                    hostingContractSize: result.size
                                }
                            })
                                .then(({ uploadCost }) => {
                                    const tx = {
                                        to: controllerContractAddress,
                                        from: client.web3.eth.defaultAccount,
                                        value: String(uploadCost),
                                        gas: '6000000',
                                        data: client.ethoFSContract.methods.AddNewContract(bs58.encode(result.cid.multihash), data, options.ethofsOptions.hostingContractDuration, result.size.toString(), result.size.toString(), contentHashString, contentPathString).encodeABI()
                                    };

                                    const sendReceipt = (txHash) => {
                                        waitForReceipt(client, txHash, function (receipt) {
                                            resolve({
                                                ipfsHash: bs58.encode(result.cid.multihash),
                                                ethoTxHash: txHash,
                                                uploadCost: uploadCost,
                                                initiationBlock: receipt.blockNumber,
                                                expirationBlock: (receipt.blockNumber + options.ethofsOptions.hostingContractDuration)
                                            });
                                        });
                                    };

                                    if (client.metamask) {
                                        delete tx.gas;

                                        client.providerMM.request({ method: 'eth_sendTransaction', params: [tx] })
                                            .then(sendReceipt)
                                            .catch(reject);
                                    } else {
                                        signAndSendTx(client, tx, privateKey)
                                            .then(sendReceipt)
                                            .catch(reject);
                                    }
                                })
                                .catch(reject);
                        }).catch(reject);
                } else {
                    reject(new Error('ethoFS User Not Found'));
                }
            })
            .catch(reject);
    });
};
