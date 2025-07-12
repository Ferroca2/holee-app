import { DocumentPayload, DocumentPayloadSchema } from '../schemas/document.schema';
import { BaseMessagePayloadHandler } from './base.handler';

export class DocumentPayloadHandler extends BaseMessagePayloadHandler<DocumentPayload> {

    /* ------------------------------------------------------------------------- */
    /* ------------------------------- VALIDATION ------------------------------ */
    /* ------------------------------------------------------------------------- */

    // Implementation of validation
    validate(payload: unknown): payload is DocumentPayload {
        return DocumentPayloadSchema.safeParse(payload).success;
    }

    /* ------------------------------------------------------------------------- */
    /* ---------------------------- CHARACTER COUNT ---------------------------- */
    /* ------------------------------------------------------------------------- */

    // Implementation of getCharacterCount
    getCharacterCount(payload: DocumentPayload): number {
        let count = payload.documentUrl.length;

        if (payload.fileName) count += payload.fileName.length;
        if (payload.caption) count += payload.caption.length;

        return count;
    }

    /* ------------------------------------------------------------------------- */
    /* ---------------------------- TEXT EXTRACTION ---------------------------- */
    /* ------------------------------------------------------------------------- */

    // Implementation of getPrimaryTextFields
    getPrimaryTextFields(payload: DocumentPayload): Record<string, string> {
        const fields: Record<string, string> = {};

        if (payload.caption) {
            fields.caption = payload.caption;
        }

        return fields;
    }

    /* ------------------------------------------------------------------------- */
    /* -------------------------------- PARSING -------------------------------- */
    /* ------------------------------------------------------------------------- */

    // Implementation of parseVariables
    parseVariables(payload: DocumentPayload, variables: Record<string, string>, pattern = '[%s]'): DocumentPayload {
        return {
            ...payload,
            documentUrl: this.replaceAll(payload.documentUrl, variables, pattern),
            ...(payload.fileName ? { fileName: this.replaceAll(payload.fileName, variables, pattern) } : {}),
            ...(payload.caption ? { caption: this.replaceAll(payload.caption, variables, pattern) } : {}),
            // Note: extension should not be parsed as they are structural
        };
    }

    // Implementation of hasVariable
    hasVariable(payload: DocumentPayload, variable: string, pattern = '[%s]'): boolean {
        const placeholder = pattern.replace('%s', variable);

        // Check in text fields only (not structural fields like extension)
        if (payload.documentUrl.includes(placeholder)) return true;
        if (payload.fileName?.includes(placeholder)) return true;
        if (payload.caption?.includes(placeholder)) return true;

        return false;
    }
}
