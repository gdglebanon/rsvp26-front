import { useEffect, useRef, useState } from 'react';
import { checkedEmail, normalizeEmail, savedProfile } from '../lib/registration';

export default function AttendeeLogin({ email, onProfile, onVerified, required = false }) {
    const [open, setOpen] = useState(required);
    const [linkPending, setLinkPending] = useState(false);
    const [verified, setVerified] = useState('');
    const [error, setError] = useState('');
    const callbacks = useRef({ onProfile, onVerified });
    callbacks.current = { onProfile, onVerified };
    useEffect(() => {
        setOpen(required);
        setLinkPending(false);
        setVerified('');
        setError('');
        callbacks.current.onVerified(null);
    }, [email, required]);

    function confirm() {
        setError('');
        try {
            const target = checkedEmail(email);
            const profile = required ? null : savedProfile(target);
            if (profile) callbacks.current.onProfile(profile);
            setVerified(target);
            setOpen(false);
            callbacks.current.onVerified({ email: target, demo: true });
        } catch (error) { setError(error.message); }
    }
    function sendLink() {
        setError('');
        try { checkedEmail(email); setLinkPending(true); }
        catch (error) { setError(error.message); }
    }
    const confirmed = verified && verified === normalizeEmail(email);
    return <div className="login-panel">
        {confirmed ? <strong>✓ Email confirmed for this demo</strong> : <>
            <p>Demo verification: no email is sent and no Google account is connected.</p>
            {!open && <button type="button" onClick={() => setOpen(true)}>Verify email</button>}
            {open && <div className="login-options">
                <button type="button" disabled={!email} onClick={confirm}>Continue with Google (demo)</button>
                <button type="button" disabled={!email} onClick={sendLink}>Email me a sign-in link (demo)</button>
                {linkPending && <>
                    <p role="status">Demo link ready. Continue below to simulate email confirmation.</p>
                    <button type="button" onClick={confirm}>Complete email sign-in (demo)</button>
                </>}
            </div>}
        </>}
        {error && <p className="login-error" role="alert">{error}</p>}
    </div>;
}
