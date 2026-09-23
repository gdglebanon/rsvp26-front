import { useState } from 'react';
import { Mail } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup, sendSignInLinkToEmail, signInWithCustomToken } from 'firebase/auth';
import { authErrorMessage } from '../lib/auth-errors';
import { checkedEmail, request } from '../lib/registration';

export default function AttendeeLogin({ auth, completeLink, onRestart, initialEmail = '', otpAvailable = false,
    error: parentError = '', compact = false, onBeforeAuthenticate, pendingId, submitted = false }) {
    const [email, setEmail] = useState(initialEmail);
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
            const url = new URL(window.location.pathname, window.location.origin);
            url.searchParams.set('auth', 'callback');
            if (pendingId) url.searchParams.set('pending', pendingId);
            if (new URLSearchParams(window.location.search).has('vip')) url.searchParams.set('vip', '');
            await sendSignInLinkToEmail(auth, target, { url: url.href, handleCodeInApp: true });
            localStorage.setItem('rsvpSignInEmail', target);
            setMessage('Check your inbox for a sign-in link.');
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
            <span>You already have details saved from previous events. Sign in to load them.</span>
            <div className="verification-icons">
                <button type="button" className="verification-icon" aria-label="Sign in with Google" title="Sign in with Google" disabled={busy} onClick={googleSignIn}><span className="google-mark" aria-hidden="true">G</span></button>
                <button type="button" className="verification-icon" aria-label="Send an email sign-in link" title="Send an email sign-in link" disabled={busy} onClick={emailSignIn}><Mail size={20} aria-hidden="true"/></button>
            </div>
        </div>
        {message && <p role="status">{message}</p>}
        {(error || parentError) && <p role="alert" className="login-error">{error || parentError}</p>}
    </div>;
    return <section className="auth-card">
        <p className="auth-eyebrow">GDG LEBANON · DEVFEST 2026</p>
        <h1>{completeLink ? 'Verify your email' : submitted ? 'Your registration is saved' : 'Verify your email'}</h1>
        <p>{completeLink ? 'Enter the email address that received this sign-in link.' : submitted ? 'Your email is not verified yet. Choose an option below to complete your registration.' : 'Sign in to load your saved details.'}</p>
        {!completeLink && <button type="button" className="btn-primary" disabled={busy} onClick={googleSignIn}>Continue with Google</button>}
        <form onSubmit={emailSignIn}>
            <label htmlFor="sign-in-email">Email address</label>
            <input id="sign-in-email" type="email" required autoComplete="email" value={email} readOnly={submitted && !completeLink} onChange={e => setEmail(e.target.value)} disabled={busy}/>
            <button className="btn-primary" disabled={busy}>{busy ? 'Please wait…' : completeLink ? 'Verify and continue' : 'Email me a sign-in link'}</button>
        </form>
        {otpAvailable && !completeLink && <button type="button" disabled={busy || !email} onClick={sendCode}>Email me a verification code</button>}
        {challenge && <form onSubmit={verifyCode}><label htmlFor="otp-code">Six-digit code</label><input id="otp-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={e => setCode(e.target.value)}/><button disabled={busy}>Verify code</button></form>}
        {completeLink && <button type="button" disabled={busy} onClick={onRestart}>Request a new sign-in link</button>}
        {message && <p role="status">{message}</p>}
        {(error || parentError) && <p role="alert" className="login-error">{error || parentError}</p>}
    </section>;
}
