"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handlers_1 = require("./handlers");
const schemas_1 = require("./schemas");
const registry_1 = require("./registry");
// Helpers - factories para criação de payloads
const createPayload = {
    text: (text) => schemas_1.TextPayloadSchema.parse({
        type: 'text',
        text: text,
    }),
    image: (image, text, transcription) => schemas_1.ImagePayloadSchema.parse(Object.assign(Object.assign({ type: 'image', image: image }, (text !== undefined ? { text } : {})), (transcription !== undefined ? { transcription } : {}))),
    audio: (audio, seconds, mimeType, transcription) => schemas_1.AudioPayloadSchema.parse(Object.assign(Object.assign(Object.assign({ type: 'audio', audio: audio }, (seconds !== undefined ? { seconds } : {})), (mimeType !== undefined ? { mimeType } : {})), (transcription !== undefined ? { transcription } : {}))),
    buttonActions: (text, buttons, title, footer) => schemas_1.ButtonActionsPayloadSchema.parse(Object.assign(Object.assign({ type: 'button-actions', text: text, buttons: buttons }, (title !== undefined ? { title } : {})), (footer !== undefined ? { footer } : {}))),
    link: (text, linkUrl, title, linkDescription, image) => schemas_1.LinkPayloadSchema.parse(Object.assign(Object.assign(Object.assign({ type: 'link', text: text, linkUrl: linkUrl }, (title !== undefined ? { title } : {})), (linkDescription !== undefined ? { linkDescription } : {})), (image !== undefined ? { image } : {}))),
    document: (documentUrl, extension, mimeType, fileName, caption) => schemas_1.DocumentPayloadSchema.parse(Object.assign(Object.assign(Object.assign({ type: 'document', documentUrl: documentUrl, extension: extension }, (mimeType !== undefined ? { mimeType } : {})), (fileName !== undefined ? { fileName } : {})), (caption !== undefined ? { caption } : {}))),
    carousel: (text, cards) => schemas_1.CarouselPayloadSchema.parse({
        type: 'carousel',
        text: text,
        cards: cards,
    }),
};
// Helpers - funções utilitárias
function validatePayload(payload) {
    return registry_1.payloadRegistry.validate(payload);
}
function calculateTypingDelay(payload, typingSpeed) {
    return registry_1.payloadRegistry.calculateTypingDelay(payload, typingSpeed);
}
function parseVariables(payload, variables, pattern) {
    return registry_1.payloadRegistry.parseVariables(payload, variables, pattern);
}
function hasVariable(payload, variable, pattern) {
    return registry_1.payloadRegistry.hasVariable(payload, variable, pattern);
}
/* ---------- Inicialização lazy interna ------------- */
function registerBuiltInHandlers() {
    registry_1.payloadRegistry.register('text', new handlers_1.TextPayloadHandler());
    registry_1.payloadRegistry.register('image', new handlers_1.ImagePayloadHandler());
    registry_1.payloadRegistry.register('audio', new handlers_1.AudioPayloadHandler());
    registry_1.payloadRegistry.register('button-actions', new handlers_1.ButtonActionsPayloadHandler());
    registry_1.payloadRegistry.register('link', new handlers_1.LinkPayloadHandler());
    registry_1.payloadRegistry.register('document', new handlers_1.DocumentPayloadHandler());
    registry_1.payloadRegistry.register('carousel', new handlers_1.CarouselPayloadHandler());
}
let ready = false;
function ensureReady() {
    if (!ready) {
        registerBuiltInHandlers();
        ready = true;
    }
}
/* ---------- Implementação da classe singleton ----------------- */
class Messaging {
    constructor() {
        /* factories */
        this.create = createPayload;
        /* util wrappers com inicialização automática */
        this.validate = (p) => {
            ensureReady();
            return validatePayload(p);
        };
        this.characters = (p) => {
            ensureReady();
            return registry_1.payloadRegistry.getCharacterCount(p);
        };
        this.textFields = (p) => {
            ensureReady();
            return registry_1.payloadRegistry.getPrimaryTextFields(p);
        };
        this.delay = (p, s) => {
            ensureReady();
            return calculateTypingDelay(p, s);
        };
        this.parse = (p, vars, pattern) => {
            ensureReady();
            return parseVariables(p, vars, pattern);
        };
        this.hasVar = (p, v, pattern) => {
            ensureReady();
            return hasVariable(p, v, pattern);
        };
    }
}
/* ---------- Exportação default: singleton real ------- */
exports.default = new Messaging();
//# sourceMappingURL=index.js.map