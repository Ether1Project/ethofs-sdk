import ipfsClient from 'ipfs-http-client';
import { hostingCost, apiBaseUrl, baseUrl, controllerContractAddress, controllerABI } from './../../constants';
import { validateEthofsKey, validateEthofsData, validateEthofsOptions } from '../../util/validators';
import Web3 from 'web3';
const fs = require('fs');
const bs58 = require('bs58');
const path = require('path');

export default function pinFromFS(ethofsKey, sourcePath, options) {

    var web3 = new Web3(`${baseUrl}`);
    var hostingCostWei = hostingCost * 1000000000000000000;
    var data;

    validateEthofsKey(ethofsKey);

    const apiEndpoint = `${apiBaseUrl}`;
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

    async function uploadToIPFS(files) {

        return await ipfs.add(files);

    };

    function waitForReceipt(hash, cb) {
        var currentBlockNumber;

        web3.eth.getTransactionReceipt(hash, function (err, receipt) {
            web3.eth.getBlock('latest', function (e, res) {
                if (!e) {
                }
                currentBlockNumber = res.number;
            });
            if (err) {
                console.log('Error connecting to Ether-1 Network: ' + err);
                console.error(err);
            }
            if (receipt !== null) {
                if (cb) {
                    cb(receipt, currentBlockNumber);
                }
            } else {
                setTimeout(function () {
                    waitForReceipt(hash, cb);
                }, 5000);
            }
        });
    }

    function calculateCost(contractSize, contractDuration, hostingCost) {
        var cost = ((((contractSize / 1048576) * hostingCost) * (contractDuration / 46522)));

        return cost;
    }

    function getAllFiles(dirPath, OriginalPath, ArrayOfFiles) {

        var files = fs.readdirSync(dirPath);
        var arrayOfFiles = ArrayOfFiles || [];
        var originalPath = OriginalPath || path.resolve(dirPath, '..');
        var folder = path.relative(originalPath, path.join(dirPath, '/'));

        arrayOfFiles.push({
            path: folder.replace(/\\/g, '/'),
            mtime: fs.statSync(folder).mtime
        });

        files.forEach(function (file) {
            if (fs.statSync(dirPath + '/' + file).isDirectory()) {
                arrayOfFiles = getAllFiles(dirPath + '/' + file, originalPath, arrayOfFiles);
            } else {
                file = path.join(dirPath, '/', file);

                arrayOfFiles.push({
                    path: path.relative(originalPath, file).replace(/\\/g, '/'),
                    content: fs.readFileSync(file),
                    mtime: fs.statSync(file).mtime
                });
            }
        });

        return arrayOfFiles;
    }

    return new Promise((resolve, reject) => {

        function pinToEthofs(result) {
            web3.eth.net.isListening()
            .then(function () {
                var account = web3.eth.accounts.privateKeyToAccount('0x' + ethofsKey);
                var privateKey = '0x' + ethofsKey;
                var ethofsContract = new web3.eth.Contract(controllerABI, controllerContractAddress);
                var contentHashString = 'ethoFSPinningChannel_alpha11:' + result.path.toString();
                var contentPathString = 'ethoFSPinningChannel_alpha11:';
                var contractCost = calculateCost(result.size, options.ethofsOptions.hostingContractDuration, hostingCostWei);

                web3.eth.accounts.wallet.add(account);
                web3.eth.defaultAccount = account.address;

                const tx = {
                    to: controllerContractAddress,
                    from: web3.eth.defaultAccount,
                    value: contractCost,
                    gas: 6000000,
                    data: ethofsContract.methods.AddNewContract(result.path.toString(), data, options.ethofsOptions.hostingContractDuration, result.size.toString(), result.size.toString(), contentHashString, contentPathString).encodeABI()
                };

                ethofsContract.methods.CheckAccountExistence(web3.eth.defaultAccount).call(function (error, ethofsResult) {
                    if (!error) {
                        if (ethofsResult) {
                            web3.eth.accounts.signTransaction(tx, privateKey)
                            .then(function (signedTransactionData) {
                                web3.eth.sendSignedTransaction(signedTransactionData.rawTransaction, function (error, ethoResult) {
                                    if (!error) {
                                        if (ethoResult) {
                                            waitForReceipt(ethoResult, function (receipt, blockNumber) {
                                                resolve({
                                                    ipfsHash: bs58.encode(result.cid.multihash),
                                                    ethoTxHash: ethoResult,
                                                    uploadCost: contractCost,
                                                    initiationBlock: blockNumber,
                                                    expirationBlock: (blockNumber + options.ethofsOptions.hostingContractDuration)
                                                });
                                            });
                                        } else {
                                            reject(new Error('There was a problem adding new contract'));
                                        }
                                    } else {
                                        reject(error);
                                    }
                                });
                            });
                        } else {
                            reject(new Error('ethoFS User Not Found'));
                        }
                    } else {
                        reject(new Error('Ether-1 RPC Access Error: ${error}'));
                    }
                });
            });
        }

        fs.lstat(sourcePath, (err, stats) => {
            if (err) {
                reject(err);
            }
            if (stats.isFile()) {
                //we need to create a single read stream instead of reading the directory recursively
                let readStream = fs.createReadStream(sourcePath);

                uploadToIPFS(readStream).then((result) => {
                    pinToEthofs(result);
                });

            } else {

                let files = getAllFiles(sourcePath);

                uploadToIPFS(files).then((result) => {
                    pinToEthofs(result);
                });
            }
        });
    });
}
