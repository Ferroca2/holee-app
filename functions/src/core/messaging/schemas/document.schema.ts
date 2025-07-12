import { z } from 'zod';
import { BaseMessagePayloadSchema } from './base.schema';

// Schema for DocumentPayload
export const DocumentPayloadSchema = BaseMessagePayloadSchema.extend({
    type: z.literal('document'),
    documentUrl: z.string().url(),                  // Document URL (only URLs, no base64)
    extension: z.string().min(1),                   // File extension (required for proper handling)
    mimeType: z.string().optional(),                // Optional MIME type
    fileName: z.string().optional(),                // Optional file name
    caption: z.string().optional(),                 // Optional document description
}).strict();

// Type for DocumentPayload
export type DocumentPayload = z.infer<typeof DocumentPayloadSchema>;
