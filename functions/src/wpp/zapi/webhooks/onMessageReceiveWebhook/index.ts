import { Request, Response } from 'express';
import { logger } from 'firebase-functions';

import Messaging, { MessagePayload, ButtonActionsPayload, CarouselPayload } from '../../../../core/messaging';

// Import the message handlers
import { handleIncomingMessage } from './handleIncomingMessage';
import { handleOutgoingMessage } from './handleOutgoingMessage';

/**
 * Handles webhook events for receiving WhatsApp messages.
 *
 * @param req - The HTTP request object containing the webhook payload.
 * @param res - The HTTP response object to return the result of the operation.
 *
 * Behavior:
 * - Validates the request method and payload structure.
 * - Routes messages based on whether they were sent by the user (fromMe) or received from others.
 * - Creates or updates the appropriate Firestore documents for conversations or groups.
 *
 * @throws 405 - If the HTTP method is not POST.
 * @throws 415 - If the Content-Type is not "application/json".
 * @throws 500 - If an internal server error occurs during processing.
 */
export default async function onMessageReceive(req: Request, res: Response) {
    try {
        // Ensure the HTTP method is POST
        if (req.method !== 'POST') {
            logger.warn(`Invalid method: ${req.method}`);
            return res.status(405).json({ message: 'Method Not Allowed. Use POST.' });
        }

        // Validate the Content-Type
        if (req.get('Content-Type') !== 'application/json') {
            logger.warn(`Invalid Content-Type: ${req.get('Content-Type')}`);
            return res.status(415).json({ message: 'Unsupported Media Type. Use application/json.' });
        }

        // Extract payload
        const payload = req.body;

        // Validate the payload format
        if (!payload) {
            logger.warn('Invalid payload format.');
            return res.status(400).json({ message: 'Invalid payload.' });
        }

        // Log the payload for debugging purposes
        logger.debug(`Webhook payload:\n${JSON.stringify(req.body, null, 2)}`);

        // Destructure relevant fields
        const {
            type,
            status,
            waitingMessage,
            isNewsletter,

            isGroup,

            instanceId,

            phone,
            chatName,
            photo,

            messageId,
            referenceMessageId,
            isEdit,
            momment,

            // Transform to TextPayload
            text,
            buttonReply,
            listResponseMessage,
            buttonsResponseMessage,

            // Transform to ImagePayload
            image,
            sticker,

            // Transform to VideoPayload
            video,

            // Transform to ImageButtonPayload or VideoButtonPayload
            buttonsMessage,

            // Transform to AudioPayload
            audio,

            // Transform to ContactPayload
            contact,

            // Transform to DocumentPayload
            document,

            // Transform to LocationPayload
            location,

            // Transform to ButtonActionsPayload, ImageButtonActionsPayload, VideoButtonActionsPayload or others payloads
            hydratedTemplate,

            // Transform to CarouselPayload
            carouselMessage,

            // // Transform to AudioPayload
            // audio,

            // // Transform to VideoPayload
            // video,

            fromMe,
            fromApi,
            participantPhone,
            senderName,
            senderPhoto,
        } = payload;

        // phone whitelist
        const phoneWhitelist = ['558592045959', '5511996267412', '5512978149232'];
        if (!phoneWhitelist.includes(phone)) {
            logger.warn(`Phone ${phone} is not whitelisted.`);
            return res.status(200).json({ message: 'Phone not whitelisted.' });
        }

        // Validate the type of the payload
        if (type !== 'ReceivedCallback') {
            logger.warn(`Invalid type: ${type}`);
            return res.status(400).json({ message: 'Invalid type, must be "ReceivedCallback".' });
        }

        // Validate the status of the payload (RECEIVED for messages sent by others, SENT for messages sent by me)
        if (status !== 'RECEIVED' && status !== 'SENT') {
            logger.warn(`Invalid status: ${status}`);
            return res.status(400).json({ message: 'Invalid status, must be "RECEIVED" or "SENT".' });
        }

        // Validate the isNewsletter of the payload... if it is a newsletter, ignore it
        if (isNewsletter) {
            logger.warn('Ignoring newsletter message.');
            return res.status(200).json({ message: 'Newsletter message ignored.' });
        }

        // Validate if isGroup is present
        if (isGroup === undefined) {
            logger.warn('Missing isGroup.');
            return res.status(400).json({ message: 'Missing isGroup.' });
        }

        // Validate if momment is present
        if (!momment) {
            logger.warn(`Missing momment in payload.`);
            return res.status(400).json({ message: 'Invalid payload: Missing momment.' });
        }

        // Extract standardized message payload
        const messagePayload = extractMessagePayload({
            text,
            buttonReply,
            listResponseMessage,
            buttonsResponseMessage,
            image,
            sticker,
            video,
            buttonsMessage,
            audio,
            contact,
            document,
            location,
            carouselMessage,
            hydratedTemplate,
        }, waitingMessage === true);

        if (!messagePayload) {
            logger.warn('Unsupported message type or empty content.');
            return res.status(200).json({ message: 'Unsupported message type or empty content.' });
        }

        // Validate the instanceId of the payload
        if (!instanceId) {
            logger.warn('Missing instanceId.');
            return res.status(400).json({ message: 'Missing instanceId.' });
        }

        // Validate if messageId is present
        if (!messageId) {
            logger.warn(`Missing messageId in payload.`);
            return res.status(400).json({ message: 'Invalid payload: Missing messageId.' });
        }

        // Route based on fromMe
        if (!fromMe) {
            await handleIncomingMessage({
                isGroup,

                phone,
                chatName,
                photo,

                messageId,
                referenceMessageId,
                isEdit,
                momment,
                messagePayload,

                fromMe,
                participantPhone,
                senderName,
                senderPhoto,
            });
        } else {
            await handleOutgoingMessage({
                isGroup,

                phone,
                chatName,
                photo,

                messageId,
                referenceMessageId,
                isEdit,
                momment,
                messagePayload,

                fromMe,
                fromApi,
                participantPhone,
                senderName,
                senderPhoto,
            });
        }

        res.status(200).end();
    } catch (error) {
        logger.error(`Error processing webhook: ${error}`);
        res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * Extracts a standardized message payload from the webhook data.
 *
 * @param text - Text payload from the webhook.
 * @param buttonReply - Button reply payload from the webhook.
 * @param listResponseMessage - List response payload from the webhook.
 * @param buttonsResponseMessage - Buttons response payload from the webhook.
 * @param image - Image payload from the webhook.
 * @param sticker - Sticker payload from the webhook.
 * @param hydratedTemplate - Hydrated template payload from the webhook.
 * @param carouselMessage - Carousel message payload from the webhook.
 * @param isWaitingMessage - Flag indicating if this is a waiting message (encrypted message that couldn't be decrypted)
 * @returns The standardized message payload or null if unsupported.
 */
function extractMessagePayload(
    input: {
        text?: { message: string },
        buttonReply?: { message: string },
        listResponseMessage?: { message: string },
        buttonsResponseMessage?: { message: string },

        image?: { imageUrl: string | null, caption?: string },
        sticker?: { stickerUrl: string },

        video?: {
            videoUrl: string,
            caption: string,
            mimeType: string,
            seconds: number,
            viewOnce: boolean,
        },

        buttonsMessage?: {
            imageUrl: string | null,
            videoUrl: string | null,
            message: string,
            buttons: Array<{
                buttonId: string,
                type: number,
                buttonText: {
                    displayText: string,
                },
            }>,
        },

        audio?: {
            ptt: boolean,
            seconds: number,
            audioUrl: string,
            mimeType: string,
            viewOnce: boolean,
        },

        contact?: {
            displayName: string,
            vCard: string,
            phones: string[],
        },

        document?: {
            caption: string | null,
            documentUrl: string,
            mimeType: string,
            title: string,
            pageCount: number,
            fileName: string,
        },

        location?: {
            longitude: number,
            latitude: number,
            address: string,
            url: string,
        },

        carouselMessage?: {
            text: string,
            cards: Array<{
                header: {
                    image: {
                        imageUrl: string,
                        thumbnailUrl: string,
                        caption: string,
                        mimeType: string,
                        viewOnce: boolean,
                        width: number,
                        height: number,
                    },
                },
                message: string,
                footer: string,
                title: string,
                hydratedButtons: Array<{
                    index: number,
                    callButton?: { displayText: string, phoneNumber: string, id?: string },
                    urlButton?: { displayText: string, url: string, id?: string },
                    quickReplyButton?: { displayText: string, id?: string },
                }>,
            }>,
        },

        hydratedTemplate?: {
            header?: {
                image?: {
                    imageUrl: string,
                    thumbnailUrl: string,
                    caption: string,
                    mimeType: string,
                    viewOnce: boolean,
                    width: number,
                    height: number,
                },
                video?: {
                    videoUrl: string,
                    caption: string,
                    mimeType: string,
                    width: number,
                    height: number,
                    seconds: number,
                    viewOnce: boolean,
                },
                document?: {
                    caption: string,
                    documentUrl: string,
                    mimeType: string,
                    title: string,
                    pageCount: number,
                    fileName: string,
                },
                location?: {
                    longitude: number,
                    latitude: number,
                    name: string,
                    address: string,
                    url: string,
                }
            },
            message: string,
            footer?: string,
            title?: string,
            templateId?: string,
            hydratedButtons: Array<{
                index: number,
                callButton?: { displayText: string, phoneNumber: string, id?: string },
                urlButton?: { displayText: string, url: string, id?: string },
                quickReplyButton?: { displayText: string, id?: string },
            }>
        },
    },
    isWaitingMessage?: boolean
): MessagePayload | null {
    try {
        // Handle waiting messages (encrypted messages that couldn't be decrypted)
        if (isWaitingMessage) {
            return Messaging.create.text(''); // Empty text for messages that couldn't be decrypted
        }

        // Handle text payloads
        if (input.text) {
            return Messaging.create.text(input.text.message);
        }
        if (input.buttonReply) {
            return Messaging.create.text(input.buttonReply.message);
        }
        if (input.listResponseMessage) {
            return Messaging.create.text(input.listResponseMessage.message);
        }
        if (input.buttonsResponseMessage) {
            return Messaging.create.text(input.buttonsResponseMessage.message);
        }

        // Handle image payloads
        if (input.image) {
            const imageUrl = input.image.imageUrl
                ? input.image.imageUrl : 'no-image-url';

            return Messaging.create.image(imageUrl, input.image.caption);
        }
        if (input.sticker) {
            return Messaging.create.image(input.sticker.stickerUrl);
        }

        // Handle video payloads
        if (input.video) {
            // return {
            //     type: 'video',
            //     video: video.videoUrl,
            //     ...(video.caption ? { text: video.caption } : {}),
            // } as VideoPayload;
        }

        // Handle ImageButtonPayload and VideoButtonPayload
        if (input.buttonsMessage) {
            // if (buttonsMessage.imageUrl) {
            //     return {
            //         type: 'image',
            //         image: buttonsMessage.imageUrl,
            //         text: buttonsMessage.message,
            //     } as ImageButtonPayload;
            // }

            // if (buttonsMessage.videoUrl) {
            //     return {
            //         type: 'video',
            //         video: buttonsMessage.videoUrl,
            //         text: buttonsMessage.message,
            //     } as VideoButtonPayload;
            // }
        }

        // Handle AudioPayload
        if (input.audio) {
            return Messaging.create.audio(
                input.audio.audioUrl,
                input.audio.seconds,
                input.audio.mimeType
            );
        }

        // Handle ContactPayload
        if (input.contact) {
            // return {
            //     type: 'contact',
            //     contact: contact,
            // } as ContactPayload;
        }

        // Handle DocumentPayload
        if (input.document) {
            // Extract extension from documentUrl
            const url = new URL(input.document.documentUrl);
            const pathname = url.pathname;
            const lastDotIndex = pathname.lastIndexOf('.');

            let extension = '';
            if (lastDotIndex !== -1 && lastDotIndex !== pathname.length - 1) {
                extension = pathname.substring(lastDotIndex + 1).toLowerCase();
            }

            // Fallback: if no extension in URL, try to get from fileName
            if (!extension && input.document.fileName) {
                const fileLastDotIndex = input.document.fileName.lastIndexOf('.');
                if (fileLastDotIndex !== -1 && fileLastDotIndex !== input.document.fileName.length - 1) {
                    extension = input.document.fileName.substring(fileLastDotIndex + 1).toLowerCase();
                }
            }

            // If we still don't have extension, skip this document
            if (!extension) {
                logger.warn('Document without valid extension, skipping');
                return null;
            }

            return Messaging.create.document(
                input.document.documentUrl,
                extension,
                input.document.fileName,
                input.document.mimeType,
                input.document.caption ?? undefined
            );
        }

        // Handle LocationPayload
        if (input.location) {
            // return {
            //     type: 'location',
            //     location: location,
            // } as LocationPayload;
        }

        // Handle carousel payload
        if (input.carouselMessage) {
            const cards = input.carouselMessage.cards.map(card => {
                const cardData: {
                    image: {
                        image: string;
                        text?: string;
                        transcription?: string;
                    };
                    text?: string;
                    buttons?: Array<{
                        id?: string;
                        type: 'CALL' | 'URL' | 'REPLY';
                        phone?: string;
                        url?: string;
                        label: string;
                    }>;
                } = {
                    image: {
                        image: card.header.image.imageUrl,
                    },
                };

                // Add image caption if present
                if (card.header.image.caption) {
                    cardData.image.text = card.header.image.caption;
                }

                // Add card text if present
                if (card.message) {
                    cardData.text = card.message;
                }

                // Add buttons if present
                if (card.hydratedButtons && card.hydratedButtons.length > 0) {
                    cardData.buttons = card.hydratedButtons
                        .map(button => {
                            if (!button) return null;

                            if (button.callButton) {
                                return {
                                    ...(button.callButton.id !== undefined ? { id: button.callButton.id } : {}),
                                    type: 'CALL' as NonNullable<CarouselPayload['cards'][number]['buttons']>[number]['type'],
                                    phone: button.callButton.phoneNumber,
                                    label: button.callButton.displayText,
                                };
                            }
                            if (button.urlButton) {
                                return {
                                    ...(button.urlButton.id !== undefined ? { id: button.urlButton.id } : {}),
                                    type: 'URL' as NonNullable<CarouselPayload['cards'][number]['buttons']>[number]['type'],
                                    url: button.urlButton.url,
                                    label: button.urlButton.displayText,
                                };
                            }
                            if (button.quickReplyButton) {
                                return {
                                    ...(button.quickReplyButton.id !== undefined ? { id: button.quickReplyButton.id } : {}),
                                    type: 'REPLY' as NonNullable<CarouselPayload['cards'][number]['buttons']>[number]['type'],
                                    label: button.quickReplyButton.displayText,
                                };
                            }

                            return null;
                        })
                        .filter((button): button is NonNullable<typeof button> => button !== null);
                }

                return cardData;
            });

            return Messaging.create.carousel(input.carouselMessage.text, cards);
        }

        // Handle hydrated template separately
        if (input.hydratedTemplate) {
            // Extract buttonActions if any
            const buttonActions = Object.values(input.hydratedTemplate.hydratedButtons || {})
                .map(button => {
                    if (!button) return null;

                    if (button.callButton) {
                        return {
                            ...(button.callButton.id !== undefined ? { id: button.callButton.id } : {}),
                            type: 'CALL' as ButtonActionsPayload['buttons'][number]['type'],
                            phone: button.callButton.phoneNumber,
                            label: button.callButton.displayText,
                        };
                    }
                    if (button.urlButton) {
                        return {
                            ...(button.urlButton.id !== undefined ? { id: button.urlButton.id } : {}),
                            type: 'URL' as ButtonActionsPayload['buttons'][number]['type'],
                            url: button.urlButton.url,
                            label: button.urlButton.displayText,
                        };
                    }
                    if (button.quickReplyButton) {
                        return {
                            ...(button.quickReplyButton.id !== undefined ? { id: button.quickReplyButton.id } : {}),
                            type: 'REPLY' as ButtonActionsPayload['buttons'][number]['type'],
                            label: button.quickReplyButton.displayText,
                        };
                    }

                    // TODO: Verify other possible types of button actions, like OTP button (copy button actually... it is not a button action)

                    // Fallback for unknown button types
                    return null;
                })
                .filter(button => button !== null);

            // TODO: Verify if we can have other types of buttons (not only button actions) inside the hydratedTemplate.hydratedButtons

            // Only create a button-actions payload if we have valid buttons
            if (buttonActions.length > 0) {
                if (!input.hydratedTemplate.header?.image && !input.hydratedTemplate.header?.video) {
                    return Messaging.create.buttonActions(
                        input.hydratedTemplate.message,
                        buttonActions as ButtonActionsPayload['buttons'],
                        input.hydratedTemplate.title,
                        input.hydratedTemplate.footer
                    );
                }
            } else if (input.hydratedTemplate.header?.image) {
                return Messaging.create.image(
                    input.hydratedTemplate.header.image.imageUrl,
                    input.hydratedTemplate.header.image.caption
                );
            }
            else {
                return null;
            }
        }

        return null;
    } catch (error) {
        logger.error(`Error extracting message payload: ${error}`);
        throw error;
    }
}
