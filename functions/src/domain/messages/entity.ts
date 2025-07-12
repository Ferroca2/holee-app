// Import MessagePayload from new messaging system
import { MessagePayload } from '../../core/messaging';

/**
 * Interface representing a message from a conversation or group.
 */
export interface Message {
    timestamp: number;                      // Timestamp of the original message.
    messagePayload: MessagePayload;         // Original content of the message.

    referenceMessageId?: string;            // ID of the reference message (optional).

    isGroup: boolean;                       // Indicates if the message was sent in a group.

    isMe: boolean;                          // Indicates if the message was sent by me.
    sender: {
        phone: string;                      // Sender's phone number.
        name?: string;                      // Sender's name (optional).
        photo?: string;                     // URL of the sender's profile picture (optional).
    };
}
