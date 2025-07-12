import { logger } from 'firebase-functions';

import { MessagePayload } from '../../../../core/messaging';

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
        waitingMessage?: boolean;

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
            // TODO: handle conversation message
        }
    } catch (error) {
        throw new Error(`Error handling incoming message: ${error}`);
    }
}
