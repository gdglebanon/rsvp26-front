import { useState } from 'react';
import { Linkedin, Github, Pencil } from 'lucide-react';
import { parseProfileUrl } from '../lib/profileUrl';

export default function ProfileUrlInput({ value, onChange, onBlur }) {
    const [editing, setEditing] = useState(false);
    const profile = parseProfileUrl(value);
    if (editing || !profile) {
        return <input type="url" name="linkedIn" aria-label="LinkedIn or GitHub URL"
            placeholder="https://linkedin.com/in/... or https://github.com/..."
            value={value} onChange={onChange} autoFocus={editing}
            onFocus={() => setEditing(true)} onBlur={event => { setEditing(false); onBlur(event); }} />;
    }
    const Icon = profile.provider === 'LinkedIn' ? Linkedin : Github;
    return <div className="profile-link-preview">
        <a href={profile.href} target="_blank" rel="noopener noreferrer" title={profile.href}
            aria-label={`Open ${profile.provider} profile for ${profile.username} (new tab)`}>
            <Icon size={20} aria-hidden="true" /><span>{profile.username}</span>
        </a>
        <button type="button" aria-label="Edit profile URL" title="Edit profile URL" onClick={() => setEditing(true)}>
            <Pencil size={17} aria-hidden="true" />
        </button>
    </div>;
}
