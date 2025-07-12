import { z } from 'zod';
import { BaseMessagePayloadSchema } from './base.schema';
import { ButtonPayloadSchema } from './buttonActions.schema';
import { ImagePayloadSchema } from './image.schema';

// Extract only the image-related fields from ImagePayloadSchema (excluding type)
const ImageFieldsSchema = ImagePayloadSchema.omit({ type: true });

// Schema for a carousel card - reusing image schema structure
export const CarouselCardSchema = z.object({
    image: ImageFieldsSchema,                               // Image data (reusing ImagePayloadSchema structure).
    text: z.string().optional(),                            // Optional text for the card.
    buttons: z.array(ButtonPayloadSchema).optional(),       // Optional buttons for the card.
}).strict();

// Schema for CarouselPayload
export const CarouselPayloadSchema = BaseMessagePayloadSchema.extend({
    type: z.literal('carousel'),
    text: z.string(),                           // Main text of the carousel message.
    cards: z.array(CarouselCardSchema).min(1),  // Array of carousel cards (at least 1).
}).strict();

// Type for CarouselPayload
export type CarouselPayload = z.infer<typeof CarouselPayloadSchema>;

// Type for CarouselCard
export type CarouselCard = z.infer<typeof CarouselCardSchema>;
