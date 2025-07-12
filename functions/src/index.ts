import * as admin from 'firebase-admin';
// import { onRequest } from 'firebase-functions/v2/https';
// import { onSchedule } from 'firebase-functions/v2/scheduler';
// import { onTaskDispatched } from 'firebase-functions/v2/tasks';

admin.initializeApp();

// Import and declare global variables
// import MessageRegistry from './wpp/zapi/webhooks/onMessageReceiveWebhook/messageRegistry';

// const globalMessageRegistry = new MessageRegistry();

// Import all CRON expressions
// import { AI_2_IDLE_SCHEDULER_CRON } from './ai/ai2IdleScheduler';


// Identify the current project
export const isProd = process.env.GCLOUD_PROJECT === 'holee-app';
export const isDev = process.env.GCLOUD_PROJECT !== 'holee-app';
export const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';

export const origin = isEmulator ? 'http://localhost:8080' : `https://holee-app${isDev ? '-dev' : ''}.web.app`;

// const aiSecrets = isDev
//     ? ['OPENAI_API_KEY', 'ZAPI_TOKEN', 'GROQ_API_KEY', 'OPENAI_API_KEY___ADITIONAL_INFO',
//         'OPENAI_API_KEY___BIRTHDAY', 'OPENAI_API_KEY___CLIENT_DATA_COLLECTOR', 'OPENAI_API_KEY___CONFIRM_CLIENT_DATA',
//         'OPENAI_API_KEY___CONFIRM_HUMAN', 'OPENAI_API_KEY___EVENTS', 'OPENAI_API_KEY___EXTERNAL_EVENTS',
//         'OPENAI_API_KEY___GENERAL_EVENTS', 'OPENAI_API_KEY___GENERAL_INFORMATIONS', 'OPENAI_API_KEY___GREETINGS',
//         'OPENAI_API_KEY___HUMANIZER', 'OPENAI_API_KEY___IDENTIFY_EVENTS', 'OPENAI_API_KEY___MAIN',
//         'OPENAI_API_KEY___MENU', 'OPENAI_API_KEY___NON_CLIENT_DATA_COLLECTOR', 'OPENAI_API_KEY___QUEUE',
//         'OPENAI_API_KEY___TABLE', 'OPENAI_API_KEY___WEEKDAY', 'OPENAI_API_KEY___IMAGE_TRANSCRIPTION',
//     ]
//     : ['OPENAI_API_KEY', 'ZAPI_TOKEN', 'GROQ_API_KEY', 'OPENAI_API_KEY___ADITIONAL_INFO',
//         'OPENAI_API_KEY___BIRTHDAY', 'OPENAI_API_KEY___CLIENT_DATA_COLLECTOR', 'OPENAI_API_KEY___CONFIRM_CLIENT_DATA',
//         'OPENAI_API_KEY___CONFIRM_HUMAN', 'OPENAI_API_KEY___EVENTS', 'OPENAI_API_KEY___EXTERNAL_EVENTS',
//         'OPENAI_API_KEY___GENERAL_EVENTS', 'OPENAI_API_KEY___GENERAL_INFORMATIONS', 'OPENAI_API_KEY___GREETINGS',
//         'OPENAI_API_KEY___HUMANIZER', 'OPENAI_API_KEY___IDENTIFY_EVENTS', 'OPENAI_API_KEY___MAIN',
//         'OPENAI_API_KEY___MENU', 'OPENAI_API_KEY___NON_CLIENT_DATA_COLLECTOR', 'OPENAI_API_KEY___QUEUE',
//         'OPENAI_API_KEY___TABLE', 'OPENAI_API_KEY___WEEKDAY', 'OPENAI_API_KEY___IMAGE_TRANSCRIPTION',
//     ];


/***************************************************/
/******************** FUNCTIONS ********************/
/***************************************************/

/* WhatsApp */

// export const connectionStatusWebhook = onRequest(
//     {
//         cors: true,
//         secrets: ['ZAPI_TOKEN'],
//     },
//     (...args) => import('./wpp/zapi/webhooks/connectionStatusWebhook')
//         .then(async m => { await m.default(...args); })
// );

// export const onMessageReceiveWebhook = onRequest(
//     {
//         cors: true,
//         secrets: ['ZAPI_TOKEN'],
//     },
//     (...args) => import('./wpp/zapi/webhooks/onMessageReceiveWebhook')
//         .then(async m => { await m.default(...args, globalMessageRegistry); })
// );

// export const onMessageDeliveryWebhook = onRequest(
//     {
//         cors: true,
//         secrets: ['ZAPI_TOKEN'],
//     },
//     (...args) => import('./wpp/zapi/webhooks/onMessageDeliveryWebhook')
//         .then(async m => { await m.default(...args); })
// );

/* AI Service */

// export const followUpScheduler = onSchedule(
//     {
//         schedule: FOLLOW_UP_SCHEDULER_CRON,
//         secrets: aiSecrets,
//     },
//     () => import('./ai/aiFollowUp/followUpScheduler').then(async m => { await m.default(); })
// );

// export const processReservationNotifications = onSchedule(
//     {
//         schedule: CHECK_NOTIFICATIONS_CRON,
//         secrets: ['ZAPI_TOKEN'],
//     },
//     () => import('./tableReservation/notifyReservationConfig').then(async m => { await m.default(); })
// );

// export * as firestore from './firestore';

// export * as pubsub from './pubsub';

// export * as webService from './webService';
