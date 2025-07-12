import { firestore } from 'firebase-admin';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { AdminBaseRef } from '../index';
import { convertDoc } from '../../utils/firestore';

import { Conversation } from './entity';

const db = firestore();

/**
 * Interface para o repositório de Conversations.
 */
export interface ConversationsRepositoryI {
    getDocRef(conversationId: string): firestore.DocumentReference<Conversation>;
    setConversation(conversationId: string, data: Conversation): Promise<void>;
    updateConversation(conversationId: string, data: Partial<Conversation>): Promise<void>;
    getConversationById(conversationId: string): Promise<AdminBaseRef<Conversation> | null>;
}

/**
 * Implementação do repositório para gerenciar Conversations no Firestore.
 */
export class ConversationsRepositoryServerSDK implements ConversationsRepositoryI {

    /**
     * Retorna a referência da coleção para Conversations.
     * @returns Uma CollectionReference para as Conversations.
     */
    private getCollection(): firestore.CollectionReference<Conversation> {
        return db.collection('conversations') as firestore.CollectionReference<Conversation>;
    }

    /**
     * Retorna uma DocumentReference para uma Conversation pelo seu ID.
     * @param conversationId - O identificador único da conversation.
     * @returns Uma DocumentReference para a Conversation.
     */
    getDocRef(conversationId: string): firestore.DocumentReference<Conversation> {
        return this.getCollection().doc(conversationId);
    }

    /**
     * Cria ou sobrescreve um documento Conversation no Firestore.
     * @param conversationId - O identificador único da conversation.
     * @param data - Os dados da Conversation a serem armazenados.
     * @throws Error se a operação falhar.
     */
    async setConversation(conversationId: string, data: Conversation): Promise<void> {
        try {
            await this.getDocRef(conversationId).set(data);
        } catch (error) {
            throw new Error(`Erro ao definir Conversation com ID ${conversationId}: ${error}`);
        }
    }

    /**
     * Atualiza um documento Conversation no Firestore.
     * @param conversationId - O identificador único da conversation.
     * @param data - Dados parciais para atualizar a Conversation.
     * @throws Error se a operação de atualização falhar.
     */
    async updateConversation(
        conversationId: string,
        data: Partial<Conversation>
    ): Promise<void> {
        try {
            await this.getDocRef(conversationId).set(data, { merge: true });
        } catch (error) {
            throw new Error(`Erro ao atualizar Conversation com ID ${conversationId}: ${error}`);
        }
    }

    /**
     * Busca uma Conversation pelo seu ID.
     * @param conversationId - O identificador único da conversation.
     * @returns Os dados da Conversation envolvidos em AdminBaseRef se encontrados, ou null se não existir.
     * @throws Error se a operação de busca falhar.
     */
    async getConversationById(
        conversationId: string
    ): Promise<AdminBaseRef<Conversation> | null> {
        try {
            const doc = await this.getDocRef(conversationId).get();
            if (!doc.exists) return null;

            const queryDoc = doc as QueryDocumentSnapshot<Conversation>;
            return convertDoc(queryDoc);
        } catch (error) {
            throw new Error(`Erro ao buscar Conversation com ID ${conversationId}: ${error}`);
        }
    }
}

export default new ConversationsRepositoryServerSDK();
