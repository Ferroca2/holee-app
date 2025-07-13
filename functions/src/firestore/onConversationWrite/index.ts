import { logger } from 'firebase-functions';
import { getFunctions } from 'firebase-admin/functions';
import { DocumentSnapshot } from 'firebase-admin/firestore';
import { FirestoreEvent, Change } from 'firebase-functions/v2/firestore';

import { Conversation } from '../../domain/conversations/entity';
import { ProcessJobsForConversationTaskData } from '../../jobs/tasks/processJobsForConversationTask/types';
import { OptInApplicationTaskData } from '../../jobs/tasks/optInApplicationTask/types';
import { SetApplicationTaskData } from '../../jobs/tasks/setApplicationTask/types';

const processJobsForConversationTaskQueue = getFunctions().taskQueue('processJobsForConversationTask');
const optInApplicationTaskQueue = getFunctions().taskQueue('optInApplicationTask');
const setApplicationTaskQueue = getFunctions().taskQueue('setApplicationTask');

/**
 * Handler triggered when a conversation is written.
 *
 * @param event - FirestoreEvent<Change<DocumentSnapshot> | undefined, { conversationId: string }>
 */
export default async function onConversationWrite(
    event: FirestoreEvent<Change<DocumentSnapshot> | undefined, { conversationId: string }>
) {
    if (!event?.data) {
        logger.warn('No data to process.');
        return;
    }

    logger.info('Event:', JSON.stringify(event, null, 2));

    const { conversationId } = event.params;

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
        // Get current data
        const currentRole = after?.get('role') as Conversation['role'] | undefined;
        const currentProfileCompleted = after?.get('profileCompleted') as Conversation['profileCompleted'] | undefined;
        const previousProfileCompleted = before?.get('profileCompleted') as Conversation['profileCompleted'] | undefined;
        const currentEmployed = after?.get('employed') as Conversation['employed'] | undefined;
        const currentJobIds = after?.get('currentJobIds') as Conversation['currentJobIds'] | undefined;
        const previousJobIds = before?.get('currentJobIds') as Conversation['currentJobIds'] | undefined;
        const currentFitResults = after?.get('fitResults') as Conversation['fitResults'] | undefined;
        const previousFitResults = before?.get('fitResults') as Conversation['fitResults'] | undefined;

        switch (changeType) {
            case 'create': {
                // Check if new conversation has currentJobIds
                if (currentJobIds && currentJobIds.length > 0) {
                    // For new conversations, all jobIds are considered "new"
                    const taskPromises = currentJobIds.map(async jobId => {
                        const taskData: OptInApplicationTaskData = {
                            conversationId,
                            jobId,
                        };

                        await optInApplicationTaskQueue.enqueue(
                            taskData,
                            { scheduleTime: new Date() }
                        );

                        logger.info(`[${conversationId}] Enqueued optInApplicationTask for job ${jobId} (new conversation)`);
                    });

                    await Promise.all(taskPromises);
                }

                // Check if new conversation has fitResults
                if (currentFitResults && currentFitResults.length > 0) {
                    // For new conversations, all fitResults are considered "new"
                    const taskPromises = currentFitResults.map(async fitResult => {
                        const taskData: SetApplicationTaskData = {
                            conversationId,
                            jobId: fitResult.jobId,
                        };

                        await setApplicationTaskQueue.enqueue(
                            taskData,
                            { scheduleTime: new Date() }
                        );

                        logger.info(`[${conversationId}] Enqueued setApplicationTask for job ${fitResult.jobId} (new conversation)`);
                    });

                    await Promise.all(taskPromises);
                }

                break;
            }
            case 'update': {
                // Check for profileCompleted trigger
                if (
                    currentRole === 'USER' &&
                    currentProfileCompleted &&
                    !previousProfileCompleted &&
                    !currentEmployed
                ) {
                    // Prepare the task data
                    const taskData: ProcessJobsForConversationTaskData = {
                        conversationId,
                    };

                    // Enqueue the task to run now
                    await processJobsForConversationTaskQueue.enqueue(
                        taskData,
                        { scheduleTime: new Date() }
                    );

                    logger.info(`[${conversationId}] Conversation enqueued for processing`);
                }

                // Check for currentJobIds changes using Set for efficient lookup
                if (currentJobIds && currentJobIds.length > 0) {
                    const previousJobIdsSet = new Set(previousJobIds || []);
                    const newJobIds = currentJobIds.filter(jobId => !previousJobIdsSet.has(jobId));

                    if (newJobIds.length > 0) {
                        const taskPromises = newJobIds.map(async jobId => {
                            const taskData: OptInApplicationTaskData = {
                                conversationId,
                                jobId,
                            };

                            await optInApplicationTaskQueue.enqueue(
                                taskData,
                                { scheduleTime: new Date() }
                            );

                            logger.info(`[${conversationId}] Enqueued optInApplicationTask for job ${jobId} (opt-in detected)`);
                        });

                        await Promise.all(taskPromises);
                    }
                }

                // Check for fitResults changes using Set for efficient lookup
                if (currentFitResults && currentFitResults.length > 0) {
                    const previousFitResultsSet = new Set(
                        (previousFitResults || []).map(fitResult => fitResult.jobId)
                    );

                    const newFitResults = currentFitResults.filter(
                        fitResult => !previousFitResultsSet.has(fitResult.jobId)
                    );

                    if (newFitResults.length > 0) {
                        const taskPromises = newFitResults.map(async fitResult => {
                            const taskData: SetApplicationTaskData = {
                                conversationId,
                                jobId: fitResult.jobId,
                            };

                            await setApplicationTaskQueue.enqueue(
                                taskData,
                                { scheduleTime: new Date() }
                            );

                            logger.info(`[${conversationId}] Enqueued setApplicationTask for job ${fitResult.jobId} (new fit result detected)`);
                        });

                        await Promise.all(taskPromises);
                    }
                }

                break;
            }

            case 'delete': {

                break;
            }

            default:
                logger.error(`Invalid change type: ${changeType}`);
                break;
        }
    } catch (error) {
        logger.error(`Error processing conversation change (conversationId: ${conversationId}):`, error);
    }
}
