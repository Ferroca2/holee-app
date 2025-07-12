"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkPayloadHandler = void 0;
const schemas_1 = require("../schemas");
const base_handler_1 = require("./base.handler");
class LinkPayloadHandler extends base_handler_1.BaseMessagePayloadHandler {
    /* ------------------------------------------------------------------------- */
    /* ------------------------------- VALIDATION ------------------------------ */
    /* ------------------------------------------------------------------------- */
    // Implementation of validation
    validate(payload) {
        return schemas_1.LinkPayloadSchema.safeParse(payload).success;
    }
    /* ------------------------------------------------------------------------- */
    /* ---------------------------- CHARACTER COUNT ---------------------------- */
    /* ------------------------------------------------------------------------- */
    // Implementation of getCharacterCount
    getCharacterCount(payload) {
        let count = payload.text.length;
        count += payload.linkUrl.length;
        if (payload.title)
            count += payload.title.length;
        if (payload.linkDescription)
            count += payload.linkDescription.length;
        return count;
    }
    /* ------------------------------------------------------------------------- */
    /* --------------------------- TEXT EXTRACTION ----------------------------- */
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
        return Object.assign(Object.assign(Object.assign(Object.assign({}, payload), { text: this.replaceAll(payload.text, variables, pattern), linkUrl: this.replaceAll(payload.linkUrl, variables, pattern) }), (payload.title ? { title: this.replaceAll(payload.title, variables, pattern) } : {})), (payload.linkDescription ? { linkDescription: this.replaceAll(payload.linkDescription, variables, pattern) } : {}));
    }
    // Implementation of hasVariable
    hasVariable(payload, variable, pattern = '[%s]') {
        var _a, _b;
        const placeholder = pattern.replace('%s', variable);
        // Check in all text fields
        if (payload.text.includes(placeholder))
            return true;
        if (payload.linkUrl.includes(placeholder))
            return true;
        if ((_a = payload.title) === null || _a === void 0 ? void 0 : _a.includes(placeholder))
            return true;
        if ((_b = payload.linkDescription) === null || _b === void 0 ? void 0 : _b.includes(placeholder))
            return true;
        return false;
    }
}
exports.LinkPayloadHandler = LinkPayloadHandler;
//# sourceMappingURL=link.handler.js.map