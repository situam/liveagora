import PocketBase from 'pocketbase';
//import { pocketbaseUrl } from '../environment'
const pocketbaseUrl = "https://mitbestimmungsorte.pockethost.io/" //https://hocuspocus.taat.live/pb"


export const pb = new PocketBase(pocketbaseUrl);
