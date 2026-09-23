import { isEmailVerificationRedirect } from '../lib/email-redirect';
import { authErrorMessage } from '../lib/auth-errors';
import { useEffect, useRef, useState } from 'react';
import { isSignInWithEmailLink, onAuthStateChanged, signInWithEmailLink, signOut } from 'firebase/auth';
import App from '../App';
import { configureAuth } from '../lib/firebase';
import { request, checkedEmail, normalizeEmail } from '../lib/registration';
import { readDraft, saveDraft, clearDraft } from '../lib/draft';
import AttendeeLogin from './AttendeeLogin';
import { readPendingSubmission, savePendingSubmission, clearPendingSubmission, submissionKey } from '../lib/pending';
import './RegistrationPortal.css';

function AccountPanel({ user, session, onRefresh, auth }) {
    const [busy, setBusy] = useState(false), [error, setError] = useState(''), [qr, setQr] = useState('');
    const [confirmCancel, setConfirmCancel] = useState(false);
    const ticket = session.ticket;
    useEffect(() => {
        let active = true, objectUrl;
        setQr('');
        if (ticket?.status === 'confirmed') request('ticket/qr', { user, blob: true }).then(blob => {
            objectUrl = URL.createObjectURL(blob);
            if (active) setQr(objectUrl); else URL.revokeObjectURL(objectUrl);
        }).catch(e => { if (active) setError(authErrorMessage(e)); });
        return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
    }, [user, ticket?.version, ticket?.status]);
    async function perform(action) {
        setBusy(true); setError('');
        try { await action(); await onRefresh(); } catch (e) { setError(authErrorMessage(e)); }
        finally { setBusy(false); }
    }
    async function confirm() {
        const saved = sessionStorage.getItem('rsvpInvitation');
        const { token } = saved ? { token: saved } : await request('invitations/current', { user });
        await request('invitations/confirm', { user, method: 'POST', body: { token } });
        sessionStorage.removeItem('rsvpInvitation');
    }
    return <aside className="account-panel">
        <div className="account-heading"><strong>Verified: {user.email}</strong><button onClick={() => signOut(auth)}>Sign out</button></div>
        {session.legacyProfileLoaded && <p>Your previous attendee information is loaded. Review it and submit your 2026 application.</p>}
        {ticket ? <>
            <h2>You are already registered · Status: <span className={`ticket-status status-${ticket.status}`}>{ticket.status}</span></h2>
            <p>{ticket.ticketType === 'VIP' ? 'VIP ticket' : 'Standard application'} · {ticket.status === 'cancelled' ? 'You can review your information and resubmit below.' : 'You can update your information below.'}</p>
            {ticket.status === 'submitted' && <p>Your application is awaiting review by the event team.</p>}
            {ticket.status === 'invited' && <><p>Confirm your spot before {new Date(ticket.invitationExpiresAt).toLocaleString()}.</p><button className="btn-primary" disabled={busy} onClick={() => perform(confirm)}>Confirm my spot</button></>}
            {ticket.status === 'expired' && <p>Your invitation has expired. The team will need to issue a new invitation.</p>}
            {qr && <div className="ticket-qr"><img src={qr} alt="Your confirmed DevFest entry QR code"/><a href={qr} download="devfest-ticket.png">Download ticket</a></div>}
            {!['cancelled', 'rejected'].includes(ticket.status) && !ticket.checkedInAt && <div className="cancel-controls">
                {!confirmCancel ? <button disabled={busy} onClick={() => setConfirmCancel(true)}>Cancel registration</button> : <>
                    <p>Cancel your application and release your spot?</p>
                    <button disabled={busy} onClick={() => perform(async () => { await request('registration/cancel', { user, method: 'POST', body: { version: ticket.version } }); setConfirmCancel(false); })}>Yes, cancel registration</button>
                    <button disabled={busy} onClick={() => setConfirmCancel(false)}>Keep my registration</button>
                </>}
            </div>}
        </> : <p>Complete the form below to apply for DevFest 2026.</p>}
        <button disabled={busy} onClick={() => perform(async () => {})}>Refresh status</button>
        {error && <p className="login-error" role="alert">{error}</p>}
    </aside>;
}

export default function RegistrationPortal() {
    const [config, setConfig] = useState(null), [auth, setAuth] = useState(null), [user, setUser] = useState(null);
    const [session, setSession] = useState(null), [error, setError] = useState(''), [loading, setLoading] = useState(true);
    const [needsEmail, setNeedsEmail] = useState(false);
    const [emailRedirect, setEmailRedirect] = useState(() => isEmailVerificationRedirect(window.location.href));
    const [formGeneration, setFormGeneration] = useState(0);
    const [connectionAttempt, setConnectionAttempt] = useState(0);
    const previousUid = useRef(null);
    const [draft, setDraft] = useState(readDraft);
    const [showVerification, setShowVerification] = useState(false);
    const [pendingSubmission, setPendingSubmission] = useState(readPendingSubmission);
    const [pendingError, setPendingError] = useState('');
    const pendingRef = useRef(readPendingSubmission());
    const verificationEmail = useRef(readDraft()?.email || '');
    const linkCompleting = useRef(false);
    const generation = useRef(0);
    const load = async (current = user) => {
        const marker = ++generation.current;
        const pending = pendingRef.current;
        if (pending?.id && (!pending.email || normalizeEmail(pending.email) === normalizeEmail(current.email))) {
            try {
                await request('pending/complete', { user: current, method: 'POST', body: { id: pending.id } });
                pendingRef.current = null; clearPendingSubmission(); clearDraft();
                setPendingSubmission(null); setDraft(null); setPendingError(''); clearCallback();
            } catch (e) { setPendingError(e.message); }
        }
        const result = await request('me', { user: current });
        if (marker === generation.current) setSession(result);
    };
    function clearCallback() {
        const url = new URL(window.location.href);
        ['apiKey', 'oobCode', 'mode', 'lang', 'auth', 'continueUrl', 'pending'].forEach(key => url.searchParams.delete(key));
        window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }
    async function finishEmail(email, targetAuth = auth) {
        if (linkCompleting.current) return;
        linkCompleting.current = true;
        setLoading(true); setNeedsEmail(false);
        try {
            await signInWithEmailLink(targetAuth, email, window.location.href);
            localStorage.removeItem('rsvpSignInEmail');
            clearCallback(); setNeedsEmail(false);
        } catch (e) {
            setNeedsEmail(true); setLoading(false);
            throw e;
        } finally { linkCompleting.current = false; }
    }
    useEffect(() => {
        let active = true, unsubscribe;
        setLoading(true); setError('');
        const pendingId = new URLSearchParams(window.location.search).get('pending');
        if (pendingId && /^[a-f0-9]{64}$/.test(pendingId)) {
            pendingRef.current = { id: pendingId };
            setPendingSubmission({ id: pendingId });
        }
        const invitation = new URLSearchParams(window.location.hash.slice(1)).get('invite');
        if (invitation && /^[a-f0-9]{64}$/.test(invitation)) {
            sessionStorage.setItem('rsvpInvitation', invitation);
            window.history.replaceState({}, '', window.location.pathname + window.location.search);
        }
        request('config').then(async data => {
            if (!active) return;
            setConfig(data);
            const firebaseAuth = await configureAuth(data.firebase);
            if (!active) return;
            setConfig(data); setAuth(firebaseAuth);
            if (isSignInWithEmailLink(firebaseAuth, window.location.href)) {
                setEmailRedirect(true);
                const email = localStorage.getItem('rsvpSignInEmail');
                if (email) {
                    try { await finishEmail(email, firebaseAuth); }
                    catch (e) { if (active) { setError(authErrorMessage(e)); setNeedsEmail(true); } }
                } else setNeedsEmail(true);
            }
            if (!active) return;
            unsubscribe = onAuthStateChanged(firebaseAuth, async current => {
                if (!active) return;
                // A pre-existing session must not bypass an unfinished email link.
                if (isSignInWithEmailLink(firebaseAuth, window.location.href) && !linkCompleting.current) {
                    setLoading(false);
                    return;
                }
                if (current && verificationEmail.current && normalizeEmail(current.email) !== normalizeEmail(verificationEmail.current)) {
                    setError(`Sign in with ${verificationEmail.current} to verify this form.`);
                    await signOut(firebaseAuth);
                    setShowVerification(Boolean(pendingRef.current?.id));
                    return;
                }
                if (previousUid.current && previousUid.current !== current?.uid) {
                    setFormGeneration(value => value + 1);
                    clearDraft(); setDraft(null);
                }
                previousUid.current = current?.uid || null;
                ++generation.current; setUser(current); setSession(null); setLoading(true);
                try {
                    if (current?.emailVerified) {
                        await load(current);
                        if (active) { setShowVerification(false); setNeedsEmail(false); setError(''); setEmailRedirect(false); }
                    }
                    else if (current) setError('Please verify your email to continue.');
                } catch (e) { if (active) setError(authErrorMessage(e)); }
                finally { if (active) setLoading(false); }
            });
        }).catch(e => { if (active) { setError(authErrorMessage(e)); setLoading(false); } });
        return () => { active = false; ++generation.current; unsubscribe?.(); };
    }, [connectionAttempt]);
    const attendee = session || { profile: null, ticket: null };
    function prepareAuthentication(form) {
        verificationEmail.current = checkedEmail(form.email);
        saveDraft(form); setDraft(form); setError('');
    }
    async function submitUnverified(form) {
        const email = checkedEmail(form.email);
        const key = submissionKey(email);
        const receipt = await request('pending', { method: 'POST', body: {
            email, form: { ...form, email }, submissionKey: key, emailVerified: false,
        } });
        const record = savePendingSubmission(receipt, email, key);
        pendingRef.current = record; setPendingSubmission(record);
        prepareAuthentication(form); setShowVerification(true);
    }
    async function saved() {
        clearDraft(); clearPendingSubmission(); pendingRef.current = null; setPendingSubmission(null); setDraft(null); verificationEmail.current = '';
        await load(user);
    }
    if (emailRedirect && loading && !needsEmail) {
        return <main className="auth-shell"><p role="status">Verifying your email and loading your submission status…</p></main>;
    }
    return <>
        {!loading && error && (!auth || (user && !session)) && <aside className="account-panel">
            <p role="alert" className="login-error">{error}</p>
            <button onClick={() => { setLoading(true); setConnectionAttempt(value => value + 1); }}>Retry connection</button>
            {user && auth && <button onClick={() => signOut(auth)}>Sign out</button>}
        </aside>}
        {user && session && <AccountPanel user={user} session={session} auth={auth} onRefresh={() => load(user)}/>}
        {pendingError && <aside className="account-panel"><p role="alert" className="login-error">Your email is verified, but the saved registration could not be completed: {pendingError}</p><button onClick={() => load(user)}>Retry saved registration</button></aside>}
        {!(emailRedirect && needsEmail) && !attendee.ticket?.checkedInAt && <App key={formGeneration} submissionReady={!loading && Boolean(auth) && (!user || Boolean(session))}
            user={user} attendee={attendee} eventConfig={config || { registrationOpen: true }} onSaved={saved} onUnverifiedSubmit={submitUnverified} initialDraft={draft} pendingEmail={pendingSubmission?.email}
            renderEmailSignIn={(form, loginRequired = false) => <AttendeeLogin key={form.email} compact auth={auth} loginRequired={loginRequired}
                initialEmail={form.email} error={error}
                pendingId={pendingSubmission?.email === normalizeEmail(form.email) ? pendingSubmission.id : undefined}
                onBeforeAuthenticate={() => prepareAuthentication(form)}/> }/>}
        {auth && (showVerification || needsEmail) && <div className="verification-overlay" role="dialog" aria-modal="true" aria-label="Verify your email">
            <div><AttendeeLogin auth={auth} otpAvailable={config.otpAvailable} initialEmail={verificationEmail.current}
                submitted={Boolean(pendingSubmission?.id)} pendingId={pendingSubmission?.id}
                completeLink={needsEmail ? finishEmail : null}
                onRestart={() => { clearCallback(); setEmailRedirect(false); setNeedsEmail(false); setShowVerification(true); setError(''); }} error={error}/>
                <button className="verification-back" onClick={() => { clearCallback(); setEmailRedirect(false); setNeedsEmail(false); setShowVerification(false); setError(''); }}>Continue filling the form</button>
                <p className="verification-note">{pendingSubmission?.id ? 'Your registration is saved with an unverified email. Verification will complete it automatically.' : 'Your saved details will load after you verify your email.'}</p>
            </div>
        </div>}
    </>;
}
