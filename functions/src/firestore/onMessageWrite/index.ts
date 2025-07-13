import { logger } from 'firebase-functions';
import { PubSub } from '@google-cloud/pubsub';
import { DocumentSnapshot } from 'firebase-admin/firestore';
import { FirestoreEvent, Change } from 'firebase-functions/v2/firestore';

import { Message } from '../../domain/messages/entity';

import { MessagePath } from '../../pubsub/onChatAi';

// Initialize PubSub client
const pubsub = new PubSub();
const aiChatAiTopic = pubsub.topic('chat-ai');

/**
 * Handler triggered when a message is written.
 *
 * @param event - FirestoreEvent<Change<DocumentSnapshot> | undefined, { storeId: string; conversationId: string }>
 */
export default async function onMessageWrite(
    event: FirestoreEvent<Change<DocumentSnapshot> | undefined, { conversationId: string; messageId: string }>
) {
    if (!event?.data) {
        logger.warn('No data to process.');
        return;
    }

    logger.info('Event:', JSON.stringify(event, null, 2));

    const { conversationId, messageId } = event.params;

    const eventTime = Date.parse(event.time);
    if (isNaN(eventTime)) {
        throw new Error(`Invalid event time: ${event.time}`);
    }

    const { before, after } = event.data;

    const changeType: 'create' | 'update' | 'delete' = !before?.exists
        ? 'create'
        : !after?.exists
            ? 'delete'
            : 'update';

    logger.info(`Processing ${changeType} event for conversation ${conversationId}, message ${messageId}`);

    try {
        // Get current data
        const currentIsMe = after?.get('isMe') as Message['isMe'] | undefined;
        const currentIsOptInMessage = after?.get('isOptInMessage') as Message['isOptInMessage'] | undefined;
        logger.info(`Message isMe: ${currentIsMe}`);

        const messagePath: MessagePath = {
            conversationId,
            messageId,
        };

        switch (changeType) {
            case 'create': {
                if (currentIsMe === true) return;

                // Skip AI processing for opt-in messages
                if (currentIsOptInMessage === true) {
                    logger.info(`[${conversationId}] Skipping AI processing for opt-in message: ${messageId}`);
                    return;
                }

                const aiDataBuffer = Buffer.from(JSON.stringify(messagePath));
                await aiChatAiTopic.publishMessage({
                    json: messagePath,
                });

                logger.info('Message published successfully to chat-ai topic');
                break;
            }
            case 'update': {
                logger.info('Processing update event - not implemented yet');
                break;
            }

            case 'delete': {
                logger.info('Processing delete event - not implemented yet');
                break;
            }

            default:
                logger.error(`Invalid change type: ${changeType}`);
                break;
        }
    } catch (error) {
        logger.error(`Error processing message change (conversationId: ${conversationId}, messageId: ${messageId}):`, error);
        throw error; // Re-throw para que o Firebase Functions possa tentar novamente
    }
}
