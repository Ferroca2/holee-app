<script lang="ts">
import { defineComponent } from 'vue';
import { useStoresStore } from 'stores/stores';
import resolveWhen from 'utils/resolveWhen';

export default defineComponent({
    async preFetch({ store }) {
        const stores = useStoresStore(store);

        await resolveWhen(() => !stores.loading);
    },
});
</script>

<script setup lang="ts">
import { ref } from 'vue';
import Navbar from 'components/layout/navbar.vue';
import Sidebar from 'components/layout/sidebar.vue';

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
    leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>

<template>
    <q-layout view="lHh lpR fFf">
        <navbar @toggle-drawer="toggleLeftDrawer" />
        <sidebar v-model="leftDrawerOpen" />

        <q-page-container class="scroll">
            <router-view />
        </q-page-container>
    </q-layout>
</template>

<style scoped lang="scss">
.scroll {
    overflow-y: auto;
    height: 100vh;
    background-color: transparent;
}
</style>
