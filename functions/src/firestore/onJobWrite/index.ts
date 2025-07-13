import { logger } from 'firebase-functions';
import { getFunctions } from 'firebase-admin/functions';
import { DocumentSnapshot } from 'firebase-admin/firestore';
import { FirestoreEvent, Change } from 'firebase-functions/v2/firestore';

import { JobStatus } from '../../domain/jobs/entity';
import { RankApplicationsTaskData } from '../../jobs/tasks/rankApplicationsTask/types';

const rankApplicationsTaskQueue = getFunctions().taskQueue('rankApplicationsTask');

/**
 * Handler triggered when a job is written.
 *
 * @param event - FirestoreEvent<Change<DocumentSnapshot> | undefined, { jobId: string }>
 */
export default async function onJobWrite(
    event: FirestoreEvent<Change<DocumentSnapshot> | undefined, { jobId: string }>
) {
    if (!event?.data) {
        logger.warn('No data to process.');
        return;
    }

    logger.info('Event:', JSON.stringify(event, null, 2));

    const { jobId } = event.params;

    const eventTime = Date.parse(event.time);
    if (isNaN(eventTime)) {
        throw new Error(`Invalid event time: ${event.time}`);
    }

    const { before, after } = event.data;

    const changeType: 'create' | 'update' | 'delete' = !before?.exists
        ? 'create'
        : !after?.exists
            ? 'delete'
            : 'update';

    try {
        // Extract JobStatus from current and previous data
        const currentJobStatus = after?.get('status') as JobStatus | undefined;
        const previousJobStatus = before?.get('status') as JobStatus | undefined;

        switch (changeType) {
            case 'create': {
                logger.info(`[${jobId}] Job created with status: ${currentJobStatus}`);
                break;
            }

            case 'update': {
                logger.info(`[${jobId}] Job updated - status changed from ${previousJobStatus} to ${currentJobStatus}`);

                // Check if job was closed (OPEN -> CLOSED)
                if (currentJobStatus === JobStatus.CLOSED && previousJobStatus === JobStatus.OPEN) {
                    // Prepare the task data
                    const taskData: RankApplicationsTaskData = {
                        jobId,
                    };

                    // Enqueue the ranking task to run now
                    await rankApplicationsTaskQueue.enqueue(
                        taskData,
                        { scheduleTime: new Date() }
                    );

                    logger.info(`[${jobId}] Job closed - enqueued rankApplicationsTask`);
                }

                break;
            }

            case 'delete': {
                logger.info(`[${jobId}] Job deleted - previous status was: ${previousJobStatus}`);
                break;
            }

            default:
                logger.error(`Invalid change type: ${changeType}`);
                break;
        }
    } catch (error) {
        logger.error(`Error processing job change (jobId: ${jobId}):`, error);
    }
}
