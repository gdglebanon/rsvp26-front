import test from 'node:test';
import assert from 'node:assert/strict';
import { isRegistrationOpen } from '../src/config.js';

test('registration is open with time closure removed', () => {
    assert.equal(isRegistrationOpen(new Date('2026-10-17T05:00:00Z')), true);
    assert.equal(isRegistrationOpen(new Date('2026-10-26T12:00:00Z')), true);
    assert.equal(isRegistrationOpen(new Date('2026-12-31T22:00:00Z')), true);
});

test('registration closes when past the deadline or explicitly force closed', () => {
    assert.equal(isRegistrationOpen(new Date('2027-01-01T00:00:00Z')), false);
    assert.equal(isRegistrationOpen(new Date(), { forceCloseRegistration: true }), false);
    assert.equal(isRegistrationOpen(new Date('2026-10-18T05:00:00Z'), { registrationDeadline: '2026-10-18T04:00:00Z' }), false);
});
