import { MessagePath } from "../pubsub/onChatAi";
import { logger } from "firebase-functions/v2";
import { ZApiServiceSDK } from "../wpp/zapi/service";
import { ChatCompletionMessageParam } from "openai/resources";
import { UserAgent } from "./userAgent";
import { parseResoningResponse } from "./utils";

/**
 * Processa mensagens para perfis incompletos usando o ProfileAgent.
 * Especializado em coletar dados do usuário e processar documentos como currículos.
 *
 * @param messagePath - Caminho da mensagem (conversationId e messageId)
 * @param messageContent - Conteúdo da mensagem já processado
 */
export const handleUserMessage = async (messagePath: MessagePath, context: ChatCompletionMessageParam[]): Promise<void> => {
    const { conversationId } = messagePath;
    try {
        const userAgent = new UserAgent();
        const response = await userAgent.process(context);

        const responsePayload = {
            type: 'text' as const,
            text: parseResoningResponse(response || { reasoning: '', response: '' }),
        };

        const zapiService = await ZApiServiceSDK.initialize();
        await zapiService.sendMessage(conversationId, responsePayload);
    } catch (error) {
        logger.error(`Failed to send user message to ${conversationId}:`, error);
    }
}
