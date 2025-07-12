import { CloudEvent } from 'firebase-functions/v2';
import { MessagePublishedData } from 'firebase-functions/v2/pubsub';
import { logger } from 'firebase-functions';

/**
 * Data structure for the message path.
 */
export type MessagePath = {
    conversationId: string,
    messageId: string,
};

/**
 * Handler for Pub/Sub messages on topic "chat-ai".
 * @param event - The CloudEvent containing the published message data.
 */
export default async function onChatAi(
    event: CloudEvent<MessagePublishedData>
) {
    try {
        // Optionally parse event data
        const messageData: MessagePath = event.data?.message?.json;
        if (!messageData) {
            logger.error('No valid message data found in chat-ai event: ', JSON.stringify(event.data, null, 2));
            return;
        }

        // Validate message path
        if (
            !messageData.conversationId ||
            !messageData.messageId)
        {
            logger.error(`Invalid message path in chat-ai event ${JSON.stringify(messageData, null, 2)}`);
            return;
        }

        // TODO: implement logic of ai processing here
    } catch (error) {
        logger.error(`Error in onChatAi: ${error}`);
        throw new Error(`Error in onChatAi: ${error}`);
    }
}

