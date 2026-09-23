# GDG RSVP

React/Vite RSVP form with Firebase Google and email-link sign-in. No SMS or numeric OTP is used.

## Local setup

1. Install dependencies: `npm install` and `npm install --prefix functions`.
2. Copy `.env.example` to `.env.local` and fill in the public Firebase web app config. Find the public web app config in Firebase Console → Project settings → Your apps.
3. In Firebase Authentication, enable Google and Email/Password with **Email link (passwordless sign-in)** enabled. Add `localhost` and your production hostname to authorized domains. Email-link sign-in is limited to five emails/day on Spark.
4. Keep the service-account JSON only on the backend. Set `GOOGLE_APPLICATION_CREDENTIALS` to its path; local scripts also discover a root-level `*firebase-adminsdk*.json` file. Never put it in `public/`, a `VITE_` variable, or Git.
5. Prepare private, normalized profile records from the already imported collection:
   ```sh
   node scripts/prepare-profiles.mjs rsvp_guests
   node scripts/prepare-profiles.mjs rsvp_guests --write
   ```
   The first command is a dry run. The second writes a separate `attendeeProfiles` collection and leaves `rsvp_guests` unchanged. Duplicate email groups are skipped for manual resolution. Only allowlisted profile fields are copied; OTP, isVerified, selection, status, emailStatus, historical comments and event answers are excluded. Rerunning replaces prepared profiles from source and should be used deliberately.
6. Run `npm run api` in one terminal and `npm run dev` in another. Visit `http://localhost:5173/rsvp-gdg/`. The local API binds to loopback, uses your real Firebase Auth and Firestore, and is proxied by Vite.

## Flow and data

An email lookup runs after a 650 ms typing pause and returns only an existence boolean. A matching email expands a verification prompt. Google sign-in or an email link proves email ownership before the API releases profile fields. A different Google email is rejected. The imported `isVerified` and `OTP` columns are never trusted.

New attendees fill the form first. Submit saves an unconfirmed record in `pendingRegistrations` and displays “One more step” with their email. Email corrections are allowed for five minutes from the original server timestamp; the server enforces this without extending the deadline. Verification can finish after that window. Only verified registrations move into the event registration collection. Returning attendees can still verify early to prefill their profile. A successful registration is stored at `events/{EVENT_ID}/registrations/{firebaseUid}`; default event ID is `gdg-lebanon-2026`. Repeated submissions update the same record. Original imported profiles are not overwritten. Set `EVENT_ID` and `REGISTRATION_CLOSED=true` in backend environment settings when appropriate; the frontend deadline is a presentation setting, not backend access control.

Old fields are mapped to current form fields. Ambiguous `akkar_north` and `manager_teamlead` values need attendee review. Previous event answers are asked again. On another device, email-link completion asks the user to re-enter their email. Submitted pending forms are stored on the server. A private session token in the email return link allows resuming the confirmation on another device; local storage also supports resuming after refresh. Do not share confirmation links. Pending records need an appropriate retention/cleanup policy before production.

## Deployment

Firebase Hosting plus Functions is the supported production setup (Blaze required). This repository does not automatically deploy or enable billing.

- Register the web app with Firebase App Check / reCAPTCHA v3, set `VITE_RECAPTCHA_SITE_KEY`, and authorize your domain. The deployed API rejects requests without a valid App Check token; local loopback development does not require it.
- Set `VITE_BASE_PATH=/` in the build environment (e.g. `VITE_BASE_PATH=/ npm run build`) and use `/api` as `VITE_API_BASE`.
- Review `firestore.rules`: the supplied rules deny all browser access to **all collections**, because the server is the only data access path. Review impact on any other apps before deploying these rules to a shared project. Existing deployed rules are not changed by a local build.
- Use Firebase CLI: `firebase deploy --only functions:rsvp,firestore:rules,hosting` after choosing the project.
- Cloud Functions uses its runtime service account; do not upload a downloaded private key.
- A shared Firestore counter limits requests to 30/minute per observed IP. Existence lookups still reveal database membership; this is an intentional tradeoff of the requested UX. App Check and rate limits reduce automated abuse. Counters include `expiresAt`; configure scheduled cleanup or a paid TTL policy if needed. Budget alerts are not spending caps.
- For GitHub Pages, a same-origin API proxy is unavailable; production deployment there would require explicit backend CORS/origin configuration, not just the existing `gh-pages` command.

## Verification

`npm test` covers verified email matching, sensitive-field exclusion, legacy mapping, and registration input filtering. `npm run build` verifies the production bundle. Real Google consent and delivery of a sign-in email require interactive testing with your own email after enabling the providers.
