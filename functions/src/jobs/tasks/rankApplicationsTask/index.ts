import { Request } from 'firebase-functions/v2/tasks';
import { logger } from 'firebase-functions';

import { validateRankApplicationsTaskData, ValidationError } from './types';

import { JobStatus } from '../../../domain/jobs/entity';
import { ApplicationStatus, ApplicationStep } from '../../../domain/applications/entity';
import JobsRepository from '../../../domain/jobs/repository';
import ApplicationsRepository from '../../../domain/applications/repository';

/**
 * Cloud Task function to rank applications for a specific job
 *
 * This function processes application ranking when a job is closed by:
 * 1. Validating the job exists and is closed
 * 2. Finding all applications for this job in INTERVIEW step
 * 3. Ranking applications based on interview performance
 * 4. Updating application steps to RANKING or FINALIST
 *
 * @param context - Task context containing the data
 */
export default async function rankApplicationsTask(context: Request): Promise<void> {
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
        const taskData = validateRankApplicationsTaskData(data);
        jobId = taskData.jobId;

        logger.info(`[${jobId}] Starting rankApplicationsTask`);

        // 1. Validate that job exists and is closed
        const job = await JobsRepository.getJobById(jobId);
        if (!job) {
            throw new ValidationError(`Job ${jobId} not found`);
        }

        if (job.status !== JobStatus.CLOSED) {
            throw new ValidationError(`Job ${jobId} is not closed. Current status: ${job.status}`);
        }

        logger.info(`[${jobId}] Job validation passed - status: ${job.status}`);

        // 2. Find ALL applications for this job
        const allApplications = await ApplicationsRepository.getApplicationsByJobId(jobId);
        logger.info(`[${jobId}] Found ${allApplications.length} total applications for this job`);

        // 3. Separate candidates (INTERVIEW + IN_PROGRESS) from rejected (all others)
        const candidateApplications = [];
        const applicationsToReject = [];
        for (const application of allApplications) {
            // Only INTERVIEW + IN_PROGRESS have a chance to pass to next step
            if (application.currentStep === ApplicationStep.INTERVIEW &&
                application.status === ApplicationStatus.IN_PROGRESS) {
                candidateApplications.push(application);
            } else {
                // All others must be rejected
                applicationsToReject.push(application);
            }
        }

        logger.info(`[${jobId}] Processing ${candidateApplications.length} candidates and ${applicationsToReject.length} applications to reject`);

        // 4. Reject all non-candidate applications
        const rejectPromises = applicationsToReject
            .filter(application => application.status !== ApplicationStatus.REJECTED)
            .map(async application => {
                await ApplicationsRepository.updateApplication(application.id, {
                    status: ApplicationStatus.REJECTED,
                    updatedAt: Date.now(),
                });
                logger.info(`[${jobId}] Rejected application ${application.id} - was in step: ${application.currentStep}, status: ${application.status}`);
            });

        await Promise.all(rejectPromises);

        // 5. Validate interview completion for candidates
        const validCandidates = [];
        const candidatesToReject = [];
        for (const candidate of candidateApplications) {
            // Check if interview was completed (has interviewData)
            const hasInterviewData = candidate.interviewData !== undefined;
            if (hasInterviewData) {
                validCandidates.push(candidate);
                logger.info(`[${jobId}] Candidate ${candidate.id} has completed interview`);
            } else {
                candidatesToReject.push(candidate);
                logger.info(`[${jobId}] Candidate ${candidate.id} interview not completed - will be rejected`);
            }
        }

        // 6. Reject candidates without completed interviews
        const cancelPromises = candidatesToReject.map(async candidate => {
            await ApplicationsRepository.updateApplication(candidate.id, {
                status: ApplicationStatus.REJECTED,
                updatedAt: Date.now(),
            });
            logger.info(`[${jobId}] Rejected candidate ${candidate.id} - interview not completed`);
        });

        await Promise.all(cancelPromises);

        logger.info(`[${jobId}] Processing completed. ${validCandidates.length} candidates ready for ranking`);

        // TODO: Implement ranking logic with agents
        // The validCandidates array contains all applications that:
        // - Were in INTERVIEW step with IN_PROGRESS status
        // - Have completed their interview (interviewData)
        // - Are ready to be ranked by the AI agent system

        logger.info(`[${jobId}] RankApplicationsTask completed successfully. ${validCandidates.length} candidates ready for ranking`);

    } catch (error) {
        // Handle validation errors differently (don't retry)
        if (error instanceof ValidationError) {
            logger.error(`Validation error in rankApplicationsTask: ${error.toString()}`);
            throw error; // Don't retry validation errors
        }

        // For other errors, log with jobId if available
        const currentJobId = jobId || 'unknown';
        logger.error(`Error in rankApplicationsTask for job ${currentJobId}:`, error);
        throw error; // Re-throw to trigger retry mechanism
    }
}
