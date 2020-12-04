import { validateEthofsKey } from '../../../util/validators';

export default function pinList(ethofsKey) {
    validateEthofsKey(ethofsKey);

    return new Promise((resolve, reject) => {
        reject(new Error('ethoFS pinList not yet implemented'));
    });
}
