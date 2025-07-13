import { Request } from 'firebase-functions/v2/tasks';
import { logger } from 'firebase-functions';

import { validateProcessJobsForConversationTaskData, ValidationError } from './types';

import { AdminBaseRef } from '../../../domain';
import { Conversation } from '../../../domain/conversations/entity';
import { Job } from '../../../domain/jobs/entity';
import conversationRepository from '../../../domain/conversations/repository';
import jobsRepository from '../../../domain/jobs/repository';

/**
 * Cloud Task function to process jobs for a specific conversation
 *
 * This function processes the jobs for a conversation by:
 * 1. Fetching the conversation data
 * 2. Processing the jobs for the conversation
 *
 * @param data - Task data containing the groupId to refresh
 */
export default async function processJobsForConversationTask(context: Request): Promise<void> {
    let conversationId: string | undefined;

    try {
        // Convert scheduledTime from seconds to milliseconds with simple conversion
        const executionTimestamp = Number(context.scheduledTime) * 1000;
        if (isNaN(executionTimestamp)) {
            throw new Error(`Invalid scheduledTime format: ${context.scheduledTime}`);
        }

        // Access the data from the Request context
        const data: unknown = context.data;

        // Validate input data and get the task data
        const taskData = validateProcessJobsForConversationTaskData(data);
        conversationId = taskData.conversationId;

        // 1. Fetch and validate the conversation data
        const conversation = await conversationRepository.getConversationById(conversationId);
        if (!conversation) {
            logger.error(`[${conversationId}] Conversation not found`);
            return;
        }

        // 2. Fetch the jobs for the conversation
        const jobs = await jobsRepository.getCurrentOpenJobs();

        // 3. Process the fit function for each pair of job and conversation in parallel
        const fitResults: Conversation['fitResults'] = await Promise.all(jobs.map(async job => {
            const fitResult = await processJobForConversation(job, conversation);
            return fitResult;
        }));

        // 4. Update the conversation with the fit results
        await conversationRepository.updateConversation(conversationId, {
            fitResults,
        });

        logger.info(`[${conversationId}] Successfully completed processJobsForConversationTask`);
    } catch (error) {
        // Handle validation errors differently (don't retry)
        if (error instanceof ValidationError) {
            logger.error(`Validation error in processJobsForConversationTask: ${error.toString()}`);
            throw error; // Don't retry validation errors
        }

        // For other errors, log with conversationId if available
        const currentConversationId = conversationId || 'unknown';
        logger.error(`Error in processJobsForConversationTask for conversation ${currentConversationId}:`, error);
        throw error; // Re-throw to trigger retry mechanism
    }
}

/**
 * Process a single job for a conversation and return fit score
 * @param job - The job to process
 * @param conversation - The conversation to process against
 * @returns Fit result with jobId and score
 */
async function processJobForConversation(job: AdminBaseRef<Job>, conversation: AdminBaseRef<Conversation>): Promise<{ jobId: string; fitScore: number }> {

    // Mock implementation - generate random score between 0 and 100
    const fitScore = Math.floor(Math.random() * 101); // 0 to 100
    logger.info(`[${conversation.id}] Processed job ${job.id} with fit score ${fitScore}`);

    // TODO: Implement the fit function and remove the mock implementation

    return {
        jobId: job.id,
        fitScore,
    };
}
