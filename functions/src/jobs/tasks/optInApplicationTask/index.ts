import { Request } from 'firebase-functions/v2/tasks';
import { logger } from 'firebase-functions';

import { validateOptInApplicationTaskData, ValidationError } from './types';

import { ApplicationStep } from '../../../domain/applications/entity';
import applicationsRepository from '../../../domain/applications/repository';
import conversationsRepository from '../../../domain/conversations/repository';
import jobsRepository from '../../../domain/jobs/repository';

/**
 * Cloud Task function to opt-in to an application for a specific job and conversation
 *
 * This function processes a user's opt-in by:
 * 1. Validating the conversation and job exist
 * 2. Finding the existing application (should exist from fit matching)
 * 3. Updating the application to the next step: ACCEPT_JOB
 *
 * @param context - Task context containing the data
 */
export default async function optInApplicationTask(context: Request): Promise<void> {
    let conversationId: string | undefined;
    let jobId: string | undefined;

    try {
        // Convert scheduledTime from seconds to milliseconds with simple conversion
        const executionTimestamp = Number(context.scheduledTime) * 1000;
        if (isNaN(executionTimestamp)) {
            throw new Error(`Invalid scheduledTime format: ${context.scheduledTime}`);
        }

        // Access the data from the Request context
        const data: unknown = context.data;

        // Validate input data and get the task data
        const taskData = validateOptInApplicationTaskData(data);
        conversationId = taskData.conversationId;
        jobId = taskData.jobId;

        // 1. Validate that conversation exists
        const conversation = await conversationsRepository.getConversationById(conversationId);
        if (!conversation) {
            logger.error(`[${conversationId}] Conversation not found`);
            return;
        }

        // 2. Validate that job exists
        const job = await jobsRepository.getJobById(jobId);
        if (!job) {
            logger.error(`[${conversationId}] Job ${jobId} not found`);
            return;
        }

        // 3. Find the existing application (should exist from fit matching)
        const existingApplication = await applicationsRepository.getApplicationByJobAndConversation(jobId, conversationId);
        if (!existingApplication) {
            logger.error(`[${conversationId}] Application not found for job ${jobId} - should exist from fit matching`);
            return;
        }

        // 4. Validate current step - should be MATCH_WITH_JOB
        if (existingApplication.currentStep !== ApplicationStep.MATCH_WITH_JOB) {
            logger.warn(`[${conversationId}] Application ${existingApplication.id} is not in MATCH_WITH_JOB step (current: ${existingApplication.currentStep})`);
            return;
        }

        // 5. Update application to next step: ACCEPT_JOB
        const now = Date.now();
        await applicationsRepository.updateApplication(existingApplication.id, {
            currentStep: ApplicationStep.ACCEPT_JOB,
            updatedAt: now,
        });

        logger.info(`[${conversationId}] Successfully updated application ${existingApplication.id} to ACCEPT_JOB step for job ${jobId}`);
    } catch (error) {
        // Handle validation errors differently (don't retry)
        if (error instanceof ValidationError) {
            logger.error(`Validation error in optInApplicationTask: ${error.toString()}`);
            throw error; // Don't retry validation errors
        }

        // For other errors, log with conversationId and jobId if available
        const currentConversationId = conversationId || 'unknown';
        const currentJobId = jobId || 'unknown';
        logger.error(`Error in optInApplicationTask for conversation ${currentConversationId}, job ${currentJobId}:`, error);
        throw error; // Re-throw to trigger retry mechanism
    }
}
