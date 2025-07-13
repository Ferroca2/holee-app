/**
 * Data structure for the processJobsForConversationTask
 */
export interface ProcessJobsForConversationTaskData {
    conversationId: string;
}

/**
 * Validates the data structure of ProcessJobsForConversationTaskData
 * @param data The data to validate
 * @returns The validated ProcessJobsForConversationTaskData
 * @throws ValidationError if data is invalid
 */
export function validateProcessJobsForConversationTaskData(data: unknown): ProcessJobsForConversationTaskData {
    // Check if data is an object
    if (!data || typeof data !== 'object') {
        throw new ValidationError('Invalid data: expected an object');
    }

    // Check if conversationId is a string
    if (!('conversationId' in data) || typeof data.conversationId !== 'string') {
        throw new ValidationError('Invalid data: conversationId is required and must be a non-empty string');
    }

    // Return the validated data
    return data as ProcessJobsForConversationTaskData;
}

/**
 * Validation error for ProcessJobsForConversationTaskData
 */
export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }

    toString(): string {
        return `${this.name}: ${this.message}`;
    }
}
