import { Request, Response } from 'express';
import { logger } from 'firebase-functions';

/**
 * Handles webhook events from ElevenLabs.
 *
 * @param req - The HTTP request object containing the webhook payload.
 * @param res - The HTTP response object to return the result of the operation.
 *
 * Behavior:
 * - Validates the request method and payload structure.
 * - Processes post_call_transcription events.
 * - Logs the payload for debugging purposes.
 *
 * @throws 405 - If the HTTP method is not POST.
 * @throws 415 - If the Content-Type is not "application/json".
 * @throws 500 - If an internal server error occurs during processing.
 */
export default async function onPostCallWebhook(req: Request, res: Response) {
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
        logger.info(`ElevenLabs webhook payload:\n${JSON.stringify(req.body, null, 2)}`);

        // Extract relevant fields
        const { type, user_id: userId, transcript, status } = payload;

        // Only process post_call_transcription events
        if (type === 'post_call_transcription') {
            logger.info(`Processing post_call_transcription event with status: ${status}`);

            // Validate required fields
            if (!userId || typeof userId !== 'string') {
                logger.warn('Missing or invalid user_id');
                return res.status(400).json({ message: 'Missing or invalid user_id' });
            }

            if (!transcript || !Array.isArray(transcript)) {
                logger.warn('Missing or invalid transcript');
                return res.status(400).json({ message: 'Missing or invalid transcript' });
            }

            // Extract jobId and conversationId from user_id (format: jobId_conversationId)
            const parts = userId.split('_');
            if (parts.length !== 2) {
                logger.warn(`Invalid user_id format: ${userId}. Expected format: jobId_conversationId`);
                return res.status(400).json({ message: 'Invalid user_id format. Expected: jobId_conversationId' });
            }

            const [jobId, conversationId] = parts;

            // TODO: Process the transcript and update the Application
            // With jobId and conversationId, we can access the Application that was responsible for this call

            logger.info(`Successfully processed post_call_transcription for job ${jobId}, conversation ${conversationId}`);
        } else {
            // Ignore other types
            logger.warn(`Ignoring event type: ${type}`);
        }

        // Return success response
        res.status(200).json({ message: 'Webhook received successfully' });
    } catch (error) {
        logger.error(`Error processing ElevenLabs webhook: ${error}`);
        res.status(500).json({ message: 'Internal server error' });
    }
}
