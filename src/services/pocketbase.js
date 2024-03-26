import PocketBase from 'pocketbase';
//import { pocketbaseUrl } from '../environment'
const pocketbaseUrl = "https://mitbestimmungsorte.pockethost.io/" //https://hocuspocus.taat.live/pb"


export const pb = new PocketBase(pocketbaseUrl);
pb.autoCancellation(false) // otherwise parallel requests fail, fsee https://github.com/pocketbase/js-sdk#auto-cancellation
