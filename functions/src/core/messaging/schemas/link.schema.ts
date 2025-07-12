import { z } from 'zod';
import { BaseMessagePayloadSchema } from './base.schema';

// Schema for LinkPayload
export const LinkPayloadSchema = BaseMessagePayloadSchema.extend({
    type: z.literal('link'),
    text: z.string(),                           // Text describing the link.
    image: z.string().optional(),               // Optional image URL associated with the link.
    linkUrl: z.string().url(),                  // URL of the main link.
    title: z.string().optional(),               // Optional title for the link.
    linkDescription: z.string().optional(),     // Optional description for the link.
}).strict();

// Type for LinkPayload
export type LinkPayload = z.infer<typeof LinkPayloadSchema>;
