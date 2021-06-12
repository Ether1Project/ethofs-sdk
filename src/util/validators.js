module.exports.validateEthofsKey = (ethofsKey) => {
    if (!ethofsKey || String(ethofsKey).trim() === '') {
        throw new Error('No ethoFS private key provided! Please provide your ethoFS private key as an argument when you start this script');
    }
};

module.exports.validateEthofsDataFilter = (data) => {
    if (data.name) {
        if (!(typeof data.name === 'string' || data.name instanceof String)) {
            throw new Error('ethofsData name must be of type string');
        }
    }

    if (data.keyvalues) {
        if (!(typeof data.keyvalues === 'object')) {
            throw new Error('ethofsData keyvalues must be an object');
        }

        let i = 0;

        Object.entries(data.keyvalues).forEach(function (keyValue) {
            if (i > 9) {
                throw new Error('No more than 10 keyvalues can be provided for ethofsData entries');
            }
            //  we want to make sure that the input is a string, a boolean, or a number, so we don't get an object passed in by accident
            if (!(typeof keyValue[1] === 'string' || typeof keyValue[1] === 'boolean' || !isNaN(keyValue[1]))) {
                throw new Error('EthofsData keyvalue values must be strings, booleans, or numbers');
            }
            i++;
        });
    }
};

module.exports.validateEthofsData = (data) => {
    if (data.name) {
        if (!(typeof data.name === 'string' || data.name instanceof String)) {
            throw new Error('ethofsData name must be of type string');
        }
    }

    if (data.keyvalues) {
        if (!(typeof data.keyvalues === 'object')) {
            throw new Error('ethofsData keyvalues must be an object');
        }

        let i = 0;

        Object.entries(data.keyvalues).forEach(function (keyValue) {
            if (i > 9) {
                throw new Error('No more than 10 keyvalues can be provided for ethofsData entries');
            }
            //  we want to make sure that the input is a string, a boolean, or a number, so we don't get an object passed in by accident
            if (!(typeof keyValue[1] === 'string' || typeof keyValue[1] === 'boolean' || !isNaN(keyValue[1]))) {
                throw new Error('EthofsData keyvalue values must be strings, booleans, or numbers');
            }
            i++;
        });
    }
};

module.exports.validateEthofsOptions = (options) => {
    if (typeof options !== 'object') {
        throw new Error('options must be an object');
    }

    if (!options.hostingContractSize || !options.hostingContractDuration) {
        throw new Error('Properly formatted ethofs options containing hostingContractSize and hostingContractDuration required');
    }

    if (options.hostingContractDuration) {
        if (options.hostingContractDuration < 6646 || typeof options.hostingContractDuration !== 'number') {
            throw new Error('incorrect hosting contract duration');
        }
    }

    if (options.hostingContractSize) {
        if (options.hostingContractSize < 0 || typeof options.hostingContractSize !== 'number') {
            throw new Error('incorrect hosting contract size');
        }
    }
};

module.exports.validateEthofsConnections = (data) => {
    if (data.rpc) {
        if (!(typeof data.rpc === 'string' || data.rpc instanceof String)) {
            throw new Error('invalid rpc connection');
        }
    }

    if (data.gateway) {
        if (!(typeof data.gateway === 'string')) {
            throw new Error('invalid gateway connection');
        }
    }
};
