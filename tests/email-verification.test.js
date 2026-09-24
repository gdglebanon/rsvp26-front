import test from 'node:test';
import assert from 'node:assert/strict';
import { refreshVerifiedUser, sendVerificationEmail } from '../src/lib/email-verification.js';

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
    await assert.rejects(refreshVerifiedUser(null), /Open the verification email link/);
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


test('verification mail requests send only the email and pending reference to the backend', async () => {
    let delivered;
    await sendVerificationEmail(' Attendee@Example.com ', 'pending-id', async (...args) => {
        delivered = args;
    });
    assert.deepEqual(delivered, ['auth/email/request', {
        method: 'POST', body: { email: 'attendee@example.com', pendingId: 'pending-id' },
    }]);
});

test('delivery failures propagate so a saved submission can offer retry', async () => {
    await assert.rejects(sendVerificationEmail('a@example.com', 'pending-id', async () => {
        throw new Error('Delivery unavailable');
    }), /Delivery unavailable/);
});

test('a verified session for another email cannot pass the status check', async () => {
    await assert.rejects(refreshVerifiedUser({
        email: 'other@example.com', emailVerified: true,
        async reload() {},
        async getIdToken() { assert.fail('Wrong identity must not continue'); },
    }, 'attendee@example.com'), /email address used for this submission/);
});
