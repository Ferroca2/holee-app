import { ref, computed } from 'vue';
import { useStoresStore } from 'stores/stores';
import { useSessionStore } from 'stores/session';

export function useStoreSelector() {
    const session = useSessionStore();
    const stores = useStoresStore();

    const mobileStoreDialog = ref(false);

    // Simple store info
    const currentStore = computed(() => ({
        id: stores.currentStore.id,
        name: stores.currentStore.name,
        logo: stores.currentStore.logo,
    }));

    return {
        currentStore,
        mobileStoreDialog,
    };
}
