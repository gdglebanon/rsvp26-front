import { readFileSync, readdirSync } from 'node:fs';
import { initializeApp, cert } from '../functions/node_modules/firebase-admin/lib/app/index.js';
import { getFirestore } from '../functions/node_modules/firebase-admin/lib/firestore/index.js';
import { normalizeEmail, emailKey, publicProfile } from '../functions/profile.js';
const source=process.argv[2];
if(!source || ['attendeeProfiles','events','rsvpRateLimits'].includes(source)) throw new Error('Usage: node scripts/prepare-profiles.mjs SOURCE_COLLECTION [--write]');
const key=process.env.GOOGLE_APPLICATION_CREDENTIALS || readdirSync('.').find(f=>f.includes('firebase-adminsdk') && f.endsWith('.json'));
initializeApp({credential:cert(JSON.parse(readFileSync(key,'utf8')))});
const db=getFirestore();
const rows=await db.collection(source).get();
const grouped=new Map(); let invalid=0;
for(const doc of rows.docs) {
 const row=doc.data(); const email=normalizeEmail(row.email);
 if(!/^\S+@\S+\.\S+$/.test(email)) {invalid++;continue;}
 const list=grouped.get(email) || []; list.push(row); grouped.set(email,list);
}
let written=0, duplicates=0;
for(const [email,records] of grouped) {
 if(records.length !== 1) {duplicates++;continue;}
 if(process.argv.includes('--write')) await db.collection('attendeeProfiles').doc(emailKey(email)).set(publicProfile(records[0]));
 written++;
}
console.log({mode:process.argv.includes('--write')?'written':'dry-run',sourceRows:rows.size,profiles:written,duplicateEmailsSkipped:duplicates,invalidEmailsSkipped:invalid});
