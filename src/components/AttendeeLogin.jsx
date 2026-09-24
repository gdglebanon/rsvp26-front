import { useState } from 'react';
import { Mail } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup, signInWithCustomToken } from 'firebase/auth';
import { refreshVerifiedUser, sendVerificationEmail } from '../lib/email-verification';
import { authErrorMessage } from '../lib/auth-errors';
import { checkedEmail, request } from '../lib/registration';

export default function AttendeeLogin({ auth, completeLink, onRestart, initialEmail = '', otpAvailable = false,
    error: parentError = '', compact = false, loginRequired = false, onBeforeAuthenticate, pendingId, onEmailSignIn, submitted = false, verificationSent = false }) {
    const [email, setEmail] = useState(initialEmail);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState(verificationSent ? 'Verification email sent. Open the link in your inbox to view your submission.' : '');
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
            await sendVerificationEmail(target, pendingId);
            setMessage('Verification email sent. Open the link in your inbox to view your submission.');
        });
    }
    function checkVerification() {
        return run(() => refreshVerifiedUser(auth.currentUser, email));
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
            <span>{loginRequired ? 'Verify your email with Google or an email link to view your registration status.' : 'You already have details saved from previous events. Sign in to load them.'}</span>
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
        <p>{completeLink ? 'Enter the email address that received this verification link.' : submitted ? 'Open the verification link in your inbox to confirm your email and view your submission.' : 'We will email you a verification link. No password or account setup is needed.'}</p>
        <form onSubmit={emailSignIn}>
            <label htmlFor="sign-in-email">Email address</label>
            <input id="sign-in-email" type="email" required autoComplete="email" value={email} readOnly={submitted && Boolean(initialEmail) && !completeLink} onChange={e => setEmail(e.target.value)} disabled={busy || !auth}/>
            <button className="btn-primary" disabled={busy || !auth}>{busy ? 'Please wait…' : completeLink ? 'Verify and view submission' : submitted || message ? 'Resend verification email' : 'Send verification email'}</button>
        </form>
        {!completeLink && <>
            <button type="button" className="btn-primary" disabled={busy || !auth} onClick={checkVerification}>Check verification status</button>
            <button type="button" disabled={busy || !auth} onClick={googleSignIn}>Verify with Google</button>
        </>}
        {otpAvailable && !completeLink && <button type="button" disabled={busy || !email} onClick={sendCode}>Email me a verification code</button>}
        {challenge && <form onSubmit={verifyCode}><label htmlFor="otp-code">Six-digit code</label><input id="otp-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={e => setCode(e.target.value)}/><button disabled={busy || !auth}>Verify code</button></form>}
        {completeLink && <button type="button" disabled={busy || !auth} onClick={onRestart}>Send a new verification link</button>}
        {message && <p role="status">{message}</p>}
        {(error || parentError) && <p role="alert" className="login-error">{error || parentError}</p>}
    </section>;
}
