/** Phone owner role inside the platform. */
export type ConversationRole = 'ADMIN' | 'USER';

/** For candidate profiles, holds extra data the AI will try to complete. */
export interface CandidateRelevantData {
    fullName?: string;                  // “John Doe”
    birthDate?: string;                 // ISO-8601 yyyy-MM-dd
    region?: string;                    // “São Paulo – SP”

    expectedSalary?: number;            // in BRL
    interests?: string[];               // free-form tags (e.g. “Blockchain, AI, Cloud Computing”)

    linkedin?: {
        url?: string;                   // url to linkedin profile
    // parsed informations
    }

    resume: {
        url?: string;                   // Cloud-storage link or external
    // parsed informations
    }
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
    subscribedJobIds?: string[];

    employed?: boolean;

    profileCompleted: boolean;
    relevantData?: CandidateRelevantData;

}
