import { Request } from 'firebase-functions/v2/tasks';
import { logger } from 'firebase-functions';

import { validateOptInApplicationTaskData, ValidationError } from './types';

import { ZApiServiceSDK } from '../../../wpp/zapi/service';
import { MessagePayload } from '../../../core/messaging';

import { ApplicationStep, ApplicationStatus } from '../../../domain/applications/entity';
import ApplicationsRepository from '../../../domain/applications/repository';
import ConversationsRepository from '../../../domain/conversations/repository';
import JobsRepository from '../../../domain/jobs/repository';
import { ReadMapAgent } from '../../../ai/readMapAgent';
import { getUserDescription } from '../../../ai/utils';

/**
 * Cloud Task function to opt-in to an application for a specific job and conversation
 *
 * This function processes a user's opt-in by:
 * 1. Validating the conversation and job exist
 * 2. Finding the existing application (should exist from fit matching)
 * 3. Updating the application to the next step: INTERVIEW
 * 4. Sending confirmation messages and interview link
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
        const conversation = await ConversationsRepository.getConversationById(conversationId);
        if (!conversation) {
            logger.error(`[${conversationId}] Conversation not found`);
            return;
        }

        // 2. Validate that job exists
        const job = await JobsRepository.getJobById(jobId);
        if (!job) {
            logger.error(`[${conversationId}] Job ${jobId} not found`);
            return;
        }

        // 3. Find the existing application (should exist from fit matching)
        const existingApplication = await ApplicationsRepository.getApplicationByJobAndConversation(jobId, conversationId);
        if (!existingApplication) {
            logger.error(`[${conversationId}] Application not found for job ${jobId} - should exist from fit matching`);
            return;
        }

        // 4. Validate application status - should be IN_PROGRESS
        if (existingApplication.status !== ApplicationStatus.IN_PROGRESS) {
            logger.warn(`[${conversationId}] Application ${existingApplication.id} is not in IN_PROGRESS status (current: ${existingApplication.status})`);
            return;
        }

        // 5. Validate current step - should be MATCH_WITH_JOB
        if (existingApplication.currentStep !== ApplicationStep.MATCH_WITH_JOB) {
            logger.warn(`[${conversationId}] Application ${existingApplication.id} is not in MATCH_WITH_JOB step (current: ${existingApplication.currentStep})`);
            return;
        }

        // 6. Update application to next step: INTERVIEW
        const now = Date.now();
        await ApplicationsRepository.updateApplication(existingApplication.id, {
            currentStep: ApplicationStep.INTERVIEW,
            updatedAt: now,
        });

        logger.info(`[${conversationId}] Successfully updated application ${existingApplication.id} to INTERVIEW step for job ${jobId}`);

        // 7. Update Application with interview data
        const readMapAgent = new ReadMapAgent(conversationId);
        const userDescription = await getUserDescription(conversationId);
        const interviewData = await readMapAgent.process(job.description, userDescription);
        await ApplicationsRepository.updateApplication(existingApplication.id, {
            interviewData: interviewData ? {
                script: interviewData.roteiro,
                checklist: interviewData.checklist.map(item => ({ text: item, tick: false })),
            } : undefined,
        });

        // 8. Send interview confirmation message
        const zApiService = await ZApiServiceSDK.initialize();

        // Format the job end date
        const endDate = new Date(job.applyEnd);
        const formattedEndDate = endDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        // Create single message payload
        const message: MessagePayload = {
            type: 'text',
            text: `🎉 Parabéns! Sua candidatura foi confirmada para *${job.title}*.\n\n📹 Realize sua entrevista a qualquer momento: https://holee-app.web.app/voice-agent-public/${jobId}/${conversationId}\n\n⏰ Cuidado com o prazo: até ${formattedEndDate}`,
        };

        // Send message
        await zApiService.sendMessage(conversationId, message);

        logger.info(`[${conversationId}] Successfully sent interview message for job ${jobId}`);
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
