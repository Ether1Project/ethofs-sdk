const { validateEthofsKey } = require('../../util/validators');

module.exports = function userPinnedDataTotal(ethofsKey) {
    validateEthofsKey(ethofsKey);

    return new Promise((resolve, reject) => {
        reject(new Error('ethoFS pinned data retrieval not yet functional'));
    });
};
