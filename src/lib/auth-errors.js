export function authErrorMessage(error) {
    const messages = {
        'auth/popup-closed-by-user': 'Sign-in was closed. Try again when you are ready.',
        'auth/popup-blocked': 'Your browser blocked the sign-in window. Allow popups or sign in with email and password.',
        'auth/unauthorized-domain': 'This website is not yet authorized for Firebase sign-in. Please contact the event team.',
        'auth/expired-action-code': 'This email link has expired. Request a new link.',
        'auth/invalid-action-code': 'This email link is invalid or has already been used. Request a new link.',
        'auth/email-already-in-use': 'This email already has an account. Sign in, or use “Forgot password / Set a password” if you previously used an email link.',
        'auth/invalid-credential': 'Email or password is incorrect. Try again or reset your password.',
        'auth/wrong-password': 'Email or password is incorrect. Try again or reset your password.',
        'auth/user-not-found': 'Email or password is incorrect. Try again or create an account.',
        'auth/weak-password': 'Choose a stronger password with at least six characters.',
        'auth/password-does-not-meet-requirements': 'This password does not meet the account password requirements. Choose a stronger password.',
        'auth/operation-not-allowed': 'Email/password sign-in is not enabled. Please contact the event team.',
        'auth/invalid-email': 'Enter a valid email address.',
        'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
        'auth/network-request-failed': 'Sign-in could not connect. Check your connection and try again.',
    };
    return messages[error.code] || error.message || 'Sign-in could not be completed.';
}
