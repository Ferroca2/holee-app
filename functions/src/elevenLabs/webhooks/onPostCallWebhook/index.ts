import { Request, Response } from 'express';
import { logger } from 'firebase-functions';

import { Application } from '../../../domain/applications/entity';
import ApplicationsRepository from '../../../domain/applications/repository';

/**
 * Handles webhook events from ElevenLabs.
 *
 * @param req - The HTTP request object containing the webhook payload.
 * @param res - The HTTP response object to return the result of the operation.
 *
 * Behavior:
 * - Validates the request method and payload structure.
 * - Processes post_call_transcription events.
 * - Updates Application with transcription data.
 *
 * @throws 405 - If the HTTP method is not POST.
 * @throws 415 - If the Content-Type is not "application/json".
 * @throws 500 - If an internal server error occurs during processing.
 */
export default async function onPostCallWebhook(req: Request, res: Response) {
    try {
        // // Ensure the HTTP method is POST
        // if (req.method !== 'POST') {
        //     logger.warn(`Invalid method: ${req.method}`);
        //     return res.status(405).json({ message: 'Method Not Allowed. Use POST.' });
        // }

        // // Validate the Content-Type
        // if (req.get('Content-Type') !== 'application/json') {
        //     logger.warn(`Invalid Content-Type: ${req.get('Content-Type')}`);
        //     return res.status(415).json({ message: 'Unsupported Media Type. Use application/json.' });
        // }

        // Extract payload
        const payload = req.body;

        // Validate the payload format
        if (!payload) {
            logger.warn('Invalid payload format.');
            return res.status(400).json({ message: 'Invalid payload.' });
        }

        // Log the payload for debugging purposes
        logger.info(`ElevenLabs webhook payload:\n${JSON.stringify(req.body, null, 2)}`);

        // Extract relevant fields from the nested structure
        const { type, data } = payload;

        // Only process post_call_transcription events
        if (type === 'post_call_transcription') {
            logger.info(`Processing post_call_transcription event with status: ${data?.status}`);

            // Validate required fields
            if (!data?.user_id || typeof data.user_id !== 'string') {
                logger.warn('Missing or invalid user_id in data');
                return res.status(400).json({ message: 'Missing or invalid user_id' });
            }

            if (!data?.transcript || !Array.isArray(data.transcript)) {
                logger.warn('Missing or invalid transcript in data');
                return res.status(400).json({ message: 'Missing or invalid transcript' });
            }

            // Extract jobId and conversationId from user_id (format: jobId_conversationId)
            const parts = data.user_id.split('_');
            if (parts.length !== 2) {
                logger.warn(`Invalid user_id format: ${data.user_id}. Expected format: jobId_conversationId`);
                return res.status(400).json({ message: 'Invalid user_id format. Expected: jobId_conversationId' });
            }

            const [jobId, conversationId] = parts;

            // Find the application
            const application = await ApplicationsRepository.getApplicationByJobAndConversation(jobId, conversationId);
            if (!application) {
                logger.warn(`Application not found for job ${jobId} and conversation ${conversationId}`);
                return res.status(404).json({ message: 'Application not found' });
            }

            // Process transcript to simplified format
            const simplifiedTranscript = data.transcript.map((item: any) => ({
                role: item.role || 'unknown',
                message: item.message || '',
            }));

            // Extract transcript summary
            const transcriptSummary = data.analysis?.transcript_summary || '';

            // Extract call duration
            const callDurationSeconds = data.metadata?.call_duration_secs || 0;

            // Extract call status
            const callStatus = data.status || '';

            // Extract main language
            const mainLanguage = data.metadata?.main_language || '';

            // Prepare update data
            const updateData: Partial<Application> = {
                updatedAt: Date.now(),
            };

            // Update interviewData with transcription and summary (preserve existing script and checklist)
            if (application.interviewData) {
                updateData.interviewData = {
                    ...application.interviewData,
                    transcription: simplifiedTranscript,
                    transcriptSummary: transcriptSummary,
                    callDurationSeconds: callDurationSeconds,
                    callStatus: callStatus,
                    mainLanguage: mainLanguage,
                };
            } else {
                logger.warn(`Application ${application.id} has no interviewData - cannot add transcription`);
                return res.status(400).json({ message: 'Application has no interviewData structure' });
            }

            // Update the application
            await ApplicationsRepository.updateApplication(application.id, updateData);

            logger.info(`Successfully updated application ${application.id} with transcription data for job ${jobId}, conversation ${conversationId}`);
            logger.info(`Transcription has ${simplifiedTranscript.length} messages`);
            logger.info(`Call duration: ${callDurationSeconds} seconds`);
            logger.info(`Call status: ${callStatus}`);
            logger.info(`Main language: ${mainLanguage}`);
            logger.info(`Transcript summary: ${transcriptSummary}`);

        } else {
            // Ignore other types
            logger.info(`Ignoring event type: ${type}`);
        }

        // Return success response
        res.status(200).json({ message: 'Webhook received successfully' });
    } catch (error) {
        logger.error(`Error processing ElevenLabs webhook: ${error}`);
        res.status(500).json({ message: 'Internal server error' });
    }
}
