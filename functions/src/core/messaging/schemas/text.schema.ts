import { z } from 'zod';
import { BaseMessagePayloadSchema } from './base.schema';

// Schema for TextPayload
export const TextPayloadSchema = BaseMessagePayloadSchema.extend({
    type: z.literal('text'),
    text: z.string(),           // Text content of the message.
}).strict();

// Type for TextPayload
export type TextPayload = z.infer<typeof TextPayloadSchema>;
