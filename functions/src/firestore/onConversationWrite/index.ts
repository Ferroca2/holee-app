import { logger } from 'firebase-functions';
import { getFunctions } from 'firebase-admin/functions';
import { DocumentSnapshot } from 'firebase-admin/firestore';
import { FirestoreEvent, Change } from 'firebase-functions/v2/firestore';

import { Conversation } from '../../domain/conversations/entity';
import { ProcessJobsForConversationTaskData } from '../../jobs/tasks/processJobsForConversationTask/types';

const processJobsForConversationTaskQueue = getFunctions().taskQueue('processJobsForConversationTask');

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

        switch (changeType) {
            case 'create': {

                break;
            }
            case 'update': {

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
