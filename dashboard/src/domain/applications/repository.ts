/* eslint-disable no-await-in-loop */
import { collection, doc, getDocs, getFirestore, query, setDoc, where, Query, getDoc, updateDoc } from 'firebase/firestore';
import { Application, ApplicationStatus, ApplicationStep } from './entity';
import { BaseRef } from '..';
import { convertDoc } from 'src/utils/firestore';

interface ApplicationRepositoryI {
    createApplication(data: Application): Promise<BaseRef<Application>>;
    updateApplication(applicationId: string, data: Partial<Application>): Promise<void>;
    updateApplicationWithUpdate(applicationId: string, data: Partial<Application>): Promise<void>;
    getApplication(applicationId: string): Promise<BaseRef<Application> | null>;
    getApplicationsByStatus(status: ApplicationStatus): Promise<BaseRef<Application>[]>;
    getApplicationsByStep(step: ApplicationStep): Promise<BaseRef<Application>[]>;
    getApplicationsByJob(jobId: string): Promise<BaseRef<Application>[]>;
    getApplicationsByConversation(conversationId: string): Promise<BaseRef<Application>[]>;
    getApplicationsByJobAndConversation(jobId: string, conversationId: string): Promise<BaseRef<Application> | null>;
    getAllApplications(): Promise<BaseRef<Application>[]>;
}

export class ApplicationRepositoryWebSDK implements ApplicationRepositoryI {

    async createApplication(data: Application): Promise<BaseRef<Application>> {
        const applicationRef = doc(collection(getFirestore(), 'applications'));
        await setDoc(applicationRef, data);

        const applicationSnap = await getDoc(applicationRef);

        return convertDoc(applicationSnap) as BaseRef<Application>;
    }

    async getApplication(applicationId: string): Promise<BaseRef<Application> | null> {
        const applicationRef = doc(
            getFirestore(),
            'applications',
            applicationId
        );

        const applicationSnap = await getDoc(applicationRef);
        if (!applicationSnap.exists()) {
            return null;
        }

        return convertDoc(applicationSnap) as BaseRef<Application>;
    }

    async getApplicationsByStatus(status: ApplicationStatus): Promise<BaseRef<Application>[]> {
        const applicationsQuery = query(
            collection(getFirestore(), 'applications') as unknown as Query<Application>,
            where('status', '==', status)
        );
        const applicationsSnap = await getDocs(applicationsQuery);

        return applicationsSnap.docs.map(doc => convertDoc(doc) as BaseRef<Application>);
    }

    async getApplicationsByStep(step: ApplicationStep): Promise<BaseRef<Application>[]> {
        const applicationsQuery = query(
            collection(getFirestore(), 'applications') as unknown as Query<Application>,
            where('currentStep', '==', step)
        );
        const applicationsSnap = await getDocs(applicationsQuery);

        return applicationsSnap.docs.map(doc => convertDoc(doc) as BaseRef<Application>);
    }

    async getApplicationsByJob(jobId: string): Promise<BaseRef<Application>[]> {
        const applicationsQuery = query(
            collection(getFirestore(), 'applications') as unknown as Query<Application>,
            where('jobId', '==', jobId)
        );
        const applicationsSnap = await getDocs(applicationsQuery);

        return applicationsSnap.docs.map(doc => convertDoc(doc) as BaseRef<Application>);
    }

    async getApplicationsByConversation(conversationId: string): Promise<BaseRef<Application>[]> {
        const applicationsQuery = query(
            collection(getFirestore(), 'applications') as unknown as Query<Application>,
            where('conversationId', '==', conversationId)
        );
        const applicationsSnap = await getDocs(applicationsQuery);

        return applicationsSnap.docs.map(doc => convertDoc(doc) as BaseRef<Application>);
    }

    async getApplicationsByJobAndConversation(jobId: string, conversationId: string): Promise<BaseRef<Application> | null> {
        const applicationsQuery = query(
            collection(getFirestore(), 'applications') as unknown as Query<Application>,
            where('jobId', '==', jobId),
            where('conversationId', '==', conversationId)
        );
        const applicationsSnap = await getDocs(applicationsQuery);

        if (applicationsSnap.empty) {
            return null;
        }

        return convertDoc(applicationsSnap.docs[0]) as BaseRef<Application>;
    }

    async getAllApplications(): Promise<BaseRef<Application>[]> {
        const applicationsQuery = query(
            collection(getFirestore(), 'applications') as unknown as Query<Application>
        );
        const applicationsSnap = await getDocs(applicationsQuery);

        return applicationsSnap.docs.map(doc => convertDoc(doc) as BaseRef<Application>);
    }

    async updateApplication(applicationId: string, data: Partial<Application>): Promise<void> {
        const applicationRef = doc(
            getFirestore(),
            'applications',
            applicationId
        );

        return setDoc(applicationRef, data, { merge: true });
    }

    async updateApplicationWithUpdate(applicationId: string, data: Partial<Application>): Promise<void> {
        const applicationRef = doc(
            getFirestore(),
            'applications',
            applicationId
        );

        return updateDoc(applicationRef, data);
    }
}

export default new ApplicationRepositoryWebSDK();
