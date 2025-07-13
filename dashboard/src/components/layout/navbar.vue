<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, ref } from 'vue';
import {
    mdiHelpCircleOutline,
    mdiCogOutline,
    mdiWeatherNight,
    mdiWeatherSunny,
    mdiClose,
} from '@quasar/extras/mdi-v6';
import miniLogo from 'assets/mini-logo.png';
import miniLogoWhite from 'assets/mini-logo-white.png';
import BaseInput from '../ui/base-input.vue';
import { useGlobalSearch, SearchResult } from '../../hooks/useGlobalSearch';

defineEmits<{
    (e: 'toggle-drawer'): void;
}>();

const $q = useQuasar();

// Global search functionality
const {
    searchQuery,
    isSearchFocused,
    filteredResults,
    navigateToPage,
    clearSearch,
} = useGlobalSearch();

const searchInputRef = ref<InstanceType<typeof BaseInput> | null>(null);

const logoSrc = computed(() => {
    // Simple placeholder logo logic
    return $q.dark.isActive ? miniLogoWhite : miniLogo;
});

// Handle search input focus
const handleSearchFocus = () => {
    isSearchFocused.value = true;
};

const handleSearchBlur = () => {
    // Delay to allow click on results
    setTimeout(() => {
        isSearchFocused.value = false;
    }, 300);
};

// Prevent blur when clicking on dropdown
const handleDropdownMouseDown = (event: MouseEvent) => {
    event.preventDefault();
};

// Handle keyboard navigation
const handleSearchKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
        clearSearch();
        searchInputRef.value?.qInputRef?.blur();
    }
};

// Handle result click
const handleResultClick = (result: SearchResult) => {
    navigateToPage(result);
    // Remove focus from search input
    if (searchInputRef.value?.qInputRef) {
        searchInputRef.value.qInputRef.blur();
    }
};

// Handle clear button click
const handleClearClick = () => {
    clearSearch();
};
</script>

<template>
    <q-header
        class="header q-px-lg q-py-xs"
        :class="{ 'q-px-xl': $q.screen.width >= 1024 }"
    >
        <q-toolbar>
            <q-btn
                dense
                flat
                round
                icon="menu"
                class="lt-md"
                color="grey-7"
                @click="$emit('toggle-drawer')"
            />

            <q-space />

            <!-- Mobile Logo -->
            <div
                v-if="$q.screen.width <= 768"
                class="mobile-logo-container"
            >
                <img
                    :src="logoSrc"
                    alt="Logo"
                    class="mobile-logo"
                >
            </div>

            <!-- Search Container -->
            <div
                v-if="$q.screen.width > 768"
                class="global-search-container"
            >
                <!-- Search Input using BaseInput -->
                <div class="search-input-wrapper">
                    <base-input
                        ref="searchInputRef"
                        v-model="searchQuery"
                        placeholder="Pesquisar páginas..."
                        type="search"
                        prepend-icon="search"
                        class="global-search-input"
                        @focus="handleSearchFocus"
                        @blur="handleSearchBlur"
                        @keydown="handleSearchKeydown"
                    >
                        <template #append>
                            <q-icon
                                v-if="searchQuery"
                                :name="mdiClose"
                                color="grey-6"
                                size="18px"
                                class="cursor-pointer"
                                @click="handleClearClick"
                            />
                        </template>
                    </base-input>
                </div>

                <!-- Search Results Dropdown -->
                <div
                    v-if="isSearchFocused && (filteredResults.length > 0 || searchQuery.trim())"
                    class="search-results-dropdown"
                    @mousedown="handleDropdownMouseDown"
                >
                    <!-- No Results State -->
                    <div
                        v-if="filteredResults.length === 0 && searchQuery.trim()"
                        class="no-results-state"
                    >
                        <q-icon
                            name="search"
                            color="grey-5"
                            size="20px"
                        />
                        <span class="text-grey-6">Nenhum resultado encontrado</span>
                    </div>

                    <!-- Search Results -->
                    <div
                        v-for="result in filteredResults"
                        :key="result.id"
                        class="search-result-item"
                        @click="handleResultClick(result)"
                    >
                        <q-icon
                            :name="result.icon"
                            color="accent"
                            size="20px"
                            class="result-icon"
                        />
                        <div class="result-content">
                            <div class="result-title">
                                {{ result.title }}
                            </div>
                            <div class="result-description">
                                {{ result.description }}
                            </div>
                        </div>
                        <div class="result-category">
                            {{ result.category }}
                        </div>
                    </div>
                </div>
            </div>

            <q-space />

            <!-- Action buttons -->
            <template v-if="$q.screen.width > 500">
                <q-btn
                    flat
                    round
                    dense
                    :icon="$q.dark.isActive ? mdiWeatherSunny : mdiWeatherNight"
                    color="grey-7"
                    class="q-mr-sm"
                    @click="$q.dark.toggle()"
                >
                    <q-tooltip>
                        {{ $q.dark.isActive ? 'Modo claro' : 'Modo escuro' }}
                    </q-tooltip>
                </q-btn>
                <q-btn
                    flat
                    round
                    dense
                    :icon="mdiCogOutline"
                    color="grey-7"
                    class="q-mr-md"
                />
            </template>

            <!-- Add button -->
            <q-btn
                round
                dense
                color="accent"
                icon="add"
                class="q-ml-auto"
                size="sm"
            >
                <q-menu
                    anchor="bottom right"
                    self="top right"
                    :offset="[0, 10]"
                    class="shortcut-menu"
                >
                    <q-list
                        style="min-width: 200px;"
                        class="q-py-xs q-px-sm"
                    >
                        <q-item
                            v-close-popup
                            clickable
                            dense
                        >
                            <q-item-section avatar>
                                <q-icon
                                    name="celebration"
                                    color="accent"
                                    size="22px"
                                />
                            </q-item-section>
                            <q-item-section>
                                <span class="text-weight-bold text-grey-9">Criar item</span>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-menu>
            </q-btn>
        </q-toolbar>
    </q-header>
</template>

<style scoped lang="scss">
.header {
    background: var(--app-bg-surface);
}

.global-search-container {
    position: relative;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
}

.search-input-wrapper {
    width: 100%;
}

.global-search-input {
    width: 100%;

    :deep(.q-field__control) {
        border-radius: 8px;
    }
}

.search-results-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: var(--app-bg-surface);
    border: 1px solid var(--app-border);
    border-radius: 10px;
    box-shadow: 0 8px 32px var(--app-shadow);
    z-index: 1000;
    max-height: 400px;
    overflow-y: auto;
    margin-top: 4px;

    // Custom scrollbar
    &::-webkit-scrollbar {
        width: 4px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background: var(--app-border);
        border-radius: 2px;
    }
}

.no-results-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 20px;
    color: var(--app-text-secondary);
    font-size: 12px;
}

.search-result-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    cursor: pointer;
    border-bottom: 1px solid var(--app-border);
    transition: background-color var(--transition-fast);

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background-color: var(--app-bg-elevated);
    }

    .result-icon {
        flex-shrink: 0;
    }

    .result-content {
        flex: 1;
        min-width: 0;

        .result-title {
            font-size: 12px;
            font-weight: 600;
            color: var(--app-text-primary);
            margin-bottom: 2px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .result-description {
            font-size: 11px;
            color: var(--app-text-secondary);
            line-height: 1.3;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    .result-category {
        flex-shrink: 0;
        font-size: 10px;
        color: var(--app-text-secondary);
        background-color: var(--app-bg-elevated);
        padding: 2px 6px;
        border-radius: 4px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 500;
    }
}

.mobile-logo-container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
}

.mobile-logo {
    height: 32px;
    width: auto;
    max-width: 120px;
}

.shortcut-menu {
    border-radius: 10px;
    background-color: var(--app-bg-surface);

    .q-item {
        padding: 8px 12px;
        border-radius: 5px;
        font-size: 14px;

        @media (max-width: 500px) {
            font-size: 16px;
        }

        &:hover {
            background: var(--app-bg-elevated);
        }
    }
}

// Interactive elements
.cursor-pointer {
    cursor: pointer;
    transition: opacity 0.2s ease;

    &:hover {
        opacity: 0.7;
    }
}

// Responsive adjustments
@media (max-width: 768px) {
    .global-search-container {
        display: none;
    }
}

@media (min-width: 769px) and (max-width: 1024px) {
    .global-search-container {
        max-width: 300px;
    }

    .search-result-item {
        padding: 10px 14px;

        .result-content {
            .result-title {
                font-size: 11px;
            }

            .result-description {
                font-size: 10px;
            }
        }

        .result-category {
            font-size: 9px;
            padding: 1px 4px;
        }
    }
}

@media (min-width: 1025px) {
    .global-search-container {
        max-width: 450px;
    }
}
</style>
