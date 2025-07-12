import { firestore } from 'firebase-admin';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { AdminBaseRef } from '../index';
import { convertDoc } from '../../utils/firestore';

import { Message } from './entity';

const db = firestore();

/**
 * Interface para o repositório de Messages.
 */
export interface MessagesRepositoryI {
    getDocRef(conversationId: string, messageId: string): firestore.DocumentReference<Message>;
    setMessage(conversationId: string, messageId: string, data: Message): Promise<void>;
    updateMessage(conversationId: string, messageId: string, data: Partial<Message>): Promise<void>;
    getMessageById(conversationId: string, messageId: string): Promise<AdminBaseRef<Message> | null>;
}

/**
 * Implementação do repositório para gerenciar Messages no Firestore.
 */
export class MessagesRepositoryServerSDK implements MessagesRepositoryI {

    /**
     * Retorna a referência da coleção para Messages dentro de uma conversation.
     * @param conversationId - O identificador único da conversation.
     * @returns Uma CollectionReference para as Messages.
     */
    private getCollection(conversationId: string): firestore.CollectionReference<Message> {
        return db
            .collection('conversations')
            .doc(conversationId)
            .collection('messages') as firestore.CollectionReference<Message>;
    }

    /**
     * Retorna uma DocumentReference para uma Message pelo seu ID.
     * @param conversationId - O identificador único da conversation.
     * @param messageId - O identificador único da message.
     * @returns Uma DocumentReference para a Message.
     */
    getDocRef(conversationId: string, messageId: string): firestore.DocumentReference<Message> {
        return this.getCollection(conversationId).doc(messageId);
    }

    /**
     * Cria ou sobrescreve um documento Message no Firestore.
     * @param conversationId - O identificador único da conversation.
     * @param messageId - O identificador único da message.
     * @param data - Os dados da Message a serem armazenados.
     * @throws Error se a operação falhar.
     */
    async setMessage(conversationId: string, messageId: string, data: Message): Promise<void> {
        try {
            await this.getDocRef(conversationId, messageId).set(data);
        } catch (error) {
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
    async updateMessage(
        conversationId: string,
        messageId: string,
        data: Partial<Message>
    ): Promise<void> {
        try {
            await this.getDocRef(conversationId, messageId).set(data, { merge: true });
        } catch (error) {
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
    async getMessageById(
        conversationId: string,
        messageId: string
    ): Promise<AdminBaseRef<Message> | null> {
        try {
            const doc = await this.getDocRef(conversationId, messageId).get();
            if (!doc.exists) return null;

            const queryDoc = doc as QueryDocumentSnapshot<Message>;
            return convertDoc(queryDoc);
        } catch (error) {
            throw new Error(`Erro ao buscar Message com ID ${messageId}: ${error}`);
        }
    }
}

export default new MessagesRepositoryServerSDK();
