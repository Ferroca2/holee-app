import { logger } from 'firebase-functions';
import { Request } from 'firebase-functions/v2/tasks';

import { SetApplicationTaskData, validateSetApplicationTaskData } from './types';
import { ApplicationsRepositoryServerSDK } from '../../../domain/applications/repository';
import { Application, ApplicationStatus, ApplicationStep } from '../../../domain/applications/entity';

/**
 * Creates a new application for a conversation and job.
 * This is called when a new fit result is detected.
 */
export default async function setApplicationTask(context: Request): Promise<void> {
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

        logger.info('Starting setApplicationTask with data:', data);

        // Validate input data
        const validatedData: SetApplicationTaskData = validateSetApplicationTaskData(data);
        conversationId = validatedData.conversationId;
        jobId = validatedData.jobId;

        logger.info(`[${conversationId}] Starting setApplicationTask for job ${jobId}`);

        const applicationsRepository = new ApplicationsRepositoryServerSDK();

        // Check if application already exists
        const existingApplication = await applicationsRepository.getApplicationByJobAndConversation(jobId, conversationId);

        if (existingApplication) {
            logger.info(`[${conversationId}] Application already exists for job ${jobId}, skipping creation`);
            return;
        }

        // Create new application in the most basic state
        const newApplication: Application = {
            conversationId,
            jobId,
            status: ApplicationStatus.IN_PROGRESS,
            currentStep: ApplicationStep.MATCH_WITH_JOB,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        const applicationDoc = await applicationsRepository.addApplication(newApplication);

        logger.info(`[${conversationId}] Created new application ${applicationDoc.id} for job ${jobId} in step MATCH_WITH_JOB`);

    } catch (error) {
        // For other errors, log with conversationId and jobId if available
        const currentConversationId = conversationId || 'unknown';
        const currentJobId = jobId || 'unknown';
        logger.error(`[${currentConversationId}] Error in setApplicationTask for job ${currentJobId}:`, error);
        throw error;
    }
}
