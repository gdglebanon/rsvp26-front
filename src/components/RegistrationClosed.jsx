import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EVENT_CONFIG } from '../config';
import DevFestLogo from './DevFestLogo';
import '../App.css';

export default function RegistrationClosed() {
    const [now, setNow] = useState(Date.now);
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);
    const showVisitorNotice = now >= EVENT_CONFIG.registrationOpensAt.getTime();

    return (
        <main className="app-container closed-container">
            <div className="logo-container"><DevFestLogo /></div>
            <div className="closed-message">
                <AlertTriangle size={48} className="warning-icon" />
                {showVisitorNotice ? <>
                    <h1>Visitor Experience</h1>
                    <p>RSVP code: <strong>RSVP26</strong></p>
                    <p>If you don’t have a ticket, please join us starting at <strong>10:30 AM</strong> for the Visitor Experience.</p>
                </> : <>
                    <h1>Registration is now closed</h1>
                    <p>Please visit the info desk tomorrow to collect your visitor badge, starting at <strong>10:30 AM</strong>.</p>
                </>}
            </div>
        </main>
    );
}
