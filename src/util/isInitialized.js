module.exports = function isInitialized(client) {
    if (!client.ethoFSContract) {
        throw new Error('SDK has not been initialized.');
    }
};
