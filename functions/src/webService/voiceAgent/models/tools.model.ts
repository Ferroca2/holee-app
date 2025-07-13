import { z } from 'zod';

/* --------------------------------------------------------------------------------------------------------------------- */
/* ------------- GET CHECKLIST (GET /api/voice-agent/v1/job/:jobId/conversation/:conversationId/checklist) ------------- */
/* --------------------------------------------------------------------------------------------------------------------- */

// Schema for get checklist request (jobId and conversationId come from URL params)
export const getChecklistRequestSchema = z.object({
    jobId: z.string().min(1, 'Job ID is required'),
    conversationId: z.string().min(1, 'Conversation ID is required'),
}).strict();

// Type derived from schema
export type GetChecklistRequest = z.infer<typeof getChecklistRequestSchema>;

// Interface for checklist item with tick status
export interface ChecklistItem {
    text: string;
    tick: boolean;
}

// Interface for get checklist response data
export interface GetChecklistResponseData {
    checklist: ChecklistItem[];
}

// Interface for get checklist response
export interface GetChecklistResponse {
    message: string;
    data: GetChecklistResponseData;
}

/* --------------------------------------------------------------------------------------------------------------------- */
/* ------------ POST CHECKLIST (POST /api/voice-agent/v1/job/:jobId/conversation/:conversationId/checklist) ------------ */
/* --------------------------------------------------------------------------------------------------------------------- */

// Schema for checklist item
const checklistItemSchema = z.object({
    text: z.string().min(1, 'Checklist item text must have at least 1 character'),
    tick: z.boolean(),
}).strict();

// Schema for update checklist request data (checklist items in body)
const updateChecklistRequestDataSchema = z.object({
    checklist: z.array(checklistItemSchema)
        .min(1, 'Checklist must have at least 1 item')
        .max(500, 'Checklist cannot have more than 500 items'),
}).strict();

// Schema for update checklist request (jobId and conversationId from URL params + checklist in body)
export const updateChecklistRequestSchema = z.object({
    jobId: z.string().min(1, 'Job ID is required'),
    conversationId: z.string().min(1, 'Conversation ID is required'),
    data: updateChecklistRequestDataSchema,
}).strict();

// Types for update checklist data and request
export type UpdateChecklistRequestData = z.infer<typeof updateChecklistRequestDataSchema>;
export type UpdateChecklistRequest = z.infer<typeof updateChecklistRequestSchema>;

// Interface for update checklist response
export interface UpdateChecklistResponse {
    message: string;
}

/* --------------------------------------------------------------------------------------------------------------------- */
/* ---------------- GET SCRIPT (GET /api/voice-agent/v1/job/:jobId/conversation/:conversationId/script) ---------------- */
/* --------------------------------------------------------------------------------------------------------------------- */

// Schema for get script request (jobId and conversationId come from URL params)
export const getScriptRequestSchema = z.object({
    jobId: z.string().min(1, 'Job ID is required'),
    conversationId: z.string().min(1, 'Conversation ID is required'),
}).strict();

// Type derived from schema
export type GetScriptRequest = z.infer<typeof getScriptRequestSchema>;

// Interface for get script response data
export interface GetScriptResponseData {
    script: string;
}

// Interface for get script response
export interface GetScriptResponse {
    message: string;
    data: GetScriptResponseData;
}
