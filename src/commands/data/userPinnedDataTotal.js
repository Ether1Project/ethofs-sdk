import axios from 'axios';
import { baseUrl } from './../../constants';
import { validateEthofsKey } from '../../util/validators';

export default function userPinnedDataTotal(ethofsKey) {
    validateEthofsKey(ethofsKey);

    return new Promise((resolve, reject) => {
        reject(new Error(`ethoFS pinned data retrieval not yet functional`));
    });
}
