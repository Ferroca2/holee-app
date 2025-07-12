import { z } from 'zod';

// Base schema for all payloads
export const BaseMessagePayloadSchema = z.object({
    type: z.string(),
}).strict();

// Type for the base payload
export type BaseMessagePayload = z.infer<typeof BaseMessagePayloadSchema>;
