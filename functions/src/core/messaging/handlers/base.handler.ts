import { MessagePayload } from '../schemas';

// Base abstract class for all handlers
export abstract class BaseMessagePayloadHandler<T extends MessagePayload = MessagePayload> {

    /* ------------------------------------------------------------------------- */
    /* ------------------------------- VALIDATION ------------------------------ */
    /* ------------------------------------------------------------------------- */

    // Abstract method that each handler must implement
    abstract validate(payload: unknown): payload is T;

    /* ------------------------------------------------------------------------- */
    /* ---------------------------- CHARACTER COUNT ---------------------------- */
    /* ------------------------------------------------------------------------- */

    // Method to get the character count for delay calculation and public use
    // Each handler can override for specific logic
    getCharacterCount(payload: T): number {
        return JSON.stringify(payload).length;
    }

    // Base implementation of calculateTypingDelay
    calculateTypingDelay(payload: T, typingSpeed = 25): number {
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
    getPrimaryTextFields(payload: T): Record<string, string> {      // eslint-disable-line @typescript-eslint/no-unused-vars
        return {}; // Default implementation returns empty object
    }

    /* ------------------------------------------------------------------------- */
    /* -------------------------------- PARSING -------------------------------- */
    /* ------------------------------------------------------------------------- */

    // Base implementation for parseVariables
    parseVariables(payload: T, variables: Record<string, string>, pattern = '[%s]'): T {  // eslint-disable-line @typescript-eslint/no-unused-vars
        return { ...payload };
    }

    // Base implementation for hasVariable
    hasVariable(payload: T, variable: string, pattern = '[%s]'): boolean {  // eslint-disable-line @typescript-eslint/no-unused-vars
        return false; // Default implementation
    }

    // Helper function to escape special characters in regex
    protected escapeRegExp(text: string): string {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Helper function to get or create regex with cache
    protected getPlaceholderRegex(ph: string): RegExp {
        return new RegExp(this.escapeRegExp(ph), 'g');
    }

    // Helper function to replace all variables in a text
    protected replaceAll(
        text: string,
        variables: Record<string, string>,
        pattern = '[%s]'
    ): string {
        let out = text;
        for (const [key, value] of Object.entries(variables)) {
            if (value === undefined || value === null) continue;
            const placeholder = pattern.replace('%s', key);
            const regex = this.getPlaceholderRegex(placeholder);
            out = out.replace(regex, value);
        }
        return out;
    }

}

// Type for the handler
export type MessagePayloadHandler<T extends MessagePayload = MessagePayload> = BaseMessagePayloadHandler<T>;
