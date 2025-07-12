"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonActionsPayloadHandler = void 0;
const schemas_1 = require("../schemas");
const base_handler_1 = require("./base.handler");
class ButtonActionsPayloadHandler extends base_handler_1.BaseMessagePayloadHandler {
    /* ------------------------------------------------------------------------- */
    /* ------------------------------- VALIDATION ------------------------------ */
    /* ------------------------------------------------------------------------- */
    // Implementation of validation
    validate(payload) {
        return schemas_1.ButtonActionsPayloadSchema.safeParse(payload).success;
    }
    /* ------------------------------------------------------------------------- */
    /* ---------------------------- CHARACTER COUNT ---------------------------- */
    /* ------------------------------------------------------------------------- */
    // Implementation of getCharacterCount
    getCharacterCount(payload) {
        let count = payload.text.length;
        if (payload.title)
            count += payload.title.length;
        if (payload.footer)
            count += payload.footer.length;
        // Add size of buttons label, url and phone if exists
        for (const button of payload.buttons) {
            count += button.label.length;
            if (button.url)
                count += button.url.length;
            if (button.phone)
                count += button.phone.length;
        }
        return count;
    }
    /* ------------------------------------------------------------------------- */
    /* ---------------------------- TEXT EXTRACTION ---------------------------- */
    /* ------------------------------------------------------------------------- */
    // Implementation of getPrimaryTextFields
    getPrimaryTextFields(payload) {
        const fields = {
            text: payload.text,
        };
        if (payload.title) {
            fields.title = payload.title;
        }
        if (payload.footer) {
            fields.footer = payload.footer;
        }
        return fields;
    }
    /* ------------------------------------------------------------------------- */
    /* -------------------------------- PARSING -------------------------------- */
    /* ------------------------------------------------------------------------- */
    // Implementation of parseVariables
    parseVariables(payload, variables, pattern = '[%s]') {
        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, payload), { text: this.replaceAll(payload.text, variables, pattern) }), (payload.title ? { title: this.replaceAll(payload.title, variables, pattern) } : {})), (payload.footer ? { footer: this.replaceAll(payload.footer, variables, pattern) } : {})), { buttons: payload.buttons.map(button => (Object.assign(Object.assign(Object.assign(Object.assign({}, button), { label: this.replaceAll(button.label, variables, pattern) }), (button.url ? { url: this.replaceAll(button.url, variables, pattern) } : {})), (button.phone ? { phone: this.replaceAll(button.phone, variables, pattern) } : {})))) });
    }
    // Implementation of hasVariable
    hasVariable(payload, variable, pattern = '[%s]') {
        var _a, _b, _c, _d;
        const placeholder = pattern.replace('%s', variable);
        // Check in all text fields
        if (payload.text.includes(placeholder))
            return true;
        if ((_a = payload.title) === null || _a === void 0 ? void 0 : _a.includes(placeholder))
            return true;
        if ((_b = payload.footer) === null || _b === void 0 ? void 0 : _b.includes(placeholder))
            return true;
        // Check in all button labels
        for (const button of payload.buttons) {
            if (button.label.includes(placeholder))
                return true;
            if ((_c = button.url) === null || _c === void 0 ? void 0 : _c.includes(placeholder))
                return true;
            if ((_d = button.phone) === null || _d === void 0 ? void 0 : _d.includes(placeholder))
                return true;
        }
        return false;
    }
}
exports.ButtonActionsPayloadHandler = ButtonActionsPayloadHandler;
//# sourceMappingURL=buttonActions.handler.js.map