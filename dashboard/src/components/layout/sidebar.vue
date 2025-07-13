<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useSessionStore } from 'stores/session';
import {
    mdiAccountCircleOutline,
    mdiHelpCircleOutline,
    mdiLogout,
    mdiArrowLeft,
} from '@quasar/extras/mdi-v6';
import { useSidebarMenu } from '../../hooks/useSidebarMenu';
import { useStoreSelector } from '../../hooks/useStoreSelector';
import logo from 'assets/logo.png';
import logoWhite from 'assets/logo-white.png';
import miniLogo from 'assets/mini-logo.png';
import miniLogoWhite from 'assets/mini-logo-white.png';

const props = defineProps<{
    modelValue: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
}>();

const router = useRouter();
const $q = useQuasar();
const session = useSessionStore();

const leftDrawerOpen = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value),
});

const drawerBehavior = computed(() => {
    return $q.screen.lt.md ? 'mobile' : 'desktop';
});

const { menuItems, isChildSelected, handleMenuClick } = useSidebarMenu();
const { currentStore, mobileStoreDialog } = useStoreSelector();

// Mini/collapsed state and hover for toggle button
const mini = ref(false);
const toggleBtnHover = ref(false);

// Hydrate mini and leftDrawerOpen from localStorage on mount
onMounted(() => {
    const miniStored = localStorage.getItem('sidebar-mini');
    if (miniStored !== null) mini.value = miniStored === 'true';

    const drawerStored = localStorage.getItem('sidebar-open');
    if (drawerStored !== null) leftDrawerOpen.value = drawerStored === 'true';
});

// Persist mini and leftDrawerOpen to localStorage on change
watch(mini, val => localStorage.setItem('sidebar-mini', String(val)));
watch(leftDrawerOpen, val => localStorage.setItem('sidebar-open', String(val)));

async function logout() {
    await session.logout();
}

// Logo configuration
const logoSrc = computed(() => {
    return $q.dark.isActive ? logoWhite : logo;
});

const miniLogoSrc = computed(() => {
    return $q.dark.isActive ? miniLogoWhite : miniLogo;
});
</script>

<template>
    <q-drawer
        v-model="leftDrawerOpen"
        show-if-above
        side="left"
        :behavior="drawerBehavior"
        bordered
        :mini="mini"
        :width="$q.screen.lt.sm ? $q.screen.width : 240"
        class="mobile-drawer"
    >
        <!-- Floating Expand/Collapse Button -->
        <div
            v-if="$q.screen.gt.sm"
            class="sidebar-toggle-btn"
            @mouseenter="toggleBtnHover = true"
            @mouseleave="toggleBtnHover = false"
            @click="mini = !mini"
        >
            <q-tooltip>
                {{ mini ? 'Expandir' : 'Recolher' }}
            </q-tooltip>
            <q-icon
                :name="toggleBtnHover ? (mini ? 'chevron_right' : 'chevron_left') : 'unfold_more'"
                size="24px"
            />
        </div>

        <!-- Mobile header -->
        <div
            v-if="$q.screen.lt.sm"
            class="row items-center justify-between q-pa-lg"
        >
            <q-btn
                flat
                round
                dense
                icon="close"
                color="grey-7"
                @click="leftDrawerOpen = false"
            />
            <div class="row items-center">
                <q-btn
                    flat
                    round
                    dense
                    :icon="mdiHelpCircleOutline"
                    color="grey-7"
                    @click="router.push('/faq')"
                />
            </div>
        </div>

        <!-- Store info section for mobile -->
        <div
            v-if="$q.screen.lt.sm"
            class="column items-center q-pa-md"
        >
            <q-avatar size="48px">
                <img
                    :src="currentStore.logo"
                    :alt="currentStore.name"
                >
            </q-avatar>
            <div class="text-weight-bold text-grey-9 q-mt-xs">
                {{ currentStore.name }}
            </div>
            <div class="text-caption text-grey">
                Empresa
            </div>
        </div>

        <q-list padding>
            <!-- Desktop store selector -->
            <template v-if="$q.screen.width > 600">
                <q-item
                    clickable
                    class="q-mt-sm q-pb-md menu-item"
                >
                    <q-item-section avatar>
                        <q-avatar size="32px">
                            <img
                                :src="currentStore.logo"
                                :alt="currentStore.name"
                            >
                        </q-avatar>
                    </q-item-section>
                    <q-item-section v-if="!mini">
                        <div class="text-weight-bold text-grey-9">
                            {{ currentStore.name }}
                        </div>
                        <div class="text-caption text-grey">
                            Empresa
                        </div>
                    </q-item-section>
                    <q-item-section
                        v-if="!mini"
                        side
                    >
                        <q-icon
                            name="expand_more"
                            color="grey-7"
                            size="24px"
                        />
                    </q-item-section>

                    <q-menu
                        anchor="bottom left"
                        self="top left"
                    >
                        <q-list
                            style="min-width: 220px"
                            class="q-px-sm q-py-xs"
                        >
                            <q-item class="menu-item">
                                <q-item-section avatar>
                                    <q-avatar size="32px">
                                        <img
                                            :src="currentStore.logo"
                                            :alt="currentStore.name"
                                        >
                                    </q-avatar>
                                </q-item-section>
                                <q-item-section>
                                    <div class="text-weight-bold text-grey-9">
                                        {{ currentStore.name }}
                                    </div>
                                    <div class="text-caption text-grey">
                                        Empresa
                                    </div>
                                </q-item-section>
                            </q-item>
                            <q-separator class="q-my-xs" />
                            <q-item class="menu-item">
                                <q-item-section avatar>
                                    <q-icon
                                        :name="mdiAccountCircleOutline"
                                        color="grey-7"
                                        size="24px"
                                    />
                                </q-item-section>
                                <q-item-section>
                                    <div class="text-grey-9">
                                        {{ session.userInfo?.name || 'Usuário' }}
                                    </div>
                                    <div class="text-caption text-grey">
                                        {{ session.userInfo?.role || 'admin' }}
                                    </div>
                                </q-item-section>
                            </q-item>
                            <q-separator class="q-my-xs" />
                            <q-item
                                v-close-popup
                                clickable
                                class="menu-item"
                                @click="logout"
                            >
                                <q-item-section avatar>
                                    <q-icon
                                        :name="mdiLogout"
                                        color="grey-7"
                                        size="24px"
                                    />
                                </q-item-section>
                                <q-item-section>
                                    <div class="text-grey-9">
                                        Sair
                                    </div>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-menu>
                </q-item>
            </template>

            <!-- Navigation menu -->
            <div class="q-mt-lg">
                <q-item
                    v-for="item in menuItems"
                    :key="item.label"
                    v-ripple
                    clickable
                    :to="item.route"
                    exact
                    :class="[
                        'q-py-xs menu-item',
                        {
                            'menu-item-selected': isChildSelected(item)
                        }
                    ]"
                    @click="handleMenuClick(item)"
                >
                    <q-item-section avatar>
                        <q-icon
                            :name="item.icon"
                            :color="isChildSelected(item) ? 'accent' : 'grey-7'"
                            size="24px"
                        />
                    </q-item-section>
                    <q-item-section v-if="!mini">
                        <span
                            :class="isChildSelected(item) ? 'text-accent text-weight-bold' : 'text-grey-9'"
                        >{{ item.label }}</span>
                    </q-item-section>
                </q-item>
            </div>
        </q-list>

        <!-- Mobile menu dialog -->
        <q-dialog
            v-model="mobileStoreDialog"
            maximized
            persistent
        >
            <q-card style="height: 100vh; border-radius: 0; font-size: 18px; background-color: var(--app-bg-surface) !important;">
                <div class="q-pa-lg q-gutter-x-md">
                    <q-btn
                        flat
                        round
                        dense
                        :icon="mdiArrowLeft"
                        color="grey-7"
                        @click="mobileStoreDialog = false"
                    />
                </div>
                <q-list
                    style="min-width: 220px"
                    class="q-pa-md"
                >
                    <q-item
                        clickable
                        class="menu-item"
                    >
                        <q-item-section avatar>
                            <q-icon
                                :name="mdiAccountCircleOutline"
                                color="grey-7"
                                size="sm"
                            />
                        </q-item-section>
                        <q-item-section>
                            <div class="text-grey-9">
                                {{ session.userInfo?.name || 'Usuário' }}
                            </div>
                            <div class="text-caption text-grey">
                                {{ session.userInfo?.role || 'admin' }}
                            </div>
                        </q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item
                        v-close-popup
                        clickable
                        @click="logout"
                    >
                        <q-item-section avatar>
                            <q-icon
                                :name="mdiLogout"
                                color="grey-7"
                                size="sm"
                            />
                        </q-item-section>
                        <q-item-section>
                            <div class="text-grey-9">
                                Sair
                            </div>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-card>
        </q-dialog>

        <!-- Logo footer -->
        <div class="sidebar-footer">
            <div
                v-if="!mini"
                class="powered-by-section"
            >
                <div class="text-caption text-grey-6 q-mb-xs">
                    powered by
                </div>
                <q-img
                    :src="logoSrc"
                    class="powered-by-logo"
                    style="width: 80px; height: auto;"
                />
            </div>

            <div
                v-else
                class="mini-logo-section"
            >
                <q-img
                    :src="miniLogoSrc"
                    class="mini-logo"
                />
            </div>
        </div>
    </q-drawer>
</template>

<style scoped lang="scss">
.menu-item {
    min-height: 40px;
    padding: 8px;
    font-weight: normal;
    border-radius: 10px;
    color: var(--app-text-primary);

    &:hover {
        background: var(--app-bg-elevated);
    }
}

.menu-item-selected {
    color: var(--app-accent) !important;
    font-weight: 600 !important;
}

.q-item__section--avatar {
    min-width: auto;
    padding-right: 8px;
}

:deep(.q-drawer) {
    background-color: var(--app-bg-surface);

    .q-list {
        padding: 0px 10px;
    }

    .q-item {
        min-height: 40px;
        padding: 8px 12px;

        &:hover {
            background: var(--app-bg-elevated);
        }
    }

    @media (max-width: 600px) {
        font-size: 18px !important;

        .q-list {
            padding: 20px;
        }
    }
}

.sidebar-toggle-btn {
    position: absolute;
    top: 50%;
    right: -26px;
    transform: translateY(-50%);
    background: var(--app-bg-surface);
    border-radius: 8px;
    width: 20px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: background 0.2s;

    &:hover {
        background: var(--app-bg-elevated);
    }
}

@media (max-width: 768px) {
    .mobile-drawer {
        width: 100% !important;
    }
}

.sidebar-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px;
    background-color: var(--app-bg-surface);
    border-top: 1px solid var(--app-border);
    transition: all var(--transition-base);
}

.powered-by-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;

    .text-caption {
        font-size: 10px;
        letter-spacing: 0.5px;
        text-transform: lowercase;
        opacity: 0.7;
    }
}

.powered-by-logo {
    max-width: 80px;
    height: auto;
    opacity: 0.8;
    transition: opacity var(--transition-base);

    &:hover {
        opacity: 1;
    }
}

.mini-logo-section {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px;
}

.mini-logo {
    max-width: 32px;
    height: auto;
    opacity: 0.8;
    transition: opacity var(--transition-base);

    &:hover {
        opacity: 1;
    }
}

:deep(.q-drawer__content) {
    padding-bottom: 80px;
}

:deep(.q-menu) {
    background-color: var(--app-bg-surface);
    border: 1px solid var(--app-border);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
