"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonActionsPayloadSchema = exports.ButtonPayloadSchema = void 0;
const zod_1 = require("zod");
const base_schema_1 = require("./base.schema");
// Schema for the button
exports.ButtonPayloadSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    type: zod_1.z.enum(['URL', 'CALL', 'REPLY']),
    url: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    label: zod_1.z.string(), // Text displayed on the button.
}).strict().refine(data => {
    // Additional validation based on the button type
    if (data.type === 'URL' && !data.url)
        return false;
    if (data.type === 'CALL' && !data.phone)
        return false;
    return true;
}, {
    message: 'URL buttons need a url and CALL buttons need a phone number',
});
// Schema for ButtonActionsPayload
exports.ButtonActionsPayloadSchema = base_schema_1.BaseMessagePayloadSchema.extend({
    type: zod_1.z.literal('button-actions'),
    text: zod_1.z.string(),
    title: zod_1.z.string().optional(),
    footer: zod_1.z.string().optional(),
    buttons: zod_1.z.array(exports.ButtonPayloadSchema).min(1),
}).strict();
//# sourceMappingURL=buttonActions.schema.js.map