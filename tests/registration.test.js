import test from 'node:test';
import assert from 'node:assert/strict';
import { request, saveRegistration, checkedEmail } from '../src/lib/registration.js';

const user = { email: 'alex@example.com', emailVerified: true, getIdToken: async () => 'verified-token' };
test('create and edit send Firebase bearer tokens and revision', async () => {
    const calls=[];
    globalThis.fetch = async (url, init) => { calls.push({url,init}); return {ok:true,json:async()=>({id:'ticket'})}; };
    await saveRegistration(user,{email:user.email},null);
    await saveRegistration(user,{email:user.email},{version:4});
    assert.equal(calls[0].init.headers.Authorization,'Bearer verified-token');
    assert.equal(calls[0].init.method,'POST');
    assert.equal(calls[1].init.method,'PUT');
    assert.equal(JSON.parse(calls[1].init.body).version,4);
});
test('demo identities and mismatched form email cannot submit', () => {
    assert.throws(()=>saveRegistration({email:user.email,demo:true},{email:user.email}),/Verify/);
    assert.throws(()=>saveRegistration(user,{email:'other@example.com'}),/verified email/);
});
test('API validation messages and stale updates are surfaced', async () => {
    globalThis.fetch=async()=>({ok:false,status:409,json:async()=>({detail:'Registration changed; reload before editing'})});
    await assert.rejects(request('registration',{user}),error=>error.status===409 && /reload/.test(error.message));
    globalThis.fetch=async()=>({ok:false,status:422,json:async()=>({detail:[{loc:['body','form','major'],msg:'Required'}]})});
    await assert.rejects(request('register',{user}),/form.major: Required/);
});
test('email input is normalized and validated', () => {
    assert.equal(checkedEmail(' ALEX@example.com '),'alex@example.com');
    assert.throws(()=>checkedEmail('invalid'));
});
