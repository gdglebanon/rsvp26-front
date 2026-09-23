import { createHash, randomBytes } from 'node:crypto';
import { normalizeEmail } from './profile.js';
export const EDIT_WINDOW_MS = 5 * 60 * 1000;
export const tokenHash = token => createHash('sha256').update(token).digest('hex');
export function newPending(form, email, now = Date.now()) {
 const secret = randomBytes(32).toString('hex');
 return {secret, record:{form,email:checkedEmail(email),tokenHash:tokenHash(secret),createdAt:now,editUntil:now+EDIT_WINDOW_MS,status:'pending'}};
}
export function checkedEmail(value) {
 const email=normalizeEmail(value);
 if(email.length>254 || !/^\S+@\S+\.\S+$/.test(email)) throw Object.assign(new Error('Enter a valid email.'),{status:400});
 return email;
}
export function authorizePending(record, secret) {
 if(!record || typeof secret!=='string' || secret.length!==64 || tokenHash(secret)!==record.tokenHash) throw Object.assign(new Error('This registration session is unavailable.'),{status:403});
}
export function changePendingEmail(record,email,now=Date.now()) {
 if(record.status!=='pending' || now>=record.editUntil) throw Object.assign(new Error('The five-minute email editing window has ended. Please verify the displayed email.'),{status:409});
 return checkedEmail(email);
}
