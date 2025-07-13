/* eslint-disable no-await-in-loop */
import { collection, doc, getDocs, getFirestore, query, setDoc, where, Query, getDoc, updateDoc } from 'firebase/firestore';
import { Job, JobStatus } from './entity';
import { BaseRef } from '..';
import { convertDoc } from 'src/utils/firestore';

interface JobRepositoryI {
    createJob(data: Job): Promise<BaseRef<Job>>;
    updateJob(jobId: string, data: Partial<Job>): Promise<void>;
    updateJobWithUpdate(jobId: string, data: Partial<Job>): Promise<void>;
    getJob(jobId: string): Promise<BaseRef<Job> | null>;
    getJobsByStatus(status: JobStatus, storeId: string): Promise<BaseRef<Job>[]>;
    getJobsByCreator(creatorConversationId: string, storeId: string): Promise<BaseRef<Job>[]>;
    getAllJobs(storeId: string): Promise<BaseRef<Job>[]>;
}

export class JobRepositoryWebSDK implements JobRepositoryI {

    async createJob(data: Job): Promise<BaseRef<Job>> {
        const jobRef = doc(collection(getFirestore(), 'jobs'));
        await setDoc(jobRef, data);

        const jobSnap = await getDoc(jobRef);

        return convertDoc(jobSnap) as BaseRef<Job>;
    }

    async getJob(jobId: string): Promise<BaseRef<Job> | null> {
        const jobRef = doc(
            getFirestore(),
            'jobs',
            jobId
        );

        const jobSnap = await getDoc(jobRef);
        if (!jobSnap.exists()) {
            return null;
        }

        return convertDoc(jobSnap) as BaseRef<Job>;
    }

    async getJobsByStatus(status: JobStatus, storeId: string): Promise<BaseRef<Job>[]> {
        const jobsQuery = query(
            collection(getFirestore(), 'jobs') as unknown as Query<Job>,
            where('status', '==', status),
            where('storeId', '==', storeId)
        );
        const jobsSnap = await getDocs(jobsQuery);

        return jobsSnap.docs.map(doc => convertDoc(doc) as BaseRef<Job>);
    }

    async getJobsByCreator(creatorConversationId: string, storeId: string): Promise<BaseRef<Job>[]> {
        const jobsQuery = query(
            collection(getFirestore(), 'jobs') as unknown as Query<Job>,
            where('creatorConversationId', '==', creatorConversationId),
            where('storeId', '==', storeId)
        );
        const jobsSnap = await getDocs(jobsQuery);

        return jobsSnap.docs.map(doc => convertDoc(doc) as BaseRef<Job>);
    }

    async getAllJobs(storeId: string): Promise<BaseRef<Job>[]> {
        const jobsQuery = query(
            collection(getFirestore(), 'jobs') as unknown as Query<Job>,
            where('storeId', '==', storeId)
        );
        const jobsSnap = await getDocs(jobsQuery);

        return jobsSnap.docs.map(doc => convertDoc(doc) as BaseRef<Job>);
    }

    async updateJob(jobId: string, data: Partial<Job>): Promise<void> {
        const jobRef = doc(
            getFirestore(),
            'jobs',
            jobId
        );

        return setDoc(jobRef, data, { merge: true });
    }

    async updateJobWithUpdate(jobId: string, data: Partial<Job>): Promise<void> {
        const jobRef = doc(
            getFirestore(),
            'jobs',
            jobId
        );

        return updateDoc(jobRef, data);
    }
}

export default new JobRepositoryWebSDK();
