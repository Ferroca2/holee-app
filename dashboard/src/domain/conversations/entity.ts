/** Phone owner role inside the platform. */
export type ConversationRole = 'ADMIN' | 'USER';

/** For candidate profiles, holds extra data the AI will try to complete. */
export interface CandidateRelevantData {
    name?: string;
    description?: string;
    skills?: string;
    interests?: string;
    expectedSalary?: number;
    linkedin?: string;
    email?: string;
    address?: string;
    gender?: string;
    pcd?: boolean;
    race?: string;
}

export interface Conversation {
    /** WhatsApp basics. */
    name: string;
    photo?: string;

    lastMessageTimestamp: number;

    role: ConversationRole;

    /* ADMIN-only */
    companyName?: string;

    /* USER-only */
    fitResults?: {
        jobId: string;
        fitScore: number;
    }[];

    currentJobIds?: string[];           // Jobs que o usuário está atualmente inscrito/interessado

    employed?: boolean;

    profileCompleted: boolean;
    relevantData?: CandidateRelevantData;

}
