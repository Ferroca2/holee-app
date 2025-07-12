<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { BaseRef } from '../domain';
import { Job, JobStatus } from '../domain/jobs/entity';
import jobRepository from '../domain/jobs/repository';
import useError from '../hooks/useError';
import useSuccess from '../hooks/useSuccess';
import useConfirm from '../hooks/useConfirm';
import { useStandardLayout } from '../hooks/useStandardLayout';
import BaseButton from '../components/ui/base-button.vue';
import BaseInput from '../components/ui/base-input.vue';
import TabComponent from '../components/ui/tab-component.vue';
import JobsTable from '../components/ui/jobs-table.vue';
import JobDialog from '../components/ui/job-dialog.vue';
import { useStoresStore } from 'stores/stores';
import { useSessionStore } from 'stores/session';

const error = useError();
const success = useSuccess();
const confirm = useConfirm();
const loading = ref(false);
const activeTab = ref('open');

const storesStore = useStoresStore();
const sessionStore = useSessionStore();

// Use standard layout
const {
    pageClasses,
    headerClasses,
    titleClasses,
    searchSectionClasses,
    emptyStateClasses,
    paginationSectionClasses,
    isMobile,
    searchInputClasses,
    filterButtonsClasses,
} = useStandardLayout();

// Define tabs
const tabs = [
    { name: 'open', label: 'Vagas Abertas' },
    { name: 'closed', label: 'Vagas Fechadas' },
];

// Jobs data
const openJobs = ref<BaseRef<Job>[]>([]);
const closedJobs = ref<BaseRef<Job>[]>([]);
const loadingOpen = ref(false);
const loadingClosed = ref(false);

// Search and filters
const searchQuery = ref('');
const selectedCreator = ref('');

// Dialog states
const showJobDialog = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const selectedJob = ref<BaseRef<Job> | null>(null);

// Computed properties for filtered jobs
const filteredOpenJobs = computed(() => {
    return openJobs.value.filter(job => {
        const matchesSearch = !searchQuery.value ||
            job.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            job.description.toLowerCase().includes(searchQuery.value.toLowerCase());

        const matchesCreator = !selectedCreator.value ||
            job.creatorConversationId === selectedCreator.value;

        return matchesSearch && matchesCreator;
    });
});

const filteredClosedJobs = computed(() => {
    return closedJobs.value.filter(job => {
        const matchesSearch = !searchQuery.value ||
            job.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            job.description.toLowerCase().includes(searchQuery.value.toLowerCase());

        const matchesCreator = !selectedCreator.value ||
            job.creatorConversationId === selectedCreator.value;

        return matchesSearch && matchesCreator;
    });
});

// Get unique creators for filter
const creatorOptions = computed(() => {
    const allJobs = [...openJobs.value, ...closedJobs.value];
    const creators = new Set<string>();
    allJobs.forEach(job => {
        if (job.creatorConversationId) {
            creators.add(job.creatorConversationId);
        }
    });
    return Array.from(creators).map(creator => ({
        label: creator,
        value: creator,
    }));
});

// API Functions
async function fetchOpenJobs() {
    loadingOpen.value = true;
    try {
        const response = await jobRepository.getJobsByStatus(JobStatus.OPEN, storesStore.currentStore!.id);
        openJobs.value = response;
    } catch (err) {
        error('Erro ao carregar vagas abertas');
        console.error(err);
    } finally {
        loadingOpen.value = false;
    }
}

async function fetchClosedJobs() {
    loadingClosed.value = true;
    try {
        const response = await jobRepository.getJobsByStatus(JobStatus.CLOSED, storesStore.currentStore!.id);
        closedJobs.value = response;
    } catch (err) {
        error('Erro ao carregar vagas fechadas');
        console.error(err);
    } finally {
        loadingClosed.value = false;
    }
}

async function refreshJobs() {
    await Promise.all([
        fetchOpenJobs(),
        fetchClosedJobs(),
    ]);
}

// Job Actions
function openCreateJobDialog() {
    dialogMode.value = 'create';
    selectedJob.value = null;
    showJobDialog.value = true;
}

function openEditJobDialog(job: BaseRef<Job>) {
    dialogMode.value = 'edit';
    selectedJob.value = job;
    showJobDialog.value = true;
}

async function closeJob(job: BaseRef<Job>) {
    const confirmed = await confirm.show({
        title: 'Fechar Vaga',
        message: `Tem certeza que deseja fechar a vaga "${job.title}"?`,
        confirmText: 'Fechar Vaga',
        cancelText: 'Cancelar',
        confirmColor: 'negative',
    });
    if (!confirmed) return;

    try {
        await jobRepository.updateJob(job.id, { status: JobStatus.CLOSED });
        success('Vaga fechada com sucesso');
        await refreshJobs();
    } catch (err) {
        error('Erro ao fechar vaga');
        console.error(err);
    }
}

async function reopenJob(job: BaseRef<Job>) {
    const confirmed = await confirm.show({
        title: 'Reabrir Vaga',
        message: `Tem certeza que deseja reabrir a vaga "${job.title}"?`,
        confirmText: 'Reabrir Vaga',
        cancelText: 'Cancelar',
        confirmColor: 'positive',
    });
    if (!confirmed) return;

    try {
        await jobRepository.updateJob(job.id, { status: JobStatus.OPEN });
        success('Vaga reaberta com sucesso');
        await refreshJobs();
    } catch (err) {
        error('Erro ao reabrir vaga');
        console.error(err);
    }
}

// Form functions
async function handleSaveJob(formData: { title: string; description: string; requirements: string[]; applyStart: string; applyEnd: string }) {
    loading.value = true;
    try {
        const jobData: Job = {
            title: formData.title,
            description: formData.description,
            requirements: formData.requirements,
            applyStart: new Date(formData.applyStart).getTime(),
            applyEnd: new Date(formData.applyEnd).getTime(),
            creatorConversationId: sessionStore.user!.uid,
            storeId: storesStore.currentStore!.id,
            status: JobStatus.OPEN,
            createdAt: Date.now(),
        };

        if (selectedJob.value) {
            await jobRepository.updateJob(selectedJob.value.id, jobData);
            success('Vaga atualizada com sucesso');
        } else {
            await jobRepository.createJob(jobData);
            success('Vaga criada com sucesso');
        }

        showJobDialog.value = false;
        await refreshJobs();
    } catch (err) {
        error('Erro ao salvar vaga');
        console.error(err);
    } finally {
        loading.value = false;
    }
}
// Initialize
onMounted(() => {
    refreshJobs();
});
</script>

<template>
    <q-page :class="pageClasses">
        <!-- Header Section -->
        <div :class="headerClasses">
            <div :class="titleClasses">
                Gerenciar Vagas
            </div>
            <div class="flex items-center q-gutter-sm">
                <!-- Create Job Button -->
                <base-button
                    color="accent"
                    dense
                    icon="add"
                    :label="isMobile ? '' : 'Nova Vaga'"
                    @click="openCreateJobDialog"
                />
            </div>
        </div>

        <!-- Search and Filters Section -->
        <div :class="searchSectionClasses">
            <div :class="searchInputClasses">
                <base-input
                    v-model="searchQuery"
                    :label="isMobile ? '' : 'Buscar vagas'"
                    :placeholder="isMobile ? 'Buscar...' : 'Buscar por título ou descrição...'"
                    type="search"
                    prepend-icon="search"
                />
            </div>
            <div :class="filterButtonsClasses">
                <!-- Creator Filter -->
                <base-button
                    v-if="creatorOptions.length > 0"
                    color="grey-9"
                    outline
                    dense
                    icon="person"
                    :label="isMobile ? '' : (selectedCreator || 'Criador')"
                    class="creator-filter-btn"
                >
                    <q-popup-proxy
                        cover
                        transition-show="scale"
                        transition-hide="scale"
                        class="popup"
                    >
                        <div
                            class="q-pa-md rounded-borders"
                            style="min-width: 250px;"
                        >
                            <q-select
                                v-model="selectedCreator"
                                :options="creatorOptions"
                                label="Filtrar por criador"
                                placeholder="Selecione um criador"
                                emit-value
                                map-options
                                clearable
                            />
                            <div class="row items-center justify-end q-gutter-sm q-pt-md">
                                <base-button
                                    v-close-popup
                                    label="Fechar"
                                    color="accent"
                                    flat
                                    size="sm"
                                />
                            </div>
                        </div>
                    </q-popup-proxy>
                </base-button>
            </div>
        </div>

        <!-- Tabs -->
        <tab-component
            v-model="activeTab"
            :tabs="tabs"
            variant="stripe"
            dense
        />

        <!-- Tab Panels -->
        <q-tab-panels
            v-model="activeTab"
            animated
            class="full-width bg-transparent"
        >
            <!-- Open Jobs Tab -->
            <q-tab-panel name="open">
                <!-- Loading State -->
                <div
                    v-if="loadingOpen"
                    :class="emptyStateClasses"
                >
                    <q-spinner-ios
                        color="primary"
                        size="50px"
                    />
                    <div class="q-mt-md text-subtitle1">
                        Carregando vagas abertas...
                    </div>
                </div>

                <!-- Empty State -->
                <div
                    v-else-if="openJobs.length === 0"
                    :class="emptyStateClasses"
                >
                    <q-icon
                        name="work"
                        :size="isMobile ? '80px' : '100px'"
                        color="accent"
                    />
                    <div class="text-h6 text-weight-medium q-mt-md text-accent">
                        Nenhuma vaga aberta
                    </div>
                    <div class="text-subtitle2 q-mt-sm text-grey">
                        Crie sua primeira vaga para começar.
                    </div>
                </div>

                <!-- Filtered Empty State -->
                <div
                    v-else-if="filteredOpenJobs.length === 0"
                    :class="emptyStateClasses"
                >
                    <q-icon
                        name="search_off"
                        :size="isMobile ? '80px' : '100px'"
                        color="accent"
                    />
                    <div class="text-h6 text-weight-medium q-mt-md text-accent">
                        Nenhuma vaga encontrada
                    </div>
                    <div class="text-subtitle2 q-mt-sm text-grey">
                        Tente ajustar sua busca.
                    </div>
                </div>

                <!-- Jobs Table -->
                <jobs-table
                    v-else
                    :jobs="filteredOpenJobs"
                    :show-edit-action="true"
                    :show-close-action="true"
                    :show-reopen-action="false"
                    @edit-job="openEditJobDialog"
                    @close-job="closeJob"
                />
            </q-tab-panel>

            <!-- Closed Jobs Tab -->
            <q-tab-panel name="closed">
                <!-- Loading State -->
                <div
                    v-if="loadingClosed"
                    :class="emptyStateClasses"
                >
                    <q-spinner-ios
                        color="primary"
                        size="50px"
                    />
                    <div class="q-mt-md text-subtitle1">
                        Carregando vagas fechadas...
                    </div>
                </div>

                <!-- Empty State -->
                <div
                    v-else-if="closedJobs.length === 0"
                    :class="emptyStateClasses"
                >
                    <q-icon
                        name="work_off"
                        :size="isMobile ? '80px' : '100px'"
                        color="accent"
                    />
                    <div class="text-h6 text-weight-medium q-mt-md text-accent">
                        Nenhuma vaga fechada
                    </div>
                    <div class="text-subtitle2 q-mt-sm text-grey">
                        Vagas fechadas aparecerão aqui.
                    </div>
                </div>

                <!-- Filtered Empty State -->
                <div
                    v-else-if="filteredClosedJobs.length === 0"
                    :class="emptyStateClasses"
                >
                    <q-icon
                        name="search_off"
                        :size="isMobile ? '80px' : '100px'"
                        color="accent"
                    />
                    <div class="text-h6 text-weight-medium q-mt-md text-accent">
                        Nenhuma vaga encontrada
                    </div>
                    <div class="text-subtitle2 q-mt-sm text-grey">
                        Tente ajustar sua busca.
                    </div>
                </div>

                <!-- Jobs Table -->
                <jobs-table
                    v-else
                    :jobs="filteredClosedJobs"
                    :show-edit-action="false"
                    :show-close-action="false"
                    :show-reopen-action="true"
                    @reopen-job="reopenJob"
                />
            </q-tab-panel>
        </q-tab-panels>

        <!-- Job Dialog -->
        <job-dialog
            v-model="showJobDialog"
            :job="selectedJob"
            :mode="dialogMode"
            :loading="loading"
            @save="handleSaveJob"
        />

        <!-- Refresh Button -->
        <div
            v-if="openJobs.length > 0 || closedJobs.length > 0"
            :class="paginationSectionClasses"
        >
            <base-button
                outline
                no-caps
                color="accent"
                icon="refresh"
                label="Atualizar Vagas"
                :loading="loading"
                @click="refreshJobs"
            />
        </div>
    </q-page>
</template>

<style scoped lang="scss">
.popup {
    .q-card {
        border-radius: 8px;
    }
}
</style>
