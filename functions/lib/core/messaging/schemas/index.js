"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagePayloadSchema = void 0;
const zod_1 = require("zod");
const text_schema_1 = require("./text.schema");
const image_schema_1 = require("./image.schema");
const audio_schema_1 = require("./audio.schema");
const buttonActions_schema_1 = require("./buttonActions.schema");
const link_schema_1 = require("./link.schema");
const document_schema_1 = require("./document.schema");
const carousel_schema_1 = require("./carousel.schema");
// Define the discriminated union directly here
exports.MessagePayloadSchema = zod_1.z.discriminatedUnion('type', [
    text_schema_1.TextPayloadSchema,
    image_schema_1.ImagePayloadSchema,
    audio_schema_1.AudioPayloadSchema,
    buttonActions_schema_1.ButtonActionsPayloadSchema,
    link_schema_1.LinkPayloadSchema,
    document_schema_1.DocumentPayloadSchema,
    carousel_schema_1.CarouselPayloadSchema,
]);
// Re-export all specific schemas and types
__exportStar(require("./base.schema"), exports);
__exportStar(require("./text.schema"), exports);
__exportStar(require("./image.schema"), exports);
__exportStar(require("./audio.schema"), exports);
__exportStar(require("./buttonActions.schema"), exports);
__exportStar(require("./link.schema"), exports);
__exportStar(require("./document.schema"), exports);
__exportStar(require("./carousel.schema"), exports);
//# sourceMappingURL=index.js.map