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
  * [pinFromFS](#pinFromFS-anchor) - WIP
  * [pinJobs](#pinJobs-anchor) - WIP
  * [pinJSONToIPFS](#pinJSONToIPFS-anchor) - WIP
  * [unpin](#unpin-anchor) - WIP

* Data
  * [testAuthentication](#testAuthentication-anchor)
  * [pinList](#pinList-anchor) - WIP
  * [userPinnedDataTotal](#userPinnedDataTotal-anchor) - WIP
<br />

<a name="pinFileToIPFS-anchor"></a>
### `pinFileToIPFS`
Send a file to to ethoFS for direct pinning to IPFS.

##### `ethofs.pinFileToIPFS(readableStream, options)`
##### Params
* `readableStream` - A [readableStream](https://nodejs.org/api/stream.html) of the file to be added 
* `options` (optional): A JSON object that can contain the following keyvalues:
  * `ethofsData` (optional): A JSON object with [optional data](#ethofsData-anchor) for the file being pinned
  * `ethofsOptions` (optional): A JSON object with additional [options](#ethofsData-anchor) for the file being pinned
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
        name: MyCustomUploadName,
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

## Questions? Issues? Suggestions? 
Feel free to file a github issue or email us at admin@ether1.org 

We'd love to hear from you!
