"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextPayloadHandler = void 0;
const schemas_1 = require("../schemas");
const base_handler_1 = require("./base.handler");
class TextPayloadHandler extends base_handler_1.BaseMessagePayloadHandler {
    /* ------------------------------------------------------------------------- */
    /* ------------------------------- VALIDATION ------------------------------ */
    /* ------------------------------------------------------------------------- */
    // Implementation of validation
    validate(payload) {
        return schemas_1.TextPayloadSchema.safeParse(payload).success;
    }
    /* ------------------------------------------------------------------------- */
    /* ---------------------------- CHARACTER COUNT ---------------------------- */
    /* ------------------------------------------------------------------------- */
    // Implementation of getCharacterCount
    getCharacterCount(payload) {
        return payload.text.length;
    }
    /* ------------------------------------------------------------------------- */
    /* ---------------------------- TEXT EXTRACTION ---------------------------- */
    /* ------------------------------------------------------------------------- */
    // Implementation of getPrimaryTextFields
    getPrimaryTextFields(payload) {
        return {
            text: payload.text,
        };
    }
    /* ------------------------------------------------------------------------- */
    /* -------------------------------- PARSING -------------------------------- */
    /* ------------------------------------------------------------------------- */
    // Implementation of parseVariables
    parseVariables(payload, variables, pattern = '[%s]') {
        return Object.assign(Object.assign({}, payload), { text: this.replaceAll(payload.text, variables, pattern) });
    }
    // Implementation of hasVariable
    hasVariable(payload, variable, pattern = '[%s]') {
        const placeholder = pattern.replace('%s', variable);
        return payload.text.includes(placeholder);
    }
}
exports.TextPayloadHandler = TextPayloadHandler;
//# sourceMappingURL=text.handler.js.map