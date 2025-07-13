import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import { onTaskDispatched } from 'firebase-functions/v2/tasks';
// import { onSchedule } from 'firebase-functions/v2/scheduler';

admin.initializeApp();

// Import and declare global variables

// Import all CRON expressions

// Identify the current project
export const isProd = process.env.GCLOUD_PROJECT === 'holee-app';
export const isDev = process.env.GCLOUD_PROJECT !== 'holee-app';
export const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';

export const origin = isEmulator ? 'http://localhost:8080' : `https://holee-app${isDev ? '-dev' : ''}.web.app`;

// const aiSecrets = ['OPENAI_API_KEY', 'ZAPI_TOKEN', 'GROQ_API_KEY', 'OPENAI_API_KEY___ADITIONAL_INFO',
//         'OPENAI_API_KEY___BIRTHDAY', 'OPENAI_API_KEY___CLIENT_DATA_COLLECTOR', 'OPENAI_API_KEY___CONFIRM_CLIENT_DATA',
//         'OPENAI_API_KEY___CONFIRM_HUMAN', 'OPENAI_API_KEY___EVENTS', 'OPENAI_API_KEY___EXTERNAL_EVENTS',
//         'OPENAI_API_KEY___GENERAL_EVENTS', 'OPENAI_API_KEY___GENERAL_INFORMATIONS', 'OPENAI_API_KEY___GREETINGS',
//         'OPENAI_API_KEY___HUMANIZER', 'OPENAI_API_KEY___IDENTIFY_EVENTS', 'OPENAI_API_KEY___MAIN',
//         'OPENAI_API_KEY___MENU', 'OPENAI_API_KEY___NON_CLIENT_DATA_COLLECTOR', 'OPENAI_API_KEY___QUEUE',
//         'OPENAI_API_KEY___TABLE', 'OPENAI_API_KEY___WEEKDAY', 'OPENAI_API_KEY___IMAGE_TRANSCRIPTION',
//     ]


/***************************************************/
/******************** FUNCTIONS ********************/
/***************************************************/

/* WhatsApp */

export const onMessageReceiveWebhook = onRequest(
    {
        cors: true,
        secrets: ['ZAPI_TOKEN'],
    },
    (...args) => import('./wpp/zapi/webhooks/onMessageReceiveWebhook')
        .then(async m => { await m.default(...args); })
);

/* ElevenLabs */

export const onPostCallWebhook = onRequest(
    {
        cors: true,
    },
    (...args) => import('./elevenLabs/webhooks/onPostCallWebhook')
        .then(async m => { await m.default(...args); })
);

/* Jobs */

export const processJobsForConversationTask = onTaskDispatched(
    {
        timeoutSeconds: 540,
        secrets: ['ZAPI_TOKEN', 'OPENAI_API_KEY'],
        memory: '512MiB', // Use '256MiB', '512MiB', '1GiB', '2GiB' or '4GiB'
        cpu: 2,
        retryConfig: {
            maxAttempts: 1, // No retry since we unmark isRefreshing in finally block
        },
        rateLimits: {
            maxConcurrentDispatches: 1000,
        },
    },
    data => import('./jobs/tasks/processJobsForConversationTask').then(m => m.default(data))
);

export const setApplicationTask = onTaskDispatched(
    {
        timeoutSeconds: 60,
        memory: '256MiB',
        cpu: 1,
        retryConfig: {
            maxAttempts: 1,
        },
        rateLimits: {
            maxConcurrentDispatches: 1000,
        },
    },
    req => import('./jobs/tasks/setApplicationTask').then(m => m.default(req))
);

export const optInApplicationTask = onTaskDispatched(
    {
        timeoutSeconds: 60,
        memory: '256MiB',
        cpu: 1,
        retryConfig: {
            maxAttempts: 1,
        },
        rateLimits: {
            maxConcurrentDispatches: 1000,
        },
    },
    req => import('./jobs/tasks/optInApplicationTask').then(m => m.default(req))
);

export const rankApplicationsTask = onTaskDispatched(
    {
        timeoutSeconds: 300,
        memory: '512MiB',
        cpu: 2,
        retryConfig: {
            maxAttempts: 1,
        },
        rateLimits: {
            maxConcurrentDispatches: 100,
        },
    },
    req => import('./jobs/tasks/rankApplicationsTask').then(m => m.default(req))
);

/* AI Service */

export * as firestore from './firestore';

export * as pubsub from './pubsub';

export * as webService from './webService';
