import pinFileToIPFS from './commands/pinning/pinFileToIPFS';
import pinFromFS from './commands/pinning/pinFromFS';
import unpin from './commands/pinning/unpin';
import extendPin from './commands/pinning/extendPin';
import calculateCost from './commands/pinning/calculateCost';
import testAuthentication from './commands/data/testAuthentication';
import pinList from './commands/data/pinList/pinList';
import networkStats from './commands/data/networkStats/networkStats';
import nodeLocations from './commands/data/networkStats/nodeLocations';
import addUser from './commands/user/addUser';

export default function ethofsClient(ethofsKey) {
    let client = {};

    //  setting up the actual calls you can make using this package
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
    client.calculateCost = function (readableStream, options) {
        return calculateCost(readableStream, options);
    };
    client.testAuthentication = function () {
        return testAuthentication(ethofsKey);
    };
    client.pinList = function (filters) {
        return pinList(ethofsKey, filters);
    };
    client.networkStats = function () {
        return networkStats();
    };
    client.nodeLocations = function () {
        return nodeLocations();
    };
    client.addUser = function (userName) {
        return addUser(ethofsKey, userName);
    };
    return client;
}
