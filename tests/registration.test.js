import test from 'node:test';
import assert from 'node:assert/strict';
import { api, readPending, PENDING_KEY, EDIT_WINDOW_MS, savedProfile } from '../src/lib/registration.js';

function reset() {
    const data = new Map();
    globalThis.sessionStorage = {
        getItem: key => data.get(key) ?? null,
        setItem: (key, value) => data.set(key, value),
        removeItem: key => data.delete(key),
    };
}
test('pending demo survives a reload and email corrections preserve the deadline', async () => {
    reset();
    const session = await api('pending', { email: ' First@example.test ', form: { firstName: 'Ada', secretCode: 'private' } });
    assert.equal(readPending().email, 'first@example.test');
    assert.equal(readPending().form.secretCode, undefined);
    assert.ok(session.editUntil <= Date.now() + EDIT_WINDOW_MS);
    const updated = await api('pending-session', { id: session.id, newEmail: 'next@example.test' });
    assert.equal(updated.editUntil, session.editUntil);
    await assert.rejects(api('complete-pending', session, { email: session.email, demo: true }));
    await api('complete-pending', updated, { email: updated.email, demo: true });
    assert.equal(readPending(), null);
    assert.equal(savedProfile(updated.email).firstName, 'Ada');
});
test('expired editing window still permits confirmation and prevents email changes', async () => {
    reset();
    const session = await api('pending', { email: 'a@example.test', form: { firstName: 'Ada', comments: 'Old event' } });
    session.editUntil = Date.now() - 1;
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(session));
    await assert.rejects(api('pending-session', { id: session.id, newEmail: 'b@example.test' }));
    await api('complete-pending', session, { email: session.email, demo: true });
    assert.equal(savedProfile(session.email).comments, undefined);
});
test('invalid addresses, stale sessions, and mismatched confirmations are rejected', async () => {
    reset();
    await assert.rejects(api('pending', { email: 'invalid', form: {} }));
    await assert.rejects(api('pending-session', { id: 'missing' }));
    await assert.rejects(api('register', { email: 'a@example.test', form: {} }, { email: 'b@example.test', demo: true }));
    await api('register', { email: 'a@example.test', form: { firstName: 'Ada' } }, { email: 'a@example.test', demo: true });
    assert.equal(savedProfile('A@example.test').firstName, 'Ada');
});
