export function authErrorMessage(error) {
    const messages = {
        'auth/popup-closed-by-user': 'Sign-in was closed. Try again when you are ready.',
        'auth/popup-blocked': 'Your browser blocked the sign-in window. Allow popups or use an email sign-in link.',
        'auth/unauthorized-domain': 'This website is not yet authorized for Firebase sign-in. Please contact the event team.',
        'auth/expired-action-code': 'This sign-in link has expired. Request a new link.',
        'auth/invalid-action-code': 'This sign-in link is invalid or has already been used. Request a new link.',
        'auth/invalid-email': 'Enter a valid email address.',
        'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
        'auth/network-request-failed': 'Sign-in could not connect. Check your connection and try again.',
    };
    return messages[error.code] || error.message || 'Sign-in could not be completed.';
}
