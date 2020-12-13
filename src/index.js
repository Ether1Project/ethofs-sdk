import pinByHash from './commands/pinning/pinByHash';
import hashMetadata from './commands/pinning/hashMetadata';
import pinFileToIPFS from './commands/pinning/pinFileToIPFS';
import pinFromFS from './commands/pinning/pinFromFS';
import pinJSONToIPFS from './commands/pinning/pinJSONToIPFS';
import pinJobs from './commands/pinning/pinJobs/pinJobs';
import unpin from './commands/pinning/unpin';
import testAuthentication from './commands/data/testAuthentication';
import pinList from './commands/data/pinList/pinList';
import userPinnedDataTotal from './commands/data/userPinnedDataTotal';

export default function ethofsClient(ethofsKey) {
    let client = {};

    //  setting up the actual calls you can make using this package
    client.pinByHash = function (hashToPin, options) {
        return pinByHash(ethofsKey, hashToPin, options);
    };
    client.hashMetadata = function (ipfsPinHash, metadata) {
        return hashMetadata(ethofsKey, ipfsPinHash, metadata);
    };
    client.pinFileToIPFS = function (readableStream, options) {
        return pinFileToIPFS(ethofsKey, readableStream, options);
    };
    client.pinFromFS = function (sourcePath, options) {
        return pinFromFS(ethofsKey, sourcePath, options);
    };
    client.pinJSONToIPFS = function (body, options) {
        return pinJSONToIPFS(ethofsKey, body, options);
    };
    client.pinJobs = function (filters) {
        return pinJobs(ethofsKey, filters);
    };
    client.unpin = function (hashToUnpin) {
        return unpin(ethofsKey, hashToUnpin);
    };
    client.testAuthentication = function () {
        return testAuthentication(ethofsKey);
    };
    client.pinList = function (filters) {
        return pinList(ethofsKey, filters);
    };
    client.userPinnedDataTotal = function () {
        return userPinnedDataTotal(ethofsKey);
    };
    return client;
}
