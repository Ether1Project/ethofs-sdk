import pinByHash from './commands/pinning/pinByHash';
import pinFileToIPFS from './commands/pinning/pinFileToIPFS';
import pinFromFS from './commands/pinning/pinFromFS';
import unpin from './commands/pinning/unpin';
import extendPin from './commands/pinning/extendPin';
import testAuthentication from './commands/data/testAuthentication';
import pinList from './commands/data/pinList/pinList';

export default function ethofsClient(ethofsKey) {
    let client = {};

    //  setting up the actual calls you can make using this package
    client.pinByHash = function (hashToPin, options) {
        return pinByHash(ethofsKey, hashToPin, options);
    };
    client.pinFileToIPFS = function (readableStream, options) {
        return pinFileToIPFS(ethofsKey, readableStream, options);
    };
    client.pinFromFS = function (sourcePath, options) {
        return pinFromFS(ethofsKey, sourcePath, options);
    };
    client.unpin = function (uploadContractAddress) {
        return unpin(ethofsKey, uploadContractAddress);
    };
    client.extendPin = function (uploadContractAddress, options) {
        return extendPin(ethofsKey, uploadContractAddress, options);
    };
    client.testAuthentication = function () {
        return testAuthentication(ethofsKey);
    };
    client.pinList = function (filters) {
        return pinList(ethofsKey, filters);
    };
    return client;
}
