export enum JobStatus {
    OPEN = 'open',
    CLOSED = 'closed',
}

export interface Job {
    creatorConversationId: string;
    title: string;
    storeId: string;
    description: string;
    requirements: string[];
    applyStart: number;
    applyEnd: number;
    status: JobStatus;
    createdAt: number;
}
