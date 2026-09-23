import test from 'node:test';
import assert from 'node:assert/strict';
import {publicProfile,verifiedEmail,emailKey,registrationData} from '../functions/profile.js';
import {mapProfile} from '../src/lib/profile.js';
test('imported OTP and verification metadata never reach the browser',()=>{
 assert.deepEqual(publicProfile({firstName:' Ada ',OTP:'123456',isVerified:true,selected:'yes',email:'private@example.test',status:'accepted'}),{firstName:'Ada'});
});
test('a legacy verified flag cannot authorize reading a profile',()=>{
 assert.throws(()=>verifiedEmail({email:'a@example.test',isVerified:true},'a@example.test'));
 assert.throws(()=>verifiedEmail({email:'b@example.test',email_verified:true},'a@example.test'));
 assert.equal(verifiedEmail({email:'A@example.test',email_verified:true},' a@example.test '),'a@example.test');
 assert.equal(emailKey(' A@example.test '),emailKey('a@example.test'));
});
test('legacy mappings preserve identity but omit old event answers and ambiguous values',()=>{
 const mapped=mapProfile({firstName:'Ada',company:'Test University',specialization:'full_stack',experience:'fresh_grad',region:'akkar_north',gender:'female',linkedin:'https://linkedin.com/in/test',mainTakeways:'networking',comments:'old event'},[{full_name:'Test University',abbreviation:'TU'}]);
 assert.equal(mapped.university,'TU');assert.equal(mapped.specialization,'Full Stack Developer');assert.equal(mapped.gender,'Female');assert.equal(mapped.expLevels.Student,4);assert.equal(mapped.region,undefined);assert.equal(mapped.comments,undefined);assert.equal(mapped.takeaways,undefined);
});
test('registration cannot inject administrative flags and validates required data',()=>{
 assert.throws(()=>registrationData({selected:true}));
 const form={firstName:'A',lastName:'B',specialization:'Backend Developer',region:'Beirut',activeExpCategories:['Professional'],takeaways:['Networking'],referral:'University',linkedIn:'https://linkedin.com/in/example',attendanceType:'full_day',OTP:'123',isVerified:true,uid:'other'};
 const clean=registrationData(form);assert.equal(clean.uid,undefined);assert.equal(clean.OTP,undefined);assert.equal(clean.isVerified,undefined);
});
