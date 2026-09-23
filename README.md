# GDG Lebanon RSVP

React/Vite RSVP interface with a browser-only demo registration flow.

## Development

```sh
npm install
npm run dev
```

Run `npm test` for flow checks and `npm run build` for a production build.
Optional: copy `.env.example` to `.env.local` to change the hosting base path.

## Registration flow

The form, validation, verification buttons, five-minute email correction window,
and completion screen work without a backend. Google and email sign-in buttons
simulate confirmation and are explicitly labeled as demo interactions. They do
not authenticate users, send emails, or submit real RSVPs.

Demo registrations and pending forms are stored in sessionStorage for the current
browser tab. Reloading resumes the pending flow; closing the tab clears its data.
Returning demo attendees can load their saved profile in the same tab. A real
verification and registration service must be connected before accepting RSVPs.

Event settings and registration deadline are in `src/config.js`. Use
`npm run deploy` to publish the static build to GitHub Pages.
