<script setup lang="ts">

</script>

<template>
    <q-layout class="root">
        <q-page-container>
            <router-view v-slot="{ Component }">
                <transition name="slide-left">
                    <component
                        :is="Component"
                    />
                </transition>
            </router-view>
        </q-page-container>
    </q-layout>
</template>

<style scoped lang="scss">
.root {
    --aside-width: max(12.5vw, 30px);
}

@media screen and (min-width: 600px) and (max-width: 1024px) {
    .root {
        --aside-width: 45vw;
    }
}

@media screen and (min-width: 1024px) {
    .root {
        --aside-width: 30vw;
    }
}

/* Mobile responsive adjustments */
@media screen and (max-width: 768px) {
    .aside {
        height: 20vh !important;
        width: 100vw !important;
        top: 0;
        left: 0;
        flex-direction: row;
        border-radius: 0 0 1rem 1rem;
    }

    .aside-img {
        position: static !important;
        width: 100%;
        height: auto;
        clip-path: none !important;
    }

    .q-page-container {
        padding-top: 20vh !important;
        padding-left: 0 !important;
        width: 100vw !important;
    }

    .flex.items-start.justify-center {
        padding: 2rem 1rem !important;
    }

    .logout-btn {
        top: 0.5rem !important;
        left: 0.5rem !important;
    }
}

/* Image clipping for aside */
.aside-img {
    position: absolute;
    height: calc(100% + 350px);
    left: 0;
    top: 0;
    clip-path: inset(0 0 350px 0);
}

/* Deep styling for onboarding content */
.onboarding-content :deep(.page) {
    padding: 0 !important;
    min-height: auto !important;
}

.onboarding-content :deep(.form-container) {
    max-width: none;
    margin: 0;
}

.onboarding-content :deep(.text-h5) {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
}

.onboarding-content :deep(.text-h3) {
    font-size: 2rem;
    margin-bottom: 1.5rem;
}

@media screen and (max-width: 768px) {
    .onboarding-content :deep(.text-h3) {
        font-size: 1.75rem;
    }
}

.onboarding-content :deep(.input-wrapper) {
    margin-bottom: 1.5rem;
}

.onboarding-content :deep(.input-label) {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--q-accent);
    display: block;
    margin-bottom: 0.5rem;
}
</style>
