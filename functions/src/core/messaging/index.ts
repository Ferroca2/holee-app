import {
    TextPayloadHandler,
    ImagePayloadHandler,
    AudioPayloadHandler,
    ButtonActionsPayloadHandler,
    LinkPayloadHandler,
    DocumentPayloadHandler,
    CarouselPayloadHandler,
} from './handlers';

import {
    TextPayloadSchema,
    TextPayload,
    ImagePayloadSchema,
    ImagePayload,
    AudioPayloadSchema,
    AudioPayload,
    ButtonActionsPayloadSchema,
    ButtonActionsPayload,
    LinkPayloadSchema,
    LinkPayload,
    DocumentPayloadSchema,
    DocumentPayload,
    CarouselPayloadSchema,
    CarouselPayload,
    MessagePayload,
} from './schemas';

import { payloadRegistry } from './registry';

// Re-export all types as part of the public API
export type {
    MessagePayload,
    TextPayload,
    ImagePayload,
    AudioPayload,
    ButtonActionsPayload,
    LinkPayload,
    DocumentPayload,
    CarouselPayload,
};

// Helpers - factories para criação de payloads
const createPayload = {
    text: (
        text: string
    ): TextPayload =>
        TextPayloadSchema.parse(
            {
                type: 'text',
                text: text,
            }
        ),

    image: (
        image: string,
        text?: string,
        transcription?: string
    ): ImagePayload =>
        ImagePayloadSchema.parse({
            type: 'image',
            image: image,
            ...(text !== undefined ? { text } : {}),
            ...(transcription !== undefined ? { transcription } : {}),
        }),

    audio: (
        audio: string,
        seconds?: number,
        mimeType?: string,
        transcription?: string
    ): AudioPayload =>
        AudioPayloadSchema.parse({
            type: 'audio',
            audio: audio,
            ...(seconds !== undefined ? { seconds } : {}),
            ...(mimeType !== undefined ? { mimeType } : {}),
            ...(transcription !== undefined ? { transcription } : {}),
        }),

    buttonActions: (
        text: string,
        buttons: ButtonActionsPayload['buttons'],
        title?: string,
        footer?: string
    ): ButtonActionsPayload =>
        ButtonActionsPayloadSchema.parse({
            type: 'button-actions',
            text: text,
            buttons: buttons,
            ...(title !== undefined ? { title } : {}),
            ...(footer !== undefined ? { footer } : {}),
        }),

    link: (
        text: string,
        linkUrl: string,
        title?: string,
        linkDescription?: string,
        image?: string
    ): LinkPayload =>
        LinkPayloadSchema.parse({
            type: 'link',
            text: text,
            linkUrl: linkUrl,
            ...(title !== undefined ? { title } : {}),
            ...(linkDescription !== undefined ? { linkDescription } : {}),
            ...(image !== undefined ? { image } : {}),
        }),

    document: (
        documentUrl: string,
        extension: string,
        mimeType?: string,
        fileName?: string,
        caption?: string
    ): DocumentPayload =>
        DocumentPayloadSchema.parse({
            type: 'document',
            documentUrl: documentUrl,
            extension: extension,
            ...(mimeType !== undefined ? { mimeType } : {}),
            ...(fileName !== undefined ? { fileName } : {}),
            ...(caption !== undefined ? { caption } : {}),
        }),

    carousel: (
        text: string,
        cards: CarouselPayload['cards']
    ): CarouselPayload =>
        CarouselPayloadSchema.parse({
            type: 'carousel',
            text: text,
            cards: cards,
        }),
};

// Helpers - funções utilitárias
function validatePayload<T extends MessagePayload>(payload: unknown): T | null {
    return payloadRegistry.validate<T>(payload);
}

function calculateTypingDelay<T extends MessagePayload>(payload: T, typingSpeed?: number): number {
    return payloadRegistry.calculateTypingDelay(payload, typingSpeed);
}

function parseVariables<T extends MessagePayload>(
    payload: T,
    variables: Record<string, string>,
    pattern?: string
): T {
    return payloadRegistry.parseVariables(payload, variables, pattern);
}

function hasVariable<T extends MessagePayload>(
    payload: T,
    variable: string,
    pattern?: string
): boolean {
    return payloadRegistry.hasVariable(payload, variable, pattern);
}

/* ---------- Inicialização lazy interna ------------- */
function registerBuiltInHandlers(): void {
    payloadRegistry.register('text', new TextPayloadHandler());
    payloadRegistry.register('image', new ImagePayloadHandler());
    payloadRegistry.register('audio', new AudioPayloadHandler());
    payloadRegistry.register('button-actions', new ButtonActionsPayloadHandler());
    payloadRegistry.register('link', new LinkPayloadHandler());
    payloadRegistry.register('document', new DocumentPayloadHandler());
    payloadRegistry.register('carousel', new CarouselPayloadHandler());
}

let ready = false;
function ensureReady() {
    if (!ready) {
        registerBuiltInHandlers();
        ready = true;
    }
}

/* --------- Implementacao da Interface de Messaging --------- */
export interface MessagingI {
    /* factories */
    create: {
        text(text: string): MessagePayload;
        image(
            image: string,
            text?: string,
            transcription?: string
        ): MessagePayload;
        audio(
            audio: string,
            seconds?: number,
            mimeType?: string,
            transcription?: string
        ): MessagePayload;
        buttonActions(
            text: string,
            buttons: ButtonActionsPayload['buttons'],
            title?: string,
            footer?: string
        ): MessagePayload;
        link(
            text: string,
            linkUrl: string,
            title?: string,
            linkDescription?: string,
            image?: string
        ): MessagePayload;
        document(
            documentUrl: string,
            extension: string,
            fileName?: string,
            mimeType?: string,
            caption?: string
        ): MessagePayload;
        carousel(
            text: string,
            cards: CarouselPayload['cards']
        ): MessagePayload;
    };

    /* utilities */
    validate<T extends MessagePayload>(p: unknown): T | null;
    characters<T extends MessagePayload>(p: T): number;
    textFields<T extends MessagePayload>(p: T): Record<string, string>;
    delay<T extends MessagePayload>(p: T, speed?: number): number;
    parse<T extends MessagePayload>(
        p: T,
        vars: Record<string, string>,
        pattern?: string
    ): T;
    hasVar<T extends MessagePayload>(
        p: T,
        variable: string,
        pattern?: string
    ): boolean;
}

/* ---------- Implementação da classe singleton ----------------- */
class Messaging implements MessagingI {
    /* factories */
    create = createPayload;

    /* util wrappers com inicialização automática */
    validate = <T extends MessagePayload>(p: unknown): T | null => {
        ensureReady();
        return validatePayload<T>(p);
    };

    characters = <T extends MessagePayload>(p: T): number => {
        ensureReady();
        return payloadRegistry.getCharacterCount(p);
    };

    textFields = <T extends MessagePayload>(p: T): Record<string, string> => {
        ensureReady();
        return payloadRegistry.getPrimaryTextFields(p);
    };

    delay = <T extends MessagePayload>(p: T, s?: number): number => {
        ensureReady();
        return calculateTypingDelay(p, s);
    };

    parse = <T extends MessagePayload>(
        p: T,
        vars: Record<string, string>,
        pattern?: string
    ): T => {
        ensureReady();
        return parseVariables(p, vars, pattern);
    };

    hasVar = <T extends MessagePayload>(
        p: T,
        v: string,
        pattern?: string
    ): boolean => {
        ensureReady();
        return hasVariable(p, v, pattern);
    };
}

/* ---------- Exportação default: singleton real ------- */
export default new Messaging();
