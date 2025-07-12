"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentPayloadSchema = void 0;
const zod_1 = require("zod");
const base_schema_1 = require("./base.schema");
// Schema for DocumentPayload
exports.DocumentPayloadSchema = base_schema_1.BaseMessagePayloadSchema.extend({
    type: zod_1.z.literal('document'),
    documentUrl: zod_1.z.string().url(),
    extension: zod_1.z.string().min(1),
    mimeType: zod_1.z.string().optional(),
    fileName: zod_1.z.string().optional(),
    caption: zod_1.z.string().optional(), // Optional document description
}).strict();
//# sourceMappingURL=document.schema.js.map