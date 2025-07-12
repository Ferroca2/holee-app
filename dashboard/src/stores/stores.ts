import { defineStore } from 'pinia';
import { shallowRef, ref, computed, watch } from 'vue';
import { useSessionStore } from './session';
import {
    collection,
    getFirestore,
    onSnapshot,
    query,
    where,
} from 'firebase/firestore';
import { BaseRef } from 'src/domain';
import { Store } from 'src/domain/stores/entity';
import StoreRepository from 'src/domain/stores/repository';

export const useStoresStore = defineStore('stores', () => {
    const session = useSessionStore();

    const loading = ref(true);

    const stores = ref<BaseRef<Store>[]>([]);

    const storeIdx = ref(0);

    const currentStore = computed(() => stores.value[storeIdx.value] ?? null);

    let unwatchStores: () => void;

    watch(() => session.user, user => {
        unwatchStores?.();

        loading.value = true;
        stores.value = [];

        if (!user) {
            loading.value = false;
            return;
        }

        const qStores = query(
            collection(getFirestore(), 'stores'),
            where('owner.id', '==', user.uid)
        );

        unwatchStores = onSnapshot(qStores, snap => {
            stores.value = snap.docs.map(doc => ({
                id: doc.id,
                $ref: shallowRef(doc.ref),
                ...doc.data(),
            } as never as BaseRef<Store>));

            loading.value = false;
        });
    }, { immediate: true });


    return {
        async updateStore(storeId: string, data: Partial<Store>) {
            return StoreRepository.updateStore(storeId, data);
        },
        setCurrentStore(store: number | BaseRef<Store>) {
            if (typeof store === 'number') {
                if (store < 0 || store >= stores.value.length) {
                    throw new Error('Invalid store index');
                }

                storeIdx.value = store;
            } else {
                const idx = stores.value.findIndex(
                    s => s.id === store.id
                );

                if (idx === -1) throw new Error('Store not found');
            }
        },
        loading,
        stores,
        currentStore,
    };
});
