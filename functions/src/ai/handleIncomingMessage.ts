import { MessagePath } from "../pubsub/onChatAi";
import conversationsRepository from "../domain/conversations/repository";
import { logger } from "firebase-functions/v2";
import messagesRepository from "../domain/messages/repository";
import { buildOpenAiContext } from "./utils";
import { ZApiServiceSDK } from "../wpp/zapi/service";
import { handleProfileMessage } from "./handleProfileMessage";
import { handleUserMessage } from "./handleUserMessage";

export const handleIncomingMessage = async (messagePath: MessagePath): Promise<void> => {
    const { conversationId, messageId } = messagePath;

    try {
        // Buscar dados da conversa
        const conversationRef = conversationsRepository.getDocRef(conversationId);
        const conversation = await conversationRef.get();

        if (!conversation.exists) {
            logger.error(`Conversation ${conversationId} not found`);
            return;
        }

        const conversationData = conversation.data();
        if (!conversationData) {
            logger.error(`Conversation data not found for ${conversationId}`);
            return;
        }

        // Buscar a mensagem específica que foi recebida
        const messageRef = messagesRepository.getDocRef(conversationId, messageId);
        const messageDoc = await messageRef.get();

        if (!messageDoc.exists) {
            logger.error(`Message ${messageId} not found in conversation ${conversationId}`);
            return;
        }

        const latestMessages = await messagesRepository.getLatestMessages(conversationId, 10);

        const context = await buildOpenAiContext(latestMessages);

        if (conversationData.profileCompleted) {
            // Perfil completo - usar handleUserMessage
            logger.info(`Using handleUserMessage for conversation ${conversationId}`);

            await handleUserMessage(messagePath, context);

        } else {
            // Perfil incompleto - usar handleProfileMessage
            logger.info(`Using handleProfileMessage for conversation ${conversationId}`);

            await handleProfileMessage(messagePath, context);
        }

    } catch (error) {
        logger.error(`Error processing message for conversation ${conversationId}:`, error);

        // Enviar mensagem de erro para o usuário
        try {
            const errorPayload = {
                type: 'text' as const,
                text: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente em alguns instantes.',
            };

            const zapiService = await ZApiServiceSDK.initialize();
            await zapiService.sendMessage(conversationId, errorPayload);
        } catch (sendError) {
            logger.error(`Failed to send error message to ${conversationId}:`, sendError);
        }
    }
}
