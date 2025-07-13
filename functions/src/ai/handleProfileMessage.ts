import { MessagePath } from "../pubsub/onChatAi";
import conversationsRepository from "../domain/conversations/repository";
import { logger } from "firebase-functions/v2";
import { ZApiServiceSDK } from "../wpp/zapi/service";
import { ChatCompletionMessageParam } from "openai/resources";
import { ProfileAgent } from "./profileAgent";
import { parseResoningResponse } from "./utils";

/**
 * Processa mensagens para perfis incompletos usando o ProfileAgent.
 * Especializado em coletar dados do usuário e processar documentos como currículos.
 *
 * @param messagePath - Caminho da mensagem (conversationId e messageId)
 * @param messageContent - Conteúdo da mensagem já processado
 */
export const handleProfileMessage = async (messagePath: MessagePath, context: ChatCompletionMessageParam[]): Promise<void> => {
    const { conversationId, messageId } = messagePath;

    try {
        const conversation = await conversationsRepository.getConversationById(conversationId);
        if (!conversation) {
            logger.error(`Conversation ${conversationId} not found`);
            return;
        }

        const profileAgent = new ProfileAgent(conversationId);
        const aiResponse = await profileAgent.process(context);
        const responsePayload = {
            type: 'text' as const,
            text: parseResoningResponse(aiResponse || { reasoning: '', response: '' }),
        };

        const zapiService = await ZApiServiceSDK.initialize();
        await zapiService.sendMessage(conversationId, responsePayload);

        logger.info(`Successfully sent profile response to conversation ${conversationId}`);
    } catch (error) {
        logger.error(`Error processing profile message for conversation ${conversationId}:`, error);
    }
}
