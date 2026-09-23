const KEY = 'rsvpPendingSubmission';
export function readPendingSubmission() {
    try {
        const record = JSON.parse(localStorage.getItem(KEY) || 'null');
        if (!record || record.expiresAt <= Date.now()) { clearPendingSubmission(); return null; }
        return record;
    } catch { clearPendingSubmission(); return null; }
}
export function submissionKey(email) {
    const existing = readPendingSubmission();
    if (existing?.email === email && existing.submissionKey) return existing.submissionKey;
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    const key = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    // Save before the request so a failed network response can be retried idempotently.
    localStorage.setItem(KEY, JSON.stringify({email, submissionKey: key, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000}));
    return key;
}
export function savePendingSubmission(receipt, email, key) {
    const record = { id: receipt.id, email, submissionKey: key, emailVerified: receipt.emailVerified,
        expiresAt: Date.parse(receipt.expiresAt) };
    localStorage.setItem(KEY, JSON.stringify(record));
    return record;
}
export function clearPendingSubmission() { localStorage.removeItem(KEY); }
