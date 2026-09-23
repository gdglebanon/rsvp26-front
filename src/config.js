// src/config.js

export const EVENT_CONFIG = {
    // Set the deadline to control the "Registration Closed" state.
    // Use a future date to open registration, or a past date to close it.
    registrationDeadline: new Date('2026-12-31T23:59:59'),

    // Set to true to forcibly close registration regardless of the date.
    forceCloseRegistration: false,

    eventName: "DevFest Lebanon 2026 — Be Part of It",
    eventDescription: "A day of ideas, hands-on learning, and new connections. Join GDG Lebanon to explore technology and meet the people building what’s next."
};

export const isRegistrationOpen = () => {
    if (EVENT_CONFIG.forceCloseRegistration) return false;
    return new Date() <= EVENT_CONFIG.registrationDeadline;
};
