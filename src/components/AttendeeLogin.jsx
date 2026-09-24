import { useState } from 'react';
import { Mail } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signOut, signInWithCustomToken } from 'firebase/auth';
import { refreshVerifiedUser } from '../lib/email-verification';
import { authErrorMessage } from '../lib/auth-errors';
import { checkedEmail, request } from '../lib/registration';

export default function AttendeeLogin({ auth, completeLink, onRestart, initialEmail = '', otpAvailable = false,
    error: parentError = '', compact = false, loginRequired = false, onBeforeAuthenticate, pendingId, onEmailSignIn, submitted = false }) {
    const [email, setEmail] = useState(initialEmail);
    const [password, setPassword] = useState('');
    const [creating, setCreating] = useState(submitted);
    const unverifiedUser = auth?.currentUser && !auth.currentUser.emailVerified ? auth.currentUser : null;
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [challenge, setChallenge] = useState(null);
    const [code, setCode] = useState('');
    async function run(action) {
        setBusy(true); setError('');
        try { await action(); } catch (e) { setError(authErrorMessage(e)); }
        finally { setBusy(false); }
    }
    function googleSignIn() {
        return run(() => {
            onBeforeAuthenticate?.();
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ login_hint: email });
            return signInWithPopup(auth, provider);
        });
    }
    async function emailSignIn(event) {
        event?.preventDefault();
        await run(async () => {
            const target = checkedEmail(email);
            if (completeLink) { await completeLink(target); return; }
            onBeforeAuthenticate?.();
            const credential = creating
                ? await createUserWithEmailAndPassword(auth, target, password)
                : await signInWithEmailAndPassword(auth, target, password);
            setPassword('');
            if (!credential.user.emailVerified) {
                if (creating) await sendVerification(credential.user);
                else setMessage('Verify your email, then select “I have verified my email”. You can resend the verification email below.');
            }
        });
    }
    function callbackSettings() {
        const url = new URL(window.location.pathname, window.location.origin);
        url.searchParams.set('auth', 'callback');
        if (pendingId) url.searchParams.set('pending', pendingId);
        if (new URLSearchParams(window.location.search).has('vip')) url.searchParams.set('vip', '');
        return { url: url.href, handleCodeInApp: false };
    }
    async function sendVerification(current) {
        await sendEmailVerification(current, callbackSettings());
        setMessage('Check your inbox for an email address verification link. After opening it, return here and select “I have verified my email”.');
    }
    function checkVerification() {
        return run(() => refreshVerifiedUser(auth.currentUser));
    }
    function resetPassword() {
        return run(async () => {
            await sendPasswordResetEmail(auth, checkedEmail(email));
            setMessage('If this account exists, a password reset email has been sent. Use it to set a password, then sign in here.');
        });
    }
    async function sendCode() {
        await run(async () => {
            onBeforeAuthenticate?.();
            const result = await request('auth/otp/request', { method: 'POST', body: { email: checkedEmail(email) } });
            setChallenge(result.challengeId); setMessage('A six-digit code has been sent. It expires in 10 minutes.');
        });
    }
    async function verifyCode(event) {
        event.preventDefault();
        await run(async () => {
            const { customToken } = await request('auth/otp/verify', { method: 'POST', body: { challengeId: challenge, code } });
            await signInWithCustomToken(auth, customToken);
        });
    }
    if (compact) return <div className="inline-verification">
        <div className="inline-verification-row">
            <span>{loginRequired ? 'Login is necessary to continue your registration. Sign in with Google or your email and password to view your registration status.' : 'You already have details saved from previous events. Sign in to load them.'}</span>
            <div className="verification-icons">
                <button type="button" className="verification-icon" aria-label="Sign in with Google" title="Sign in with Google" disabled={busy || !auth} onClick={googleSignIn}><span className="google-mark" aria-hidden="true">G</span></button>
                <button type="button" className="verification-icon" aria-label="Sign in with email" title="Sign in with email" disabled={busy || !auth} onClick={() => { onBeforeAuthenticate?.(); onEmailSignIn?.(); }}><Mail size={20} aria-hidden="true"/></button>
            </div>
        </div>
        {message && <p role="status">{message}</p>}
        {(error || parentError) && <p role="alert" className="login-error">{error || parentError}</p>}
    </div>;
    return <section className="auth-card">
        <p className="auth-eyebrow">GDG LEBANON · DEVFEST 2026</p>
        <h1>{completeLink ? 'Verify your email' : submitted ? 'Your registration is saved' : 'Verify your email'}</h1>
        <p>{completeLink ? 'Enter the email address that received this sign-in link.' : submitted ? 'Your email is not verified yet. Choose an option below to complete your registration.' : 'Sign in with your email and password, or create an account and verify your email.'}</p>
        {!completeLink && <button type="button" className="btn-primary" disabled={busy || !auth} onClick={googleSignIn}>Continue with Google</button>}
        {unverifiedUser && !completeLink ? <div>
            <p>Verify the email address {unverifiedUser.email} to continue.</p>
            <button type="button" className="btn-primary" disabled={busy} onClick={checkVerification}>I have verified my email</button>
            <button type="button" disabled={busy} onClick={() => run(() => sendVerification(unverifiedUser))}>Resend verification email</button>
            <button type="button" disabled={busy} onClick={() => run(() => signOut(auth))}>Use another account</button>
        </div> : <><form onSubmit={emailSignIn}>
            <label htmlFor="sign-in-email">Email address</label>
            <input id="sign-in-email" type="email" required autoComplete="email" value={email} readOnly={submitted && !completeLink} onChange={e => setEmail(e.target.value)} disabled={busy || !auth}/>
            {!completeLink && <><label htmlFor="sign-in-password">Password</label>
                <input id="sign-in-password" type="password" required minLength={creating ? 6 : undefined} autoComplete={creating ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} disabled={busy || !auth}/></>}
            <button className="btn-primary" disabled={busy || !auth}>{busy ? 'Please wait…' : completeLink ? 'Verify and continue' : creating ? 'Create account and verify email' : 'Sign in'}</button>
        </form>
        {!completeLink && <>
            <button type="button" disabled={busy} onClick={() => { setCreating(!creating); setError(''); setMessage(''); setPassword(''); }}>{creating ? 'Already have an account? Sign in' : 'New here? Create an account'}</button>
            <button type="button" disabled={busy || !auth || !email} onClick={resetPassword}>Forgot password / Set a password</button>
        </>}</>}
        {otpAvailable && !completeLink && <button type="button" disabled={busy || !email} onClick={sendCode}>Email me a verification code</button>}
        {challenge && <form onSubmit={verifyCode}><label htmlFor="otp-code">Six-digit code</label><input id="otp-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={e => setCode(e.target.value)}/><button disabled={busy || !auth}>Verify code</button></form>}
        {completeLink && <button type="button" disabled={busy || !auth} onClick={onRestart}>Continue with email and password</button>}
        {message && <p role="status">{message}</p>}
        {(error || parentError) && <p role="alert" className="login-error">{error || parentError}</p>}
    </section>;
}
