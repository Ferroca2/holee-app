import { MessagePath } from "../pubsub/onChatAi";
import conversationsRepository from "../domain/conversations/repository";
import { logger } from "firebase-functions/v2";
import messagesRepository from "../domain/messages/repository";
import { buildOpenAiContext } from "./utils";
import { handleProfileMessage } from "./handleProfileMessage";
import { handleUserMessage } from "./handleUserMessage";

export const handleIncomingMessage = async (messagePath: MessagePath): Promise<void> => {
    const { conversationId } = messagePath;
    try {
        const conversation = await conversationsRepository.getConversationById(conversationId);

        if (!conversation) {
            logger.error(`Conversation ${conversationId} not found`);
            return;
        }

        const latestMessages = await messagesRepository.getLatestMessages(conversationId, 10);
        const context = await buildOpenAiContext(latestMessages);

        if (conversation.profileCompleted) {
            await handleUserMessage(messagePath, context);
        } else {
            await handleProfileMessage(messagePath, context);
        }
    } catch (error) {
        logger.error(`Error processing message for conversation ${conversationId}:`, error);
    }
}
