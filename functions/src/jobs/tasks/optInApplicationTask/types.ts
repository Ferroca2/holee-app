/**
 * Data structure for optInApplication task
 */
export interface OptInApplicationTaskData {
    conversationId: string;
    jobId: string;
}

/**
 * Custom error class for validation errors in optInApplication task
 */
export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

/**
 * Validates the optInApplication task data
 * @param data - Raw data to validate
 * @returns Validated OptInApplicationTaskData
 * @throws ValidationError if validation fails
 */
export function validateOptInApplicationTaskData(data: unknown): OptInApplicationTaskData {
    if (!data || typeof data !== 'object') {
        throw new ValidationError('Data must be an object');
    }

    const typedData = data as Record<string, unknown>;

    if (!typedData.conversationId || typeof typedData.conversationId !== 'string') {
        throw new ValidationError('conversationId must be a non-empty string');
    }

    if (!typedData.jobId || typeof typedData.jobId !== 'string') {
        throw new ValidationError('jobId must be a non-empty string');
    }

    return {
        conversationId: typedData.conversationId,
        jobId: typedData.jobId,
    };
}
