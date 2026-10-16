import test from 'node:test';
import assert from 'node:assert/strict';
import { isRegistrationOpen } from '../src/config.js';

test('temporary registration closure remains active across the previous opening time', () => {
    assert.equal(isRegistrationOpen(new Date('2026-10-17T04:59:59.999Z')), false);
    assert.equal(isRegistrationOpen(new Date('2026-10-17T05:00:00Z')), false);
    assert.equal(isRegistrationOpen(new Date('2026-12-31T22:00:00Z')), false);
});

test('server configuration cannot override the temporary frontend closure', () => {
    const now = new Date('2026-10-18T05:00:00Z');
    assert.equal(isRegistrationOpen(now, { forceCloseRegistration: true }), false);
    assert.equal(isRegistrationOpen(now, { registrationOpensAt: '2026-10-19T05:00:00Z' }), false);
    assert.equal(isRegistrationOpen(now, { registrationDeadline: '2026-10-18T04:00:00Z' }), false);
});
