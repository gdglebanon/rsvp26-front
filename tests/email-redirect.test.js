import test from 'node:test';
import assert from 'node:assert/strict';
import { isEmailVerificationRedirect } from '../src/lib/email-redirect.js';

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
