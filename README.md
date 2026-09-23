# DevFest Lebanon RSVP frontend

React/Vite frontend connected to the [FastAPI + Firebase backend](https://github.com/gdglebanon/rsvp26-back). In the local combined workspace the backend lives in `../backend`; when cloning these repositories separately, run each project from its own directory.

```bash
npm install
npm run dev -- --host localhost
```

Run the backend on port 8000 first. Open http://localhost:5173/rsvp-gdg/. `.env.example` documents `VITE_API_URL` and `VITE_BASE_PATH`. The backend supplies the public Firebase web configuration; service-account credentials never belong in this project.

The registration form opens immediately. Email typing triggers a background presence-only lookup; returning users see Google/email icons below the email field to verify and load saved details. Unverified submissions are saved in Firestore with an unverified flag before the verification popup opens. Google and Firebase email magic links are active; a numeric OTP option appears when the backend mail provider is configured. The `?auth=callback` page completes email sign-in and securely loads the current user's information. Unverified drafts are preserved locally for 30 minutes, excluding VIP access codes, and cleared on save. The pending submission ID travels through the email callback, and successful verification automatically completes the already submitted form. Frontend badges and backend records reflect whether the email is verified. The same account page supports application edits, status refresh, cancellation, invitation confirmation, and confirmed-ticket QR download. `?vip` reveals the shared access-code field for a new application.

A legacy attendee profile may be prefilled from Firestore after verification. Event tickets remain separate from reusable personal details. AI screening is disabled. Firebase handles sign-in email; event email and Sheet sync require the settings documented in the [backend README](https://github.com/gdglebanon/rsvp26-back#readme).

For production, configure the frontend host as a Firebase authorized domain, set the backend's exact CORS origins and frontend URL, and use HTTPS. Set `VITE_BASE_PATH=/` for root hosting or `/rsvp26-front/` for this repository's GitHub Pages project path; the local default remains `/rsvp-gdg/`. Email links opened in another browser ask for the receiving email address. No profile is fetched by an arbitrary URL email/user ID.

```bash
npm test
npm run build
```
