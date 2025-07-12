import { z } from 'zod';
import { TextPayloadSchema } from './text.schema';
import { ImagePayloadSchema } from './image.schema';
import { AudioPayloadSchema } from './audio.schema';
import { ButtonActionsPayloadSchema } from './buttonActions.schema';
import { LinkPayloadSchema } from './link.schema';
import { DocumentPayloadSchema } from './document.schema';
import { CarouselPayloadSchema } from './carousel.schema';

// Define the discriminated union directly here
export const MessagePayloadSchema = z.discriminatedUnion('type', [
    TextPayloadSchema,
    ImagePayloadSchema,
    AudioPayloadSchema,
    ButtonActionsPayloadSchema,
    LinkPayloadSchema,
    DocumentPayloadSchema,
    CarouselPayloadSchema,
]);

// Export the inferred type of the union
export type MessagePayload = z.infer<typeof MessagePayloadSchema>;

// Re-export all specific schemas and types
export * from './base.schema';
export * from './text.schema';
export * from './image.schema';
export * from './audio.schema';
export * from './buttonActions.schema';
export * from './link.schema';
export * from './document.schema';
export * from './carousel.schema';
