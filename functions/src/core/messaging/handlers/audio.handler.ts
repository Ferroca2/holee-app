import { AudioPayload, AudioPayloadSchema } from '../schemas';
import { BaseMessagePayloadHandler } from './base.handler';

export class AudioPayloadHandler extends BaseMessagePayloadHandler<AudioPayload> {

    /* ------------------------------------------------------------------------- */
    /* ------------------------------- VALIDATION ------------------------------ */
    /* ------------------------------------------------------------------------- */

    // Implementation of validation
    validate(payload: unknown): payload is AudioPayload {
        return AudioPayloadSchema.safeParse(payload).success;
    }

    /* ------------------------------------------------------------------------- */
    /* ---------------------------- CHARACTER COUNT ---------------------------- */
    /* ------------------------------------------------------------------------- */

    // Implementation of getCharacterCount
    getCharacterCount(payload: AudioPayload): number {
        return payload.transcription?.length || (payload.seconds || 1) * 12; // ~12 chars per second
    }

    /* ------------------------------------------------------------------------- */
    /* ---------------------------- TEXT EXTRACTION ---------------------------- */
    /* ------------------------------------------------------------------------- */

    // Implementation of getPrimaryTextFields
    getPrimaryTextFields(payload: AudioPayload): Record<string, string> {
        const fields: Record<string, string> = {};

        if (payload.transcription) {
            fields.transcription = payload.transcription;
        }

        return fields;
    }

    /* ------------------------------------------------------------------------- */
    /* -------------------------------- PARSING -------------------------------- */
    /* ------------------------------------------------------------------------- */

    // No parsing needed for audio
}
