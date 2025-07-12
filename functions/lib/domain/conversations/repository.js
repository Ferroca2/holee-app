"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationsRepositoryServerSDK = void 0;
const firebase_admin_1 = require("firebase-admin");
const firestore_1 = require("../../utils/firestore");
const db = (0, firebase_admin_1.firestore)();
/**
 * Implementação do repositório para gerenciar Conversations no Firestore.
 */
class ConversationsRepositoryServerSDK {
    /**
     * Retorna a referência da coleção para Conversations.
     * @returns Uma CollectionReference para as Conversations.
     */
    getCollection() {
        return db.collection('conversations');
    }
    /**
     * Retorna uma DocumentReference para uma Conversation pelo seu ID.
     * @param conversationId - O identificador único da conversation.
     * @returns Uma DocumentReference para a Conversation.
     */
    getDocRef(conversationId) {
        return this.getCollection().doc(conversationId);
    }
    /**
     * Cria ou sobrescreve um documento Conversation no Firestore.
     * @param conversationId - O identificador único da conversation.
     * @param data - Os dados da Conversation a serem armazenados.
     * @throws Error se a operação falhar.
     */
    async setConversation(conversationId, data) {
        try {
            await this.getDocRef(conversationId).set(data);
        }
        catch (error) {
            throw new Error(`Erro ao definir Conversation com ID ${conversationId}: ${error}`);
        }
    }
    /**
     * Atualiza um documento Conversation no Firestore.
     * @param conversationId - O identificador único da conversation.
     * @param data - Dados parciais para atualizar a Conversation.
     * @throws Error se a operação de atualização falhar.
     */
    async updateConversation(conversationId, data) {
        try {
            await this.getDocRef(conversationId).set(data, { merge: true });
        }
        catch (error) {
            throw new Error(`Erro ao atualizar Conversation com ID ${conversationId}: ${error}`);
        }
    }
    /**
     * Busca uma Conversation pelo seu ID.
     * @param conversationId - O identificador único da conversation.
     * @returns Os dados da Conversation envolvidos em AdminBaseRef se encontrados, ou null se não existir.
     * @throws Error se a operação de busca falhar.
     */
    async getConversationById(conversationId) {
        try {
            const doc = await this.getDocRef(conversationId).get();
            if (!doc.exists)
                return null;
            const queryDoc = doc;
            return (0, firestore_1.convertDoc)(queryDoc);
        }
        catch (error) {
            throw new Error(`Erro ao buscar Conversation com ID ${conversationId}: ${error}`);
        }
    }
}
exports.ConversationsRepositoryServerSDK = ConversationsRepositoryServerSDK;
exports.default = new ConversationsRepositoryServerSDK();
//# sourceMappingURL=repository.js.map