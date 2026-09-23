import test from 'node:test';
import assert from 'node:assert/strict';
import { submissionKey, readPendingSubmission, savePendingSubmission, clearPendingSubmission } from '../src/lib/pending.js';

test('pending submissions survive email redirects and retries without storing profile fields', () => {
    const values = new Map();
    globalThis.localStorage = {getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
    const key=submissionKey('a@example.com');
    assert.match(key,/^[a-f0-9]{64}$/);
    assert.equal(submissionKey('a@example.com'),key);
    savePendingSubmission({id:'1'.repeat(64),emailVerified:false,expiresAt:new Date(Date.now()+100000).toISOString()},'a@example.com',key);
    assert.equal(readPendingSubmission().emailVerified,false);
    assert.equal(readPendingSubmission().id,'1'.repeat(64));
    assert.equal(readPendingSubmission().profile,undefined);
    assert.notEqual(submissionKey('b@example.com'),key);
    clearPendingSubmission();
    assert.equal(readPendingSubmission(),null);
});
