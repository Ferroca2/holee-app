import { onRequest } from 'firebase-functions/v2/https';

export const payment = onRequest({
    timeoutSeconds: 60,
}, (...args) => import('./voiceAgent/index')
    .then(async m => { await m.default(...args); })
);
