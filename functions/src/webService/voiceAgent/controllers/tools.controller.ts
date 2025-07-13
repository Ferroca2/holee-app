import { Request, Response } from 'express';
import { logger } from 'firebase-functions';

import { validateRequest, handleValidationError } from '../../shared/utils/validateRequest';
import { sendSuccessResponse, sendErrorResponse } from '../../shared/utils/apiResponse';
import { errorResponses } from '../../shared/utils/errors';

import {
    getChecklistRequestSchema,
    GetChecklistRequest,
    GetChecklistResponse,
    updateChecklistRequestSchema,
    UpdateChecklistRequest,
    UpdateChecklistResponse,
    getScriptRequestSchema,
    GetScriptRequest,
    GetScriptResponse,

} from '../models/tools.model';

import toolsService from '../services/tools.service';

/**
 * Interface for the tools controller
 */
interface ToolsControllerI {
    getChecklist(req: Request, res: Response): Promise<void>;
    updateChecklist(req: Request, res: Response): Promise<void>;
    getScript(req: Request, res: Response): Promise<void>;
}

/**
 * Controller for tools-related endpoints
 * Handles HTTP requests for interview tools operations
 */
class ToolsController implements ToolsControllerI {

    /**
     * Gets checklist for application interview
     *
     * @route GET /api/voice-agent/v1/job/:jobId/conversation/:conversationId/checklist
     * @param req - Express request object
     * @param res - Express response object
     * @returns HTTP response with checklist data
     */
    async getChecklist(req: Request, res: Response): Promise<void> {
        try {
            // Request parameters
            const jobId = req.params.jobId;
            const conversationId = req.params.conversationId;

            // Validate request using Zod schema
            const validatedRequest = validateRequest<GetChecklistRequest>(
                getChecklistRequestSchema,
                {
                    jobId,
                    conversationId,
                }
            );

            // Get checklist from service
            const responseData = await toolsService.getChecklist(validatedRequest);
            if ('error' in responseData) {
                logger.warn(`[${jobId}/${conversationId}] [GET /checklist] Error in getChecklist controller: ${responseData.error}`);
                sendErrorResponse(res, responseData);
                return;
            }

            // Return success response
            logger.info(`[${jobId}/${conversationId}] [GET /checklist] Checklist retrieved successfully`);
            const successResponse: GetChecklistResponse = {
                message: 'Checklist retrieved successfully',
                data: responseData,
            };
            sendSuccessResponse(res, successResponse);
        } catch (error) {
            // Handle validation errors
            if (handleValidationError(error, req, res, 'GET /checklist')) return;

            // Handle all other errors as internal server errors
            logger.error(`[${req.params.jobId}/${req.params.conversationId}] [GET /checklist] Error in getChecklist controller: ${(error as Error).message}`);
            sendErrorResponse(res, errorResponses.serverError());
        }
    }

    /**
     * Updates checklist for application interview
     *
     * @route POST /api/voice-agent/v1/job/:jobId/conversation/:conversationId/checklist
     * @param req - Express request object
     * @param res - Express response object
     * @returns HTTP response with update result
     */
    async updateChecklist(req: Request, res: Response): Promise<void> {
        try {
            // Request parameters
            const jobId = req.params.jobId;
            const conversationId = req.params.conversationId;

            // Validate request data
            const validatedRequest = validateRequest<UpdateChecklistRequest>(
                updateChecklistRequestSchema,
                {
                    jobId,
                    conversationId,
                    data: req.body,
                }
            );

            // Call service to update the checklist
            const responseData = await toolsService.updateChecklist(validatedRequest);
            if ('error' in responseData) {
                logger.warn(`[${jobId}/${conversationId}] [POST /checklist] Error in updateChecklist controller: ${responseData.error}`);
                sendErrorResponse(res, responseData);
                return;
            }

            // Return success response
            logger.info(`[${jobId}/${conversationId}] [POST /checklist] Checklist updated successfully`);
            const successResponse: UpdateChecklistResponse = {
                message: 'Checklist updated successfully',
            };
            sendSuccessResponse(res, successResponse);
        } catch (error) {
            // Handle validation errors
            if (handleValidationError(error, req, res, 'POST /checklist')) return;

            // Handle all other errors as internal server errors
            logger.error(`[${req.params.jobId}/${req.params.conversationId}] [POST /checklist] Error in updateChecklist controller: ${(error as Error).message}`);
            sendErrorResponse(res, errorResponses.serverError());
        }
    }

    /**
     * Gets script for application interview
     *
     * @route GET /api/voice-agent/v1/job/:jobId/conversation/:conversationId/script
     * @param req - Express request object
     * @param res - Express response object
     * @returns HTTP response with script data
     */
    async getScript(req: Request, res: Response): Promise<void> {
        try {
            // Request parameters
            const jobId = req.params.jobId;
            const conversationId = req.params.conversationId;

            // Validate request using Zod schema
            const validatedRequest = validateRequest<GetScriptRequest>(
                getScriptRequestSchema,
                {
                    jobId,
                    conversationId,
                }
            );

            // Get script from service
            const responseData = await toolsService.getScript(validatedRequest);
            if ('error' in responseData) {
                logger.warn(`[${jobId}/${conversationId}] [GET /script] Error in getScript controller: ${responseData.error}`);
                sendErrorResponse(res, responseData);
                return;
            }

            // Return success response
            logger.info(`[${jobId}/${conversationId}] [GET /script] Script retrieved successfully`);
            const successResponse: GetScriptResponse = {
                message: 'Script retrieved successfully',
                data: responseData,
            };
            sendSuccessResponse(res, successResponse);
        } catch (error) {
            // Handle validation errors
            if (handleValidationError(error, req, res, 'GET /script')) return;

            // Handle all other errors as internal server errors
            logger.error(`[${req.params.jobId}/${req.params.conversationId}] [GET /script] Error in getScript controller: ${(error as Error).message}`);
            sendErrorResponse(res, errorResponses.serverError());
        }
    }


}

// Export a single instance of the controller
export default new ToolsController();
