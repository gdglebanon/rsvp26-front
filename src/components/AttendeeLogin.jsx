import { useEffect, useRef, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, api } from '../lib/firebase';
const normalize = value => value.trim().toLowerCase();
export default function AttendeeLogin({email,onEmail,onProfile,onVerified,required=false,returnUrl}) {
 const [exists,setExists]=useState(false),[open,setOpen]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState(''),[verified,setVerified]=useState('');
 const [linkPending,setLinkPending]=useState(()=>auth && isSignInWithEmailLink(auth,window.location.href));
 const latest=useRef(email);latest.current=email;
 const callbacks=useRef({onEmail,onProfile,onVerified});callbacks.current={onEmail,onProfile,onVerified};
 const loaded=useRef('');
 async function load(user, target) {
  if(normalize(user.email || '')!==normalize(target)) {await signOut(auth);throw new Error('Choose the Google account matching the email you entered.');}
  const result=required ? {profile:null} : await api('profile',{email:target},user);
  if (!user.emailVerified) throw new Error('Please verify your email first.');
  if(normalize(latest.current)!==normalize(target)) return;
  if(loaded.current !== user.uid) {if(result.profile) callbacks.current.onProfile(result.profile); loaded.current=user.uid;}
  setVerified(normalize(target));callbacks.current.onVerified(user);setOpen(false);
  setMessage(result.profile?'Your saved details are loaded. Please review them and complete the event questions.':'Email verified.');
 }
 useEffect(()=>{
  if(!auth) return;
  return onAuthStateChanged(auth,user=>{if(!user){setVerified('');callbacks.current.onVerified(null);}});
 },[]);
 useEffect(()=>{
  let cancelled=false;
  loaded.current='';
  setExists(false);setOpen(Boolean(linkPending || required));setMessage('');setError('');setVerified('');callbacks.current.onVerified(null);
  if(!auth || !/^\S+@\S+\.\S+$/.test(email) || linkPending) return;
  const timer=setTimeout(async()=>{
   try {
    await auth.authStateReady();
    if(cancelled) return;
    if(auth.currentUser && normalize(auth.currentUser.email || '')===normalize(email)) {await load(auth.currentUser,email);return;}
    const data=await api('lookup',{email});
    if(!cancelled){setExists(data.exists);setOpen(data.exists || required);}
   } catch(e){if(!cancelled)setError(e.message);}
  },650);
  return ()=>{cancelled=true;clearTimeout(timer);};
 },[email,linkPending,required]);
 useEffect(()=>{
  if(linkPending && !required){const saved=localStorage.getItem('rsvpSignInEmail');if(saved)callbacks.current.onEmail(saved);setOpen(true);}
 },[]);
 async function run(action) {setBusy(true);setError('');try {await action();}catch(e){setError(e.code==='auth/popup-closed-by-user'?'Sign-in was cancelled. Please try again.':e.message);}finally{setBusy(false);}}
 async function google(){const target=email;const provider=new GoogleAuthProvider();provider.setCustomParameters({login_hint:target,prompt:'select_account'});await load((await signInWithPopup(auth,provider)).user,target);}
 async function sendLink(){
  const target=normalize(email);
  if(!/^\S+@\S+\.\S+$/.test(target)) throw new Error('Enter your email first.');
  await sendSignInLinkToEmail(auth,target,{url:returnUrl || `${window.location.origin}${import.meta.env.BASE_URL}`,handleCodeInApp:true});
  localStorage.setItem('rsvpSignInEmail',target);setMessage('Sign-in link sent. Check your inbox and spam folder.');
 }
 async function finishLink(){
  const target=normalize(email);const result=await signInWithEmailLink(auth,target,window.location.href);
  localStorage.removeItem('rsvpSignInEmail');window.history.replaceState({},'',window.location.pathname);setLinkPending(false);await load(result.user,target);
 }
 if(!required && !exists && !verified && !linkPending) return null;
 if(!auth) return <div className="login-panel" role="status">Firebase web configuration is needed before sign-in and registration can be tested.</div>;
 return <div className="login-panel">
  {verified ? <strong>✓ Email verified</strong> : <>
   <p>{exists?'We found a previous registration. Verify your email to load your saved details.':'Confirming your email is mandatory to complete your registration.'}</p>
   {!open && <button type="button" onClick={()=>setOpen(true)}>Verify email</button>}
  </>}
  {open && !verified && <div className="login-options">
   {linkPending ? <><p>Confirm your email in the field above, then complete sign-in.</p><button type="button" disabled={busy || !email} onClick={()=>run(finishLink)}>Complete email sign-in</button></> : <>
    <button type="button" disabled={busy || !email} onClick={()=>run(google)}>Continue with Google</button>
    <button type="button" disabled={busy || !email} onClick={()=>run(sendLink)}>Email me a sign-in link</button>
   </>}
  </div>}
  {busy && <p role="status">Please wait…</p>}
  {message && <p role="status">{message}</p>}
  {error && <p className="login-error" role="alert">{error}</p>}
 </div>;
}
