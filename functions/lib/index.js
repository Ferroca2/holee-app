"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.origin = exports.isEmulator = exports.isDev = exports.isProd = void 0;
const admin = __importStar(require("firebase-admin"));
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
exports.isProd = process.env.GCLOUD_PROJECT === 'holee-app';
exports.isDev = process.env.GCLOUD_PROJECT !== 'holee-app';
exports.isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';
exports.origin = exports.isEmulator ? 'http://localhost:8080' : `https://holee-app${exports.isDev ? '-dev' : ''}.web.app`;
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
//# sourceMappingURL=index.js.map