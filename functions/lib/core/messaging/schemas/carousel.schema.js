"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarouselPayloadSchema = exports.CarouselCardSchema = void 0;
const zod_1 = require("zod");
const base_schema_1 = require("./base.schema");
const buttonActions_schema_1 = require("./buttonActions.schema");
const image_schema_1 = require("./image.schema");
// Extract only the image-related fields from ImagePayloadSchema (excluding type)
const ImageFieldsSchema = image_schema_1.ImagePayloadSchema.omit({ type: true });
// Schema for a carousel card - reusing image schema structure
exports.CarouselCardSchema = zod_1.z.object({
    image: ImageFieldsSchema,
    text: zod_1.z.string().optional(),
    buttons: zod_1.z.array(buttonActions_schema_1.ButtonPayloadSchema).optional(), // Optional buttons for the card.
}).strict();
// Schema for CarouselPayload
exports.CarouselPayloadSchema = base_schema_1.BaseMessagePayloadSchema.extend({
    type: zod_1.z.literal('carousel'),
    text: zod_1.z.string(),
    cards: zod_1.z.array(exports.CarouselCardSchema).min(1), // Array of carousel cards (at least 1).
}).strict();
//# sourceMappingURL=carousel.schema.js.map