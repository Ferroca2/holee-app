"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentPayloadHandler = void 0;
const document_schema_1 = require("../schemas/document.schema");
const base_handler_1 = require("./base.handler");
class DocumentPayloadHandler extends base_handler_1.BaseMessagePayloadHandler {
    /* ------------------------------------------------------------------------- */
    /* ------------------------------- VALIDATION ------------------------------ */
    /* ------------------------------------------------------------------------- */
    // Implementation of validation
    validate(payload) {
        return document_schema_1.DocumentPayloadSchema.safeParse(payload).success;
    }
    /* ------------------------------------------------------------------------- */
    /* ---------------------------- CHARACTER COUNT ---------------------------- */
    /* ------------------------------------------------------------------------- */
    // Implementation of getCharacterCount
    getCharacterCount(payload) {
        let count = payload.documentUrl.length;
        if (payload.fileName)
            count += payload.fileName.length;
        if (payload.caption)
            count += payload.caption.length;
        return count;
    }
    /* ------------------------------------------------------------------------- */
    /* ---------------------------- TEXT EXTRACTION ---------------------------- */
    /* ------------------------------------------------------------------------- */
    // Implementation of getPrimaryTextFields
    getPrimaryTextFields(payload) {
        const fields = {};
        if (payload.caption) {
            fields.caption = payload.caption;
        }
        return fields;
    }
    /* ------------------------------------------------------------------------- */
    /* -------------------------------- PARSING -------------------------------- */
    /* ------------------------------------------------------------------------- */
    // Implementation of parseVariables
    parseVariables(payload, variables, pattern = '[%s]') {
        return Object.assign(Object.assign(Object.assign(Object.assign({}, payload), { documentUrl: this.replaceAll(payload.documentUrl, variables, pattern) }), (payload.fileName ? { fileName: this.replaceAll(payload.fileName, variables, pattern) } : {})), (payload.caption ? { caption: this.replaceAll(payload.caption, variables, pattern) } : {}));
    }
    // Implementation of hasVariable
    hasVariable(payload, variable, pattern = '[%s]') {
        var _a, _b;
        const placeholder = pattern.replace('%s', variable);
        // Check in text fields only (not structural fields like extension)
        if (payload.documentUrl.includes(placeholder))
            return true;
        if ((_a = payload.fileName) === null || _a === void 0 ? void 0 : _a.includes(placeholder))
            return true;
        if ((_b = payload.caption) === null || _b === void 0 ? void 0 : _b.includes(placeholder))
            return true;
        return false;
    }
}
exports.DocumentPayloadHandler = DocumentPayloadHandler;
//# sourceMappingURL=document.handler.js.map