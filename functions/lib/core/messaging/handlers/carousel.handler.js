"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarouselPayloadHandler = void 0;
const schemas_1 = require("../schemas");
const base_handler_1 = require("./base.handler");
class CarouselPayloadHandler extends base_handler_1.BaseMessagePayloadHandler {
    /* ------------------------------------------------------------------------- */
    /* ------------------------------- VALIDATION ------------------------------ */
    /* ------------------------------------------------------------------------- */
    // Implementation of validation
    validate(payload) {
        return schemas_1.CarouselPayloadSchema.safeParse(payload).success;
    }
    /* ------------------------------------------------------------------------- */
    /* ---------------------------- CHARACTER COUNT ---------------------------- */
    /* ------------------------------------------------------------------------- */
    // Implementation of getCharacterCount
    getCharacterCount(payload) {
        var _a;
        let count = payload.text.length;
        // Add character count for each card
        for (const card of payload.cards) {
            // Count image text (caption)
            if (card.image.text) {
                count += ((_a = card.image.text) === null || _a === void 0 ? void 0 : _a.length) || 0;
            }
            // Count card text
            if (card.text) {
                count += card.text.length;
            }
            // Add character count for buttons in each card
            if (card.buttons) {
                for (const button of card.buttons) {
                    count += button.label.length;
                    if (button.url)
                        count += button.url.length;
                    if (button.phone)
                        count += button.phone.length;
                }
            }
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
        // Add text from each card
        payload.cards.forEach((card, index) => {
            if (card.image.text) {
                fields[`card_${index}_image_text`] = card.image.text;
            }
            if (card.text) {
                fields[`card_${index}_text`] = card.text;
            }
        });
        return fields;
    }
    /* ------------------------------------------------------------------------- */
    /* -------------------------------- PARSING -------------------------------- */
    /* ------------------------------------------------------------------------- */
    // Implementation of parseVariables
    parseVariables(payload, variables, pattern = '[%s]') {
        return Object.assign(Object.assign({}, payload), { text: this.replaceAll(payload.text, variables, pattern), cards: payload.cards.map((card) => (Object.assign(Object.assign(Object.assign(Object.assign({}, card), { image: Object.assign(Object.assign({}, card.image), (card.image.text ? { text: this.replaceAll(card.image.text, variables, pattern) } : {})) }), (card.text ? { text: this.replaceAll(card.text, variables, pattern) } : {})), (card.buttons ? {
                buttons: card.buttons.map((button) => (Object.assign(Object.assign(Object.assign(Object.assign({}, button), { label: this.replaceAll(button.label, variables, pattern) }), (button.url ? { url: this.replaceAll(button.url, variables, pattern) } : {})), (button.phone ? { phone: this.replaceAll(button.phone, variables, pattern) } : {})))),
            } : {})))) });
    }
    // Implementation of hasVariable
    hasVariable(payload, variable, pattern = '[%s]') {
        var _a, _b, _c, _d;
        const placeholder = pattern.replace('%s', variable);
        // Check in main text
        if (payload.text.includes(placeholder))
            return true;
        // Check in all cards
        for (const card of payload.cards) {
            if ((_a = card.image.text) === null || _a === void 0 ? void 0 : _a.includes(placeholder))
                return true;
            if ((_b = card.text) === null || _b === void 0 ? void 0 : _b.includes(placeholder))
                return true;
            // Check in all buttons of each card
            if (card.buttons) {
                for (const button of card.buttons) {
                    if (button.label.includes(placeholder))
                        return true;
                    if ((_c = button.url) === null || _c === void 0 ? void 0 : _c.includes(placeholder))
                        return true;
                    if ((_d = button.phone) === null || _d === void 0 ? void 0 : _d.includes(placeholder))
                        return true;
                }
            }
        }
        return false;
    }
}
exports.CarouselPayloadHandler = CarouselPayloadHandler;
//# sourceMappingURL=carousel.handler.js.map