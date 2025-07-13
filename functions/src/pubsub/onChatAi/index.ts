import { CloudEvent } from 'firebase-functions/v2';
import { MessagePublishedData } from 'firebase-functions/v2/pubsub';
import { logger } from 'firebase-functions';
import { handleIncomingMessage } from '../../ai/handleIncomingMessage';

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
        logger.info('onChatAi received event:', JSON.stringify(event, null, 2));

        // Primeiro tenta pegar como JSON
        let messageData: MessagePath | undefined = event.data?.message?.json;

        // Se não conseguir, tenta parsear dos dados em buffer
        if (!messageData && event.data?.message?.data) {
            try {
                const dataString = Buffer.from(event.data.message.data, 'base64').toString();
                messageData = JSON.parse(dataString);
                logger.info('Parsed message data from buffer:', messageData);
            } catch (parseError) {
                logger.error('Failed to parse message data from buffer:', parseError);
            }
        }

        if (!messageData) {
            logger.error('No valid message data found in chat-ai event: ', JSON.stringify(event.data, null, 2));
            return;
        }

        logger.info('Processing message data:', messageData);

        // Validate message path
        if (
            !messageData.conversationId ||
            !messageData.messageId) {
            logger.error(`Invalid message path in chat-ai event ${JSON.stringify(messageData, null, 2)}`);
            return;
        }

        await handleIncomingMessage(messageData);

        logger.info(`Successfully processed chat-ai message for conversation ${messageData.conversationId}, message ${messageData.messageId}`);

        // Aqui você pode adicionar a lógica para processar a mensagem com IA
        // Por exemplo, chamar o handleIncomingMessage que está nos arquivos untracked

    } catch (error) {
        logger.error(`Error in onChatAi: ${error}`);
        throw new Error(`Error in onChatAi: ${error}`);
    }
}

