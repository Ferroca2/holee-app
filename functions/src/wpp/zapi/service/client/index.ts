/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, AxiosInstance } from 'axios';
import { ZApiClientError } from './ZApiClientError';

import { PhoneExistsResult } from '../types';

export interface ZApiClientI {
    /* Messages */
    sendText(body: {
        phone: string,                      // Phone number
        message: string,                    // Message to be sent
        delayMessage?: number,              // Delay before sending next message (Optional)
        delayTyping?: number,               // Delay typing indicator (Optional)
        messageId?: string,                 // Message ID to respond to (Optional)
        mentioned?: string,                 // Mentioned contact (only for group messages) (Optional)
        editMessageId?: string,             // Message ID to be edited (Optional)
    }): Promise<any>;                       // Sends a text message
    sendImage(body: {
        phone: string,                      // Phone number
        image: string,                      // Image URL or base64
        caption?: string,                   // Optional caption for the image (Optional)
        delayMessage?: number,              // Delay before sending next message (Optional)
        delayTyping?: number,               // Delay typing indicator (Optional)
        messageId?: string,                 // Message ID to respond to (Optional)
        viewOnce?: boolean                  // Whether the image can be viewed only once (Optional)
    }): Promise<any>;                       // Sends an image message
    sendAudio(body: {
        phone: string,                      // Phone number
        audio: string,                      // Audio URL or base64
        delayMessage?: number,              // Delay before sending next message (Optional)
        delayTyping?: number,               // Delay typing indicator (Optional)
        messageId?: string,                 // Message ID to respond to (Optional)
        viewOnce?: boolean,                 // Whether the audio can be viewed only once (Optional)
        async?: boolean,                    // Whether to send asynchronously (Optional)
        waveform?: boolean                  // Whether to include waveform data (Optional)
    }): Promise<any>;                       // Sends an audio message
    sendButtonActions(body: {
        phone: string,                      // Phone number
        message: string,                    // Message to be sent
        title?: string,                     // Optional title
        footer?: string,                    // Optional footer
        buttonActions: Array<{              // Array of button actions
            id?: string,                    // Optional button ID
            type: 'CALL' | 'URL' | 'REPLY', // Button type
            phone?: string,                 // Optional phone number (for CALL type)
            url?: string,                   // Optional URL (for URL type)
            label: string,                  // Button label
        }>,
        delayMessage?: number,              // Delay before sending next message (Optional)
        delayTyping?: number,               // Delay typing indicator (Optional)
    }): Promise<any>;                       // Sends a message with interactive buttons
    sendDocument(body: {
        phone: string,                          // Phone number
        document: string,                       // Document URL
        fileName?: string,                      // Optional file name
        caption?: string,                       // Optional document description
        delayMessage?: number,                  // Delay before sending next message (Optional)
        delayTyping?: number,                   // Delay typing indicator (Optional)
        messageId?: string,                     // Message ID to respond to (Optional)
    }, extension: string): Promise<any>;        // Sends a document message
    sendCarousel(body: {
        phone: string,                          // Phone number
        message: string,                        // Message to be sent
        carousel: Array<{                       // Array of carousel cards
            image: string,                      // Image URL or base64 (Required)
            text?: string,                      // Optional card text
            buttons?: Array<{                   // Optional array of buttons
                id?: string,                    // Optional button ID
                type: 'CALL' | 'URL' | 'REPLY', // Button type
                phone?: string,                 // Optional phone number (for CALL type)
                url?: string,                   // Optional URL (for URL type)
                label: string,                  // Button label
            }>,
        }>,
        delayMessage?: number,              // Delay before sending next message (Optional)
        delayTyping?: number,               // Delay typing indicator (Optional)
    }): Promise<any>;                       // Sends a carousel message
    deleteMessages(messageId: string, phone: string, owner: boolean): Promise<any>;     // Deletes a message

    /* Contacts */
    phoneExistsBatch(body: {
        phones: string[]                    // Array of phone numbers to check
    }): Promise<PhoneExistsResult[]>;       // Checks if phone numbers exist on WhatsApp
}

export class ZApiClient implements ZApiClientI {
    private client: AxiosInstance;
    private instanceId: string;
    private instanceToken: string;

    constructor(instanceId: string, instanceToken: string) {
        try {
            this.client = axios.create({
                baseURL: `https://api.z-api.io/instances/${instanceId}/token/${instanceToken}`,
                headers: {
                    'Client-Token': process.env.ZAPI_TOKEN,
                },
            });

            this.instanceId = instanceId;
            this.instanceToken = instanceToken;
        } catch (error) {
            throw new Error(`Error creating ZApiClient: ${error}`);
        }
    }


    /* Error handling */

    // Static method to handle Axios errors and standardize them with ZApiClientError
    private static handleError(error: unknown, context: string): never {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            throw new ZApiClientError(
                context,
                axiosError.message,
                axiosError.response?.status || null,
                axiosError.response?.data || null
            );
        }

        // For any other error types
        throw new ZApiClientError(context, (error as Error)?.message || String(error));
    }


    /* API */

    // Send a text message
    async sendText(body: {
        phone: string,                  // Phone number
        message: string,                // Message to be sent
        delayMessage?: number,          // Delay before sending next message (Optional)
        delayTyping?: number,           // Delay typing indicator (Optional)
        messageId?: string,             // Message ID to respond to (Optional)
        mentioned?: string,             // Mentioned contact (only for group messages) (Optional)
        editMessageId?: string,         // Message ID to be edited (Optional)
    }): Promise<any> {
        try {
            const response = await this.client.post('/send-text', body);
            return response.data;
        } catch (error) {
            ZApiClient.handleError(error, 'Sending Text Message');
        }
    }

    // Send an image message
    async sendImage(body: {
        phone: string,                  // Phone number
        image: string,                  // Image URL or base64
        caption?: string,               // Optional caption for the image (Optional)
        delayMessage?: number,          // Delay before sending next message (Optional)
        delayTyping?: number,           // Delay typing indicator (Optional)
        messageId?: string,             // Message ID to respond to (Optional)
        viewOnce?: boolean              // Whether the image can be viewed only once (Optional)
    }): Promise<any> {
        try {
            const response = await this.client.post('/send-image', body);
            return response.data;
        } catch (error) {
            ZApiClient.handleError(error, 'Sending Image Message');
        }
    }

    // Send an audio message
    async sendAudio(body: {
        phone: string,                  // Phone number
        audio: string,                  // Audio URL or base64
        delayMessage?: number,          // Delay before sending next message (Optional)
        delayTyping?: number,           // Delay typing indicator (Optional)
        messageId?: string,             // Message ID to respond to (Optional)
        viewOnce?: boolean,             // Whether the audio can be viewed only once (Optional)
        async?: boolean,                // Whether to send asynchronously (Optional)
        waveform?: boolean              // Whether to include waveform data (Optional)
    }): Promise<any> {
        try {
            const response = await this.client.post('/send-audio', body);
            return response.data;
        } catch (error) {
            ZApiClient.handleError(error, 'Sending Audio Message');
        }
    }

    // Send a message with interactive buttons
    async sendButtonActions(body: {
        phone: string,                          // Phone number
        message: string,                        // Message to be sent
        title?: string,                         // Optional title
        footer?: string,                        // Optional footer
        buttonActions: Array<{                  // Array of button actions
            id?: string,                        // Optional button ID
            type: 'CALL' | 'URL' | 'REPLY',     // Button type
            phone?: string,                     // Optional phone number (for CALL type)
            url?: string,                       // Optional URL (for URL type)
            label: string,                      // Button label
        }>,
        delayMessage?: number,                  // Delay before sending next message (Optional)
        delayTyping?: number,                   // Delay typing indicator (Optional)
    }): Promise<any> {
        try {
            const response = await this.client.post('/send-button-actions', body);
            return response.data;
        } catch (error) {
            ZApiClient.handleError(error, 'Sending Button Actions Message');
        }
    }

    // Send a document message
    async sendDocument(body: {
        phone: string,                          // Phone number
        document: string,                       // Document URL
        fileName?: string,                      // Optional file name
        caption?: string,                       // Optional document description
        delayMessage?: number,                  // Delay before sending next message (Optional)
        delayTyping?: number,                   // Delay typing indicator (Optional)
        messageId?: string,                     // Message ID to respond to (Optional)
    }, extension: string): Promise<any> {
        try {
            const response = await this.client.post(`/send-document/${extension}`, body);
            return response.data;
        } catch (error) {
            ZApiClient.handleError(error, 'Sending Document Message');
        }
    }

    // Send a carousel message
    async sendCarousel(body: {
        phone: string,                      // Phone number
        message: string,                    // Message to be sent
        carousel: Array<{                  // Array of carousel cards
            image: string,              // Image URL or base64 (Required)
            text?: string,              // Optional card text
            buttons?: Array<{           // Optional array of buttons
                id?: string,            // Optional button ID
                type: 'CALL' | 'URL' | 'REPLY', // Button type
                phone?: string,         // Optional phone number (for CALL type)
                url?: string,           // Optional URL (for URL type)
                label: string,          // Button label
            }>,
        }>,
        delayMessage?: number,              // Delay before sending next message (Optional)
        delayTyping?: number,               // Delay typing indicator (Optional)
    }): Promise<any> {
        try {
            const response = await this.client.post('/send-carousel', body);
            return response.data;
        } catch (error) {
            ZApiClient.handleError(error, 'Sending Carousel Message');
        }
    }

    // Delete a message
    async deleteMessages(messageId: string, phone: string, owner: boolean): Promise<any> {
        try {
            const response = await this.client.delete(`/messages?messageId=${messageId}&phone=${phone}&owner=${owner}`);
            return response.data;
        } catch (error) {
            ZApiClient.handleError(error, 'Deleting Message');
        }
    }


    /* Contacts */

    // Check if phone numbers exist on WhatsApp
    async phoneExistsBatch(body: {
        phones: string[]                               // Array of phone numbers to check
    }): Promise<PhoneExistsResult[]> {
        try {
            const response = await this.client.post('/phone-exists-batch', body);
            return response.data;
        } catch (error) {
            ZApiClient.handleError(error, 'Checking Phone Numbers Existence');
        }
    }
}
