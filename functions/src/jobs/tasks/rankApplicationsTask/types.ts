/**
 * Data structure for rankApplications task
 */
export interface RankApplicationsTaskData {
    jobId: string;
}

/**
 * Custom error class for validation errors in rankApplications task
 */
export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

/**
 * Validates the rankApplications task data
 * @param data - Raw data to validate
 * @returns Validated RankApplicationsTaskData
 * @throws ValidationError if validation fails
 */
export function validateRankApplicationsTaskData(data: unknown): RankApplicationsTaskData {
    if (!data || typeof data !== 'object') {
        throw new ValidationError('Data must be an object');
    }

    const typedData = data as Record<string, unknown>;

    if (!typedData.jobId || typeof typedData.jobId !== 'string') {
        throw new ValidationError('jobId must be a non-empty string');
    }

    return {
        jobId: typedData.jobId,
    };
}
