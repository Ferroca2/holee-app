"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payloadRegistry = void 0;
const schemas_1 = require("./schemas");
class MessagePayloadRegistry {
    constructor() {
        // Internally we store handlers with proper typing
        this.handlers = {};
    }
    // Register a handler with strong typing - only allows valid types
    register(type, handler) {
        // The typing ensures that only handlers compatible with T are accepted
        this.handlers[type] = handler;
    }
    // Get the handler - simple lookup
    getHandler(payload) {
        const handler = this.handlers[payload.type];
        if (!handler) {
            throw new Error(`No handler registered for payload type: ${payload.type}`);
        }
        return handler;
    }
    // Method for always strict and consistent validation
    validate(payload) {
        try {
            // Basic structure verification
            if (!payload || typeof payload !== 'object' || !('type' in payload)) {
                return null;
            }
            const payloadWithType = payload;
            const type = payloadWithType.type;
            // If we have a handler for the type, we check if it supports the payload
            const handler = this.handlers[type];
            if (!handler) {
                return null;
            }
            // Always strict validation with Zod for total consistency
            try {
                schemas_1.MessagePayloadSchema.parse(payload);
            }
            catch (error) {
                return null;
            }
            // Additional validation with the specific handler
            if (handler.validate(payload)) {
                return payload;
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
    // Utility methods that encapsulate common operations
    getCharacterCount(payload) {
        return this.getHandler(payload).getCharacterCount(payload);
    }
    getPrimaryTextFields(payload) {
        return this.getHandler(payload).getPrimaryTextFields(payload);
    }
    calculateTypingDelay(payload, typingSpeed) {
        return this.getHandler(payload).calculateTypingDelay(payload, typingSpeed);
    }
    parseVariables(payload, variables, pattern) {
        return this.getHandler(payload).parseVariables(payload, variables, pattern);
    }
    hasVariable(payload, variable, pattern) {
        return this.getHandler(payload).hasVariable(payload, variable, pattern);
    }
}
// Export a singleton instance of the registry
exports.payloadRegistry = new MessagePayloadRegistry();
//# sourceMappingURL=registry.js.map