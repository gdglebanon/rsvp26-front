import test from 'node:test';
import assert from 'node:assert/strict';
import { isEmailVerificationRedirect, verificationPendingId } from '../src/lib/email-redirect.js';

test('email sign-in redirects wait from the first render', () => {
    assert.equal(isEmailVerificationRedirect('https://rsvp.example/?auth=callback&mode=signIn&oobCode=code'), true);
    assert.equal(isEmailVerificationRedirect('https://rsvp.example/?mode=signIn&oobCode=code'), true);
    assert.equal(isEmailVerificationRedirect('https://rsvp.example/?auth=callback&pending=receipt'), true);
});

test('normal, VIP, invitation and unrelated auth visits open immediately', () => {
    for (const suffix of ['', '?vip', '#invite=token', '?pending=receipt', '?mode=resetPassword&oobCode=code', '?mode=signIn']) {
        assert.equal(isEmailVerificationRedirect(`https://rsvp.example/${suffix}`), false);
    }
});

test('email verification actions wait for Firebase validation', () => {
    assert.equal(isEmailVerificationRedirect('https://rsvp.example/?mode=verifyEmail&oobCode=code'), true);
    assert.equal(isEmailVerificationRedirect('https://rsvp.example/?mode=verifyEmail'), false);
});


test('standard verification actions recover the pending submission from trusted continue URLs', () => {
    const id = 'a'.repeat(64);
    const action = new URL('https://rsvp.example/rsvp/?mode=verifyEmail&oobCode=secret');
    action.searchParams.set('continueUrl', `https://rsvp.example/rsvp/?auth=callback&pending=${id}`);
    assert.equal(verificationPendingId(action.href), id);
    action.searchParams.set('continueUrl', `https://other.example/rsvp/?pending=${id}`);
    assert.equal(verificationPendingId(action.href), null);
    action.searchParams.set('continueUrl', 'invalid');
    assert.equal(verificationPendingId(action.href), null);
    assert.equal(verificationPendingId(`https://rsvp.example/?pending=${id}`), id);
    assert.equal(verificationPendingId('https://rsvp.example/?pending=invalid'), null);
});
