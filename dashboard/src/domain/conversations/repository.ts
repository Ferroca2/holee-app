/* eslint-disable no-await-in-loop */
import { collection, doc, getDocs, getFirestore, query, setDoc, where, Query, getDoc, updateDoc, orderBy, limit } from 'firebase/firestore';
import { Conversation, ConversationRole } from './entity';
import { BaseRef } from '..';
import { convertDoc } from 'src/utils/firestore';

interface ConversationRepositoryI {
    createConversation(data: Conversation): Promise<BaseRef<Conversation>>;
    updateConversation(conversationId: string, data: Partial<Conversation>): Promise<void>;
    updateConversationWithUpdate(conversationId: string, data: Partial<Conversation>): Promise<void>;
    getConversation(conversationId: string): Promise<BaseRef<Conversation> | null>;
    getConversationsByRole(role: ConversationRole): Promise<BaseRef<Conversation>[]>;
    getConversationsByJob(jobId: string): Promise<BaseRef<Conversation>[]>;
    getConversationsByEmploymentStatus(employed: boolean): Promise<BaseRef<Conversation>[]>;
    getConversationsByProfileCompleted(profileCompleted: boolean): Promise<BaseRef<Conversation>[]>;
    getRecentConversations(limitCount?: number): Promise<BaseRef<Conversation>[]>;
    getAllConversations(): Promise<BaseRef<Conversation>[]>;
}

export class ConversationRepositoryWebSDK implements ConversationRepositoryI {

    async createConversation(data: Conversation): Promise<BaseRef<Conversation>> {
        const conversationRef = doc(collection(getFirestore(), 'conversations'));
        await setDoc(conversationRef, data);

        const conversationSnap = await getDoc(conversationRef);

        return convertDoc(conversationSnap) as BaseRef<Conversation>;
    }

    async getConversation(conversationId: string): Promise<BaseRef<Conversation> | null> {
        const conversationRef = doc(
            getFirestore(),
            'conversations',
            conversationId
        );

        const conversationSnap = await getDoc(conversationRef);
        if (!conversationSnap.exists()) {
            return null;
        }

        return convertDoc(conversationSnap) as BaseRef<Conversation>;
    }

    async getConversationsByRole(role: ConversationRole): Promise<BaseRef<Conversation>[]> {
        const conversationsQuery = query(
            collection(getFirestore(), 'conversations') as unknown as Query<Conversation>,
            where('role', '==', role)
        );
        const conversationsSnap = await getDocs(conversationsQuery);

        return conversationsSnap.docs.map(doc => convertDoc(doc) as BaseRef<Conversation>);
    }

    async getConversationsByJob(jobId: string): Promise<BaseRef<Conversation>[]> {
        const conversationsQuery = query(
            collection(getFirestore(), 'conversations') as unknown as Query<Conversation>,
            where('subscribedJobIds', 'array-contains', jobId)
        );
        const conversationsSnap = await getDocs(conversationsQuery);

        return conversationsSnap.docs.map(doc => convertDoc(doc) as BaseRef<Conversation>);
    }

    async getConversationsByEmploymentStatus(employed: boolean): Promise<BaseRef<Conversation>[]> {
        const conversationsQuery = query(
            collection(getFirestore(), 'conversations') as unknown as Query<Conversation>,
            where('employed', '==', employed)
        );
        const conversationsSnap = await getDocs(conversationsQuery);

        return conversationsSnap.docs.map(doc => convertDoc(doc) as BaseRef<Conversation>);
    }

    async getConversationsByProfileCompleted(profileCompleted: boolean): Promise<BaseRef<Conversation>[]> {
        const conversationsQuery = query(
            collection(getFirestore(), 'conversations') as unknown as Query<Conversation>,
            where('profileCompleted', '==', profileCompleted)
        );
        const conversationsSnap = await getDocs(conversationsQuery);

        return conversationsSnap.docs.map(doc => convertDoc(doc) as BaseRef<Conversation>);
    }

    async getRecentConversations(limitCount = 50): Promise<BaseRef<Conversation>[]> {
        const conversationsQuery = query(
            collection(getFirestore(), 'conversations') as unknown as Query<Conversation>,
            orderBy('lastMessageTimestamp', 'desc'),
            limit(limitCount)
        );
        const conversationsSnap = await getDocs(conversationsQuery);

        return conversationsSnap.docs.map(doc => convertDoc(doc) as BaseRef<Conversation>);
    }

    async getAllConversations(): Promise<BaseRef<Conversation>[]> {
        const conversationsQuery = query(
            collection(getFirestore(), 'conversations') as unknown as Query<Conversation>
        );
        const conversationsSnap = await getDocs(conversationsQuery);

        return conversationsSnap.docs.map(doc => convertDoc(doc) as BaseRef<Conversation>);
    }

    async updateConversation(conversationId: string, data: Partial<Conversation>): Promise<void> {
        const conversationRef = doc(
            getFirestore(),
            'conversations',
            conversationId
        );

        return setDoc(conversationRef, data, { merge: true });
    }

    async updateConversationWithUpdate(conversationId: string, data: Partial<Conversation>): Promise<void> {
        const conversationRef = doc(
            getFirestore(),
            'conversations',
            conversationId
        );

        return updateDoc(conversationRef, data);
    }
}

export default new ConversationRepositoryWebSDK();
