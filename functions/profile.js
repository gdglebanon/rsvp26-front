import { createHash } from 'node:crypto';
export const normalizeEmail = value => typeof value === 'string' ? value.trim().toLowerCase() : '';
export const emailKey = value => createHash('sha256').update(normalizeEmail(value)).digest('hex');
// Explicit allowlist: imported verification flags, OTPs and event administration never leave the server.
const fields = ['firstName', 'lastName', 'specialization', 'experience', 'company', 'region', 'age', 'gender', 'linkedin', 'phone', 'education'];
export function publicProfile(row) {
 return Object.fromEntries(fields.filter(k => typeof row[k] === 'string').map(k => [k, row[k].trim().slice(0, 1000)]));
}
export function verifiedEmail(token, requested) {
 const email = normalizeEmail(token?.email);
 if (!token?.email_verified || !email || email !== normalizeEmail(requested)) {
  const error = new Error('Sign in with the same verified email you entered.'); error.status = 403; throw error;
 }
 return email;
}
export function registrationData(input) {
 const out = {};
 const strings = ['firstName','lastName','specialization','company','university','major','region','ageRange','gender','linkedIn','phone','referral','referralOtherText','referralPartnerText','otherTakeawaysInput','otherTechInterestInput','comments','attendanceType'];
 for (const key of strings) if (typeof input[key] === 'string') out[key] = input[key].trim().slice(0, key === 'comments' ? 5000 : 1000);
 for (const key of ['activeExpCategories','takeaways','techInterests']) out[key] = Array.isArray(input[key]) ? input[key].filter(v => typeof v === 'string').slice(0,30).map(v=>v.slice(0,100)) : [];
 out.expLevels = Object.fromEntries(['Student','Professional','Manager / Team Lead'].map(k=>[k, Number.isInteger(input.expLevels?.[k]) ? Math.max(0,Math.min(6,input.expLevels[k])) : 0]));
 out.attendedBefore = Number.isInteger(input.attendedBefore) && input.attendedBefore >= 0 && input.attendedBefore <= 3 ? input.attendedBefore : 3;
 if (!out.firstName || !out.lastName || !out.specialization || !out.region || !out.activeExpCategories.length || !out.takeaways.length || !out.referral || !out.linkedIn || !['full_day','few_hours','networking','afternoon'].includes(out.attendanceType)) {
  const error = new Error('Please complete all required registration fields.'); error.status=400; throw error;
 }
 return out;
}
