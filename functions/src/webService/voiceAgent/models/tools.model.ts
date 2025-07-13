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

/* --------------------------------------------------------------------------------------------------------------------- */
/* ----------------- GET NOTES (GET /api/voice-agent/v1/job/:jobId/conversation/:conversationId/notes) ----------------- */
/* --------------------------------------------------------------------------------------------------------------------- */

// Schema for get notes request (jobId and conversationId come from URL params)
export const getNotesRequestSchema = z.object({
    jobId: z.string().min(1, 'Job ID is required'),
    conversationId: z.string().min(1, 'Conversation ID is required'),
}).strict();

// Type derived from schema
export type GetNotesRequest = z.infer<typeof getNotesRequestSchema>;

// Interface for get notes response data
export interface GetNotesResponseData {
    notes?: string;
}

// Interface for get notes response
export interface GetNotesResponse {
    message: string;
    data: GetNotesResponseData;
}

/* --------------------------------------------------------------------------------------------------------------------- */
/* ---------------- POST NOTES (POST /api/voice-agent/v1/job/:jobId/conversation/:conversationId/notes) ---------------- */
/* --------------------------------------------------------------------------------------------------------------------- */

// Schema for update notes request data (notes content in body)
const updateNotesRequestDataSchema = z.object({
    notes: z.string()
        .min(1, 'Notes must have at least 1 character')
        .max(5000, 'Notes must be at most 5000 characters'),
}).strict();

// Schema for update notes request (jobId and conversationId from URL params + notes in body)
export const updateNotesRequestSchema = z.object({
    jobId: z.string().min(1, 'Job ID is required'),
    conversationId: z.string().min(1, 'Conversation ID is required'),
    data: updateNotesRequestDataSchema,
}).strict();

// Types for update notes data and request
export type UpdateNotesRequestData = z.infer<typeof updateNotesRequestDataSchema>;
export type UpdateNotesRequest = z.infer<typeof updateNotesRequestSchema>;

// Interface for update notes response
export interface UpdateNotesResponse {
    message: string;
}
