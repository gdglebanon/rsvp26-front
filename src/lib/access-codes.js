export const ACCESS_CODE_MARKERS = {
    speaker: 'SPEAKER_EXTERNAL',
    partner: 'PARTNER_EXTERNAL',
    volunteer: 'VOLUNTEER_EXTERNAL',
    rsvp26: '',
};

const normalize = code => String(code || '').trim().toLowerCase();
const known = code => Object.hasOwn(ACCESS_CODE_MARKERS, normalize(code));

export function applyAccessCode(comments, code, previousCode = '') {
    if (!known(code) && !known(previousCode)) return comments || '';
    const markers = Object.values(ACCESS_CODE_MARKERS).filter(Boolean);
    const text = String(comments || '').split('\n')
        .filter(line => !markers.includes(line.trim())).join('\n').trimEnd();
    const marker = ACCESS_CODE_MARKERS[normalize(code)];
    return marker ? [text, marker].filter(Boolean).join('\n') : text;
}
