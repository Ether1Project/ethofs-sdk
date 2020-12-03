import axios from 'axios';
import { baseUrl } from './../../../constants';
import { validateEthofsKey } from '../../../util/validators';
import queryBuilder from './queryBuilder';

export default function pinList(ethofsKey) {
    validateEthofsKey(ethofsKey);
    
    return new Promise((resolve, reject) => {
        reject(new Error(`ethoFS pinList not yet implemented`));
    });
}
