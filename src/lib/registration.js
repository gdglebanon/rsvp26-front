export const normalizeEmail = value => String(value || '').trim().toLowerCase();
export function checkedEmail(value) {
    const email = normalizeEmail(value);
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) throw new Error('Enter a valid email.');
    return email;
}
const base = (import.meta.env?.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
export async function request(path, { user, body, method = 'GET', blob = false } = {}) {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (user) headers.Authorization = `Bearer ${await user.getIdToken()}`;
    const response = await fetch(`${base}/api/${path}`, {
        method, headers, ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const detail = Array.isArray(data.detail)
            ? data.detail.map(error => `${error.loc.slice(1).join('.')}: ${error.msg}`).join('\n')
            : data.detail;
        const error = new Error(detail || 'The server could not complete this request.');
        error.status = response.status;
        throw error;
    }
    return blob ? response.blob() : response.json();
}
export function saveRegistration(user, form, ticket) {
    if (!user?.emailVerified) throw new Error('Verify your email before submitting.');
    const email = checkedEmail(user.email);
    if (checkedEmail(form.email) !== email) throw new Error('The form must use your verified email.');
    return request(ticket ? 'registration' : 'register', {
        user, method: ticket ? 'PUT' : 'POST',
        body: { email, form, ...(ticket ? { version: ticket.version } : {}) },
    });
}
