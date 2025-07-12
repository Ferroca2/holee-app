"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseMessagePayloadHandler = void 0;
// Base abstract class for all handlers
class BaseMessagePayloadHandler {
    /* ------------------------------------------------------------------------- */
    /* ---------------------------- CHARACTER COUNT ---------------------------- */
    /* ------------------------------------------------------------------------- */
    // Method to get the character count for delay calculation and public use
    // Each handler can override for specific logic
    getCharacterCount(payload) {
        return JSON.stringify(payload).length;
    }
    // Base implementation of calculateTypingDelay
    calculateTypingDelay(payload, typingSpeed = 25) {
        const charCount = this.getCharacterCount(payload);
        // Variation in typing speed
        const variation = Math.min(5, Math.max(0, typingSpeed - 15));
        const minCps = Math.max(15, typingSpeed - variation);
        const maxCps = typingSpeed + variation;
        const cpsThisMsg = Math.random() * (maxCps - minCps) + minCps;
        // Time calculations
        const typingMs = (charCount / cpsThisMsg) * 1000;
        const thinkingMs = 200 + Math.random() * 300;
        const totalSec = Math.round((typingMs + thinkingMs) / 1000);
        return Math.min(15, Math.max(1, totalSec));
    }
    /* ------------------------------------------------------------------------- */
    /* ---------------------------- TEXT EXTRACTION ---------------------------- */
    /* ------------------------------------------------------------------------- */
    // Method to extract the primary text fields from a payload (if applicable)
    // Returns an object with the main text fields for each payload type
    // Each handler can override for specific logic
    getPrimaryTextFields(payload) {
        return {}; // Default implementation returns empty object
    }
    /* ------------------------------------------------------------------------- */
    /* -------------------------------- PARSING -------------------------------- */
    /* ------------------------------------------------------------------------- */
    // Base implementation for parseVariables
    parseVariables(payload, variables, pattern = '[%s]') {
        return Object.assign({}, payload);
    }
    // Base implementation for hasVariable
    hasVariable(payload, variable, pattern = '[%s]') {
        return false; // Default implementation
    }
    // Helper function to escape special characters in regex
    escapeRegExp(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    // Helper function to get or create regex with cache
    getPlaceholderRegex(ph) {
        return new RegExp(this.escapeRegExp(ph), 'g');
    }
    // Helper function to replace all variables in a text
    replaceAll(text, variables, pattern = '[%s]') {
        let out = text;
        for (const [key, value] of Object.entries(variables)) {
            if (value === undefined || value === null)
                continue;
            const placeholder = pattern.replace('%s', key);
            const regex = this.getPlaceholderRegex(placeholder);
            out = out.replace(regex, value);
        }
        return out;
    }
}
exports.BaseMessagePayloadHandler = BaseMessagePayloadHandler;
//# sourceMappingURL=base.handler.js.map