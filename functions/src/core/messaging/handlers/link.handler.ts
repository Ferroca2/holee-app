import { LinkPayload, LinkPayloadSchema } from '../schemas';
import { BaseMessagePayloadHandler } from './base.handler';

export class LinkPayloadHandler extends BaseMessagePayloadHandler<LinkPayload> {

    /* ------------------------------------------------------------------------- */
    /* ------------------------------- VALIDATION ------------------------------ */
    /* ------------------------------------------------------------------------- */

    // Implementation of validation
    validate(payload: unknown): payload is LinkPayload {
        return LinkPayloadSchema.safeParse(payload).success;
    }

    /* ------------------------------------------------------------------------- */
    /* ---------------------------- CHARACTER COUNT ---------------------------- */
    /* ------------------------------------------------------------------------- */

    // Implementation of getCharacterCount
    getCharacterCount(payload: LinkPayload): number {
        let count = payload.text.length;
        count += payload.linkUrl.length;
        if (payload.title) count += payload.title.length;
        if (payload.linkDescription) count += payload.linkDescription.length;

        return count;
    }

    /* ------------------------------------------------------------------------- */
    /* --------------------------- TEXT EXTRACTION ----------------------------- */
    /* ------------------------------------------------------------------------- */

    // Implementation of getPrimaryTextFields
    getPrimaryTextFields(payload: LinkPayload): Record<string, string> {
        return {
            text: payload.text,
        };
    }

    /* ------------------------------------------------------------------------- */
    /* -------------------------------- PARSING -------------------------------- */
    /* ------------------------------------------------------------------------- */

    // Implementation of parseVariables
    parseVariables(payload: LinkPayload, variables: Record<string, string>, pattern = '[%s]'): LinkPayload {
        return {
            ...payload,
            text: this.replaceAll(payload.text, variables, pattern),
            linkUrl: this.replaceAll(payload.linkUrl, variables, pattern),
            ...(payload.title ? { title: this.replaceAll(payload.title, variables, pattern) } : {}),
            ...(payload.linkDescription ? { linkDescription: this.replaceAll(payload.linkDescription, variables, pattern) } : {}),
        };
    }

    // Implementation of hasVariable
    hasVariable(payload: LinkPayload, variable: string, pattern = '[%s]'): boolean {
        const placeholder = pattern.replace('%s', variable);

        // Check in all text fields
        if (payload.text.includes(placeholder)) return true;
        if (payload.linkUrl.includes(placeholder)) return true;
        if (payload.title?.includes(placeholder)) return true;
        if (payload.linkDescription?.includes(placeholder)) return true;

        return false;
    }
}
