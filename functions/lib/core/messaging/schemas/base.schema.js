"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseMessagePayloadSchema = void 0;
const zod_1 = require("zod");
// Base schema for all payloads
exports.BaseMessagePayloadSchema = zod_1.z.object({
    type: zod_1.z.string(),
}).strict();
//# sourceMappingURL=base.schema.js.map