import { CarouselPayload, CarouselPayloadSchema } from '../schemas';
import { BaseMessagePayloadHandler } from './base.handler';

export class CarouselPayloadHandler extends BaseMessagePayloadHandler<CarouselPayload> {

    /* ------------------------------------------------------------------------- */
    /* ------------------------------- VALIDATION ------------------------------ */
    /* ------------------------------------------------------------------------- */

    // Implementation of validation
    validate(payload: unknown): payload is CarouselPayload {
        return CarouselPayloadSchema.safeParse(payload).success;
    }

    /* ------------------------------------------------------------------------- */
    /* ---------------------------- CHARACTER COUNT ---------------------------- */
    /* ------------------------------------------------------------------------- */

    // Implementation of getCharacterCount
    getCharacterCount(payload: CarouselPayload): number {
        let count = payload.text.length;

        // Add character count for each card
        for (const card of payload.cards) {
            // Count image text (caption)
            if (card.image.text) {
                count += card.image.text?.length || 0;
            }

            // Count card text
            if (card.text) {
                count += card.text.length;
            }

            // Add character count for buttons in each card
            if (card.buttons) {
                for (const button of card.buttons) {
                    count += button.label.length;
                    if (button.url) count += button.url.length;
                    if (button.phone) count += button.phone.length;
                }
            }
        }

        return count;
    }

    /* ------------------------------------------------------------------------- */
    /* ---------------------------- TEXT EXTRACTION ---------------------------- */
    /* ------------------------------------------------------------------------- */

    // Implementation of getPrimaryTextFields
    getPrimaryTextFields(payload: CarouselPayload): Record<string, string> {
        const fields: Record<string, string> = {
            text: payload.text,
        };

        // Add text from each card
        payload.cards.forEach((card: CarouselPayload['cards'][number], index: number) => {
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
    parseVariables(payload: CarouselPayload, variables: Record<string, string>, pattern = '[%s]'): CarouselPayload {
        return {
            ...payload,
            text: this.replaceAll(payload.text, variables, pattern),
            cards: payload.cards.map((card: CarouselPayload['cards'][number]) => ({
                ...card,
                image: {
                    ...card.image,
                    ...(card.image.text ? { text: this.replaceAll(card.image.text, variables, pattern) } : {}),
                },
                ...(card.text ? { text: this.replaceAll(card.text, variables, pattern) } : {}),
                ...(card.buttons ? {
                    buttons: card.buttons.map((button: NonNullable<CarouselPayload['cards'][number]['buttons']>[number]) => ({
                        ...button,
                        label: this.replaceAll(button.label, variables, pattern),
                        ...(button.url ? { url: this.replaceAll(button.url, variables, pattern) } : {}),
                        ...(button.phone ? { phone: this.replaceAll(button.phone, variables, pattern) } : {}),
                    })),
                } : {}),
            })),
        };
    }

    // Implementation of hasVariable
    hasVariable(payload: CarouselPayload, variable: string, pattern = '[%s]'): boolean {
        const placeholder = pattern.replace('%s', variable);

        // Check in main text
        if (payload.text.includes(placeholder)) return true;

        // Check in all cards
        for (const card of payload.cards) {
            if (card.image.text?.includes(placeholder)) return true;
            if (card.text?.includes(placeholder)) return true;

            // Check in all buttons of each card
            if (card.buttons) {
                for (const button of card.buttons) {
                    if (button.label.includes(placeholder)) return true;
                    if (button.url?.includes(placeholder)) return true;
                    if (button.phone?.includes(placeholder)) return true;
                }
            }
        }

        return false;
    }
}
