import test from 'node:test';
import assert from 'node:assert/strict';
import { readDraft, saveDraft, clearDraft } from '../src/lib/draft.js';

test('verification draft survives redirects, excludes VIP codes, and expires', () => {
    const values = new Map();
    globalThis.localStorage = {getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
    saveDraft({email:'a@example.com',firstName:'Alex',secretCode:'private-vip'});
    assert.deepEqual(readDraft(),{email:'a@example.com',firstName:'Alex'});
    assert.ok(![...values.values()].join('').includes('private-vip'));
    const clock=Date.now;
    Date.now=()=>clock()+31*60*1000;
    try { assert.equal(readDraft(),null); } finally { Date.now=clock; }
    assert.equal(values.size,0);
    saveDraft({email:'a@example.com'});
    clearDraft();
    assert.equal(readDraft(),null);
});
