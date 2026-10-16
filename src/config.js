// src/config.js

export const EVENT_CONFIG = {
    // Lebanon is UTC+03:00 on October 17, 2026.
    registrationOpensAt: new Date('2026-10-17T08:00:00+03:00'),
    registrationDeadline: new Date('2026-12-31T23:59:59+02:00'),

    // Set to true to forcibly close registration regardless of the date.
    forceCloseRegistration: true,

    eventName: "DevFest Lebanon 2026 — Be Part of It",
    eventDescription: "A day of ideas, hands-on learning, and new connections. Join GDG Lebanon to explore technology and meet the people building what’s next."
};

export const isRegistrationOpen = (now = new Date(), config = {}) => {
    if (EVENT_CONFIG.forceCloseRegistration || config.forceCloseRegistration) return false;
    const opensAt = new Date(config.registrationOpensAt ?? EVENT_CONFIG.registrationOpensAt);
    const deadline = new Date(config.registrationDeadline ?? EVENT_CONFIG.registrationDeadline);
    return now >= opensAt && now <= deadline;
};
