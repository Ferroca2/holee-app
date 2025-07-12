import { ImagePayload, ImagePayloadSchema } from '../schemas';
import { BaseMessagePayloadHandler } from './base.handler';

export class ImagePayloadHandler extends BaseMessagePayloadHandler<ImagePayload> {

    /* ------------------------------------------------------------------------- */
    /* ------------------------------- VALIDATION ------------------------------ */
    /* ------------------------------------------------------------------------- */

    // Implementation of validation
    validate(payload: unknown): payload is ImagePayload {
        return ImagePayloadSchema.safeParse(payload).success;
    }

    /* ------------------------------------------------------------------------- */
    /* ---------------------------- CHARACTER COUNT ---------------------------- */
    /* ------------------------------------------------------------------------- */

    // Implementation of getCharacterCount
    getCharacterCount(payload: ImagePayload): number {
        return payload.text?.length || 0;
    }

    /* ------------------------------------------------------------------------- */
    /* ---------------------------- TEXT EXTRACTION ---------------------------- */
    /* ------------------------------------------------------------------------- */

    // Implementation of getPrimaryTextFields
    getPrimaryTextFields(payload: ImagePayload): Record<string, string> {
        const fields: Record<string, string> = {};

        if (payload.text) {
            fields.text = payload.text;
        }

        return fields;
    }

    /* ------------------------------------------------------------------------- */
    /* -------------------------------- PARSING -------------------------------- */
    /* ------------------------------------------------------------------------- */

    // Implementation of parseVariables
    parseVariables(payload: ImagePayload, variables: Record<string, string>, pattern = '[%s]'): ImagePayload {
        if (!payload.text) return payload;

        return {
            ...payload,
            text: this.replaceAll(payload.text, variables, pattern),
        };
    }

    // Implementation of hasVariable
    hasVariable(payload: ImagePayload, variable: string, pattern = '[%s]'): boolean {
        if (!payload.text) return false;

        const placeholder = pattern.replace('%s', variable);
        return payload.text.includes(placeholder);
    }
}
