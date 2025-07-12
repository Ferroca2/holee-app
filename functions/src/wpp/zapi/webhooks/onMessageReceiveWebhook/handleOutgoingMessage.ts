import { logger } from 'firebase-functions';

import { MessagePayload } from '../../../../core/messaging';

import { Conversation } from '../../../../domain/conversations/entity';
import { Message } from '../../../../domain/messages/entity';
import ConversationsRepository from '../../../../domain/conversations/repository';
import MessagesRepository from '../../../../domain/messages/repository';

/**
 * Handles outgoing messages (messages sent by the user/store)
 *
 * Logic:
 * - If fromApi=false: Always treat as HUMAN chatHandler
 * - If fromApi=true but message not in DB: Treat as HUMAN chatHandler
 * - If message exists in DB: Just update timestamp, senderName, senderPhoto
 * - For edits (isEdit=true):
 *   - If fromApi=true: Edits probably already exist in DB
 *   - If fromApi=false: Add new edition to editions array
 */
export async function handleOutgoingMessage(
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
        fromApi: boolean;
        participantPhone: string;
        senderName: string;
        senderPhoto: string;
    }
) {
    try {
        // Ensure this handler only processes messages sent by the user
        if (!params.fromMe) {
            logger.warn('Outgoing message handler received a message with fromMe=false');
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
                fromApi: params.fromApi,
                senderName: params.senderName,
                senderPhoto: params.senderPhoto,
            });
        }
    } catch (error) {
        throw new Error(`Error processing outgoing message: ${error}`);
    }
}

/**
 * Processes outgoing messages sent in private conversations.
 *
 * @param params - The parameters for the conversation message
 * @param params.phone - The phone number of the conversation
 * @param params.chatName - The name of the conversation
 * @param params.photo - The photo of the conversation
 * @param params.messageId - The ID of the message
 * @param params.referenceMessageId - The ID of the reference message (optional).
 * @param params.isEdit - Whether the message is an edit
 * @param params.momment - The timestamp of the message
 * @param params.messagePayload - The payload of the message
 * @param params.waitingMessage - Whether the message is waiting for a response
 * @param params.fromMe - Whether the message is from the user
 * @param params.fromApi - Whether the message is from the API
 * @param params.senderName - The name of the sender
 * @param params.senderPhoto - The photo of the sender
 */
async function handleConversationMessage(params: {
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
    fromApi: boolean;
    senderName: string;
    senderPhoto: string;
}) {
    // Create typed promises array
    const promises: Promise<[Conversation | null, Message | null]> = Promise.all([
        ConversationsRepository.getConversationById(params.phone),
        MessagesRepository.getMessageById(params.phone, params.messageId),
    ]);

    // Get results (OBS: conversation2 is the same as conversation but with a possible nine digits existance or not)
    const [conversation, existingMessage] = await promises;

    // Create a list of promises to be executed
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const dbPromises: Promise<any>[] = [];
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const conversationUpdateData: Partial<Conversation> = {};
    let messageUpdateData: Partial<Message>;
    let newMessageData: Message;

    // Create conversation if it doesn't exist, or update its data if it does
    if (!conversation) {
        const newConversation: Conversation = {
            name: params.chatName || params.senderName || params.phone || 'UNKNOWN_USER_NAME',
            ...(params.photo ? { photo: params.photo } : params.senderPhoto ? { photo: params.senderPhoto } : {}),
            lastMessageTimestamp: params.momment,

            role: 'USER',
            profileCompleted: false,
        };

        dbPromises.push(ConversationsRepository.setConversation(params.phone, newConversation));
    } else {
        // Update conversation name if needed
        if (conversation.name !== params.chatName && params.chatName) {
            conversationUpdateData.name = params.chatName;
        }

        // Update conversation photo if needed
        if (conversation.photo !== params.photo && params.photo) {
            conversationUpdateData.photo = params.photo;
        }

        // Update conversation's lastMessageTimestamp
        if (conversation.lastMessageTimestamp < params.momment) {
            if (existingMessage) {
                conversationUpdateData.lastMessageTimestamp = Math.max(conversation.lastMessageTimestamp, existingMessage.timestamp);
            } else {
                conversationUpdateData.lastMessageTimestamp = params.momment;
            }
        }

        // Apply all conversation updates in a single call if needed
        if (Object.keys(conversationUpdateData).length > 0) {
            dbPromises.push(ConversationsRepository.updateConversation(params.phone, conversationUpdateData));
        }
    }

    // Handle message logic
    if (params.isEdit) {
        // Se é uma edição de mensagem
        if (existingMessage) {
            // Check if message payload has changed
            const hasMessagePayloadChanged = JSON.stringify(existingMessage.messagePayload) !== JSON.stringify(params.messagePayload);

            // Criar objeto de atualização apenas se houver mudanças
            messageUpdateData = {
                ...(hasMessagePayloadChanged ? { messagePayload: params.messagePayload } : {}),
                ...(existingMessage.timestamp < params.momment ? { timestamp: params.momment } : {}),
                ...(params.referenceMessageId ? { referenceMessageId: params.referenceMessageId } : {}),
            };

            // Update existing message only if there are changes
            if (Object.keys(messageUpdateData).length > 0) {
                dbPromises.push(MessagesRepository.updateMessage(params.phone, params.messageId, messageUpdateData));
            }
        } else {
            // Se a mensagem não existe (caso raro), cria uma nova
            newMessageData = {
                timestamp: params.momment,
                messagePayload: params.messagePayload,
                ...(params.referenceMessageId ? { referenceMessageId: params.referenceMessageId } : {}),
                isGroup: false,
                isMe: params.fromMe,
                sender: {
                    phone: params.phone,
                    ...(params.senderName ? { name: params.senderName } : params.chatName ? { name: params.chatName } : {}),
                    ...(params.senderPhoto ? { photo: params.senderPhoto } : params.photo ? { photo: params.photo } : {}),
                },
            };

            dbPromises.push(MessagesRepository.setMessage(params.phone, params.messageId, newMessageData));
        }
    } else if (existingMessage) {
        // Handle non-edited message that exists (probably sent via API)
        messageUpdateData = {
            // Do not update the original timestamp
            // Only update the necessary fields
            sender: {
                phone: params.phone,
                ...(params.senderName ? { name: params.senderName } : existingMessage.sender.name ? { name: existingMessage.sender.name } : {}),
                ...(params.senderPhoto ? { photo: params.senderPhoto } : existingMessage.sender.photo ? { photo: existingMessage.sender.photo } : {}),
            },
        };

        // Update existing message only if there are changes
        if (Object.keys(messageUpdateData).length > 0) {
            dbPromises.push(MessagesRepository.updateMessage(params.phone, params.messageId, messageUpdateData));
        }
    } else {
        // Handle non-edited message that doesn't exist (sent via phone or API not yet set)
        newMessageData = {
            timestamp: params.momment,
            messagePayload: params.messagePayload,
            ...(params.referenceMessageId ? { referenceMessageId: params.referenceMessageId } : {}),
            isGroup: false,
            isMe: params.fromMe,
            sender: {
                phone: params.phone,
                ...(params.senderName ? { name: params.senderName } : params.chatName ? { name: params.chatName } : {}),
                ...(params.senderPhoto ? { photo: params.senderPhoto } : params.photo ? { photo: params.photo } : {}),
            },
        };

        dbPromises.push(MessagesRepository.setMessage(params.phone, params.messageId, newMessageData));
    }

    // Execute all database operations in parallel
    await Promise.all(dbPromises);
}
