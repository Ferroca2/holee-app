import { logger } from 'firebase-functions';

import {
    GetChecklistRequest,
    GetChecklistResponseData,
    UpdateChecklistRequest,
    GetScriptRequest,
    GetScriptResponseData,

    ChecklistItem,
} from '../models/tools.model';

import { ErrorResponse, errorResponses } from '../../shared/utils/errors';
import { InterviewData } from '../../../domain/applications/entity';
import ApplicationsRepository from '../../../domain/applications/repository';

/**
 * Interface for the tools service
 */
interface ToolsServiceI {
    getChecklist(request: GetChecklistRequest): Promise<GetChecklistResponseData | ErrorResponse>;
    updateChecklist(request: UpdateChecklistRequest): Promise<{ success: boolean } | ErrorResponse>;
    getScript(request: GetScriptRequest): Promise<GetScriptResponseData | ErrorResponse>;
}

/**
 * Service for tools-related operations
 * Handles business logic for interview tools management
 */
class ToolsService implements ToolsServiceI {

    /**
     * Gets checklist for application interview
     *
     * @param request - Validated get checklist request
     * @returns Checklist data or error response
     */
    async getChecklist(request: GetChecklistRequest): Promise<GetChecklistResponseData | ErrorResponse> {
        try {
            const { jobId, conversationId } = request;

            // 1. Find the application
            const application = await ApplicationsRepository.getApplicationByJobAndConversation(jobId, conversationId);
            if (!application) {
                return errorResponses.notFound('Application not found for the specified job and conversation');
            }

            // 2. Extract checklist from interview data
            const checklist: ChecklistItem[] = application.interviewData?.checklist || [];

            logger.info(`[${jobId}/${conversationId}] Checklist retrieved successfully (${checklist.length} items)`);

            return {
                checklist,
            };
        } catch (error) {
            logger.error(`[${request.jobId}/${request.conversationId}] Error in getChecklist service: ${error}`);
            return errorResponses.serverError('Failed to get checklist');
        }
    }

    /**
     * Updates checklist for application interview (SET operation - replaces entire checklist)
     *
     * @param request - Validated update checklist request
     * @returns Success confirmation or error response
     */
    async updateChecklist(request: UpdateChecklistRequest): Promise<{ success: boolean } | ErrorResponse> {
        try {
            const { jobId, conversationId, data } = request;
            const { checklist } = data;

            // 1. Find the application
            const application = await ApplicationsRepository.getApplicationByJobAndConversation(jobId, conversationId);
            if (!application) {
                return errorResponses.notFound('Application not found for the specified job and conversation');
            }

            // 2. Prepare updated interview data
            const currentInterviewData = application.interviewData || {
                checklist: [],
                script: '',
            };

            const updatedInterviewData: InterviewData = {
                ...currentInterviewData,
                checklist, // SET operation - completely replace checklist
            };

            // 3. Update the application
            await ApplicationsRepository.updateApplication(application.id, {
                interviewData: updatedInterviewData,
                updatedAt: Date.now(),
            });

            logger.info(`[${jobId}/${conversationId}] Checklist updated successfully (${checklist.length} items)`);

            return {
                success: true,
            };
        } catch (error) {
            logger.error(`[${request.jobId}/${request.conversationId}] Error in updateChecklist service: ${error}`);
            return errorResponses.serverError('Failed to update checklist');
        }
    }

    /**
     * Gets script for application interview
     *
     * @param request - Validated get script request
     * @returns Script data or error response
     */
    async getScript(request: GetScriptRequest): Promise<GetScriptResponseData | ErrorResponse> {
        try {
            const { jobId, conversationId } = request;

            // 1. Find the application
            const application = await ApplicationsRepository.getApplicationByJobAndConversation(jobId, conversationId);
            if (!application) {
                return errorResponses.notFound('Application not found for the specified job and conversation');
            }

            // 2. Extract script from interview data
            const script: string = application.interviewData?.script || '';

            logger.info(`[${jobId}/${conversationId}] Script retrieved successfully`);

            return {
                script,
            };
        } catch (error) {
            logger.error(`[${request.jobId}/${request.conversationId}] Error in getScript service: ${error}`);
            return errorResponses.serverError('Failed to get script');
        }
    }


}

// Export a single instance of the service
export default new ToolsService();
