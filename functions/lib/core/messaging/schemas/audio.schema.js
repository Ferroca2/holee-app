"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioPayloadSchema = void 0;
const zod_1 = require("zod");
const base_schema_1 = require("./base.schema");
// Schema for AudioPayload
exports.AudioPayloadSchema = base_schema_1.BaseMessagePayloadSchema.extend({
    type: zod_1.z.literal('audio'),
    audio: zod_1.z.string(),
    seconds: zod_1.z.number().optional(),
    mimeType: zod_1.z.string().optional(),
    transcription: zod_1.z.string().optional(), // Optional transcription of the audio content.
}).strict();
//# sourceMappingURL=audio.schema.js.map