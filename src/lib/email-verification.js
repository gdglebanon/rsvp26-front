// Reload account state before replacing the cached token used by the API.
export async function refreshVerifiedUser(user) {
    if (!user) throw new Error('Sign in with your email and password to continue.');
    await user.reload();
    if (!user.emailVerified) throw new Error('Your email is not verified yet. Open the verification link in your inbox first.');
    await user.getIdToken(true);
}
