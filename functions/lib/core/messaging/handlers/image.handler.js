"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagePayloadHandler = void 0;
const schemas_1 = require("../schemas");
const base_handler_1 = require("./base.handler");
class ImagePayloadHandler extends base_handler_1.BaseMessagePayloadHandler {
    /* ------------------------------------------------------------------------- */
    /* ------------------------------- VALIDATION ------------------------------ */
    /* ------------------------------------------------------------------------- */
    // Implementation of validation
    validate(payload) {
        return schemas_1.ImagePayloadSchema.safeParse(payload).success;
    }
    /* ------------------------------------------------------------------------- */
    /* ---------------------------- CHARACTER COUNT ---------------------------- */
    /* ------------------------------------------------------------------------- */
    // Implementation of getCharacterCount
    getCharacterCount(payload) {
        var _a;
        return ((_a = payload.text) === null || _a === void 0 ? void 0 : _a.length) || 0;
    }
    /* ------------------------------------------------------------------------- */
    /* ---------------------------- TEXT EXTRACTION ---------------------------- */
    /* ------------------------------------------------------------------------- */
    // Implementation of getPrimaryTextFields
    getPrimaryTextFields(payload) {
        const fields = {};
        if (payload.text) {
            fields.text = payload.text;
        }
        return fields;
    }
    /* ------------------------------------------------------------------------- */
    /* -------------------------------- PARSING -------------------------------- */
    /* ------------------------------------------------------------------------- */
    // Implementation of parseVariables
    parseVariables(payload, variables, pattern = '[%s]') {
        if (!payload.text)
            return payload;
        return Object.assign(Object.assign({}, payload), { text: this.replaceAll(payload.text, variables, pattern) });
    }
    // Implementation of hasVariable
    hasVariable(payload, variable, pattern = '[%s]') {
        if (!payload.text)
            return false;
        const placeholder = pattern.replace('%s', variable);
        return payload.text.includes(placeholder);
    }
}
exports.ImagePayloadHandler = ImagePayloadHandler;
//# sourceMappingURL=image.handler.js.map