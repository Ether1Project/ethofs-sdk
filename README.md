<div class="bg-gray-dark">
<img src="https://ethofs.com/index/images/logo.png" width="200" />
</div>

# ethoFS SDK

Official NodeJS SDK for [ethoFS](https://ethofs.com)

## Overview

The ethoFS NodeJS SDK provides the quickest / easiest path for interacting with the [ethoFS Network](https://docs.ether1.org/ethofs/ethofs-introduction).

## Installation
```
npm install --save @ethofs/sdk
```

## Setup
To start, simply require the ethoFS SDK and set up an instance with your ethoFS Upload Address/Key. Register a new upload address: [ethoFS Uploads](https://ethofs.com/uploads.html).
```javascript
const ethofsSDK = require('@ethofs/sdk');
const ethofs = ethofsSDK('yourETHOPrivateKey');
```

Quickly test that you can connect to the API with the following call:
```javascript
ethofs.testAuthentication().then((result) => {
    //handle successful authentication here
    console.log(result);
}).catch((err) => {
    //handle error here
    console.log(err);
});
```

## Usage
Once you've set up your instance, using the ethoFS SDK is easy. Simply call your desired function and handle the results of the promise.

* Pinning
  * [pinByHash](#pinByHash-anchor) - WIP
  * [pinFileToIPFS](#pinFileToIPFS-anchor)
  * [pinFromFS](#pinFromFS-anchor)
  * [unpin](#unpin-anchor)

* Data
  * [testAuthentication](#testAuthentication-anchor)
  * [pinList](#pinList-anchor)
<br />

<a name="pinFileToIPFS-anchor"></a>
### `pinFileToIPFS`
Send a file to ethoFS for direct pinning to IPFS.

##### `ethofs.pinFileToIPFS(readableStream, options)`
##### Params
* `readableStream` - A [readableStream](https://nodejs.org/api/stream.html) of the file to be added 
* `options` : A JSON object that contains the following keyvalues:
  * `ethofsData` : A JSON object with (#ethofsData-anchor) for the data being pinned
  * `ethofsOptions` : A JSON object with additional [options](#ethofsData-anchor) for the data being pinned
#### Response
```
{
    ipfsHash: This is the IPFS multi-hash provided back for your content,
    ethoTXHash: This is transaction hash of the confirmed upload contract on the Ether-1 Network,
    uploadCost: This is the total cost in ETHO for the upload
}
```
##### Example Code
```javascript
const fs = require('fs');
const readableStreamForFile = fs.createReadStream('./yourfile.png');
const options = {
    ethofsData: {
        name: 'MyCustomUploadName',
        keyvalues: {
            customKey: 'customValue',
            customKey2: 'customValue2'
        }
    },
    ethofsOptions: {
        uploadContractDuration: 100000
    }
};
ethofs.pinFileToIPFS(readableStreamForFile, options).then((result) => {
    //handle results here
    console.log(result);
}).catch((err) => {
    //handle error here
    console.log(err);
});
```
<a name="pinFromFS-anchor"></a>
### `pinFromFS`
Send a file/directory from local filesystem to ethoFS for direct pinning to IPFS.

##### `ethofs.pinFromFS(fsLocation, options)`
##### Params
* `fsLocation` - A local filesystem location of the file or directory to be added 
* `options` : A JSON object that contains the following keyvalues:
  * `ethofsData` : A JSON object with (#ethofsData-anchor) for the data being pinned
  * `ethofsOptions` : A JSON object with additional [options](#ethofsData-anchor) for the data being pinned
#### Response
```
{
    ipfsHash: This is the IPFS multi-hash provided back for your content,
    ethoTXHash: This is transaction hash of the confirmed upload contract on the Ether-1 Network,
    uploadCost: This is the total cost in ETHO for the upload
}
```
##### Example Code
```javascript
const sourceDirectory = ('./yourDirectory');
const options = {
    ethofsData: {
        name: 'MyCustomDirectoryUploadName',
        keyvalues: {
            customKey: 'customValue',
            customKey2: 'customValue2'
        }
    },
    ethofsOptions: {
        uploadContractDuration: 100000
    }
};
ethofs.pinFromFS(sourceDirectory, options).then((result) => {
    //handle results here
    console.log(result);
}).catch((err) => {
    //handle error here
    console.log(err);
});
```
<a name="unpin-anchor"></a>
### `unpin`
Have ethoFS unpin content that you've pinned/uploaded through the platform.

##### `ethofs.unpin(uploadContractAddress)`
##### Params
* `uploadContractAddress` - the upload contract address of the content you wish to remove from ethoFS
#### Response
```
{
    ethoTXHash: This is transaction hash of the confirmed upload contract removal on the Ether-1 Network
}
```
##### Example Code
```javascript
ethofs.unpin(hashToUnpin).then((result) => {
    //handle results here
    console.log(result);
}).catch((err) => {
    //handle error here
    console.log(err);
});
```

<a name="testAuthentication-anchor"></a>
### `testAuthentication`
Tests that you can authenticate with ethoFS correctly

##### `ethofs.testAuthentication()`
##### Params
None

#### Response
```
{
    authenticated: true
}
```

##### Example Code
```javascript
ethofs.testAuthentication().then((result) => {
    //handle results here
    console.log(result);
}).catch((err) => {
    //handle error here
    console.log(err);
});
```
<a name="pinList-anchor"></a>
### `pinList`
List pin contracts stored in ethoFS.

##### `ethofs.pinList(options)`
##### Params
* `options` (optional) : A JSON object that contains the following keyvalues:
  * `ethofsDataFilter` (optional) : A JSON object with (#ethofsDataFilter-anchor) for the filtering out pinned data
#### Response
```
{
    address: This is the Ether-1 contract address,
    data: This is any saved data along with upload (ie name/keyvalues),
    ipfsHash: This is the IPFS multi-hash provided back for your content,
    uploadBlock: This is the original Ether-1 block the upload was iniated/recorded in,
    expirationBlock: This is the Ether-1 expiration block of the upload contract
}
```
##### Example Code
```javascript
const options = {
    ethofsDataFilter: {
        name: 'MyNameFilter',
        keyvalues: {
            customKeyFilter: 'customValueFilter',
            customKey2Filter: 'customValue2Filter'
        }
    },
};
ethofs.pinList(options).then((result) => {
    //handle results here
    console.log(result);
}).catch((err) => {
    //handle error here
    console.log(err);
});
```

<a name="ethofsOptions-anchor"></a>

## ethoFS Options
Some endpoints allow you to pass additional options for ethoFS to take into account when adding content to IPFS.

The options object can consist of the following values:
* uploadContractDuration (required) - The duration in ETHO blocks you would like your upload pinned for. A minimum of 100000 blocks is required.

##### Example ethofsOptions object
```
{
    uploadContractDuration: 100000
}
```
<a name="ethofsData-anchor"></a>

## ethoFS Data
Some endpoints allow you to pass additional data to store with your IPFS upload.

The options object can consist of the following values:
* name (optional) - The name of your upload.
* keyvalues (optional) - Misc metadata to store with your upload.

##### Example ethofsData object
```
{
    name: 'UploadContractName',
    keyvalues: {
        customKey: 'customValue',
        customKey2: 'customValue2'
    }
}
```

<a name="ethofsDataFilter-anchor"></a>

## ethoFS Data Filter
Some endpoints allow you to pass additional data filters to filter out existing contracts.

The options object can consist of the following values:
* name (optional) - The name of your upload.
* keyvalues (optional) - Misc metadata stored with your upload.

##### Example ethofsDataFilter object
```
{
    name: 'UploadContractNameFilter',
    keyvalues: {
        customKeyFilter: 'customValueFilter',
        customKey2Filter: 'customValue2Filter'
    }
}
```

## Questions? Issues? Suggestions? 
Feel free to file a github issue or email us at admin@ether1.org 

We'd love to hear from you!
