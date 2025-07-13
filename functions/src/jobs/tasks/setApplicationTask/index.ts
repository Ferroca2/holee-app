import { logger } from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';

import { SetApplicationTaskData, validateSetApplicationTaskData } from './types';
import { ApplicationsRepositoryServerSDK } from '../../../domain/applications/repository';
import { Application, ApplicationStatus, ApplicationStep } from '../../../domain/applications/entity';

/**
 * Creates a new application for a conversation and job.
 * This is called when a new fit result is detected.
 */
export default async function setApplicationTask(data: unknown) {
    logger.info('Starting setApplicationTask with data:', data);

    // Validate input data
    const validatedData: SetApplicationTaskData = validateSetApplicationTaskData(data);
    const { conversationId, jobId } = validatedData;

    logger.info(`[${conversationId}] Starting setApplicationTask for job ${jobId}`);

    try {
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
        logger.error(`[${conversationId}] Error in setApplicationTask for job ${jobId}:`, error);
        throw error;
    }
}
