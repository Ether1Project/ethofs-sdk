<img src="https://ethofs.com/index/images/logo.png" width="200" />

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
  * [hashMetadata](#hashMetadata-anchor)
  * [hashPinPolicy](#hashPinPolicy-anchor)
  * [pinByHash](#pinByHash-anchor)
  * [pinFileToIPFS](#pinFileToIPFS-anchor)
  * [pinFromFS](#pinFromFS-anchor)
  * [pinJobs](#pinJobs-anchor)
  * [pinJSONToIPFS](#pinJSONToIPFS-anchor)
  * [unpin](#unpin-anchor)
  * [userPinPolicy](#userPinPolicy-anchor)

* Data
  * [testAuthentication](#testAuthentication-anchor)
  * [pinList](#pinList-anchor)
  * [userPinnedDataTotal](#userPinnedDataTotal-anchor)
<br />

<a name="hashMetadata-anchor"></a>
### `hashMetadata`
Allows the user to change the name and keyvalues associated with content pinned to ethoFS.
Changes made via this endpoint only affect the metadata for the hash passed in. [Metadata](#metadata-anchor) is specific to ethoFS and does not modify the actual content stored on IPFS in any way. It is simply a convenient way of keeping track of what content you have stored.

##### `ethofs.hashMetadata(ipfsPinHash, metadata)`
##### Params
* `ipfsPinHash` - A string for a valid IPFS Hash that you have pinned on ethoFS.
* `metadata` A JSON object containing the following:
  * `name` (optional) - A new name that ethoFS will associate with this particular hash. 
  * `keyvalues` (optional) - A JSON object with the updated keyvalues you want associated with the hash provided (see more below)
  
###### Adding or modifying keyvalues
To add or modify existing keyvalues, simply provide them in the following format for the keyvalues object:
```
keyvalues: {
    newKey: 'newValue', //this adds a keyvalue pair
    existingKey: 'newValue' //this modifies the value of an existing key if that key already exists
}
```

###### Removing keyvalues
To remove a keyvalue pair, simply provide null as the value for an existing key like so:
```
keyvalues: {
    existingKeyToRemove: null //this removes a keyvalue pair
}
```

#### Response
If the operation is successful, you will receive back an "OK" REST 200 status.

##### Example Code
```javascript
const metadata = {
    name: 'new custom name',
    keyvalues: {
        newKey: 'newValue',
        existingKey: 'newValue',
        existingKeyToRemove: null
    }
};
ethofs.hashMetadata('yourHashHere', metadata).then((result) => {
    //handle results here
    console.log(result);
}).catch((err) => {
    //handle error here
    console.log(err);
});
```
<a name="pinByHash-anchor"></a>
### `pinByHash`
Adds a hash to ethoFS pin queue to be pinned asynchronously. For the synchronous version of this operation see: [pinHashToIPFS](#pinHashToIPFS-anchor)

##### `ethofs.pinByHash(hashToPin, options)`
##### Params
* `hashToPin` - A string for a valid IPFS Hash (Also known as a CID)
* `options` (optional): A JSON object that can contain following keyvalues:
  * `ethofsMetadata` (optional): A JSON object with [optional metadata](#metadata-anchor) for the hash being pinned
  * `ethofsOptions`
     * `hostNodes` (optional): An array of [multiaddresses for nodes](#hostNode-anchor) that are currently hosting the content to be pinned
#### Response
```
{
    id: This is ethoFS/ETHO Tx hash for the pin job,
    ipfsHash: This is the IPFS multi-hash provided to ethoFS to pin,
    status: The current status of the pin job. If the request was successful the status should be 'searching'.
    name: The name of the pin (if provided initially)
}
```
##### Example Code
```javascript
const options = {
    ethofsMetadata: {
        name: MyCustomName,
        keyvalues: {
            customKey: 'customValue',
            customKey2: 'customValue2'
        }
    },
    ethofsOptions: {
        hostNodes: [
            '/ip4/hostNode1ExternalIP/tcp/4001/ipfs/hostNode1PeerId',
            '/ip4/hostNode2ExternalIP/tcp/4001/ipfs/hostNode2PeerId'
        ]
        }
    }
};
ethofs.pinByHash('yourHashHere', options).then((result) => {
    //handle results here
    console.log(result);
}).catch((err) => {
    //handle error here
    console.log(err);
});
```

<a name="pinFileToIPFS-anchor"></a>
### `pinFileToIPFS`
Send a file to to ethoFS for direct pinning to IPFS.

##### `ethofs.pinFileToIPFS(readableStream, options)`
##### Params
* `readableStream` - A [readableStream](https://nodejs.org/api/stream.html) of the file to be added 
* `options` (optional): A JSON object that can contain the following keyvalues:
  * `ethofsMetadata` (optional): A JSON object with [optional metadata](#metadata-anchor) for the file being pinned
  * `ethofsOptions` (optional): A JSON object with additional [options](#metadata-anchor) for the file being pinned
#### Response
```
{
    IpfsHash: This is the IPFS multi-hash provided back for your content,
    PinSize: This is how large (in bytes) the content you just pinned is,
    Timestamp: This is the timestamp for your content pinning (represented in ISO 8601 format)
}
```
##### Example Code
```javascript
const fs = require('fs');
const readableStreamForFile = fs.createReadStream('./yourfile.png');
const options = {
    ethofsMetadata: {
        name: MyCustomName,
        keyvalues: {
            customKey: 'customValue',
            customKey2: 'customValue2'
        }
    },
    pinataOptions: {
        cidVersion: 0
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

<a name="pinFromFs-anchor"></a>
### `pinFromFS`
Read from a location on your local file system and recursively pin the contents to IPFS (node.js only).

Both individual files, as well as directories can be read from.

##### `ethofs.pinFromFs(sourcePath, options)`
##### Params
* `sourcePath` - The location on your local filesystem that should be read from. 
* `options` (optional): A JSON object that can contain the following keyvalues:
  * `ethofsMetadata` (optional): A JSON object with [optional metadata](#metadata-anchor) for the file being pinned
  * `ethofsOptions` (optional): A JSON object with additional [options](#metadata-anchor) for the file being pinned
#### Response
```
{
    IpfsHash: This is the IPFS multi-hash provided back for your content,
    PinSize: This is how large (in bytes) the content you just pinned is,
    Timestamp: This is the timestamp for your content pinning (represented in ISO 8601 format)
}
```
##### Example Code
```javascript
const sourcePath = '/Users/me/builds/my-awesome-website/';
const options = {
    ethofsMetadata: {
        name: 'My Awesome Website',
        keyvalues: {
            customKey: 'customValue',
            customKey2: 'customValue2'
        }
    },
    ethofsOptions: {
        cidVersion: 0
    }
};
ethofs.pinFromFS(sourcePath, options).then((result) => {
    //handle results here
    console.log(result);
}).catch((err) => {
    //handle error here
    console.log(err);
});
```

<a name="pinJSONToIPFS-anchor"></a>
### `pinJSONToIPFS`
Send JSON to to ethoFS for direct pinning to IPFS.

##### `ethofs.pinJSONToIPFS(body, options)`
##### Params
* `body` - Valid JSON you wish to pin to IPFS
* `options` (optional): A JSON object that can contain the following keyvalues:
  * `metadata` (optional): A JSON object with [optional metadata](#metadata-anchor) for the hash being pinned
  * `pinataOptions` (optional): A JSON object with additional [options](#metadata-anchor) for the JSON being pinned
#### Response
```
{
    IpfsHash: This is the IPFS multi-hash provided back for your content,
    PinSize: This is how large (in bytes) the content you just pinned is,
    Timestamp: This is the timestamp for your content pinning (represented in ISO 8601 format)
}
```
##### Example Code
```javascript
const body = {
    message: 'ethoFS is awesome'
};
const options = {
    ethofsMetadata: {
        name: MyCustomName,
        keyvalues: {
            customKey: 'customValue',
            customKey2: 'customValue2'
        }
    },
    ethofsOptions: {
        cidVersion: 0
    }
};
ethofs.pinJSONToIPFS(body, options).then((result) => {
    //handle results here
    console.log(result);
}).catch((err) => {
    //handle error here
    console.log(err);
});
```

<a name="unpin-anchor"></a>
### `unpin`
Have ethoFS unpin content that you've pinned through the service.

##### `ethofs.unpin(hashToUnpin)`
##### Params
* `hashToUnpin` - the hash of the content you wish to unpin from Pinata
#### Response
If the operation is successful, you will simply receive "OK" as your result
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
Retrieve pin records for your ethoFS account

##### `ethoFS.pinList(filters)`
##### Params
* `filters` (optional): An object that can consist of the following optional query parameters:
  * `hashContains` (optional): A string of alphanumeric characters that desires hashes must contain
  * `pinStart` (optional): The earliest date the content is allowed to have been pinned. Must be a valid [ISO_8601](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString) date. 
  * `pinEnd` (optional): The earliest date the content is allowed to have been pinned. Must be a valid [ISO_8601](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString) date. 
  * `unpinStart` (optional): The earlist date the content is allowed to have been unpinned. Must be a valid [ISO_8601](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString) date. 
  * `unpinEnd` (optional): The latest date the content is allowed to have been unpinned. Must be a valid [ISO_8601](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString) date. 
  * `pinSizeMin` (optional): The minimum byte size that pin record you're looking for can have
  * `pinSizeMax` (optional): The maximum byte size that pin record you're looking for can have
  * `status` (optional): Filter pins using one of the following options
    * `'all'` (Records for both pinned and unpinned content will be returned)
    * `'pinned'` (Only records for pinned content will be returned)
    * `'unpinned'` (Only records for unpinned content will be returned)
  * `pageLimit` (optional): Limit the amount of results returned per page of results (default is 10, and max is 1000)
  * `pageOffset` (optional): Provide the record offset for records being returned. This is how you retrieve records on additional pages (default is 0)
   * `metadata` (optional): A JSON object that can be used to find records for content that had optional metadata included when it was added to Pinata. The metadata object is formatted as follows:
 
##### Metadata filter object formatting
```
{
    name: 'exampleName',
    keyvalues: {
        testKeyValue: {
            value: 'exampleFilterValue',
            op: 'exampleFilterOperation'
        },
        testKeyValue2: {
            value: 'exampleFilterValue2',
            op: 'exampleFilterOperation2'
        }
    }
}
```
Filter explanations:
* `name` (optional): If provided, any records returned must have a name that contains the string provided for the 'name'.
* `keyvalues` (optional): Each keyvalue provided in this object have both a `value` and `op`
  * `value` (required): This is the value which will be filtered on
  * `op` (required): This is the filter operation that will be applied to the `value` that was provided. Valid op values are:
     * `'gt'` (greater than the value provided)
     * `'gte'` (greater than or equal to the value provided)
     * `'lt'` (less than the value provided)
     * `'lte'` (less than or equal to the value provided)
     * `'ne'` (not equal to the value provided)
     * `'eq'` (equal to the value provided)
     * `'between'` (between the two values provided) - NOTE - This also requires a `secondValue` be provided as seen in the example below
     * `'notBetween'` (not between the two values provided) - NOTE - This also requires a `secondValue` be provided as seen in the example below
     * `'like'` (like the value provided)
     * `'notLike'` (not like the value provided)
     * `'iLike'` (case insensitive version of `like`)
     * `'notILike'` (case insensitive version of `notLike`)
     * `'regexp'` (filter the value provided based on a provided regular expression)
     * `'iRegexp'` (case insensitive version of regexp)
  
As an example, the following filter would only find records whose name contains the letters 'invoice', have the metadata key 'company' with a value of 'exampleCompany', and have a metadata key 'total' with values between 500 and 1000:
```
{
    name: 'invoice',
    keyvalues: {
        company: {
            value: 'exampleCompany,
            op: 'eq'
        },
        total: {
            value: 500,
            secondValue: 1000,
            op: 'between'
        }
    }
}
```


 
#### Response
```
{
    count: (this is the total number of pin records that exist for the query filters you passed in),
    rows: [
        {
            id: (the id of your pin instance record),
            ipfs_pin_hash: (the IPFS multi-hash for the content you pinned),
            size: (this is how large (in bytes) the content pinned is),
            user_id: (this is your user id for ethoFS),
            date_pinned: (This is the timestamp for when this content was pinned - represented in ISO 8601 format),
            date_unpinned: (This is the timestamp for when this content was unpinned (if null, then you still have the content pinned on Pinata),
            metadata: {
                name: (this will be the name of the file originally upuloaded, or the custom name you set),
                keyvalues: {
                    exampleCustomKey: "exampleCustomValue",
                    exampleCustomKey2: "exampleCustomValue2",
                    ...
                }
            }
        },
        {
            same record format as above
        }
        .
        .
        .
    ]
}
```
##### Example Code
```javascript
const metadataFilter = {
    name: 'exampleName',
    keyvalues: {
        testKeyValue: {
            value: 'exampleFilterValue',
            op: 'exampleFilterOperation'
        },
        testKeyValue2: {
            value: 'exampleFilterValue2',
            op: 'exampleFilterOperation2'
        }
    }
};

const filters = {
    status : 'pinned',
    pageLimit: 10,
    pageOffset: 0,
    metadata: metadataFilter
};
ethofs.pinList(filters).then((result) => {
    //handle results here
    console.log(result);
}).catch((err) => {
    //handle error here
    console.log(err);
});
```

<a name="userPinnedDataTotal-anchor"></a>
### `userPinnedDataTotal`
Returns the total combined size (in bytes) of all content you currently have pinned on ethoFS.

##### `ethofs.userPinnedDataTotal()`
##### Params
None

#### Response
The response for this call will the total combined size of everything you currently have pinned on ethofs.
This value will be expressed in bytes

##### Example Code
```javascript
ethofs.userPinnedDataTotal().then((result) => {
    //handle results here
    console.log(result);
}).catch((err) => {
    //handle error here
    console.log(err);
});
```
<a name="metadata-anchor"></a>
## ethoFS Metadata
For endpoints that allow you to add content, ethoFS lets you add optionally metadata for that content. This metadata can later be used for querying on what you've pinned with our [userPinList](#userPinList-anchor) endpoint. Providing metadata does not alter your content or how it is stored on IPFS in any way.

The metadata object can consist of the following values:
* name (optional) - A custom string to use as the name for your content
* keyvalues (optional) - An object containing up to 10 custom key / value pairs. The values can be:
  * strings
  * numbers (integers or decimals)
  * dates (provided in ISO_8601 format)
  
##### Example metadata object
```
{
    name: "customName",
    keyvalues: {
        customKey: "customValue",
        customKey2: "customValue2"
    }
}
```
<a name="ethofsOptions-anchor"></a>

## ethoFS Options
Some endpoints allow you to pass additional options for Pinata to take into account when adding content to IPFS.

The options object can consist of the following values:
* cidVerson (optional) - The [CID version](https://github.com/multiformats/cid#versions) IPFS will use when creating a hash for your content. Valid options are:
  * `0` - CIDv0
  * `1` - CIDv1
* wrapWithDirectory (optional) - Tells IPFS to wrap your content in a directory to preserve the content's original name. See [this blog post](https://flyingzumwalt.gitbooks.io/decentralized-web-primer/content/files-on-ipfs/lessons/wrap-directories-around-content.html) for more details on what this does. Valid options are:
  * `true`
  * `false`

  
##### Example ethofsOptions object
```
{
    cidVersion: 1,
    wrapWithDirectory: true
}
```

## Questions? Issues? Suggestions? 
Feel free to file a github issue or email us at admin@ether1.org 

We'd love to hear from you!
