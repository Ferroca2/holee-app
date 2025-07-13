import { onMessagePublished } from 'firebase-functions/v2/pubsub';

/**
 * PubSub handler for AI message processing.
 *
 * This handler listens for messages published to the 'chat-ai' topic.
 * It processes incoming messages from WhatsApp and dispatches them to the AI for processing.
 */
export const onChatAi = onMessagePublished(
    {
        topic: 'chat-ai',
        secrets: ['OPENAI_API_KEY', 'ZAPI_TOKEN'],
        // maxInstances: 1000,
        //minInstances: 3,
        memory: '256MiB', // 128MiB, 256MiB, 512MiB, 1GiB, 2GiB
    },
    event => import('./onChatAi').then(m => m.default(event))
);
