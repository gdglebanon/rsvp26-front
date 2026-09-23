import { useEffect, useRef, useState } from 'react';
import AttendeeLogin from './AttendeeLogin';
import { api } from '../lib/registration';
export { PENDING_KEY, readPending } from '../lib/registration';
import { PENDING_KEY } from '../lib/registration';
export default function VerificationStep({initial,onDone}) {
 const [session,setSession]=useState(initial),[email,setEmail]=useState(initial.email || ''),[now,setNow]=useState(Date.now()),[error,setError]=useState(''),[busy,setBusy]=useState(false),[user,setUser]=useState(null);
 const completing=useRef(false);
 function save(next){setSession(next);setEmail(next.email);sessionStorage.setItem(PENDING_KEY,JSON.stringify(next));}
 useEffect(()=>{
  let active=true;
  api('pending-session',initial).then(data=>{if(active)save({...initial,...data});}).catch(e=>{if(active)setError(e.message);});
  const timer=setInterval(()=>setNow(Date.now()),1000);return ()=>{active=false;clearInterval(timer);};
 },[]);
 const remaining=Math.max(0,Math.ceil(((session.editUntil || 0)-now)/1000));
 async function edit(e){
  e.preventDefault();setBusy(true);setError('');setUser(null);
  try {const data=await api('pending-session',{id:session.id,secret:session.secret,newEmail:email});save({...session,...data});}
  catch(e){setError(e.message);}finally{setBusy(false);}
 }
 async function complete(verified){
  if(!verified || completing.current) return;
  completing.current=true;setBusy(true);setError('');
  try {await api('complete-pending',{id:session.id,secret:session.secret,email:session.email},verified);sessionStorage.removeItem(PENDING_KEY);window.history.replaceState({},'',window.location.pathname);onDone(session.firstName);}
  catch(e){setError(e.message);}finally{completing.current=false;setBusy(false);}
 }
 return <div className="app-container"><main className="form-wrapper verification-step">
  <h1>One more step</h1>
  <p>Confirm your email to complete this demo. No email will be sent.</p>
  <p className="confirmation-email"><strong>{session.email || 'Loading your registration…'}</strong></p>
  {remaining>0 ? <form onSubmit={edit}>
   <label htmlFor="confirmation-email">Need to correct your email?</label>
   <div className="email-edit-row"><input id="confirmation-email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} disabled={busy}/><button disabled={busy || email===session.email} type="submit">Save email</button></div>
   <p role="timer">You can edit it for {Math.floor(remaining/60)}:{String(remaining%60).padStart(2,'0')} more.</p>
  </form> : session.email && <p>The five-minute editing window has ended. You can still verify the email above.</p>}
  {session.email && <AttendeeLogin key={session.email} required email={session.email} onEmail={()=>{}} onProfile={()=>{}} onVerified={u=>{setUser(u);if(u)complete(u);}}/>}
  {busy && <p role="status">Saving your registration…</p>}
  {error && <p role="alert" className="login-error">{error}</p>}
  {error && user && <button type="button" disabled={busy} onClick={()=>complete(user)}>Retry confirmation</button>}
 </main></div>;
}
