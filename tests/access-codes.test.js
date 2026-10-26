import test from 'node:test';
import assert from 'node:assert/strict';
import { applyAccessCode } from '../src/lib/access-codes.js';

test('role codes add the exact marker without losing attendee comments', () => {
    for (const [code, marker] of [['Speaker','SPEAKER_EXTERNAL'], ['Partner','PARTNER_EXTERNAL'], ['Volunteer','VOLUNTEER_EXTERNAL']]) {
        const result = applyAccessCode('My demo proposal', ` ${code.toUpperCase()} `);
        assert.equal(result, `My demo proposal\n${marker}`);
        assert.equal(applyAccessCode(result, code), result);
    }
});

test('switching or clearing codes replaces only standalone automatic markers', () => {
    assert.equal(applyAccessCode('Notes\nSPEAKER_EXTERNAL', 'Partner', 'Speaker'), 'Notes\nPARTNER_EXTERNAL');
    assert.equal(applyAccessCode('Notes\nSPEAKER_EXTERNAL', '', 'Speaker'), 'Notes');
    assert.equal(applyAccessCode('Notes\nSPEAKER_EXTERNAL', 'RSVP26', 'Speaker'), 'Notes');
    assert.equal(applyAccessCode('Explain SPEAKER_EXTERNAL here', 'Volunteer'), 'Explain SPEAKER_EXTERNAL here\nVOLUNTEER_EXTERNAL');
    assert.equal(applyAccessCode('Notes\nSPEAKER_EXTERNAL', ''), 'Notes\nSPEAKER_EXTERNAL');
});
