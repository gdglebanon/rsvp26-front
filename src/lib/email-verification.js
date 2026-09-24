import { checkedEmail, normalizeEmail, request } from './registration.js';

export async function sendVerificationEmail(email, pendingId, sendRequest = request) {
    return sendRequest('auth/email/request', {
        method: 'POST', body: { email: checkedEmail(email), ...(pendingId ? { pendingId } : {}) },
    });
}

// Reload verification performed through another supported method, then refresh the API token.
export async function refreshVerifiedUser(user, expectedEmail) {
    if (!user) throw new Error('Open the verification email link in this browser, or verify with Google or an email code, then check again.');
    await user.reload();
    if (expectedEmail && normalizeEmail(user.email) !== checkedEmail(expectedEmail)) {
        throw new Error('Verify the email address used for this submission.');
    }
    if (!user.emailVerified) throw new Error('Your email is not verified yet. Open the verification link in your inbox first.');
    await user.getIdToken(true);
}
