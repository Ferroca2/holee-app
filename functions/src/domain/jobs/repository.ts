import { firestore } from 'firebase-admin';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { AdminBaseRef } from '../index';
import { convertDoc } from '../../utils/firestore';

import { Job } from './entity';

const db = firestore();

/**
 * Interface para o repositório de Jobs.
 */
export interface JobsRepositoryI {
    getDocRef(jobId: string): firestore.DocumentReference<Job>;

    setJob(jobId: string, data: Job): Promise<void>;
    updateJob(jobId: string, data: Partial<Job>): Promise<void>;

    getJobById(jobId: string): Promise<AdminBaseRef<Job> | null>;
    getJobsByStore(storeId: string): Promise<AdminBaseRef<Job>[]>;
    getCurrentOpenJobs(): Promise<AdminBaseRef<Job>[]>;
}

/**
 * Implementação do repositório para gerenciar Jobs no Firestore.
 */
export class JobsRepositoryServerSDK implements JobsRepositoryI {

    /**
     * Retorna a referência da coleção para Jobs.
     * @returns Uma CollectionReference para os Jobs.
     */
    private getCollection(): firestore.CollectionReference<Job> {
        return db.collection('jobs') as firestore.CollectionReference<Job>;
    }

    /**
     * Retorna uma DocumentReference para um Job pelo seu ID.
     * @param jobId - O identificador único do job.
     * @returns Uma DocumentReference para o Job.
     */
    getDocRef(jobId: string): firestore.DocumentReference<Job> {
        return this.getCollection().doc(jobId);
    }

    /**
     * Cria ou sobrescreve um documento Job no Firestore.
     * @param jobId - O identificador único do job.
     * @param data - Os dados do Job a serem armazenados.
     * @throws Error se a operação falhar.
     */
    async setJob(jobId: string, data: Job): Promise<void> {
        try {
            await this.getDocRef(jobId).set(data);
        } catch (error) {
            throw new Error(`Erro ao definir Job com ID ${jobId}: ${error}`);
        }
    }

    /**
     * Atualiza um documento Job no Firestore.
     * @param jobId - O identificador único do job.
     * @param data - Dados parciais para atualizar o Job.
     * @throws Error se a operação de atualização falhar.
     */
    async updateJob(
        jobId: string,
        data: Partial<Job>
    ): Promise<void> {
        try {
            await this.getDocRef(jobId).set(data, { merge: true });
        } catch (error) {
            throw new Error(`Erro ao atualizar Job com ID ${jobId}: ${error}`);
        }
    }

    /**
     * Busca um Job pelo seu ID.
     * @param jobId - O identificador único do job.
     * @returns Os dados do Job envolvidos em AdminBaseRef se encontrados, ou null se não existir.
     * @throws Error se a operação de busca falhar.
     */
    async getJobById(
        jobId: string
    ): Promise<AdminBaseRef<Job> | null> {
        try {
            const doc = await this.getDocRef(jobId).get();
            if (!doc.exists) return null;

            const queryDoc = doc as QueryDocumentSnapshot<Job>;
            return convertDoc(queryDoc);
        } catch (error) {
            throw new Error(`Erro ao buscar Job com ID ${jobId}: ${error}`);
        }
    }

    /**
     * Busca todos os Jobs de uma Store específica.
     * @param storeId - O identificador único da store.
     * @returns Array de Jobs da store.
     * @throws Error se a operação de busca falhar.
     */
    async getJobsByStore(storeId: string): Promise<AdminBaseRef<Job>[]> {
        try {
            const snapshot = await this.getCollection()
                .where('storeId', '==', storeId)
                .get();

            return snapshot.docs.map(doc => convertDoc(doc));
        } catch (error) {
            throw new Error(`Erro ao buscar Jobs da Store ${storeId}: ${error}`);
        }
    }

    /**
     * Busca Jobs que estão abertos e dentro do período de aplicação.
     * @returns Array de Jobs abertos e válidos no momento atual.
     * @throws Error se a operação de busca falhar.
     */
    async getCurrentOpenJobs(): Promise<AdminBaseRef<Job>[]> {
        try {
            const now = Date.now();
            const snapshot = await this.getCollection()
                .where('status', '==', 'open')
                .where('applyStart', '<=', now)
                .where('applyEnd', '>=', now)
                .orderBy('applyStart', 'asc')
                .get();

            return snapshot.docs.map(doc => convertDoc(doc));
        } catch (error) {
            throw new Error(`Erro ao buscar Jobs abertos e válidos: ${error}`);
        }
    }
}

export default new JobsRepositoryServerSDK();
