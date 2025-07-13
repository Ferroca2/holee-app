import { Request } from 'firebase-functions/v2/tasks';
import { logger } from 'firebase-functions';

import { validateProcessJobsForConversationTaskData, ValidationError } from './types';

import { ZApiServiceSDK } from '../../../wpp/zapi/service';
import { generateJobOptinMessage } from '../../utils';

import { AdminBaseRef } from '../../../domain';
import { Conversation } from '../../../domain/conversations/entity';
import { Job } from '../../../domain/jobs/entity';
import StoresRepository from '../../../domain/stores/repository';
import ConversationsRepository from '../../../domain/conversations/repository';
import JobsRepository from '../../../domain/jobs/repository';

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
        const conversation = await ConversationsRepository.getConversationById(conversationId);
        if (!conversation) {
            logger.error(`[${conversationId}] Conversation not found`);
            return;
        }

        // 2. Fetch the jobs for the conversation
        const jobs = await JobsRepository.getCurrentOpenJobs();
        logger.info(`[${conversationId}] Found ${jobs.length} jobs: ${jobs.map(job => job.id).join(', ')}`);

        // 3. Get existing fitResults to avoid reprocessing
        const existingFitResults = conversation.fitResults ?? [];
        const existingJobIds = new Set(existingFitResults.map(result => result.jobId));

        // 4. Process the fit function only for jobs that don't have existing fitResults
        const newFitResults: { jobId: string; fitScore: number }[] = (await Promise.all(jobs.map(async job => {
            // Skip processing if job already has a fitResult
            if (existingJobIds.has(job.id)) {
                return null;
            }

            const fitResult = await processJobForConversation(job, conversation);
            return fitResult;
        })))
            .filter((result): result is { jobId: string; fitScore: number } => result !== null)
            .sort((a, b) => b.fitScore - a.fitScore);

        // 5. Merge with existing fitResults
        const allFitResults = [...existingFitResults, ...newFitResults]
            .sort((a, b) => b.fitScore - a.fitScore);

        // 6. Update the conversation with the fit results
        await ConversationsRepository.updateConversation(conversation.id, {
            fitResults: allFitResults,
        });

        // 7. Send carousel for top 5 NEW fit results (only if there are new results)
        if (newFitResults.length > 0) {
            const zApiService = await ZApiServiceSDK.initialize();
            const top5NewResults = newFitResults.slice(0, 5);

            // Create a map of jobId -> job for quick lookup
            const jobsMap = new Map(jobs.map(job => [job.id, job]));

            // Get jobs and their stores for the carousel
            const jobsWithStores = await Promise.all(top5NewResults.map(async (result: { jobId: string; fitScore: number }) => {
                const job = jobsMap.get(result.jobId);
                if (!job) {
                    logger.warn(`[${conversationId}] Job ${result.jobId} not found in loaded jobs`);
                    return null;
                }

                const store = await StoresRepository.getStoreById(job.storeId);
                if (!store) {
                    logger.warn(`[${conversationId}] Store ${job.storeId} not found for job ${result.jobId}`);
                    return null;
                }

                return { job, store, fitScore: result.fitScore };
            }));

            // Filter out null results
            const validJobsWithStores = jobsWithStores.filter((item): item is { job: any; store: any; fitScore: number } => item !== null);
            if (validJobsWithStores.length > 0) {
                const carousel = validJobsWithStores.map((item: { job: any; store: any; fitScore: number }) => ({
                    image: item.store.logo,
                    text: `*${item.job.title}* - ${item.store.name}\n\n${item.job.description}\n\n📍 ${item.job.location}\n💰 ${item.job.salaryRange ? `R$ ${item.job.salaryRange.min.toLocaleString()} - R$ ${item.job.salaryRange.max.toLocaleString()}` : 'Salário a combinar'}\n`,
                    buttons: [
                        {
                            type: 'REPLY' as const,
                            label: generateJobOptinMessage(item.job.id),
                        },
                    ],
                }));

                await zApiService.sendCarousel({
                    phone: conversation.id,
                    message: `🎯 Encontramos ${validJobsWithStores.length} nova${validJobsWithStores.length > 1 ? 's' : ''} vaga${validJobsWithStores.length > 1 ? 's' : ''} que combina${validJobsWithStores.length > 1 ? 'm' : ''} com você:`,
                    carousel,
                });

                logger.info(`[${conversationId}] Sent carousel with ${validJobsWithStores.length} new job matches`);
            }
        }

        logger.info(`[${conversationId}] Successfully completed processJobsForConversationTask: ${newFitResults.length} new jobs above threshold, ${allFitResults.length} total jobs`);
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
 * @returns Fit result with jobId and score, or null if below threshold
 */
async function processJobForConversation(job: AdminBaseRef<Job>, conversation: AdminBaseRef<Conversation>): Promise<{ jobId: string; fitScore: number } | null> {
    // Mock implementation - generate random score between 0 and 100
    const fitScore = Math.floor(Math.random() * 100); // 0 to 100

    //TODO: IMPROVE THIS LOGIC AND CHANGE THRESHOLD

    // Apply threshold filter and return the jobId and fitScore if above threshold
    return fitScore >= 0 ? { jobId: job.id, fitScore } : null;
}
