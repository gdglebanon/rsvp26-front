import test from 'node:test';
import assert from 'node:assert/strict';
import { refreshVerifiedUser } from '../src/lib/email-verification.js';

test('verification reloads the account before forcing a fresh API token', async () => {
    const calls = [];
    const user = {
        emailVerified: false,
        async reload() { calls.push('reload'); this.emailVerified = true; },
        async getIdToken(force) { calls.push(['token', force]); },
    };
    await refreshVerifiedUser(user);
    assert.deepEqual(calls, ['reload', ['token', true]]);
});

test('unverified or absent sessions cannot proceed as verified', async () => {
    await assert.rejects(refreshVerifiedUser(null), /Sign in/);
    let requestedToken = false;
    await assert.rejects(refreshVerifiedUser({
        emailVerified: false,
        async reload() {},
        async getIdToken() { requestedToken = true; },
    }), /not verified yet/);
    assert.equal(requestedToken, false);
});

test('failed account reloads do not refresh the API token', async () => {
    await assert.rejects(refreshVerifiedUser({
        emailVerified: true,
        async reload() { throw new Error('Network unavailable'); },
        async getIdToken() { assert.fail('Must not request a token after reload failure'); },
    }), /Network unavailable/);
});
