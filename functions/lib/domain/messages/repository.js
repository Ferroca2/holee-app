"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesRepositoryServerSDK = void 0;
const firebase_admin_1 = require("firebase-admin");
const firestore_1 = require("../../utils/firestore");
const db = (0, firebase_admin_1.firestore)();
/**
 * Implementação do repositório para gerenciar Messages no Firestore.
 */
class MessagesRepositoryServerSDK {
    /**
     * Retorna a referência da coleção para Messages dentro de uma conversation.
     * @param conversationId - O identificador único da conversation.
     * @returns Uma CollectionReference para as Messages.
     */
    getCollection(conversationId) {
        return db
            .collection('conversations')
            .doc(conversationId)
            .collection('messages');
    }
    /**
     * Retorna uma DocumentReference para uma Message pelo seu ID.
     * @param conversationId - O identificador único da conversation.
     * @param messageId - O identificador único da message.
     * @returns Uma DocumentReference para a Message.
     */
    getDocRef(conversationId, messageId) {
        return this.getCollection(conversationId).doc(messageId);
    }
    /**
     * Cria ou sobrescreve um documento Message no Firestore.
     * @param conversationId - O identificador único da conversation.
     * @param messageId - O identificador único da message.
     * @param data - Os dados da Message a serem armazenados.
     * @throws Error se a operação falhar.
     */
    async setMessage(conversationId, messageId, data) {
        try {
            await this.getDocRef(conversationId, messageId).set(data);
        }
        catch (error) {
            throw new Error(`Erro ao definir Message com ID ${messageId}: ${error}`);
        }
    }
    /**
     * Atualiza um documento Message no Firestore.
     * @param conversationId - O identificador único da conversation.
     * @param messageId - O identificador único da message.
     * @param data - Dados parciais para atualizar a Message.
     * @throws Error se a operação de atualização falhar.
     */
    async updateMessage(conversationId, messageId, data) {
        try {
            await this.getDocRef(conversationId, messageId).set(data, { merge: true });
        }
        catch (error) {
            throw new Error(`Erro ao atualizar Message com ID ${messageId}: ${error}`);
        }
    }
    /**
     * Busca uma Message pelo seu ID.
     * @param conversationId - O identificador único da conversation.
     * @param messageId - O identificador único da message.
     * @returns Os dados da Message envolvidos em AdminBaseRef se encontrados, ou null se não existir.
     * @throws Error se a operação de busca falhar.
     */
    async getMessageById(conversationId, messageId) {
        try {
            const doc = await this.getDocRef(conversationId, messageId).get();
            if (!doc.exists)
                return null;
            const queryDoc = doc;
            return (0, firestore_1.convertDoc)(queryDoc);
        }
        catch (error) {
            throw new Error(`Erro ao buscar Message com ID ${messageId}: ${error}`);
        }
    }
}
exports.MessagesRepositoryServerSDK = MessagesRepositoryServerSDK;
exports.default = new MessagesRepositoryServerSDK();
//# sourceMappingURL=repository.js.map