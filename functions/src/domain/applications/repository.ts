import { firestore } from 'firebase-admin';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { AdminBaseRef } from '../index';
import { convertDoc } from '../../utils/firestore';

import { Application, ApplicationStatus, ApplicationStep } from './entity';

const db = firestore();

/**
 * Interface para o repositório de Applications.
 */
export interface ApplicationsRepositoryI {
    getDocRef(applicationId: string): firestore.DocumentReference<Application>;

    setApplication(applicationId: string, data: Application): Promise<void>;
    updateApplication(applicationId: string, data: Partial<Application>): Promise<void>;

    getApplicationById(applicationId: string): Promise<AdminBaseRef<Application> | null>;
    getApplicationsByStepAndStatus(step: ApplicationStep, status: ApplicationStatus): Promise<AdminBaseRef<Application>[]>;
}

/**
 * Implementação do repositório para gerenciar Applications no Firestore.
 */
export class ApplicationsRepositoryServerSDK implements ApplicationsRepositoryI {

    /**
     * Retorna a referência da coleção para Applications.
     * @returns Uma CollectionReference para as Applications.
     */
    private getCollection(): firestore.CollectionReference<Application> {
        return db.collection('applications') as firestore.CollectionReference<Application>;
    }

    /**
     * Retorna uma DocumentReference para uma Application pelo seu ID.
     * @param applicationId - O identificador único da application.
     * @returns Uma DocumentReference para a Application.
     */
    getDocRef(applicationId: string): firestore.DocumentReference<Application> {
        return this.getCollection().doc(applicationId);
    }

    /**
     * Cria ou sobrescreve um documento Application no Firestore.
     * @param applicationId - O identificador único da application.
     * @param data - Os dados da Application a serem armazenados.
     * @throws Error se a operação falhar.
     */
    async setApplication(applicationId: string, data: Application): Promise<void> {
        try {
            await this.getDocRef(applicationId).set(data);
        } catch (error) {
            throw new Error(`Erro ao definir Application com ID ${applicationId}: ${error}`);
        }
    }

    /**
     * Atualiza um documento Application no Firestore.
     * @param applicationId - O identificador único da application.
     * @param data - Dados parciais para atualizar a Application.
     * @throws Error se a operação de atualização falhar.
     */
    async updateApplication(
        applicationId: string,
        data: Partial<Application>
    ): Promise<void> {
        try {
            await this.getDocRef(applicationId).set(data, { merge: true });
        } catch (error) {
            throw new Error(`Erro ao atualizar Application com ID ${applicationId}: ${error}`);
        }
    }

    /**
     * Busca uma Application pelo seu ID.
     * @param applicationId - O identificador único da application.
     * @returns Os dados da Application envolvidos em AdminBaseRef se encontrados, ou null se não existir.
     * @throws Error se a operação de busca falhar.
     */
    async getApplicationById(
        applicationId: string
    ): Promise<AdminBaseRef<Application> | null> {
        try {
            const doc = await this.getDocRef(applicationId).get();
            if (!doc.exists) return null;

            const queryDoc = doc as QueryDocumentSnapshot<Application>;
            return convertDoc(queryDoc);
        } catch (error) {
            throw new Error(`Erro ao buscar Application com ID ${applicationId}: ${error}`);
        }
    }

    /**
     * Busca Applications por step e status.
     * @param step - Step das applications.
     * @param status - Status das applications.
     * @returns Array de Applications com o step e status especificados.
     * @throws Error se a operação de busca falhar.
     */
    async getApplicationsByStepAndStatus(step: ApplicationStep, status: ApplicationStatus): Promise<AdminBaseRef<Application>[]> {
        try {
            const snapshot = await this.getCollection()
                .where('currentStep', '==', step)
                .where('status', '==', status)
                .get();

            return snapshot.docs.map(doc => convertDoc(doc));
        } catch (error) {
            throw new Error(`Erro ao buscar Applications com step ${step} e status ${status}: ${error}`);
        }
    }
}

export default new ApplicationsRepositoryServerSDK();
