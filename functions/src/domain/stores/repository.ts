import { firestore } from 'firebase-admin';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { AdminBaseRef } from '../index';
import { convertDoc } from '../../utils/firestore';

import { Store } from './entity';

const db = firestore();

/**
 * Interface para o repositório de Stores.
 */
export interface StoresRepositoryI {
    getDocRef(storeId: string): firestore.DocumentReference<Store>;
    setStore(storeId: string, data: Store): Promise<void>;
    updateStore(storeId: string, data: Partial<Store>): Promise<void>;
    getStoreById(storeId: string): Promise<AdminBaseRef<Store> | null>;
    getAllStores(): Promise<AdminBaseRef<Store>[]>;
}

/**
 * Implementação do repositório para gerenciar Stores no Firestore.
 */
export class StoresRepositoryServerSDK implements StoresRepositoryI {

    /**
     * Retorna a referência da coleção para Stores.
     * @returns Uma CollectionReference para as Stores.
     */
    private getCollection(): firestore.CollectionReference<Store> {
        return db.collection('stores') as firestore.CollectionReference<Store>;
    }

    /**
     * Retorna todas as Stores.
     * @returns Todas as Stores.
     */
    async getAllStores(): Promise<AdminBaseRef<Store>[]> {
        const stores = await this.getCollection().get();
        return stores.docs.map(doc => convertDoc(doc as QueryDocumentSnapshot<Store>));
    }

    /**
     * Retorna uma DocumentReference para uma Store pelo seu ID.
     * @param storeId - O identificador único da store.
     * @returns Uma DocumentReference para a Store.
     */
    getDocRef(storeId: string): firestore.DocumentReference<Store> {
        return this.getCollection().doc(storeId);
    }

    /**
     * Cria ou sobrescreve um documento Store no Firestore.
     * @param storeId - O identificador único da store.
     * @param data - Os dados da Store a serem armazenados.
     * @throws Error se a operação falhar.
     */
    async setStore(storeId: string, data: Store): Promise<void> {
        try {
            await this.getDocRef(storeId).set(data);
        } catch (error) {
            throw new Error(`Erro ao definir Store com ID ${storeId}: ${error}`);
        }
    }

    /**
     * Atualiza um documento Store no Firestore.
     * @param storeId - O identificador único da store.
     * @param data - Dados parciais para atualizar a Store.
     * @throws Error se a operação de atualização falhar.
     */
    async updateStore(
        storeId: string,
        data: Partial<Store>
    ): Promise<void> {
        try {
            await this.getDocRef(storeId).set(data, { merge: true });
        } catch (error) {
            throw new Error(`Erro ao atualizar Store com ID ${storeId}: ${error}`);
        }
    }

    /**
     * Busca uma Store pelo seu ID.
     * @param storeId - O identificador único da store.
     * @returns Os dados da Store envolvidos em AdminBaseRef se encontrados, ou null se não existir.
     * @throws Error se a operação de busca falhar.
     */
    async getStoreById(
        storeId: string
    ): Promise<AdminBaseRef<Store> | null> {
        try {
            const doc = await this.getDocRef(storeId).get();
            if (!doc.exists) return null;

            const queryDoc = doc as QueryDocumentSnapshot<Store>;
            return convertDoc(queryDoc);
        } catch (error) {
            throw new Error(`Erro ao buscar Store com ID ${storeId}: ${error}`);
        }
    }
}

export default new StoresRepositoryServerSDK();
