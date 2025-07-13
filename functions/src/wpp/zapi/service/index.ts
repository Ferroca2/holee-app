import { ZApiClient } from './client';
import { MessageInfo, PhoneExistsResult } from './types';

import { MessagePayload, ButtonActionsPayload } from '../../../core/messaging';

export interface ZApiServiceI {
    // Messages
    sendText(body: {
        phone: string,
        message: string,
        delayTyping?: number,
        delayMessage?: number,
        messageId?: string,
        mentioned?: string
    }): Promise<MessageInfo>;               // Sends a text message

    sendImage(body: {
        phone: string,
        image: string,
        caption?: string,
        delayMessage?: number,
        delayTyping?: number,
        messageId?: string,
        viewOnce?: boolean
    }): Promise<MessageInfo>;               // Sends an image message

    sendAudio(body: {
        phone: string,
        audio: string,
        delayMessage?: number,
        delayTyping?: number,
        messageId?: string,
        viewOnce?: boolean,
        async?: boolean,
        waveform?: boolean
    }): Promise<MessageInfo>;               // Sends an audio message

    sendButtonActions(body: {
        phone: string,
        message: string,
        title?: string,
        footer?: string,
        buttonActions: Array<{
            id?: string,
            type: 'CALL' | 'URL' | 'REPLY',
            phone?: string,
            url?: string,
            label: string
        }>,
        delayMessage?: number,
        delayTyping?: number
    }): Promise<MessageInfo>;               // Sends a message with interactive buttons

    sendDocument(body: {
        phone: string,
        document: string,
        fileName?: string,
        caption?: string,
        delayMessage?: number,
        delayTyping?: number,
        messageId?: string
    }, extension: string): Promise<MessageInfo>; // Sends a document message

    sendCarousel(body: {
        phone: string,
        message: string,
        carousel: Array<{
            image: string,
            text?: string,
            buttons?: Array<{
                id?: string,
                type: 'CALL' | 'URL' | 'REPLY',
                phone?: string,
                url?: string,
                label: string
            }>,
        }>,
        delayMessage?: number,
        delayTyping?: number
    }): Promise<MessageInfo>;               // Sends a carousel message

    deleteMessage(messageId: string, phone: string, owner: boolean): Promise<boolean>; // Deletes a message

    // Contacts
    phoneExistsBatch(phones: string[]): Promise<PhoneExistsResult[]>; // Checks if phone numbers exist on WhatsApp

    /* Utils */
    sendMessage(phone: string, payload: MessagePayload, options?: {
        delayTyping?: number,
        delayMessage?: number,
        messageId?: string,
        mentioned?: string,
        viewOnce?: boolean,
        async?: boolean,
        waveform?: boolean
    }): Promise<MessageInfo>;               // Generic method to send any type of message
}

export class ZApiServiceSDK implements ZApiServiceI {
    private instanceId: string;
    private zApiClient: ZApiClient;

    private constructor(
        instanceId: string,
        zApiClient: ZApiClient
    ) {
        this.instanceId = instanceId;
        this.zApiClient = zApiClient;
    }

    /**
    * Factory method to initialize and create a ZApiServiceSDK.
    * @param instanceId - The ID of the ZApiInstance.
    * @param instanceToken - The token for the ZApiInstance.
    * @returns A fully initialized ZApiServiceSDK.
    */
    static async initialize(instanceId: string = process.env.ZAPI_INSTANCE_ID!, instanceToken: string = process.env.ZAPI_INSTANCE_TOKEN!): Promise<ZApiServiceSDK> {
        try {
            if (!instanceToken) {
                throw new Error(`Token is required for instance ID: ${instanceId}`);
            }

            // Create the ZApiClient
            const zApiClient = new ZApiClient(instanceId, instanceToken);

            // Return a fully initialized ZApiServiceSDK
            return new ZApiServiceSDK(instanceId, zApiClient);
        } catch (error) {
            throw new Error(`Error initializing ZApiServiceSDK: ${error}`);
        }
    }

    /* ZApiServiceI methods */

    /**
     * Sends a text message to the specified phone number.
     * @param body - The message body.
     * @param body.phone - The phone number to send the message to.
     * @param body.message - The message to send.
     * @param body.delayMessage - The delay in seconds before sending the next message. (Optional)
     * @param body.delayTyping - The delay in seconds before sending the message. (Optional)
     * @param body.messageId - The message ID to respond to. (Optional)
     * @param body.mentioned - The phone number to mention in the message. Only used for group messages. (Optional)
     */
    async sendText(body: {
        phone: string,
        message: string,
        delayMessage?: number,
        delayTyping?: number,
        messageId?: string,
        mentioned?: string
    }): Promise<MessageInfo> {
        try {
            const response = await this.zApiClient.sendText(body);

            return {
                zaapId: response.zaapId,
                messageId: response.messageId,
                id: response.id,
            };
        } catch (error) {
            throw new Error(`Error sending text message for instance ${this.instanceId}: ${String(error)}`);
        }
    }

    /**
     * Sends an image message to the specified phone number.
     * @param body - The image message body.
     * @param body.phone - The phone number to send the image to.
     * @param body.image - The image URL or base64 string.
     * @param body.caption - The optional caption for the image.
     * @param body.delayMessage - The optional delay before sending the next message.
     * @param body.delayTyping - The optional delay for typing indication.
     * @param body.messageId - The optional message ID to respond to.
     * @param body.viewOnce - The optional setting for view-once images.
     */
    async sendImage(body: {
        phone: string,                      // Phone number to send the image to
        image: string,                      // Image URL or base64 string
        caption?: string,                   // Optional caption for the image
        delayMessage?: number,              // Optional delay before sending the next message
        delayTyping?: number,               // Optional delay for typing indication
        messageId?: string,                 // Optional message ID to respond to
        viewOnce?: boolean                  // Optional setting for view-once images
    }): Promise<MessageInfo> {
        try {
            const response = await this.zApiClient.sendImage(body);

            return {
                zaapId: response.zaapId,
                messageId: response.messageId,
                id: response.id,
            };
        } catch (error) {
            throw new Error(`Error sending image message for instance ${this.instanceId}: ${String(error)}`);
        }
    }

    /**
     * Sends an audio message to the specified phone number.
     * @param body - The audio message body.
     * @param body.phone - The phone number to send the audio to.
     * @param body.audio - The audio URL or base64 string.
     * @param body.delayMessage - The optional delay before sending the next message.
     * @param body.delayTyping - The optional delay for typing indication.
     * @param body.messageId - The optional message ID to respond to.
     * @param body.viewOnce - The optional setting for view-once audio.
     * @param body.async - The optional setting for async sending.
     * @param body.waveform - The optional setting for including waveform.
     */
    async sendAudio(body: {
        phone: string,                      // Phone number to send the audio to
        audio: string,                      // Audio URL or base64 string
        delayMessage?: number,              // Optional delay before sending the next message
        delayTyping?: number,               // Optional delay for typing indication
        messageId?: string,                 // Optional message ID to respond to
        viewOnce?: boolean,                 // Optional setting for view-once audio
        async?: boolean,                    // Optional setting for async sending
        waveform?: boolean                  // Optional setting for including waveform
    }): Promise<MessageInfo> {
        try {
            const response = await this.zApiClient.sendAudio(body);

            return {
                zaapId: response.zaapId,
                messageId: response.messageId,
                id: response.id,
            };
        } catch (error) {
            throw new Error(`Error sending audio message for instance ${this.instanceId}: ${String(error)}`);
        }
    }

    /**
     * Sends a message with interactive buttons (call, url, reply buttons).
     *
     * @param body - The button actions message body.
     * @param body.phone - The phone number to send the message to.
     * @param body.message - The message text.
     * @param body.title - Optional title for the message.
     * @param body.footer - Optional footer for the message.
     * @param body.buttonActions - Array of button action objects with type, label and optional fields.
     * @param body.delayMessage - Optional delay before sending the next message.
     * @param body.delayTyping - Optional delay for typing indication.
     *
     * @returns A MessageInfo object with the sent message details.
     * @throws Error if there is a failure sending the button actions message.
     */
    async sendButtonActions(body: {
        phone: string,
        message: string,
        title?: string,
        footer?: string,
        buttonActions: Array<{
            id?: string,
            type: 'CALL' | 'URL' | 'REPLY',
            phone?: string,
            url?: string,
            label: string
        }>,
        delayMessage?: number,
        delayTyping?: number
    }): Promise<MessageInfo> {
        try {
            const response = await this.zApiClient.sendButtonActions(body);

            return {
                zaapId: response.zaapId,
                messageId: response.messageId,
                id: response.id,
            };
        } catch (error) {
            throw new Error(`Error sending button actions message for instance ${this.instanceId}: ${String(error)}`);
        }
    }

    /**
     * Sends a document message to the specified phone number.
     * @param body - The document message body.
     * @param body.phone - The phone number to send the document to.
     * @param body.document - The document URL or base64 string.
     * @param body.fileName - The optional file name for the document.
     * @param body.caption - The optional caption for the document.
     * @param body.delayMessage - The optional delay before sending the next message.
     * @param body.delayTyping - The optional delay for typing indication.
     * @param body.messageId - The optional message ID to respond to.
     * @param extension - The file extension for the document.
     */
    async sendDocument(body: {
        phone: string,
        document: string,
        fileName?: string,
        caption?: string,
        delayMessage?: number,
        delayTyping?: number,
        messageId?: string
    }, extension: string): Promise<MessageInfo> {
        try {
            const response = await this.zApiClient.sendDocument(body, extension);

            return {
                zaapId: response.zaapId,
                messageId: response.messageId,
                id: response.id,
            };
        } catch (error) {
            throw new Error(`Error sending document message for instance ${this.instanceId}: ${String(error)}`);
        }
    }

    /**
     * Sends a carousel message to the specified phone number.
     * @param body - The carousel message body.
     * @param body.phone - The phone number to send the carousel to.
     * @param body.message - The message text for the carousel.
     * @param body.carousel - The carousel array containing cards.
     * @param body.delayMessage - The optional delay before sending the next message.
     * @param body.delayTyping - The optional delay for typing indication.
     */
    async sendCarousel(body: {
        phone: string,
        message: string,
        carousel: Array<{
            image: string,
            text?: string,
            buttons?: Array<{
                id?: string,
                type: 'CALL' | 'URL' | 'REPLY',
                phone?: string,
                url?: string,
                label: string
            }>,
        }>,
        delayMessage?: number,
        delayTyping?: number
    }): Promise<MessageInfo> {
        try {
            const response = await this.zApiClient.sendCarousel(body);

            return {
                zaapId: response.zaapId,
                messageId: response.messageId,
                id: response.id,
            };
        } catch (error) {
            throw new Error(`Error sending carousel message for instance ${this.instanceId}: ${String(error)}`);
        }
    }

    /**
     * Deletes a message from a chat.
     *
     * @param messageId - The ID of the message to delete
     * @param phone - The phone number of the chat
     * @param owner - Whether the message is owned by the instance
     * @returns true if the message was successfully deleted, false otherwise
     */
    async deleteMessage(messageId: string, phone: string, owner: boolean): Promise<boolean> {
        try {
            const response = await this.zApiClient.deleteMessages(messageId, phone, owner);
            return response && response.value === true;
        } catch (error) {
            throw new Error(`Error deleting message for instance ${this.instanceId}: ${String(error)}`);
        }
    }

    /**
     * Checks if phone numbers exist on WhatsApp.
     * @param phones Array of phone numbers to check
     * @returns Array of results indicating if each number exists on WhatsApp
     * @throws Error if there is a failure checking phone numbers
     */
    async phoneExistsBatch(phones: string[]): Promise<PhoneExistsResult[]> {
        try {
            const results: PhoneExistsResult[] = await this.zApiClient.phoneExistsBatch({
                phones,
            });

            if (results.length === 0) {
                throw new Error(`No results returned for instance ${this.instanceId}`);
            }

            // Return the data directly as it already matches the expected format
            return results;
        } catch (error) {
            throw new Error(`Error checking phone numbers existence for instance ${this.instanceId}: ${String(error)}`);
        }
    }

    /**
     * Generic method to send any type of message.
     *
     * This method acts as a router for different message types,
     * delegating to the appropriate specific send method based on the payload type.
     *
     * @param phone - The phone number to send the message to.
     * @param payload - The message payload that conforms to our application's MessagePayload type.
     * @param options - Additional options for sending the message.
     * @param options.delayTyping - Optional delay for typing indication in milliseconds.
     * @param options.delayMessage - Optional delay before sending the next message in milliseconds.
     * @param options.messageId - Optional message ID to respond to.
     * @param options.mentioned - Optional phone number to mention (for group messages - only text messages).
     * @param options.viewOnce - Optional setting for view-once media (for images/videos/audios messages).
     * @param options.async - Optional setting for async sending (for audio messages).
     * @param options.waveform - Optional setting for including waveform (for audio messages).
     *
     * @returns A MessageInfo object with the IDs of the sent message.
     * @throws Error if the message type is not supported or if there's an error sending the message.
     */
    async sendMessage(phone: string, payload: MessagePayload, options?: {
        delayMessage?: number,
        delayTyping?: number,
        messageId?: string,
        mentioned?: string,
        viewOnce?: boolean,
        async?: boolean,
        waveform?: boolean
    }): Promise<MessageInfo> {
        try {
            // Route the payload to the appropriate method based on its type
            switch(payload.type) {
                case 'text':
                    // Send text message
                    return await this.sendText({
                        phone,

                        message: payload.text,

                        delayMessage: options?.delayMessage,
                        delayTyping: options?.delayTyping,
                        messageId: options?.messageId,
                        mentioned: options?.mentioned,
                    });

                case 'image':
                    // Send image message
                    return await this.sendImage({
                        phone,

                        image: payload.image,
                        caption: payload.text,

                        delayMessage: options?.delayMessage,
                        delayTyping: options?.delayTyping,
                        messageId: options?.messageId,
                        viewOnce: options?.viewOnce,
                    });

                case 'audio':
                    // Send audio message
                    return await this.sendAudio({
                        phone,

                        audio: payload.audio,

                        delayMessage: options?.delayMessage,
                        delayTyping: options?.delayTyping,
                        messageId: options?.messageId,
                        viewOnce: options?.viewOnce,
                        async: options?.async,
                        waveform: options?.waveform,
                    });

                case 'button-actions':
                    // Send button actions message
                    return await this.sendButtonActions({
                        phone,

                        message: payload.text,
                        title: payload.title,
                        footer: payload.footer,
                        buttonActions: payload.buttons.map((button: ButtonActionsPayload['buttons'][number]) => ({
                            id: button.id,
                            type: button.type,
                            phone: button.phone,
                            url: button.url,
                            label: button.label,
                        })),

                        delayMessage: options?.delayMessage,
                        delayTyping: options?.delayTyping,
                    });

                case 'document':
                    // Send document message
                    return await this.sendDocument({
                        phone,

                        document: payload.documentUrl,
                        fileName: payload.fileName,
                        caption: payload.caption,

                        delayMessage: options?.delayMessage,
                        delayTyping: options?.delayTyping,
                        messageId: options?.messageId,
                    }, payload.extension);

                    // TODO: Implement other message types (link, poll) here as they are supported

                case 'carousel':
                    // Send carousel message
                    return await this.sendCarousel({
                        phone,

                        message: payload.text,
                        carousel: payload.cards.map(card => ({
                            image: card.image.image,
                            text: card.text,
                            buttons: card.buttons?.map(button => ({
                                id: button.id,
                                type: button.type,
                                phone: button.phone,
                                url: button.url,
                                label: button.label,
                            })),
                        })),

                        delayMessage: options?.delayMessage,
                        delayTyping: options?.delayTyping,
                    });

                default:
                    throw new Error(`Unsupported message type: ${payload.type}`);
            }
        } catch (error) {
            throw new Error(`Error sending message for instance ${this.instanceId}: ${String(error)}`);
        }
    }
}
