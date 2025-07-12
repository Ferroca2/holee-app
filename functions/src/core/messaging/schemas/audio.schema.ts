import { z } from 'zod';
import { BaseMessagePayloadSchema } from './base.schema';

// Schema for AudioPayload
export const AudioPayloadSchema = BaseMessagePayloadSchema.extend({
    type: z.literal('audio'),
    audio: z.string(),                      // URL of the audio file.
    seconds: z.number().optional(),         // Optional duration of the audio in seconds.
    mimeType: z.string().optional(),        // Optional MIME type of the audio file.
    transcription: z.string().optional(),   // Optional transcription of the audio content.
}).strict();

// Type for AudioPayload
export type AudioPayload = z.infer<typeof AudioPayloadSchema>;
