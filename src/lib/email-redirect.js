// Detect the callback before Firebase initializes so the form never flashes first.
// Firebase still validates the actual sign-in link before authenticating it.
export function isEmailVerificationRedirect(href) {
    const params = new URL(href).searchParams;
    return params.get('auth') === 'callback'
        || (params.get('mode') === 'signIn' && Boolean(params.get('oobCode')));
}
