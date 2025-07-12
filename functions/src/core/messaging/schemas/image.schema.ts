import { z } from 'zod';
import { BaseMessagePayloadSchema } from './base.schema';

// Schema for ImagePayload
export const ImagePayloadSchema = BaseMessagePayloadSchema.extend({
    type: z.literal('image'),
    image: z.string(),                      // URL of the image.
    text: z.string().optional(),            // Optional caption for the image.
    transcription: z.string().optional(),   // Optional transcription of the image content.
}).strict();

// Type for ImagePayload
export type ImagePayload = z.infer<typeof ImagePayloadSchema>;
