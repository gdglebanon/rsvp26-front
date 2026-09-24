// Detect the callback before Firebase initializes so the form never flashes first.
// Firebase still validates the actual sign-in link before authenticating it.
export function isEmailVerificationRedirect(href) {
    const params = new URL(href).searchParams;
    return params.get('auth') === 'callback'
        || (['signIn', 'verifyEmail'].includes(params.get('mode')) && Boolean(params.get('oobCode')));
}


// Firebase puts our submission reference inside continueUrl for standard verification emails.
export function verificationPendingId(href) {
    const page = new URL(href);
    let id = page.searchParams.get('pending');
    if (!id && page.searchParams.get('continueUrl')) {
        try {
            const callback = new URL(page.searchParams.get('continueUrl'));
            if (callback.origin === page.origin && callback.pathname === page.pathname) {
                id = callback.searchParams.get('pending');
            }
        } catch { /* Ignore malformed callback state. Firebase validates the email proof. */ }
    }
    return /^[a-f0-9]{64}$/.test(id || '') ? id : null;
}
