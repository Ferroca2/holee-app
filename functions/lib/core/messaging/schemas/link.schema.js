"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkPayloadSchema = void 0;
const zod_1 = require("zod");
const base_schema_1 = require("./base.schema");
// Schema for LinkPayload
exports.LinkPayloadSchema = base_schema_1.BaseMessagePayloadSchema.extend({
    type: zod_1.z.literal('link'),
    text: zod_1.z.string(),
    image: zod_1.z.string().optional(),
    linkUrl: zod_1.z.string().url(),
    title: zod_1.z.string().optional(),
    linkDescription: zod_1.z.string().optional(), // Optional description for the link.
}).strict();
//# sourceMappingURL=link.schema.js.map