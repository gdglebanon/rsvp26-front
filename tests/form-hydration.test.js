import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeLoadedForm } from '../src/lib/form-hydration.js';

test('background account data fills untouched fields and preserves in-progress edits', () => {
    const initial = { email: '', firstName: '', lastName: '', techInterests: [], expLevels: { Student: 0 } };
    const current = { ...initial, firstName: 'Typed name', techInterests: ['Cloud'] };
    const incoming = { email: 'verified@example.com', firstName: 'Saved name', lastName: 'Saved surname', techInterests: ['Android'], expLevels: { Student: 2 } };
    assert.deepEqual(mergeLoadedForm(current, initial, incoming), {
        email: incoming.email, firstName: 'Typed name', lastName: 'Saved surname', techInterests: ['Cloud'], expLevels: { Student: 2 },
    });
    assert.equal(current.email, '');
});

test('later refreshes update unchanged values while enforcing the signed-in email', () => {
    const previous = { email: 'saved@example.com', firstName: 'Saved', lastName: 'Name' };
    const current = { ...previous, email: 'typed@example.com', lastName: 'Edited' };
    assert.deepEqual(mergeLoadedForm(current, previous, { email: previous.email, firstName: 'Updated', lastName: 'Remote' }), {
        email: previous.email, firstName: 'Updated', lastName: 'Edited',
    });
});
