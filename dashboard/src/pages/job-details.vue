<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useStoresStore } from 'stores/stores';
import jobRepository from 'src/domain/jobs/repository';
import applicationRepository from 'src/domain/applications/repository';
import conversationRepository from 'src/domain/conversations/repository';
import { Job, JobStatus, WorkMode, JobType } from 'src/domain/jobs/entity';
import { Application, ApplicationStep } from 'src/domain/applications/entity';
import { Conversation } from 'src/domain/conversations/entity';
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
import { Pie as PieChart, Bar as BarChart } from 'vue-chartjs';
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
const conversations = ref<Map<string, BaseRef<Conversation>>>(new Map());
const loading = ref(true);
const activeTab = ref('statistics');

// Computed properties
const isMobile = computed(() => $q.screen.lt.md);

// Application step labels in Portuguese
const applicationStepLabels: Record<ApplicationStep, string> = {
    [ApplicationStep.MATCH_WITH_JOB]: 'Match com Vaga',
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

// Funnel chart data for recruitment pipeline
const funnelChartData = computed(() => {
    // Define funnel steps in order from top to bottom
    const funnelSteps = [
        { step: ApplicationStep.MATCH_WITH_JOB, label: 'Match com Vaga', color: '#2196F3' },
        { step: ApplicationStep.INTERVIEW, label: 'Entrevista', color: '#FF9800' },
        { step: ApplicationStep.RANKING, label: 'Ranking', color: '#9C27B0' },
        { step: ApplicationStep.FINALIST, label: 'Finalistas', color: '#FFD700' },
    ];

    const labels: string[] = [];
    const data: number[] = [];
    const backgroundColor: string[] = [];

    funnelSteps.forEach(({ step, label, color }) => {
        const count = applicationsByStep.value[step].length;
        labels.push(label);
        data.push(count);
        backgroundColor.push(color);
    });

    return {
        labels,
        datasets: [
            {
                data,
                backgroundColor,
                borderWidth: 2,
                borderColor: '#fff',
                borderRadius: 4,
            },
        ],
    };
});

const funnelChartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    scales: {
        x: {
            beginAtZero: true,
            grid: {
                display: false,
            },
            ticks: {
                stepSize: 1,
                font: {
                    size: 12,
                },
            },
        },
        y: {
            grid: {
                display: false,
            },
            ticks: {
                font: {
                    size: 12,
                    weight: 'bold' as const,
                },
            },
        },
    },
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            backgroundColor: 'white',
            titleColor: '#1e293b',
            bodyColor: '#374151',
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
                    const total = Math.max(...context.dataset.data);
                    const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : '0';
                    return `${context.label}: ${context.raw} candidatos (${percentage}% do total inicial)`;
                },
            },
        },
    },
    elements: {
        bar: {
            borderRadius: 4,
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

// Conversation/Candidate utility functions
function getConversationForApplication(application: BaseRef<Application>): BaseRef<Conversation> | null {
    return conversations.value.get(application.conversationId) || null;
}

function getCandidateName(conversation: BaseRef<Conversation> | null): string {
    return conversation?.name || 'Nome não disponível';
}

function getCandidatePhoto(conversation: BaseRef<Conversation> | null): string {
    return conversation?.photo || 'https://via.placeholder.com/150x150/cccccc/ffffff?text=?';
}

function getCandidateLocation(conversation: BaseRef<Conversation> | null): string {
    return conversation?.relevantData?.address || 'Localização não informada';
}

function getCandidateExpectedSalary(conversation: BaseRef<Conversation> | null): string {
    if (!conversation?.relevantData?.expectedSalary) return 'Não informado';

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    return formatter.format(conversation.relevantData.expectedSalary);
}

function getCandidateInterests(conversation: BaseRef<Conversation> | null): string {
    return conversation?.relevantData?.interests || 'Interesses não informados';
}

function getCandidateLinkedin(conversation: BaseRef<Conversation> | null): string {
    return conversation?.relevantData?.linkedin || '';
}

function getCandidateEmploymentStatus(conversation: BaseRef<Conversation> | null): string {
    if (!conversation) return 'Status não informado';
    return conversation.employed ? 'Empregado' : 'Desempregado';
}

function getCandidateProfileStatus(conversation: BaseRef<Conversation> | null): string {
    if (!conversation) return 'Status não informado';
    return conversation.profileCompleted ? 'Perfil Completo' : 'Perfil Incompleto';
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

        // Fetch conversations for each application
        const conversationMap = new Map<string, BaseRef<Conversation>>();
        const uniqueConversationIds = [...new Set(applicationsResult.map(app => app.conversationId))];

        const conversationPromises = uniqueConversationIds.map(async conversationId => {
            try {
                const conversation = await conversationRepository.getConversation(conversationId);
                if (conversation) {
                    return { conversationId, conversation };
                }
            } catch (convErr) {
                console.error(`Error fetching conversation ${conversationId}:`, convErr);
            }
            return null;
        });

        const conversationResults = await Promise.all(conversationPromises);
        conversationResults.forEach(result => {
            if (result) {
                conversationMap.set(result.conversationId, result.conversation);
            }
        });

        conversations.value = conversationMap;
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
                                            class="card-icon text-accent"
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
                            <q-card
                                v-if="funnelChartData && funnelChartData.labels.length > 0"
                                class="chart-card"
                            >
                                <q-card-section class="q-pb-none">
                                    <div class="chart-title-container">
                                        <div>
                                            <div class="text-h6 text-weight-bold text-grey-9">
                                                Funil de Recrutamento
                                            </div>
                                            <div class="text-grey-7 text-caption q-mt-xs">
                                                Progressão dos candidatos por etapa
                                            </div>
                                        </div>
                                        <q-icon
                                            name="o_filter_alt"
                                            size="24px"
                                            class="card-icon text-accent"
                                        />
                                    </div>
                                </q-card-section>
                                <q-card-section>
                                    <div
                                        class="chart-container"
                                        style="height: 300px;"
                                    >
                                        <bar-chart
                                            :data="funnelChartData"
                                            :options="funnelChartOptions"
                                        />
                                    </div>
                                </q-card-section>
                            </q-card>
                            <q-card
                                v-else
                                class="text-center q-pa-xl"
                            >
                                <q-icon
                                    name="filter_alt"
                                    size="60px"
                                    color="grey-5"
                                />
                                <div class="text-h6 text-grey-7 q-mt-md">
                                    Funil vazio
                                </div>
                                <div class="text-caption text-grey-5">
                                    O funil de recrutamento aparecerá quando houver candidaturas
                                </div>
                            </q-card>
                        </div>
                    </div>
                </q-tab-panel>

                <!-- Match with Job Tab -->
                <q-tab-panel
                    name="match_with_job"
                    class="q-pa-md"
                >
                    <div v-if="applicationsByStep[ApplicationStep.MATCH_WITH_JOB].length > 0">
                        <div class="q-gutter-sm bg-grey-1">
                            <q-expansion-item
                                v-for="application in applicationsByStep[ApplicationStep.MATCH_WITH_JOB]"
                                :key="application.id"
                                class="candidate-expansion-card"
                                header-class="candidate-expansion-header"
                            >
                                <!-- Header - Always visible -->
                                <template #header>
                                    <q-item-section avatar>
                                        <q-avatar>
                                            <img :src="getCandidatePhoto(getConversationForApplication(application))">
                                        </q-avatar>
                                    </q-item-section>
                                    <q-item-section>
                                        <div class="row items-center justify-between full-width">
                                            <q-item-label class="text-weight-bold text-body1">
                                                {{ getCandidateName(getConversationForApplication(application)) }}
                                            </q-item-label>
                                            <div
                                                class="status-badge status-match"
                                            >
                                                <q-icon
                                                    name="person_search"
                                                    size="14px"
                                                    class="q-mr-xs"
                                                />
                                                {{ applicationStepLabels[application.currentStep] }}
                                            </div>
                                        </div>
                                        <div class="row items-center justify-between full-width q-mt-xs">
                                            <q-item-label
                                                caption
                                                class="text-grey-7"
                                            >
                                                {{ getCandidateLocation(getConversationForApplication(application)) }}
                                            </q-item-label>
                                            <div class="text-caption text-grey-8">
                                                {{ formatDateTime(application.createdAt) }}
                                            </div>
                                        </div>
                                        <div class="row items-center justify-between full-width q-mt-xs">
                                            <q-item-label
                                                caption
                                                class="text-grey-6"
                                            >
                                                Salário esperado: {{ getCandidateExpectedSalary(getConversationForApplication(application)) }}
                                            </q-item-label>
                                        </div>
                                    </q-item-section>
                                </template>

                                <!-- Expanded content -->
                                <q-card
                                    flat
                                    class="expansion-content"
                                >
                                    <q-card-section class="q-pa-md">
                                        <div class="row items-start">
                                            <!-- Left side: Candidate Information -->
                                            <div class="col q-pr-md">
                                                <div class="q-gutter-xs">
                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="badge"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        ID da Candidatura: {{ application.id }}
                                                    </div>

                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="person"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Nome: {{ getCandidateName(getConversationForApplication(application)) }}
                                                    </div>

                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="place"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Localização: {{ getCandidateLocation(getConversationForApplication(application)) }}
                                                    </div>

                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="attach_money"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Salário Esperado: {{ getCandidateExpectedSalary(getConversationForApplication(application)) }}
                                                    </div>

                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="work"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Status de Emprego: {{ getCandidateEmploymentStatus(getConversationForApplication(application)) }}
                                                    </div>

                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="account_circle"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Status do Perfil: {{ getCandidateProfileStatus(getConversationForApplication(application)) }}
                                                    </div>

                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="interests"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Interesses: {{ getCandidateInterests(getConversationForApplication(application)) }}
                                                    </div>

                                                    <div
                                                        v-if="getCandidateLinkedin(getConversationForApplication(application))"
                                                        class="text-body2 text-grey-8 row items-center"
                                                    >
                                                        <q-icon
                                                            name="link"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        LinkedIn:
                                                        <a
                                                            :href="getCandidateLinkedin(getConversationForApplication(application))"
                                                            target="_blank"
                                                            class="q-ml-xs text-primary"
                                                        >
                                                            Ver perfil
                                                        </a>
                                                    </div>

                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="event"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Candidatura criada em: {{ formatDateTime(application.createdAt) }}
                                                    </div>

                                                    <div
                                                        v-if="application.updatedAt && application.updatedAt !== application.createdAt"
                                                        class="text-body2 text-grey-8 row items-center"
                                                    >
                                                        <q-icon
                                                            name="update"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Última atualização: {{ formatDateTime(application.updatedAt) }}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </q-card-section>
                                </q-card>
                            </q-expansion-item>
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

                <!-- Interview Tab -->
                <q-tab-panel
                    name="interview"
                    class="q-pa-md"
                >
                    <div v-if="applicationsByStep[ApplicationStep.INTERVIEW].length > 0">
                        <div class="q-gutter-sm bg-grey-1">
                            <q-expansion-item
                                v-for="application in applicationsByStep[ApplicationStep.INTERVIEW]"
                                :key="application.id"
                                class="candidate-expansion-card"
                                header-class="candidate-expansion-header"
                            >
                                <!-- Header - Always visible -->
                                <template #header>
                                    <q-item-section avatar>
                                        <q-avatar>
                                            <img :src="getCandidatePhoto(getConversationForApplication(application))">
                                        </q-avatar>
                                    </q-item-section>
                                    <q-item-section>
                                        <div class="row items-center justify-between full-width">
                                            <q-item-label class="text-weight-bold text-body1">
                                                {{ getCandidateName(getConversationForApplication(application)) }}
                                            </q-item-label>
                                            <div class="status-badge status-interview">
                                                <q-icon
                                                    name="record_voice_over"
                                                    size="14px"
                                                    class="q-mr-xs"
                                                />
                                                {{ applicationStepLabels[application.currentStep] }}
                                            </div>
                                        </div>
                                        <div class="row items-center justify-between full-width q-mt-xs">
                                            <q-item-label
                                                caption
                                                class="text-grey-7"
                                            >
                                                {{ getCandidateLocation(getConversationForApplication(application)) }}
                                            </q-item-label>
                                            <div class="text-caption text-grey-8">
                                                {{ formatDateTime(application.createdAt) }}
                                            </div>
                                        </div>
                                        <div class="row items-center justify-between full-width q-mt-xs">
                                            <q-item-label
                                                caption
                                                class="text-grey-6"
                                            >
                                                Salário esperado: {{ getCandidateExpectedSalary(getConversationForApplication(application)) }}
                                            </q-item-label>
                                        </div>
                                    </q-item-section>
                                </template>

                                <!-- Expanded content -->
                                <q-card
                                    flat
                                    class="expansion-content"
                                >
                                    <q-card-section class="q-pa-md">
                                        <div class="row items-start">
                                            <!-- Left side: Candidate Information -->
                                            <div class="col q-pr-md">
                                                <div class="q-gutter-xs">
                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="badge"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        ID da Candidatura: {{ application.id }}
                                                    </div>

                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="person"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Nome: {{ getCandidateName(getConversationForApplication(application)) }}
                                                    </div>

                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="place"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Localização: {{ getCandidateLocation(getConversationForApplication(application)) }}
                                                    </div>

                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="attach_money"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Salário Esperado: {{ getCandidateExpectedSalary(getConversationForApplication(application)) }}
                                                    </div>

                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="work"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Status de Emprego: {{ getCandidateEmploymentStatus(getConversationForApplication(application)) }}
                                                    </div>

                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="account_circle"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Status do Perfil: {{ getCandidateProfileStatus(getConversationForApplication(application)) }}
                                                    </div>

                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="interests"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Interesses: {{ getCandidateInterests(getConversationForApplication(application)) }}
                                                    </div>

                                                    <div
                                                        v-if="getCandidateLinkedin(getConversationForApplication(application))"
                                                        class="text-body2 text-grey-8 row items-center"
                                                    >
                                                        <q-icon
                                                            name="link"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        LinkedIn:
                                                        <a
                                                            :href="getCandidateLinkedin(getConversationForApplication(application))"
                                                            target="_blank"
                                                            class="q-ml-xs text-primary"
                                                        >
                                                            Ver perfil
                                                        </a>
                                                    </div>

                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="event"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Candidatura criada em: {{ formatDateTime(application.createdAt) }}
                                                    </div>

                                                    <div
                                                        v-if="application.updatedAt && application.updatedAt !== application.createdAt"
                                                        class="text-body2 text-grey-8 row items-center"
                                                    >
                                                        <q-icon
                                                            name="update"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Última atualização: {{ formatDateTime(application.updatedAt) }}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </q-card-section>
                                </q-card>
                            </q-expansion-item>
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
                        <div class="q-gutter-sm bg-grey-1">
                            <q-expansion-item
                                v-for="application in applicationsByStep[ApplicationStep.RANKING]"
                                :key="application.id"
                                class="candidate-expansion-card"
                                header-class="candidate-expansion-header"
                            >
                                <!-- Header - Always visible -->
                                <template #header>
                                    <q-item-section avatar>
                                        <q-avatar>
                                            <img :src="getCandidatePhoto(getConversationForApplication(application))">
                                        </q-avatar>
                                    </q-item-section>
                                    <q-item-section>
                                        <div class="row items-center justify-between full-width">
                                            <q-item-label class="text-weight-bold text-body1">
                                                {{ getCandidateName(getConversationForApplication(application)) }}
                                            </q-item-label>
                                            <div class="status-badge status-ranking">
                                                <q-icon
                                                    name="leaderboard"
                                                    size="14px"
                                                    class="q-mr-xs"
                                                />
                                                {{ applicationStepLabels[application.currentStep] }}
                                            </div>
                                        </div>
                                        <div class="row items-center justify-between full-width q-mt-xs">
                                            <q-item-label
                                                caption
                                                class="text-grey-7"
                                            >
                                                {{ getCandidateLocation(getConversationForApplication(application)) }}
                                            </q-item-label>
                                            <div class="text-caption text-grey-8">
                                                {{ formatDateTime(application.createdAt) }}
                                            </div>
                                        </div>
                                        <div class="row items-center justify-between full-width q-mt-xs">
                                            <q-item-label
                                                caption
                                                class="text-grey-6"
                                            >
                                                Salário esperado: {{ getCandidateExpectedSalary(getConversationForApplication(application)) }}
                                            </q-item-label>
                                        </div>
                                    </q-item-section>
                                </template>

                                <!-- Expanded content -->
                                <q-card
                                    flat
                                    class="expansion-content"
                                >
                                    <q-card-section class="q-pa-md">
                                        <div class="row items-start">
                                            <!-- Left side: Candidate Information -->
                                            <div class="col q-pr-md">
                                                <div class="q-gutter-xs">
                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="badge"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        ID da Candidatura: {{ application.id }}
                                                    </div>

                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="person"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Nome: {{ getCandidateName(getConversationForApplication(application)) }}
                                                    </div>

                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="place"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Localização: {{ getCandidateLocation(getConversationForApplication(application)) }}
                                                    </div>

                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="attach_money"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Salário Esperado: {{ getCandidateExpectedSalary(getConversationForApplication(application)) }}
                                                    </div>

                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="work"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Status de Emprego: {{ getCandidateEmploymentStatus(getConversationForApplication(application)) }}
                                                    </div>

                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="account_circle"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Status do Perfil: {{ getCandidateProfileStatus(getConversationForApplication(application)) }}
                                                    </div>

                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="interests"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Interesses: {{ getCandidateInterests(getConversationForApplication(application)) }}
                                                    </div>

                                                    <div
                                                        v-if="getCandidateLinkedin(getConversationForApplication(application))"
                                                        class="text-body2 text-grey-8 row items-center"
                                                    >
                                                        <q-icon
                                                            name="link"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        LinkedIn:
                                                        <a
                                                            :href="getCandidateLinkedin(getConversationForApplication(application))"
                                                            target="_blank"
                                                            class="q-ml-xs text-primary"
                                                        >
                                                            Ver perfil
                                                        </a>
                                                    </div>

                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="event"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Candidatura criada em: {{ formatDateTime(application.createdAt) }}
                                                    </div>

                                                    <div
                                                        v-if="application.updatedAt && application.updatedAt !== application.createdAt"
                                                        class="text-body2 text-grey-8 row items-center"
                                                    >
                                                        <q-icon
                                                            name="update"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Última atualização: {{ formatDateTime(application.updatedAt) }}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </q-card-section>
                                </q-card>
                            </q-expansion-item>
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
                        <div class="q-gutter-sm bg-grey-1">
                            <q-expansion-item
                                v-for="application in applicationsByStep[ApplicationStep.FINALIST]"
                                :key="application.id"
                                class="candidate-expansion-card"
                                header-class="candidate-expansion-header"
                            >
                                <!-- Header - Always visible -->
                                <template #header>
                                    <q-item-section avatar>
                                        <q-avatar>
                                            <img :src="getCandidatePhoto(getConversationForApplication(application))">
                                        </q-avatar>
                                    </q-item-section>
                                    <q-item-section>
                                        <div class="row items-center justify-between full-width">
                                            <q-item-label class="text-weight-bold text-body1">
                                                {{ getCandidateName(getConversationForApplication(application)) }}
                                            </q-item-label>
                                            <div class="status-badge status-finalist">
                                                <q-icon
                                                    name="emoji_events"
                                                    size="14px"
                                                    class="q-mr-xs"
                                                />
                                                {{ applicationStepLabels[application.currentStep] }}
                                            </div>
                                        </div>
                                        <div class="row items-center justify-between full-width q-mt-xs">
                                            <q-item-label
                                                caption
                                                class="text-grey-7"
                                            >
                                                {{ getCandidateLocation(getConversationForApplication(application)) }}
                                            </q-item-label>
                                            <div class="text-caption text-grey-8">
                                                {{ formatDateTime(application.createdAt) }}
                                            </div>
                                        </div>
                                        <div class="row items-center justify-between full-width q-mt-xs">
                                            <q-item-label
                                                caption
                                                class="text-grey-6"
                                            >
                                                Salário esperado: {{ getCandidateExpectedSalary(getConversationForApplication(application)) }}
                                            </q-item-label>
                                        </div>
                                    </q-item-section>
                                </template>

                                <!-- Expanded content -->
                                <q-card
                                    flat
                                    class="expansion-content"
                                >
                                    <q-card-section class="q-pa-md">
                                        <div class="row items-start">
                                            <!-- Left side: Candidate Information -->
                                            <div class="col q-pr-md">
                                                <div class="q-gutter-xs">
                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="badge"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        ID da Candidatura: {{ application.id }}
                                                    </div>

                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="person"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Nome: {{ getCandidateName(getConversationForApplication(application)) }}
                                                    </div>

                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="place"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Localização: {{ getCandidateLocation(getConversationForApplication(application)) }}
                                                    </div>

                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="attach_money"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Salário Esperado: {{ getCandidateExpectedSalary(getConversationForApplication(application)) }}
                                                    </div>

                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="work"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Status de Emprego: {{ getCandidateEmploymentStatus(getConversationForApplication(application)) }}
                                                    </div>

                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="account_circle"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Status do Perfil: {{ getCandidateProfileStatus(getConversationForApplication(application)) }}
                                                    </div>

                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="interests"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Interesses: {{ getCandidateInterests(getConversationForApplication(application)) }}
                                                    </div>

                                                    <div
                                                        v-if="getCandidateLinkedin(getConversationForApplication(application))"
                                                        class="text-body2 text-grey-8 row items-center"
                                                    >
                                                        <q-icon
                                                            name="link"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        LinkedIn:
                                                        <a
                                                            :href="getCandidateLinkedin(getConversationForApplication(application))"
                                                            target="_blank"
                                                            class="q-ml-xs text-primary"
                                                        >
                                                            Ver perfil
                                                        </a>
                                                    </div>

                                                    <div class="text-body2 text-grey-8 row items-center">
                                                        <q-icon
                                                            name="event"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Candidatura criada em: {{ formatDateTime(application.createdAt) }}
                                                    </div>

                                                    <div
                                                        v-if="application.updatedAt && application.updatedAt !== application.createdAt"
                                                        class="text-body2 text-grey-8 row items-center"
                                                    >
                                                        <q-icon
                                                            name="update"
                                                            size="13px"
                                                            class="q-mr-xs text-grey-7"
                                                        />
                                                        Última atualização: {{ formatDateTime(application.updatedAt) }}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </q-card-section>
                                </q-card>
                            </q-expansion-item>
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

.candidate-expansion-card {
    border-radius: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--app-border);
    overflow: hidden;
    transition: box-shadow 0.2s ease;
    margin-bottom: 8px;

    &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
}

.candidate-expansion-header {
    padding: 16px;
}

.expansion-content {
    border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.status-match {
    background-color: #e3f2fd;
    color: #1976d2;
}

.status-interview {
    background-color: #fff3e0;
    color: #f57c00;
}

.status-ranking {
    background-color: #f3e5f5;
    color: #7b1fa2;
}

.status-finalist {
    background-color: #fffde7;
    color: #f9a825;
}
</style>
