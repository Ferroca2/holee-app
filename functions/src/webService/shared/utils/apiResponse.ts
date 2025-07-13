/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { ErrorResponse } from './errors';

/**
 * Sends a success response
 * @param res Express response object
 * @param data Data to be sent in the response
 * @param status HTTP status code
 */
export const sendSuccessResponse = (
    res: Response,
    data: any,
    status = 200
): void => {
    res.status(status).json(data);
};

/**
 * Sends an error response
 * @param res Express response object
 * @param errorResponse Error response object or message
 */
export const sendErrorResponse = (
    res: Response,
    errorResponse: ErrorResponse | string
): void => {
    // If the error is a string, convert it to an error response object
    if (typeof errorResponse === 'string') {
        res.status(500).json({
            error: errorResponse,
            code: 'server_error',
        });
        return;
    }

    // Send the error response
    res.status(errorResponse.status).json({
        error: errorResponse.error,
        code: errorResponse.code,
    });
};

/**
 * Wraps async request handlers with error handling
 * @param handler Async request handler function
 * @returns Express middleware function
 */
export const asyncHandler = (handler: (req: Request, res: Response, next: NextFunction) => Promise<void>) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        await handler(req, res, next);
    } catch (error) {
        console.error('Error in asyncHandler:', error);
        sendErrorResponse(res, {
            error: 'An unexpected error occurred',
            code: 'server_error',
            status: 500,
        });
    }
};
