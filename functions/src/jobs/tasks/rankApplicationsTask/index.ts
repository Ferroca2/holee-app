import { Request } from 'firebase-functions/v2/tasks';
import { logger } from 'firebase-functions';

import { validateRankApplicationsTaskData, ValidationError } from './types';

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

        // TODO: Implement ranking logic
        // 1. Validate that job exists and is closed
        // 2. Find all applications for this job in INTERVIEW step
        // 3. Rank applications based on interview performance
        // 4. Update application steps to RANKING or FINALIST

        logger.info(`[${jobId}] RankApplicationsTask completed successfully (not implemented yet)`);

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
