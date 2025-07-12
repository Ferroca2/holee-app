import { z } from 'zod';
import { BaseMessagePayloadSchema } from './base.schema';

// Schema for the button
export const ButtonPayloadSchema = z.object({
    id: z.string().optional(),              // Optional ID for the button.
    type: z.enum(['URL', 'CALL', 'REPLY']), // Type of button action.
    url: z.string().optional(),             // URL for link buttons.
    phone: z.string().optional(),           // Phone number for call buttons.
    label: z.string(),                      // Text displayed on the button.
}).strict().refine(data => {
    // Additional validation based on the button type
    if (data.type === 'URL' && !data.url) return false;
    if (data.type === 'CALL' && !data.phone) return false;
    return true;
}, {
    message: 'URL buttons need a url and CALL buttons need a phone number',
});

// Schema for ButtonActionsPayload
export const ButtonActionsPayloadSchema = BaseMessagePayloadSchema.extend({
    type: z.literal('button-actions'),
    text: z.string(),                       // Text sent along with the buttons.
    title: z.string().optional(),           // Optional title for the buttons.
    footer: z.string().optional(),          // Optional footer for the message.
    buttons: z.array(ButtonPayloadSchema).min(1),
}).strict();

// Type for ButtonActionsPayload
export type ButtonActionsPayload = z.infer<typeof ButtonActionsPayloadSchema>;
