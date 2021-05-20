import pinFileToIPFS from './commands/pinning/pinFileToIPFS';
import pinFolderToIPFS from './commands/pinning/pinFolderToIPFS';
import pinFromFS from './commands/pinning/pinFromFS';
import unpin from './commands/pinning/unpin';
import extendPin from './commands/pinning/extendPin';
import calculateCost from './commands/pinning/calculateCost';
import testAuthentication from './commands/data/testAuthentication';
import pinList from './commands/data/pinList/pinList';
import networkStats from './commands/data/networkStats/networkStats';
import nodeLocations from './commands/data/networkStats/nodeLocations';
import addUser from './commands/user/addUser';

export default function ethofsClient(ethofsKey, connections) {
    let client = {};

    //  setting up the actual calls you can make using this package
    client.pinFileToIPFS = function (readableStream, options) {

        var config;

        if (connections) {
            if (options) {
                options.connections = connections;
                config = options;
            } else {
              config = {
                  connections: connections
              };
            }
        } else {
            config = options;
        }
        return pinFileToIPFS(ethofsKey, readableStream, config);
    };
    client.pinFolderToIPFS = function (readableStream, options) {

        var config;

        if (connections) {
            if (options) {
                options.connections = connections;
                config = options;
            } else {
              config = {
                  connections: connections
              };
            }
        } else {
            config = options;
        }
        return pinFolderToIPFS(ethofsKey, readableStream, config);
    };
    client.pinFromFS = function (sourcePath, options) {

        var config;

        if (connections) {
            if (options) {
                options.connections = connections;
                config = options;
            } else {
              config = {
                  connections: connections
              };
            }
        } else {
            config = options;
        }
        return pinFromFS(ethofsKey, sourcePath, config);
    };
    client.unpin = function (uploadContractAddress) {
        return unpin(ethofsKey, uploadContractAddress, connections);
    };
    client.extendPin = function (uploadContractAddress, options) {

        var config;

        if (connections) {
            if (options) {
                options.connections = connections;
                config = options;
            } else {
              config = {
                  connections: connections
              };
            }
        } else {
            config = options;
        }
        return extendPin(ethofsKey, uploadContractAddress, config);
    };
    client.calculateCost = function (options) {

        var config;

        if (connections) {
            if (options) {
                options.connections = connections;
                config = options;
            } else {
              config = {
                  connections: connections
              };
            }
        } else {
            config = options;
        }
        return calculateCost(config);
    };
    client.testAuthentication = function () {
        return testAuthentication(ethofsKey, connections);
    };
    client.pinList = function (options) {

        var config;

        if (connections) {
            if (options) {
                options.connections = connections;
                config = options;
            } else {
              config = {
                  connections: connections
              };
            }
        } else {
            config = options;
        }
        return pinList(ethofsKey, config);
    };
    client.networkStats = function () {
        return networkStats();
    };
    client.nodeLocations = function () {
        return nodeLocations();
    };
    client.addUser = function (userName) {
        return addUser(ethofsKey, userName, connections);
    };
    return client;
}
