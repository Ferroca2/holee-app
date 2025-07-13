<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useStoresStore } from 'stores/stores';
import jobRepository from 'src/domain/jobs/repository';
import applicationRepository from 'src/domain/applications/repository';
import { Job, JobStatus, WorkMode, JobType } from 'src/domain/jobs/entity';
import { Application, ApplicationStep } from 'src/domain/applications/entity';
import { BaseRef } from 'src/domain';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Colors,
} from 'chart.js';
import { Pie as PieChart } from 'vue-chartjs';
import StatCard from 'src/components/ui/stat-card.vue';
import BaseButton from 'src/components/ui/base-button.vue';
import useError from '../hooks/useError';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Colors
);

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const stores = useStoresStore();
const error = useError();

// Get route params
const storeId = computed(() => stores.currentStore?.id);
const jobId = computed(() => route.params.jobId as string);

// Data
const job = ref<BaseRef<Job> | null>(null);
const applications = ref<BaseRef<Application>[]>([]);
const loading = ref(true);
const activeTab = ref('statistics');

// Computed properties
const isMobile = computed(() => $q.screen.lt.md);

// Application step labels in Portuguese
const applicationStepLabels: Record<ApplicationStep, string> = {
    [ApplicationStep.MATCH_WITH_JOB]: 'Match com Vaga',
    [ApplicationStep.ACCEPT_JOB]: 'Aceitar Vaga',
    [ApplicationStep.INTERVIEW]: 'Entrevista',
    [ApplicationStep.RANKING]: 'Ranking',
    [ApplicationStep.FINALIST]: 'Finalista',
};

// Status labels for job status
const jobStatusLabels: Record<JobStatus, string> = {
    [JobStatus.OPEN]: 'Aberta',
    [JobStatus.CLOSED]: 'Fechada',
};

// Work mode labels
const workModeLabels: Record<WorkMode, string> = {
    [WorkMode.REMOTE]: 'Remoto',
    [WorkMode.HYBRID]: 'Híbrido',
    [WorkMode.ON_SITE]: 'Presencial',
};

// Job type labels
const jobTypeLabels: Record<JobType, string> = {
    [JobType.FULL_TIME]: 'Tempo Integral',
    [JobType.PART_TIME]: 'Meio Período',
    [JobType.CONTRACT]: 'Contrato',
};

// Statistics computed
const totalApplications = computed(() => applications.value.length);

const applicationsByStep = computed(() => {
    const groups: Record<ApplicationStep, BaseRef<Application>[]> = {
        [ApplicationStep.MATCH_WITH_JOB]: [],
        [ApplicationStep.ACCEPT_JOB]: [],
        [ApplicationStep.INTERVIEW]: [],
        [ApplicationStep.RANKING]: [],
        [ApplicationStep.FINALIST]: [],
    };

    applications.value.forEach(app => {
        groups[app.currentStep].push(app);
    });

    return groups;
});

// Tab configuration
const tabs = computed(() => [
    {
        name: 'statistics',
        label: isMobile.value ? 'Stats' : 'Estatísticas',
        icon: 'analytics',
    },
    {
        name: 'match_with_job',
        label: `Match (${applicationsByStep.value[ApplicationStep.MATCH_WITH_JOB].length})`,
        icon: 'person_search',
    },
    {
        name: 'accept_job',
        label: isMobile.value ? `Aceitaram (${applicationsByStep.value[ApplicationStep.ACCEPT_JOB].length})` : `Aceitaram (${applicationsByStep.value[ApplicationStep.ACCEPT_JOB].length})`,
        icon: 'thumb_up',
    },
    {
        name: 'interview',
        label: isMobile.value ? `Entrevista (${applicationsByStep.value[ApplicationStep.INTERVIEW].length})` : `Entrevista (${applicationsByStep.value[ApplicationStep.INTERVIEW].length})`,
        icon: 'record_voice_over',
    },
    {
        name: 'ranking',
        label: `Ranking (${applicationsByStep.value[ApplicationStep.RANKING].length})`,
        icon: 'leaderboard',
    },
    {
        name: 'finalist',
        label: isMobile.value ? `Finalista (${applicationsByStep.value[ApplicationStep.FINALIST].length})` : `Finalista (${applicationsByStep.value[ApplicationStep.FINALIST].length})`,
        icon: 'emoji_events',
    },
]);

// Chart data for application steps distribution
const pieChartData = computed(() => {
    const labels: string[] = [];
    const data: number[] = [];
    const backgroundColors: string[] = [];

    // Define colors for each step
    const colors: Record<ApplicationStep, string> = {
        [ApplicationStep.MATCH_WITH_JOB]: '#2196F3',
        [ApplicationStep.ACCEPT_JOB]: '#4CAF50',
        [ApplicationStep.INTERVIEW]: '#FF9800',
        [ApplicationStep.RANKING]: '#9C27B0',
        [ApplicationStep.FINALIST]: '#FFD700',
    };

    // Add data for each step that has applications
    Object.entries(applicationsByStep.value).forEach(([step, applications]) => {
        if (applications.length > 0) {
            const applicationStep = step as ApplicationStep;
            labels.push(applicationStepLabels[applicationStep]);
            data.push(applications.length);
            backgroundColors.push(colors[applicationStep]);
        }
    });

    return {
        labels,
        datasets: [
            {
                data,
                backgroundColor: backgroundColors,
                borderWidth: 2,
                borderColor: '#fff',
            },
        ],
    };
});

const pieChartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom' as const,
            labels: {
                padding: 20,
                usePointStyle: true,
                font: {
                    size: 14,
                },
            },
        },
        tooltip: {
            backgroundColor: 'white',
            titleColor: '#1e293b',
            bodyColor: '#8E44AD',
            bodyFont: {
                weight: 'bold' as const,
                size: 14,
            },
            padding: 12,
            cornerRadius: 8,
            displayColors: true,
            borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.05)',
            callbacks: {
                label: function(context: any) {
                    const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
                    const percentage = ((context.raw / total) * 100).toFixed(1);
                    return `${context.label}: ${context.raw} (${percentage}%)`;
                },
            },
        },
    },
}));

// Utility functions
function formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleDateString('pt-BR');
}

function formatTime(timestamp: number) {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatDateTime(timestamp: number) {
    return `${formatDate(timestamp)} às ${formatTime(timestamp)}`;
}

function getStatusIcon(status: JobStatus): string {
    const iconMap = {
        [JobStatus.OPEN]: 'work',
        [JobStatus.CLOSED]: 'work_off',
    };
    return iconMap[status] || 'help';
}

function isJobExpired(job: BaseRef<Job>): boolean {
    return Date.now() > job.applyEnd;
}

function getDaysRemaining(job: BaseRef<Job>): number {
    const days = Math.ceil((job.applyEnd - Date.now()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
}

function getExpirationStatus(job: BaseRef<Job>): { text: string; color: string } {
    if (job.status === JobStatus.CLOSED) {
        return { text: 'Fechada', color: 'grey' };
    }

    if (isJobExpired(job)) {
        return { text: 'Expirada', color: 'negative' };
    }

    const daysRemaining = getDaysRemaining(job);
    if (daysRemaining === 0) {
        return { text: 'Expira hoje', color: 'warning' };
    } else if (daysRemaining <= 3) {
        return { text: `${daysRemaining} dias restantes`, color: 'warning' };
    } else {
        return { text: `${daysRemaining} dias restantes`, color: 'positive' };
    }
}

function formatSalaryRange(salaryRange?: { min: number; max: number }): string {
    if (!salaryRange) return 'Não informado';

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    if (salaryRange.min && salaryRange.max) {
        return `${formatter.format(salaryRange.min)} - ${formatter.format(salaryRange.max)}`;
    } else if (salaryRange.min) {
        return `A partir de ${formatter.format(salaryRange.min)}`;
    } else if (salaryRange.max) {
        return `Até ${formatter.format(salaryRange.max)}`;
    } else {
        return 'Não informado';
    }
}

// API functions
async function fetchJobDetails() {
    if (!storeId.value || !jobId.value) return;

    loading.value = true;
    try {
        const [jobResult, applicationsResult] = await Promise.all([
            jobRepository.getJob(jobId.value),
            applicationRepository.getApplicationsByJob(jobId.value),
        ]);

        job.value = jobResult;
        applications.value = applicationsResult;
    } catch (err) {
        console.error('Error fetching job details:', err);
        error('Erro ao carregar detalhes da vaga');
    } finally {
        loading.value = false;
    }
}

function goBack() {
    router.back();
}

// Initialize
onMounted(() => {
    fetchJobDetails();
});
</script>

<template>
    <q-page
        class="column align-center bg-grey-1"
        :class="$q.screen.lt.sm ? 'q-pa-md' : 'q-pa-xl'"
    >
        <!-- Header -->
        <div
            class="row items-center justify-between full-width"
            :class="$q.screen.lt.sm ? 'q-mb-md' : 'q-my-md'"
        >
            <div class="row items-center">
                <base-button
                    flat
                    round
                    icon="arrow_back"
                    color="grey-7"
                    class="q-mr-md"
                    @click="goBack"
                />
                <div>
                    <div
                        class="text-start text-weight-bold "
                        :class="$q.screen.lt.sm ? 'text-h6' : 'text-h5'"
                    >
                        {{ job?.title || 'Carregando...' }}
                    </div>
                    <div
                        v-if="job?.location"
                        class="text-grey-7 text-caption"
                    >
                        {{ job.location }} • {{ workModeLabels[job.workMode] }} • {{ jobTypeLabels[job.jobType] }}
                    </div>
                </div>
            </div>

            <!-- Status Badge -->
            <div
                v-if="job && !loading"
                class="text-right"
            >
                <div
                    class="status-badge"
                    :class="'status-' + job.status.toLowerCase()"
                >
                    <q-icon
                        :name="getStatusIcon(job.status)"
                        size="16px"
                        class="q-mr-xs"
                    />
                    {{ jobStatusLabels[job.status] }}
                </div>
                <div class="text-caption text-grey-7 q-mt-xs">
                    {{ formatDateTime(job.createdAt) }}
                </div>
                <q-chip
                    :color="getExpirationStatus(job).color"
                    :label="getExpirationStatus(job).text"
                    size="sm"
                    dense
                    class="q-mt-xs"
                />
            </div>
        </div>

        <!-- Loading State -->
        <div
            v-if="loading"
            class="full-width column items-center justify-center q-py-xl"
            style="min-height: 400px;"
        >
            <q-spinner-ios
                color="primary"
                size="50px"
            />
            <div class="q-mt-md text-purple-7">
                Carregando detalhes da vaga...
            </div>
        </div>

        <!-- Content -->
        <div
            v-else-if="job"
            class="full-width"
        >
            <!-- Tabs -->
            <q-tabs
                v-model="activeTab"
                dense
                no-caps
                class="text-grey-7"
                active-color="primary"
                indicator-color="primary"
                :align="isMobile ? 'left' : 'justify'"
                :mobile-arrows="isMobile"
                narrow-indicator
                :breakpoint="0"
            >
                <q-tab
                    v-for="tab in tabs"
                    :key="tab.name"
                    :name="tab.name"
                    :icon="tab.icon"
                    :label="tab.label"
                />
            </q-tabs>

            <q-separator />

            <q-tab-panels
                v-model="activeTab"
                animated
                class="bg-transparent"
            >
                <!-- Statistics Tab -->
                <q-tab-panel
                    name="statistics"
                    class="q-pa-md"
                >
                    <!-- Statistics Cards -->
                    <div class="row q-col-gutter-md q-mb-lg">
                        <div class="col-12 col-md-3">
                            <stat-card
                                title="Total de Candidatos"
                                icon="people"
                                :value="totalApplications"
                            />
                        </div>
                        <div class="col-12 col-md-3">
                            <stat-card
                                title="Match com Vaga"
                                icon="person_search"
                                :value="applicationsByStep[ApplicationStep.MATCH_WITH_JOB].length"
                            />
                        </div>
                        <div class="col-12 col-md-3">
                            <stat-card
                                title="Entrevistas"
                                icon="record_voice_over"
                                :value="applicationsByStep[ApplicationStep.INTERVIEW].length"
                            />
                        </div>
                        <div class="col-12 col-md-3">
                            <stat-card
                                title="Finalistas"
                                icon="emoji_events"
                                :value="applicationsByStep[ApplicationStep.FINALIST].length"
                            />
                        </div>
                    </div>

                    <!-- Job Details Card -->
                    <div class="row q-col-gutter-md q-mb-lg">
                        <div class="col-12">
                            <q-card class="details-card">
                                <q-card-section class="q-pb-none">
                                    <div class="text-h6 text-weight-bold text-grey-9">
                                        Detalhes da Vaga
                                    </div>
                                </q-card-section>
                                <q-card-section>
                                    <div class="review-summary">
                                        <div class="review-item">
                                            <div class="review-label">
                                                ID:
                                            </div>
                                            <div class="review-value">
                                                {{ job.id }}
                                            </div>
                                        </div>
                                        <div class="review-item">
                                            <div class="review-label">
                                                Título:
                                            </div>
                                            <div class="review-value">
                                                {{ job.title }}
                                            </div>
                                        </div>
                                        <div class="review-item">
                                            <div class="review-label">
                                                Descrição:
                                            </div>
                                            <div class="review-value">
                                                {{ job.description }}
                                            </div>
                                        </div>
                                        <div class="review-item">
                                            <div class="review-label">
                                                Localização:
                                            </div>
                                            <div class="review-value">
                                                {{ job.location }}
                                            </div>
                                        </div>
                                        <div class="review-item">
                                            <div class="review-label">
                                                Número de Vagas:
                                            </div>
                                            <div class="review-value">
                                                {{ job.numberOfPositions }}
                                            </div>
                                        </div>
                                        <div class="review-item">
                                            <div class="review-label">
                                                Nível de Senioridade:
                                            </div>
                                            <div class="review-value">
                                                {{ job.seniorityLevel }}
                                            </div>
                                        </div>
                                        <div class="review-item">
                                            <div class="review-label">
                                                Modo de Trabalho:
                                            </div>
                                            <div class="review-value">
                                                {{ workModeLabels[job.workMode] }}
                                            </div>
                                        </div>
                                        <div class="review-item">
                                            <div class="review-label">
                                                Tipo de Contrato:
                                            </div>
                                            <div class="review-value">
                                                {{ jobTypeLabels[job.jobType] }}
                                            </div>
                                        </div>
                                        <div class="review-item">
                                            <div class="review-label">
                                                Faixa Salarial:
                                            </div>
                                            <div class="review-value">
                                                {{ formatSalaryRange(job.salaryRange) }}
                                            </div>
                                        </div>
                                        <div
                                            v-if="job.minExperienceYears"
                                            class="review-item"
                                        >
                                            <div class="review-label">
                                                Experiência Mínima:
                                            </div>
                                            <div class="review-value">
                                                {{ job.minExperienceYears }} anos
                                            </div>
                                        </div>
                                        <div class="review-item">
                                            <div class="review-label">
                                                Período de Inscrições:
                                            </div>
                                            <div class="review-value">
                                                {{ formatDate(job.applyStart) }} - {{ formatDate(job.applyEnd) }}
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Skills Section -->
                                    <div
                                        v-if="job.requiredSkills && job.requiredSkills.length > 0"
                                        class="q-mt-md"
                                    >
                                        <div class="text-subtitle2 text-weight-bold text-grey-9 q-mb-sm">
                                            Habilidades Obrigatórias
                                        </div>
                                        <div class="q-gutter-xs">
                                            <q-chip
                                                v-for="skill in job.requiredSkills"
                                                :key="skill"
                                                color="primary"
                                                text-color="white"
                                                size="sm"
                                            >
                                                {{ skill }}
                                            </q-chip>
                                        </div>
                                    </div>

                                    <div
                                        v-if="job.niceToHaveSkills && job.niceToHaveSkills.length > 0"
                                        class="q-mt-md"
                                    >
                                        <div class="text-subtitle2 text-weight-bold text-grey-9 q-mb-sm">
                                            Habilidades Desejáveis
                                        </div>
                                        <div class="q-gutter-xs">
                                            <q-chip
                                                v-for="skill in job.niceToHaveSkills"
                                                :key="skill"
                                                color="accent"
                                                text-color="white"
                                                size="sm"
                                                outline
                                            >
                                                {{ skill }}
                                            </q-chip>
                                        </div>
                                    </div>

                                    <div
                                        v-if="job.languagesRequired && job.languagesRequired.length > 0"
                                        class="q-mt-md"
                                    >
                                        <div class="text-subtitle2 text-weight-bold text-grey-9 q-mb-sm">
                                            Idiomas Necessários
                                        </div>
                                        <div class="q-gutter-xs">
                                            <q-chip
                                                v-for="language in job.languagesRequired"
                                                :key="language"
                                                color="info"
                                                text-color="white"
                                                size="sm"
                                            >
                                                {{ language }}
                                            </q-chip>
                                        </div>
                                    </div>
                                </q-card-section>
                            </q-card>
                        </div>
                    </div>

                    <!-- Applications Distribution Chart -->
                    <div class="row q-col-gutter-md q-mt-lg">
                        <div class="col-12 col-md-6">
                            <q-card
                                v-if="pieChartData && pieChartData.labels.length > 0"
                                class="chart-card"
                            >
                                <q-card-section class="q-pb-none">
                                    <div class="chart-title-container">
                                        <div>
                                            <div class="text-h6 text-weight-bold text-grey-9">
                                                Distribuição por Etapa
                                            </div>
                                            <div class="text-grey-7 text-caption q-mt-xs">
                                                Status das candidaturas por etapa
                                            </div>
                                        </div>
                                        <q-icon
                                            name="o_pie_chart"
                                            size="24px"
                                            class="card-icon text-purple-7"
                                        />
                                    </div>
                                </q-card-section>
                                <q-card-section>
                                    <div
                                        class="chart-container"
                                        style="height: 300px;"
                                    >
                                        <pie-chart
                                            :data="pieChartData"
                                            :options="pieChartOptions"
                                        />
                                    </div>
                                </q-card-section>
                            </q-card>
                            <q-card
                                v-else
                                class="text-center q-pa-xl"
                            >
                                <q-icon
                                    name="pie_chart"
                                    size="60px"
                                    color="grey-5"
                                />
                                <div class="text-h6 text-grey-7 q-mt-md">
                                    Nenhuma candidatura
                                </div>
                                <div class="text-caption text-grey-5">
                                    As estatísticas aparecerão quando houver candidaturas
                                </div>
                            </q-card>
                        </div>
                        <div class="col-12 col-md-6">
                            <!-- Additional stats or summary could go here -->
                        </div>
                    </div>
                </q-tab-panel>

                <!-- Match with Job Tab -->
                <q-tab-panel
                    name="match_with_job"
                    class="q-pa-md"
                >
                    <div v-if="applicationsByStep[ApplicationStep.MATCH_WITH_JOB].length > 0">
                        <div class="q-gutter-md">
                            <q-card
                                v-for="application in applicationsByStep[ApplicationStep.MATCH_WITH_JOB]"
                                :key="application.id"
                                class="application-card"
                            >
                                <q-card-section>
                                    <div class="row items-center justify-between">
                                        <div>
                                            <div class="text-weight-bold">
                                                ID: {{ application.id }}
                                            </div>
                                            <div class="text-caption text-grey-7">
                                                Conversa: {{ application.conversationId }}
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <q-chip
                                                color="primary"
                                                :label="applicationStepLabels[application.currentStep]"
                                                size="sm"
                                            />
                                        </div>
                                    </div>
                                    <div class="q-mt-sm text-caption text-grey-6">
                                        Criado em: {{ formatDateTime(application.createdAt) }}
                                    </div>
                                </q-card-section>
                            </q-card>
                        </div>
                    </div>
                    <div
                        v-else
                        class="text-center q-pa-xl"
                    >
                        <q-icon
                            name="person_search"
                            size="60px"
                            color="grey-5"
                        />
                        <div class="text-h6 text-grey-7 q-mt-md">
                            Nenhuma candidatura no Match
                        </div>
                        <div class="text-subtitle2 q-mt-sm text-grey-6">
                            Candidatos que fazem match com a vaga aparecerão aqui
                        </div>
                    </div>
                </q-tab-panel>

                <!-- Accept Job Tab -->
                <q-tab-panel
                    name="accept_job"
                    class="q-pa-md"
                >
                    <div v-if="applicationsByStep[ApplicationStep.ACCEPT_JOB].length > 0">
                        <div class="q-gutter-md">
                            <q-card
                                v-for="application in applicationsByStep[ApplicationStep.ACCEPT_JOB]"
                                :key="application.id"
                                class="application-card"
                            >
                                <q-card-section>
                                    <div class="row items-center justify-between">
                                        <div>
                                            <div class="text-weight-bold">
                                                ID: {{ application.id }}
                                            </div>
                                            <div class="text-caption text-grey-7">
                                                Conversa: {{ application.conversationId }}
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <q-chip
                                                color="primary"
                                                :label="applicationStepLabels[application.currentStep]"
                                                size="sm"
                                            />
                                        </div>
                                    </div>
                                    <div class="q-mt-sm text-caption text-grey-6">
                                        Criado em: {{ formatDateTime(application.createdAt) }}
                                    </div>
                                </q-card-section>
                            </q-card>
                        </div>
                    </div>
                    <div
                        v-else
                        class="text-center q-pa-xl"
                    >
                        <q-icon
                            name="thumb_up"
                            size="60px"
                            color="grey-5"
                        />
                        <div class="text-h6 text-grey-7 q-mt-md">
                            Nenhuma candidatura para aceitar
                        </div>
                        <div class="text-subtitle2 q-mt-sm text-grey-6">
                            Candidatos que aceitaram a vaga aparecerão aqui
                        </div>
                    </div>
                </q-tab-panel>

                <!-- Interview Tab -->
                <q-tab-panel
                    name="interview"
                    class="q-pa-md"
                >
                    <div v-if="applicationsByStep[ApplicationStep.INTERVIEW].length > 0">
                        <div class="q-gutter-md">
                            <q-card
                                v-for="application in applicationsByStep[ApplicationStep.INTERVIEW]"
                                :key="application.id"
                                class="application-card"
                            >
                                <q-card-section>
                                    <div class="row items-center justify-between">
                                        <div>
                                            <div class="text-weight-bold">
                                                ID: {{ application.id }}
                                            </div>
                                            <div class="text-caption text-grey-7">
                                                Conversa: {{ application.conversationId }}
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <q-chip
                                                color="primary"
                                                :label="applicationStepLabels[application.currentStep]"
                                                size="sm"
                                            />
                                        </div>
                                    </div>
                                    <div class="q-mt-sm text-caption text-grey-6">
                                        Criado em: {{ formatDateTime(application.createdAt) }}
                                    </div>
                                </q-card-section>
                            </q-card>
                        </div>
                    </div>
                    <div
                        v-else
                        class="text-center q-pa-xl"
                    >
                        <q-icon
                            name="record_voice_over"
                            size="60px"
                            color="grey-5"
                        />
                        <div class="text-h6 text-grey-7 q-mt-md">
                            Nenhuma candidatura em entrevista
                        </div>
                        <div class="text-subtitle2 q-mt-sm text-grey-6">
                            Candidatos em processo de entrevista aparecerão aqui
                        </div>
                    </div>
                </q-tab-panel>

                <!-- Ranking Tab -->
                <q-tab-panel
                    name="ranking"
                    class="q-pa-md"
                >
                    <div v-if="applicationsByStep[ApplicationStep.RANKING].length > 0">
                        <div class="q-gutter-md">
                            <q-card
                                v-for="application in applicationsByStep[ApplicationStep.RANKING]"
                                :key="application.id"
                                class="application-card"
                            >
                                <q-card-section>
                                    <div class="row items-center justify-between">
                                        <div>
                                            <div class="text-weight-bold">
                                                ID: {{ application.id }}
                                            </div>
                                            <div class="text-caption text-grey-7">
                                                Conversa: {{ application.conversationId }}
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <q-chip
                                                color="primary"
                                                :label="applicationStepLabels[application.currentStep]"
                                                size="sm"
                                            />
                                        </div>
                                    </div>
                                    <div class="q-mt-sm text-caption text-grey-6">
                                        Criado em: {{ formatDateTime(application.createdAt) }}
                                    </div>
                                </q-card-section>
                            </q-card>
                        </div>
                    </div>
                    <div
                        v-else
                        class="text-center q-pa-xl"
                    >
                        <q-icon
                            name="leaderboard"
                            size="60px"
                            color="grey-5"
                        />
                        <div class="text-h6 text-grey-7 q-mt-md">
                            Nenhuma candidatura no ranking
                        </div>
                        <div class="text-subtitle2 q-mt-sm text-grey-6">
                            Candidatos sendo ranqueados aparecerão aqui
                        </div>
                    </div>
                </q-tab-panel>

                <!-- Finalist Tab -->
                <q-tab-panel
                    name="finalist"
                    class="q-pa-md"
                >
                    <div v-if="applicationsByStep[ApplicationStep.FINALIST].length > 0">
                        <div class="q-gutter-md">
                            <q-card
                                v-for="application in applicationsByStep[ApplicationStep.FINALIST]"
                                :key="application.id"
                                class="application-card"
                            >
                                <q-card-section>
                                    <div class="row items-center justify-between">
                                        <div>
                                            <div class="text-weight-bold">
                                                ID: {{ application.id }}
                                            </div>
                                            <div class="text-caption text-grey-7">
                                                Conversa: {{ application.conversationId }}
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <q-chip
                                                color="primary"
                                                :label="applicationStepLabels[application.currentStep]"
                                                size="sm"
                                            />
                                        </div>
                                    </div>
                                    <div class="q-mt-sm text-caption text-grey-6">
                                        Criado em: {{ formatDateTime(application.createdAt) }}
                                    </div>
                                </q-card-section>
                            </q-card>
                        </div>
                    </div>
                    <div
                        v-else
                        class="text-center q-pa-xl"
                    >
                        <q-icon
                            name="emoji_events"
                            size="60px"
                            color="grey-5"
                        />
                        <div class="text-h6 text-grey-7 q-mt-md">
                            Nenhuma candidatura finalista
                        </div>
                        <div class="text-subtitle2 q-mt-sm text-grey-6">
                            Candidatos finalistas aparecerão aqui
                        </div>
                    </div>
                </q-tab-panel>
            </q-tab-panels>
        </div>

        <!-- Error State -->
        <div
            v-else
            class="full-width text-center q-pa-xl"
        >
            <q-icon
                name="error_outline"
                size="100px"
                color="negative"
            />
            <div class="text-h6 text-weight-medium q-mt-md text-negative">
                Vaga não encontrada
            </div>
            <div class="text-subtitle2 q-mt-sm text-grey">
                A vaga pode ter sido removida ou você não tem permissão para acessá-la.
            </div>
            <base-button
                color="primary"
                label="Voltar para vagas"
                icon="arrow_back"
                class="q-mt-md"
                @click="goBack"
            />
        </div>
    </q-page>
</template>

<style scoped lang="scss">
.chart-card {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .chart-title-container {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
    }

    .card-icon {
        margin-top: 4px;
    }
}

.chart-container {
    position: relative;
    width: 100%;
}

.details-card {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.review-summary {
    border-radius: 10px;
    padding: 14px 16px;
    margin-bottom: 16px;
    border: 1px solid #e0e0e0;
}

.review-item {
    display: flex;
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid #e0e0e0;

    &:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
    }
}

.review-label {
    font-weight: 500;
    width: 150px;
    font-size: 12px;
}

.review-value {
    flex: 1;
    font-size: 12px;
    color: #5f6368;
}

.application-card {
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    transition: box-shadow 0.2s ease;

    &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
}



.status-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 0.75rem;
    font-weight: 600;
}

.status-open {
    background-color: #e6f7ef;
    color: #21BA45;
}

.status-closed {
    background-color: #fee7e7;
    color: #C10015;
}
</style>
