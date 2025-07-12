"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextPayloadSchema = void 0;
const zod_1 = require("zod");
const base_schema_1 = require("./base.schema");
// Schema for TextPayload
exports.TextPayloadSchema = base_schema_1.BaseMessagePayloadSchema.extend({
    type: zod_1.z.literal('text'),
    text: zod_1.z.string(), // Text content of the message.
}).strict();
//# sourceMappingURL=text.schema.js.map