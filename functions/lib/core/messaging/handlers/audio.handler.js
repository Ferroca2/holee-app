"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioPayloadHandler = void 0;
const schemas_1 = require("../schemas");
const base_handler_1 = require("./base.handler");
class AudioPayloadHandler extends base_handler_1.BaseMessagePayloadHandler {
    /* ------------------------------------------------------------------------- */
    /* ------------------------------- VALIDATION ------------------------------ */
    /* ------------------------------------------------------------------------- */
    // Implementation of validation
    validate(payload) {
        return schemas_1.AudioPayloadSchema.safeParse(payload).success;
    }
    /* ------------------------------------------------------------------------- */
    /* ---------------------------- CHARACTER COUNT ---------------------------- */
    /* ------------------------------------------------------------------------- */
    // Implementation of getCharacterCount
    getCharacterCount(payload) {
        var _a;
        return ((_a = payload.transcription) === null || _a === void 0 ? void 0 : _a.length) || (payload.seconds || 1) * 12; // ~12 chars per second
    }
    /* ------------------------------------------------------------------------- */
    /* ---------------------------- TEXT EXTRACTION ---------------------------- */
    /* ------------------------------------------------------------------------- */
    // Implementation of getPrimaryTextFields
    getPrimaryTextFields(payload) {
        const fields = {};
        if (payload.transcription) {
            fields.transcription = payload.transcription;
        }
        return fields;
    }
}
exports.AudioPayloadHandler = AudioPayloadHandler;
//# sourceMappingURL=audio.handler.js.map