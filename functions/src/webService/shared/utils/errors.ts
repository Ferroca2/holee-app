export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
    }
}

export class BadRequestError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'BadRequestError';
    }
}

// API Error with code and status
export class APIError extends Error {
    code: string;
    status: number;

    constructor(message: string, code: string, status: number) {
        super(message);
        this.name = 'APIError';
        this.code = code;
        this.status = status;
    }
}

// Standard error response type
export type ErrorResponse = {
    error: string;
    code: string;
    status: number;
};

// Utility functions for creating standardized error responses
export const createErrorResponse = (message: string, code: string, status: number): ErrorResponse => ({
    error: message,
    code: code,
    status: status,
});

// Common error response factories
export const errorResponses = {
    notFound: (message = 'Resource not found') =>
        createErrorResponse(message, 'not_found', 404),

    badRequest: (message: string, code = 'bad_request') =>
        createErrorResponse(message, code, 400),

    invalidData: (message = 'Invalid data provided') =>
        createErrorResponse(message, 'invalid_data', 400),

    missingField: (field: string) =>
        createErrorResponse(`${field} is required`, `missing_${field.toLowerCase().replace(/\s/g, '_')}`, 400),

    missingFields: (fields: string[]) =>
        createErrorResponse(`Missing required fields: ${fields.join(', ')}`, 'missing_fields', 400),

    serverError: (message = 'An unexpected error occurred') =>
        createErrorResponse(message, 'server_error', 500),

    paymentRequired: (message: string) =>
        createErrorResponse(message, 'payment_required', 402),

    unauthorized: (message = 'Unauthorized access') =>
        createErrorResponse(message, 'unauthorized', 401),

    forbidden: (message = 'Access forbidden') =>
        createErrorResponse(message, 'forbidden', 403),

    conflict: (message: string, code = 'conflict') =>
        createErrorResponse(message, code, 409),

    unprocessableEntity: (message: string, code = 'unprocessable_entity') =>
        createErrorResponse(message, code, 422),
};
