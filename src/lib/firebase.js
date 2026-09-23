import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaV3Provider, getToken } from 'firebase/app-check';
const config = {
 apiKey:import.meta.env.VITE_FIREBASE_API_KEY,
 authDomain:import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
 projectId:import.meta.env.VITE_FIREBASE_PROJECT_ID,
 appId:import.meta.env.VITE_FIREBASE_APP_ID,
};
const app = Object.values(config).every(Boolean) ? initializeApp(config) : null;
export const auth = app ? getAuth(app) : null;
const appCheck = app && import.meta.env.VITE_RECAPTCHA_SITE_KEY ? initializeAppCheck(app,{provider:new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),isTokenAutoRefreshEnabled:true}) : null;
export async function api(path, body, user) {
 const appToken = appCheck ? (await getToken(appCheck)).token : null;
 const token = user ? await user.getIdToken() : null;
 const response = await fetch(`${import.meta.env.VITE_API_BASE || '/api'}/${path}`, {
  method:'POST', headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`} : {}),...(appToken?{'X-Firebase-AppCheck':appToken}:{})},body:JSON.stringify(body)
 });
 let data;
 try {data=await response.json();} catch {throw new Error('The attendee service is unavailable. Please try again later.');}
 if(!response.ok) throw new Error(data.error || 'Please try again.');
 return data;
}
