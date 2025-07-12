"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagePayloadSchema = void 0;
const zod_1 = require("zod");
const base_schema_1 = require("./base.schema");
// Schema for ImagePayload
exports.ImagePayloadSchema = base_schema_1.BaseMessagePayloadSchema.extend({
    type: zod_1.z.literal('image'),
    image: zod_1.z.string(),
    text: zod_1.z.string().optional(),
    transcription: zod_1.z.string().optional(), // Optional transcription of the image content.
}).strict();
//# sourceMappingURL=image.schema.js.map