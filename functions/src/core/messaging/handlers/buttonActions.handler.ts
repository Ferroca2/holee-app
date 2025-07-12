import { ButtonActionsPayload, ButtonActionsPayloadSchema } from '../schemas';
import { BaseMessagePayloadHandler } from './base.handler';

export class ButtonActionsPayloadHandler extends BaseMessagePayloadHandler<ButtonActionsPayload> {

    /* ------------------------------------------------------------------------- */
    /* ------------------------------- VALIDATION ------------------------------ */
    /* ------------------------------------------------------------------------- */

    // Implementation of validation
    validate(payload: unknown): payload is ButtonActionsPayload {
        return ButtonActionsPayloadSchema.safeParse(payload).success;
    }

    /* ------------------------------------------------------------------------- */
    /* ---------------------------- CHARACTER COUNT ---------------------------- */
    /* ------------------------------------------------------------------------- */

    // Implementation of getCharacterCount
    getCharacterCount(payload: ButtonActionsPayload): number {
        let count = payload.text.length;
        if (payload.title) count += payload.title.length;
        if (payload.footer) count += payload.footer.length;

        // Add size of buttons label, url and phone if exists
        for (const button of payload.buttons) {
            count += button.label.length;
            if (button.url) count += button.url.length;
            if (button.phone) count += button.phone.length;
        }

        return count;
    }

    /* ------------------------------------------------------------------------- */
    /* ---------------------------- TEXT EXTRACTION ---------------------------- */
    /* ------------------------------------------------------------------------- */

    // Implementation of getPrimaryTextFields
    getPrimaryTextFields(payload: ButtonActionsPayload): Record<string, string> {
        const fields: Record<string, string> = {
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
    parseVariables(payload: ButtonActionsPayload, variables: Record<string, string>, pattern = '[%s]'): ButtonActionsPayload {
        return {
            ...payload,
            text: this.replaceAll(payload.text, variables, pattern),
            ...(payload.title ? { title: this.replaceAll(payload.title, variables, pattern) } : {}),
            ...(payload.footer ? { footer: this.replaceAll(payload.footer, variables, pattern) } : {}),
            buttons: payload.buttons.map(button => ({
                ...button,
                label: this.replaceAll(button.label, variables, pattern),
                ...(button.url ? { url: this.replaceAll(button.url, variables, pattern) } : {}),
                ...(button.phone ? { phone: this.replaceAll(button.phone, variables, pattern) } : {}),
            })),
        };
    }

    // Implementation of hasVariable
    hasVariable(payload: ButtonActionsPayload, variable: string, pattern = '[%s]'): boolean {
        const placeholder = pattern.replace('%s', variable);

        // Check in all text fields
        if (payload.text.includes(placeholder)) return true;
        if (payload.title?.includes(placeholder)) return true;
        if (payload.footer?.includes(placeholder)) return true;

        // Check in all button labels
        for (const button of payload.buttons) {
            if (button.label.includes(placeholder)) return true;
            if (button.url?.includes(placeholder)) return true;
            if (button.phone?.includes(placeholder)) return true;
        }

        return false;
    }
}
