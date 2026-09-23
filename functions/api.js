import express from 'express';
import { newPending, authorizePending, changePendingEmail } from './pending.js';
import { getAuth } from 'firebase-admin/auth';
import { getAppCheck } from 'firebase-admin/app-check';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { normalizeEmail, emailKey, publicProfile, verifiedEmail, registrationData } from './profile.js';

export function createApi() {
 const app = express();
 app.use((req,res,next)=>{ if(req.url.startsWith('/api/')) req.url=req.url.slice(4); next(); });
 app.use(express.json({limit:'24kb'}));
 app.use(async (req,res,next)=>{
  if(!process.env.K_SERVICE) return next(); // local API binds only to loopback
  try { await getAppCheck().verifyToken(req.headers['x-firebase-appcheck'] || ''); next(); }
  catch { res.status(403).json({error:'App verification failed. Reload and try again.'}); }
 });
 // Shared Firestore counters work across instances. IP addresses are stored only as hashes.
 app.use(async (req,res,next) => {
  try {
   const bucket = Math.floor(Date.now()/60000);
   const ref = getFirestore().collection('rsvpRateLimits').doc(`${emailKey(req.ip || 'unknown')}_${bucket}`);
   await getFirestore().runTransaction(async tx => {
    const snap = await tx.get(ref); const count = snap.data()?.count || 0;
    if(count >= 30) { const e=new Error('Too many requests. Please wait a minute.'); e.status=429; throw e; }
    tx.set(ref,{count:count+1,expiresAt:Timestamp.fromMillis((bucket+2)*60000)});
   });
   next();
  } catch(e) { next(e); }
 });
 app.post('/lookup', async (req,res,next) => {
  try {
   const email = normalizeEmail(req.body.email);
   if(email.length > 254 || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({error:'Enter a valid email.'});
   const doc = await getFirestore().collection('attendeeProfiles').doc(emailKey(email)).get();
   res.json({exists:doc.exists});
  } catch(e) { next(e); }
 });
 app.post('/pending', async (req,res,next)=>{
  try {
   if(process.env.REGISTRATION_CLOSED==='true') return res.status(403).json({error:'Registration is closed.'});
   const {secret,record}=newPending(registrationData(req.body.form || {}),req.body.email);
   const ref=getFirestore().collection('pendingRegistrations').doc();
   await ref.set(record);
   res.json({id:ref.id,secret,email:record.email,editUntil:record.editUntil,firstName:record.form.firstName});
  } catch(e){next(e);}
 });
 app.post('/pending-session', async (req,res,next)=>{
  try {
   if(typeof req.body.id!=='string' || !/^[a-zA-Z0-9]{20}$/.test(req.body.id)) return res.status(400).json({error:'Invalid registration session.'});
   const ref=getFirestore().collection('pendingRegistrations').doc(req.body.id);
   const result=await getFirestore().runTransaction(async tx=>{
    const record=(await tx.get(ref)).data(); authorizePending(record,req.body.secret);
    let email=record.email;
    if(req.body.newEmail!==undefined) {email=changePendingEmail(record,req.body.newEmail);tx.update(ref,{email});}
    return {email,editUntil:record.editUntil,status:record.status,firstName:record.form.firstName};
   });
   res.json(result);
  } catch(e){next(e);}
 });
 app.use(async (req,res,next) => {
  try {
   const token = req.headers.authorization?.replace(/^Bearer /,'');
   if(!token) return res.status(401).json({error:'Please sign in first.'});
   req.identity = await getAuth().verifyIdToken(token,true);
   req.email = verifiedEmail(req.identity,req.body.email);
   next();
  } catch(e) { res.status(e.status || 401).json({error:'Sign in with the same verified email you entered.'}); }
 });
 app.post('/profile', async (req,res,next) => {
  try {
   const doc=await getFirestore().collection('attendeeProfiles').doc(emailKey(req.email)).get();
   res.json({profile:doc.exists ? publicProfile(doc.data()) : null});
  } catch(e) { next(e); }
 });
 app.post('/complete-pending', async (req,res,next)=>{
  try {
   if(typeof req.body.id!=='string' || !/^[a-zA-Z0-9]{20}$/.test(req.body.id)) return res.status(400).json({error:'Invalid registration session.'});
   const db=getFirestore(), ref=db.collection('pendingRegistrations').doc(req.body.id);
   await db.runTransaction(async tx=>{
    const record=(await tx.get(ref)).data();authorizePending(record,req.body.secret);
    verifiedEmail(req.identity,record.email);
    if(record.status==='verified') return;
    const event=process.env.EVENT_ID || 'gdg-lebanon-2026';
    const dest=db.collection('events').doc(event).collection('registrations').doc(req.identity.uid);
    tx.set(dest,{...record.form,email:record.email,uid:req.identity.uid,updatedAt:FieldValue.serverTimestamp()});
    tx.update(ref,{status:'verified',verifiedAt:FieldValue.serverTimestamp()});
   });
   res.json({saved:true});
  } catch(e){next(e);}
 });
 app.post('/register', async (req,res,next) => {
  try {
   if(process.env.REGISTRATION_CLOSED === 'true') return res.status(403).json({error:'Registration is closed.'});
   const data=registrationData(req.body.form || {});
   const event = process.env.EVENT_ID || 'gdg-lebanon-2026';
   await getFirestore().collection('events').doc(event).collection('registrations').doc(req.identity.uid).set({...data,email:req.email,uid:req.identity.uid,updatedAt:FieldValue.serverTimestamp()});
   res.json({saved:true});
  } catch(e) { next(e); }
 });
 app.use((err,req,res,next) => { res.status(err.status || 500).json({error:err.status ? err.message : 'Unable to connect. Please try again shortly.'}); });
 return app;
}
