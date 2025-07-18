import { logger } from 'firebase-functions';

import { MessagePayload } from '../../../../core/messaging';
import { isJobOptinMessage, parseJobOptinMessage } from '../../../../jobs/utils';

import { Conversation } from '../../../../domain/conversations/entity';
import { Message } from '../../../../domain/messages/entity';
import ConversationsRepository from '../../../../domain/conversations/repository';
import MessagesRepository from '../../../../domain/messages/repository';

/**
 * Main handler for incoming messages (fromMe = false).
 * Routes the message to the appropriate handler based on isGroup.
 *
 * @param storeId - The ID of the store
 * @param isButtonReply - Indicates if the message is a button reply
 * @param params - The message params from the webhook
 */
export async function handleIncomingMessage(
    params: {
        isGroup: boolean;

        phone: string;
        chatName: string;
        photo: string;

        messageId: string;
        referenceMessageId?: string;
        isEdit: boolean;
        momment: number;
        messagePayload: MessagePayload;

        fromMe: boolean;
        participantPhone: string;
        senderName: string;
        senderPhoto: string;
    }
) {
    try {
        // Ensure this handler only processes messages not sent by the user
        if (params.fromMe) {
            logger.warn('Incoming message handler received a message with fromMe=true');
            return;
        }

        // Route based on group or conversation
        if (params.isGroup) {
            return; // ignore group messages
        } else {
            await handleConversationMessage({
                phone: params.phone,
                chatName: params.chatName,
                photo: params.photo,

                messageId: params.messageId,
                referenceMessageId: params.referenceMessageId,
                isEdit: params.isEdit,
                momment: params.momment,
                messagePayload: params.messagePayload,

                fromMe: params.fromMe,
                senderName: params.senderName,
                senderPhoto: params.senderPhoto,
            });
        }
    } catch (error) {
        throw new Error(`Error handling incoming message: ${error}`);
    }
}

/**
 * Verifica se a mensagem é um opt-in de job e retorna o jobId se for
 * @param messagePayload - Payload da mensagem
 * @param fromMe - Se a mensagem foi enviada pelo bot
 * @returns jobId se for opt-in válido, null caso contrário
 */
function checkJobOptinMessage(messagePayload: MessagePayload, fromMe: boolean): string | null {
    // Só verifica mensagens de texto enviadas pelo usuário
    if (messagePayload.type === 'text' && !fromMe) {
        const textContent = messagePayload.text;

        if (isJobOptinMessage(textContent)) {
            return parseJobOptinMessage(textContent);
        }
    }

    return null;
}

/**
 * Processes messages sent in private conversations.
 *
 * @param params - Parameters required to handle a private conversation message.
 * @param params.phone - The phone number of the conversation.
 * @param params.messageId - The ID of the message.
 * @param params.referenceMessageId - The ID of the reference message (optional).
 * @param params.isEdit - Indicates if the message was edited.
 * @param params.momment - The timestamp of the message.
 * @param params.messagePayload - The standardized message payload.
 * @param params.fromMe - Indicates if the message was sent by the bot.
 * @param params.senderName - The name of the sender.
 * @param params.senderPhoto - The photo of the sender.
 */
async function handleConversationMessage(
    params: {
        phone: string;
        chatName: string;
        photo: string;

        messageId: string;
        referenceMessageId?: string;
        isEdit: boolean;
        momment: number;
        messagePayload: MessagePayload;
        waitingMessage?: boolean;

        fromMe: boolean;
        senderName: string;
        senderPhoto: string;
    }
) {
    // Verificar se a mensagem é um opt-in de job ANTES de buscar a conversation
    const jobOptinId = checkJobOptinMessage(params.messagePayload, params.fromMe);

    // Validate if the conversation exists and update its data
    const conversation = await ConversationsRepository.getConversationById(params.phone);
    const existingMessage = await MessagesRepository.getMessageById(params.phone, params.messageId);

    // Create conversation if it doesn't exist, or update its data if it does
    if (!conversation) {
        if (jobOptinId) {
            logger.info(`[${params.phone}] Job opt-in detected for job: ${jobOptinId} (new conversation)`);
        }

        const newConversation: Conversation = {
            name: params.chatName || params.senderName || 'UNKNOWN_USER_NAME',
            ...(params.photo ? { photo: params.photo } : params.senderPhoto ? { photo: params.senderPhoto } : {}),
            lastMessageTimestamp: params.momment,

            role: 'USER',
            profileCompleted: false,
            ...(jobOptinId ? { currentJobIds: [jobOptinId] } : {}),
        };

        await ConversationsRepository.setConversation(params.phone, newConversation);
    } else {
        const updatedData: Partial<Conversation> = {};

        // Update conversation name if needed
        if (conversation.name !== params.chatName && params.chatName) {
            updatedData.name = params.chatName;
        } else if (conversation.name !== params.senderName && params.senderName) {
            // If chatName is not available, use senderName as fallback
            updatedData.name = params.senderName;
        }

        // Update conversation photo if needed
        if (conversation.photo !== params.photo && params.photo) {
            updatedData.photo = params.photo;
        }

        // Update last message timestamp
        if (conversation.lastMessageTimestamp < params.momment) {
            updatedData.lastMessageTimestamp = params.momment;
        }

        // Processar opt-in de job se detectado
        if (jobOptinId) {
            const currentJobIds = conversation.currentJobIds || [];

            // Adicionar o jobId se não estiver já presente
            if (!currentJobIds.includes(jobOptinId)) {
                const updatedJobIds = [...currentJobIds, jobOptinId];
                updatedData.currentJobIds = updatedJobIds;

                logger.info(`[${params.phone}] Added job ${jobOptinId} to currentJobIds. Total jobs: ${updatedJobIds.length}`);
            } else {
                logger.warn(`[${params.phone}] Job ${jobOptinId} already in currentJobIds`);
            }
        }

        if (Object.keys(updatedData).length > 0) {
            await ConversationsRepository.updateConversation(params.phone, updatedData);
        }
    }

    if (params.isEdit) {
        if (existingMessage) {
            // Se a mensagem existe, atualiza apenas o payload e timestamp
            const updatedMessage: Partial<Message> = {
                timestamp: params.momment,
                messagePayload: params.messagePayload,
                ...(jobOptinId ? { isOptInMessage: true } : {}),
            };

            await MessagesRepository.updateMessage(params.phone, params.messageId, updatedMessage);
        } else {
            // Se a mensagem não existe (caso raro), cria uma nova
            const newMessage: Message = {
                timestamp: params.momment,
                messagePayload: params.messagePayload,
                ...(params.referenceMessageId ? { referenceMessageId: params.referenceMessageId } : {}),
                isGroup: false,
                isMe: params.fromMe,
                ...(jobOptinId ? { isOptInMessage: true } : {}),
                sender: {
                    phone: params.phone,
                    ...(params.senderName ? { name: params.senderName } : params.chatName ? { name: params.chatName } : {}),
                    ...(params.senderPhoto ? { photo: params.senderPhoto } : params.photo ? { photo: params.photo } : {}),
                },
            };

            await MessagesRepository.setMessage(params.phone, params.messageId, newMessage);
        }
    } else {
        // Se não é uma edição, cria uma nova mensagem
        const newMessage: Message = {
            timestamp: params.momment,
            messagePayload: params.messagePayload,
            ...(params.referenceMessageId ? { referenceMessageId: params.referenceMessageId } : {}),
            isGroup: false,
            isMe: params.fromMe,
            ...(jobOptinId ? { isOptInMessage: true } : {}),
            sender: {
                phone: params.phone,
                ...(params.senderName ? { name: params.senderName } : params.chatName ? { name: params.chatName } : {}),
                ...(params.senderPhoto ? { photo: params.senderPhoto } : params.photo ? { photo: params.photo } : {}),
            },
        };

        await MessagesRepository.setMessage(params.phone, params.messageId, newMessage);
    }
}
