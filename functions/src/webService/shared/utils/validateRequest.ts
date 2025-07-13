import { Request, Response } from 'express';
import { logger } from 'firebase-functions';
import { z } from 'zod';

import { sendErrorResponse } from './apiResponse';
import { errorResponses } from './errors';

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
    public zodError: z.ZodError;

    constructor(message: string, zodError: z.ZodError) {
        super(message);
        this.name = 'ZodError'; // Preserve the name as 'ZodError' for type checking
        this.zodError = zodError;
    }
}

/**
 * Validates the request data against the provided schema
 * @param schema - The Zod schema to validate against
 * @param data - The request data to validate
 * @returns The validated data
 * @throws ValidationError if validation fails
 */
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
        return schema.parse(data) as T;
    } catch (error) {
        if (error instanceof z.ZodError) {
            const message = error.errors?.[0]?.message || 'Validation failed';
            // Throw a new error that preserves the original ZodError object
            throw new ValidationError(message, error);
        }
        throw error;
    }
}

/**
 * Handles validation errors in a centralized way
 *
 * @param error - The validation error
 * @param req - Express request object
 * @param res - Express response object
 * @param endpoint - Endpoint name for logging context
 * @returns True if error was handled, false otherwise
 */
export function handleValidationError(error: unknown, req: Request, res: Response, endpoint: string): boolean {
    if (error instanceof ValidationError) {
        // Handle missing required fields
        const missingFields = error.zodError.errors
            .filter(err => err.code === 'invalid_type' && err.received === 'undefined')
            .map(err => err.path.join('.'));

        if (missingFields.length > 0) {
            // Get context ID for logging
            const contextId = req.params?.jobId || req.params?.conversationId || 'unknown';
            logger.warn(`[${contextId}] [${endpoint}] Missing required fields: ${missingFields.join(', ')} | Full error message: ${error.message}`);
            sendErrorResponse(res, errorResponses.badRequest(
                `Missing required fields: ${missingFields.join(', ')}`,
                'missing_fields'
            ));
            return true;
        }

        // Handle custom validation errors
        const customErrors = error.zodError.errors
            .filter(err => err.code === 'custom')
            .map(err => ({
                path: err.path.join('.'),
                message: err.message,
            }));

        if (customErrors.length > 0) {
            const detailedErrors = customErrors.map(err =>
                err.path ? `${err.path}: ${err.message}` : err.message
            ).join('; ');

            const contextId = req.params?.jobId || req.params?.conversationId || 'unknown';
            logger.warn(`[${contextId}] [${endpoint}] Custom validation failed: ${detailedErrors} | Full error message: ${error.message}`);
            sendErrorResponse(res, errorResponses.badRequest(
                customErrors[0]?.message || 'Custom validation failed',
                'validation_error'
            ));
            return true;
        }

        // Handle other validation errors with detailed logging
        const allErrors = error.zodError.errors.map(err => {
            const path = err.path.length > 0 ? err.path.join('.') : 'root';
            return `${path}: ${err.message} (code: ${err.code})`;
        }).join('; ');

        const contextId = req.params?.jobId || req.params?.conversationId || 'unknown';
        logger.warn(`[${contextId}] [${endpoint}] Validation failed - Details: ${allErrors} | Full error message: ${error.message}`);
        sendErrorResponse(res, errorResponses.badRequest(
            error.message || 'Validation failed',
            'validation_error'
        ));
        return true;
    }

    return false;
}
