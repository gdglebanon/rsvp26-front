// Browser-only demo state. These confirmations do not authenticate an attendee.
export const PENDING_KEY = 'rsvpDemoPending';
const RECORDS_KEY = 'rsvpDemoRegistrations';
export const EDIT_WINDOW_MS = 5 * 60 * 1000;
export const normalizeEmail = value => String(value || '').trim().toLowerCase();
export function checkedEmail(value) {
    const email = normalizeEmail(value);
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) throw new Error('Enter a valid email.');
    return email;
}
export function readPending() {
    try { return JSON.parse(sessionStorage.getItem(PENDING_KEY) || 'null'); }
    catch { return null; }
}
function registrations() {
    return JSON.parse(sessionStorage.getItem(RECORDS_KEY) || '{}');
}
function saveRegistration(email, form) {
    const records = registrations();
    // Access codes are not needed for the demo or saved profile.
    const { secretCode, ...details } = form;
    records[email] = { ...details, email };
    sessionStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}
export function savedProfile(email) {
    const record = registrations()[checkedEmail(email)];
    if (!record) return null;
    const fields = ['firstName', 'lastName', 'phone', 'linkedIn', 'major', 'ageRange', 'gender', 'region', 'specialization', 'company', 'university', 'activeExpCategories', 'expLevels', 'status'];
    return Object.fromEntries(fields.filter(key => key in record).map(key => [key, record[key]]));
}
export async function api(action, body, confirmation) {
    if (action === 'pending') {
        const email = checkedEmail(body.email);
        const { secretCode, ...form } = body.form;
        const session = { id: crypto.randomUUID(), email, form, firstName: form.firstName, editUntil: Date.now() + EDIT_WINDOW_MS };
        sessionStorage.setItem(PENDING_KEY, JSON.stringify(session));
        return session;
    }
    if (action === 'register') {
        const email = checkedEmail(body.email);
        if (!confirmation?.demo || normalizeEmail(confirmation.email) !== email) throw new Error('Confirm the same email first.');
        saveRegistration(email, body.form);
        return {};
    }
    const session = readPending();
    if (!session || session.id !== body.id) throw new Error('This demo registration session is unavailable.');
    if (action === 'pending-session') {
        if (body.newEmail !== undefined) {
            if (Date.now() >= session.editUntil) throw new Error('The five-minute email editing window has ended.');
            session.email = checkedEmail(body.newEmail);
            sessionStorage.setItem(PENDING_KEY, JSON.stringify(session));
        }
        return session;
    }
    if (action === 'complete-pending') {
        if (!confirmation?.demo || normalizeEmail(confirmation.email) !== session.email) throw new Error('Confirm the displayed email first.');
        saveRegistration(session.email, session.form);
        sessionStorage.removeItem(PENDING_KEY);
        return {};
    }
    throw new Error('Unknown demo action.');
}
