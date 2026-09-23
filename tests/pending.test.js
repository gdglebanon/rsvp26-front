import test from 'node:test';
import assert from 'node:assert/strict';
import { newPending,authorizePending,changePendingEmail,EDIT_WINDOW_MS } from '../functions/pending.js';
test('email editing ends exactly five minutes after submission and cannot reset the deadline',()=>{
 const {record}=newPending({},' first@example.test ',1000);
 assert.equal(record.email,'first@example.test');
 assert.equal(changePendingEmail(record,'new@example.test',1000+EDIT_WINDOW_MS-1),'new@example.test');
 assert.throws(()=>changePendingEmail(record,'new@example.test',1000+EDIT_WINDOW_MS));
 assert.equal(record.editUntil,1000+EDIT_WINDOW_MS);
 assert.throws(()=>changePendingEmail({...record,status:'verified'},'new@example.test',1001));
});
test('pending sessions require their unguessable secret and reject invalid emails',()=>{
 const {record,secret}=newPending({},'a@example.test');
 assert.doesNotThrow(()=>authorizePending(record,secret));
 assert.throws(()=>authorizePending(record,'0'.repeat(64)));
 assert.throws(()=>authorizePending(undefined,secret));
 assert.throws(()=>newPending({},'bad'));
});
