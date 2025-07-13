import { MessagePath } from "../pubsub/onChatAi";
import { logger } from "firebase-functions/v2";
import { ZApiServiceSDK } from "../wpp/zapi/service";
import { ChatCompletionMessageParam } from "openai/resources";

/**
 * Processa mensagens para perfis incompletos usando o ProfileAgent.
 * Especializado em coletar dados do usuário e processar documentos como currículos.
 *
 * @param messagePath - Caminho da mensagem (conversationId e messageId)
 * @param messageContent - Conteúdo da mensagem já processado
 */
export const handleUserMessage = async (messagePath: MessagePath, context: ChatCompletionMessageParam[]): Promise<void> => {
    const { conversationId, messageId } = messagePath;

    try {
        const responsePayload = {
            type: 'text' as const,
            text: 'teste',
        };

        const zapiService = await ZApiServiceSDK.initialize();
        await zapiService.sendMessage(conversationId, responsePayload);

        logger.info(`Successfully sent profile response to conversation ${conversationId}`);

    } catch (error) {
        logger.error(`Error processing profile message for conversation ${conversationId}:`, error);

        // Enviar mensagem de erro para o usuário
        try {
            const errorPayload = {
                type: 'text' as const,
                text: 'Desculpe, ocorreu um erro ao processar sua mensagem de perfil. Tente novamente em alguns instantes.',
            };

            const zapiService = await ZApiServiceSDK.initialize();
            await zapiService.sendMessage(conversationId, errorPayload);
        } catch (sendError) {
            logger.error(`Failed to send error message to ${conversationId}:`, sendError);
        }
    }
}
