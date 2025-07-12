/* eslint-disable no-await-in-loop */
import { collection, doc, getDocs, getFirestore, query, setDoc, where, Query, getDoc, updateDoc } from 'firebase/firestore';
import { Store } from './entity';
import { BaseRef } from '..';
import { convertDoc } from 'src/utils/firestore';

interface StoreRepositoryI {
    createStore(data: Store): Promise<BaseRef<Store>>;
    updateStore(storeId: string, data: Partial<Store>): Promise<void>;
    updateStoreWithUpdate(storeId: string, data: Partial<Store>): Promise<void>;
    getStoreFromSlug(slug: string): Promise<BaseRef<Store> | null>;
    getStore(storeId: string): Promise<BaseRef<Store> | null>;
}

export class StoreRepositoryWebSDK implements StoreRepositoryI {

    async createStore(data: Store): Promise<BaseRef<Store>> {
        const storeRef = doc(collection(getFirestore(), 'stores'));
        await setDoc(storeRef, data);

        const storeSnap = await getDoc(storeRef);

        return convertDoc(storeSnap) as BaseRef<Store>;
    }

    async getStoreFromSlug(slug: string) {
        const storesQuery = query(
            collection(getFirestore(), 'stores') as unknown as Query<Store>,
            where('menuSlug', '==', slug)
        );
        const storesSnap = await getDocs(storesQuery);
        const stores = storesSnap.docs;

        if (stores.length > 1) {
            throw (`Slug ${slug} duplicado!`);
        }
        if (!stores.length) return null;

        return convertDoc(stores[0]);
    }

    async getStore(storeId: string): Promise<BaseRef<Store> | null> {
        const storeRef = doc(
            getFirestore(),
            'stores',
            storeId
        );

        const storeSnap = await getDoc(storeRef);
        if (!storeSnap.exists()) {
            return null;
        }

        return convertDoc(storeSnap) as BaseRef<Store>;
    }

    async updateStore(storeId: string, data: Partial<Store>) {
        const storeRef = doc(
            getFirestore(),
            'stores',
            storeId
        );

        return setDoc(storeRef, data, { merge: true });
    }

    async updateStoreWithUpdate(storeId: string, data: Partial<Store>) {
        const storeRef = doc(
            getFirestore(),
            'stores',
            storeId
        );

        return updateDoc(storeRef, data);
    }
}

export default new StoreRepositoryWebSDK();
