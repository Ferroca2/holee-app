import { TextPayload, TextPayloadSchema } from '../schemas';
import { BaseMessagePayloadHandler } from './base.handler';

export class TextPayloadHandler extends BaseMessagePayloadHandler<TextPayload> {

    /* ------------------------------------------------------------------------- */
    /* ------------------------------- VALIDATION ------------------------------ */
    /* ------------------------------------------------------------------------- */

    // Implementation of validation
    validate(payload: unknown): payload is TextPayload {
        return TextPayloadSchema.safeParse(payload).success;
    }

    /* ------------------------------------------------------------------------- */
    /* ---------------------------- CHARACTER COUNT ---------------------------- */
    /* ------------------------------------------------------------------------- */

    // Implementation of getCharacterCount
    getCharacterCount(payload: TextPayload): number {
        return payload.text.length;
    }

    /* ------------------------------------------------------------------------- */
    /* ---------------------------- TEXT EXTRACTION ---------------------------- */
    /* ------------------------------------------------------------------------- */

    // Implementation of getPrimaryTextFields
    getPrimaryTextFields(payload: TextPayload): Record<string, string> {
        return {
            text: payload.text,
        };
    }

    /* ------------------------------------------------------------------------- */
    /* -------------------------------- PARSING -------------------------------- */
    /* ------------------------------------------------------------------------- */

    // Implementation of parseVariables
    parseVariables(payload: TextPayload, variables: Record<string, string>, pattern = '[%s]'): TextPayload {
        return {
            ...payload,
            text: this.replaceAll(payload.text, variables, pattern),
        };
    }

    // Implementation of hasVariable
    hasVariable(payload: TextPayload, variable: string, pattern = '[%s]'): boolean {
        const placeholder = pattern.replace('%s', variable);
        return payload.text.includes(placeholder);
    }
}
