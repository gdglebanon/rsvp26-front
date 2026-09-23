import { readFileSync, readdirSync } from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { createApi } from './api.js';
const key = process.env.GOOGLE_APPLICATION_CREDENTIALS || readdirSync('.').find(f=>f.includes('firebase-adminsdk') && f.endsWith('.json'));
if(!key) throw new Error('Set GOOGLE_APPLICATION_CREDENTIALS to your private service-account file.');
initializeApp({credential:cert(JSON.parse(readFileSync(key,'utf8')))});
createApi().listen(8787,'127.0.0.1',()=>console.log('Private local Firebase API ready on http://127.0.0.1:8787'));
