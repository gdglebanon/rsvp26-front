import { initializeApp, getApps } from 'firebase/app';
import { getAuth, browserSessionPersistence, setPersistence } from 'firebase/auth';

export async function configureAuth(config) {
    if (!config?.apiKey || !config?.appId) throw new Error('Firebase sign-in configuration is missing on the backend.');
    const app = getApps()[0] || initializeApp(config);
    const auth = getAuth(app);
    await setPersistence(auth, browserSessionPersistence);
    return auth;
}
