const KEY = 'rsvpUnverifiedDraft';
export function saveDraft(form) {
    const { secretCode, ...safeForm } = form;
    localStorage.setItem(KEY, JSON.stringify({ form: safeForm, expiresAt: Date.now() + 30 * 60 * 1000 }));
}
export function readDraft() {
    try {
        const draft = JSON.parse(localStorage.getItem(KEY) || 'null');
        if (!draft || draft.expiresAt <= Date.now()) { clearDraft(); return null; }
        return draft.form;
    } catch { clearDraft(); return null; }
}
export function clearDraft() { localStorage.removeItem(KEY); }
