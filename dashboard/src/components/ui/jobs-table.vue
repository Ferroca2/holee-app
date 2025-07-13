<script setup lang="ts">
import { BaseRef } from 'src/domain';
import { Job, JobStatus, WorkMode, JobType } from 'src/domain/jobs/entity';

interface Props {
    jobs: BaseRef<Job>[];
    showReopenAction?: boolean;
    showEditAction?: boolean;
    showCloseAction?: boolean;
}

withDefaults(defineProps<Props>(), {
    showReopenAction: false,
    showEditAction: true,
    showCloseAction: true,
});

const emit = defineEmits([
    'edit-job',
    'close-job',
    'reopen-job',
]);

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
    return `${formatDate(timestamp)} ${formatTime(timestamp)}`;
}

function getStatusBadgeClass(status: JobStatus): string {
    switch (status) {
        case 'open':
            return 'status-open';
        case 'closed':
            return 'status-closed';
        default:
            return 'status-default';
    }
}

function getStatusLabel(status: JobStatus): string {
    switch (status) {
        case 'open':
            return 'Aberta';
        case 'closed':
            return 'Fechada';
        default:
            return 'Desconhecido';
    }
}

function getStatusIcon(status: JobStatus): string {
    switch (status) {
        case 'open':
            return 'work';
        case 'closed':
            return 'work_off';
        default:
            return 'help';
    }
}

function getWorkModeLabel(workMode: WorkMode): string {
    switch (workMode) {
        case 'remote':
            return 'Remoto';
        case 'hybrid':
            return 'Híbrido';
        case 'on_site':
            return 'Presencial';
        default:
            return 'Não especificado';
    }
}

function getJobTypeLabel(jobType: JobType): string {
    switch (jobType) {
        case 'full_time':
            return 'Tempo Integral';
        case 'part_time':
            return 'Meio Período';
        case 'contract':
            return 'Contrato';
        default:
            return 'Não especificado';
    }
}

function isJobExpired(job: BaseRef<Job>): boolean {
    return Date.now() > job.applyEnd;
}

function getDaysRemaining(job: BaseRef<Job>): number {
    const days = Math.ceil((job.applyEnd - Date.now()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
}

function getExpirationStatus(job: BaseRef<Job>): { text: string; color: string } {
    if (job.status === 'closed') {
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
</script>

<template>
    <div class="q-mb-md">
        <!-- Jobs expansion table -->
        <div class="q-gutter-sm bg-grey-1">
            <q-expansion-item
                v-for="job in jobs"
                :key="job.id"
                class="job-expansion-card"
                header-class="job-expansion-header"
            >
                <!-- Header - Always visible -->
                <template #header>
                    <q-item-section>
                        <div class="row items-center justify-between full-width">
                            <q-item-label class="text-weight-bold text-body1">
                                {{ job.title }}
                            </q-item-label>
                            <div
                                class="status-badge"
                                :class="getStatusBadgeClass(job.status)"
                            >
                                <q-icon
                                    :name="getStatusIcon(job.status)"
                                    size="14px"
                                    class="q-mr-xs"
                                />
                                {{ getStatusLabel(job.status) }}
                            </div>
                        </div>
                        <div class="row items-center justify-between full-width q-mt-xs">
                            <q-item-label
                                caption
                                class="text-grey-7"
                            >
                                {{ job.description.substring(0, 80) }}{{ job.description.length > 80 ? '...' : '' }}
                            </q-item-label>
                            <div class="text-caption text-grey-8">
                                {{ formatDateTime(job.createdAt) }}
                            </div>
                        </div>
                        <div class="row items-center justify-between full-width q-mt-xs">
                            <q-item-label
                                caption
                                class="text-grey-6"
                            >
                                {{ job.location }} • {{ getWorkModeLabel(job.workMode) }} • {{ getJobTypeLabel(job.jobType) }}
                            </q-item-label>
                            <q-chip
                                :color="getExpirationStatus(job).color"
                                :label="getExpirationStatus(job).text"
                                size="sm"
                                dense
                            />
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
                            <!-- Left side: Information -->
                            <div class="col q-pr-md">
                                <!-- Job details -->
                                <div class="q-gutter-xs">
                                    <div class="text-body2 text-grey-8 row items-center">
                                        <q-icon
                                            name="badge"
                                            size="13px"
                                            class="q-mr-xs text-grey-7"
                                        />
                                        ID da Vaga: {{ job.id }}
                                    </div>

                                    <div class="text-body2 text-grey-8 row items-center">
                                        <q-icon
                                            name="store"
                                            size="13px"
                                            class="q-mr-xs text-grey-7"
                                        />
                                        Loja: {{ job.storeId }}
                                    </div>

                                    <div class="text-body2 text-grey-8 row items-center">
                                        <q-icon
                                            name="place"
                                            size="13px"
                                            class="q-mr-xs text-grey-7"
                                        />
                                        Localização: {{ job.location }}
                                    </div>

                                    <div class="text-body2 text-grey-8 row items-center">
                                        <q-icon
                                            name="people"
                                            size="13px"
                                            class="q-mr-xs text-grey-7"
                                        />
                                        Número de vagas: {{ job.numberOfPositions }}
                                    </div>

                                    <div class="text-body2 text-grey-8 row items-center">
                                        <q-icon
                                            name="work"
                                            size="13px"
                                            class="q-mr-xs text-grey-7"
                                        />
                                        Modo de trabalho: {{ getWorkModeLabel(job.workMode) }}
                                    </div>

                                    <div class="text-body2 text-grey-8 row items-center">
                                        <q-icon
                                            name="schedule"
                                            size="13px"
                                            class="q-mr-xs text-grey-7"
                                        />
                                        Tipo de contrato: {{ getJobTypeLabel(job.jobType) }}
                                    </div>

                                    <div class="text-body2 text-grey-8 row items-center">
                                        <q-icon
                                            name="trending_up"
                                            size="13px"
                                            class="q-mr-xs text-grey-7"
                                        />
                                        Nível de senioridade: {{ job.seniorityLevel }}
                                    </div>

                                    <div class="text-body2 text-grey-8 row items-center">
                                        <q-icon
                                            name="attach_money"
                                            size="13px"
                                            class="q-mr-xs text-grey-7"
                                        />
                                        Faixa salarial: {{ formatSalaryRange(job.salaryRange) }}
                                    </div>

                                    <div
                                        v-if="job.minExperienceYears"
                                        class="text-body2 text-grey-8 row items-center"
                                    >
                                        <q-icon
                                            name="school"
                                            size="13px"
                                            class="q-mr-xs text-grey-7"
                                        />
                                        Experiência mínima: {{ job.minExperienceYears }} anos
                                    </div>

                                    <div class="text-body2 text-grey-8 row items-center">
                                        <q-icon
                                            name="description"
                                            size="13px"
                                            class="q-mr-xs text-grey-7"
                                        />
                                        Descrição completa: {{ job.description }}
                                    </div>

                                    <div class="text-body2 text-grey-8 row items-center">
                                        <q-icon
                                            name="date_range"
                                            size="13px"
                                            class="q-mr-xs text-grey-7"
                                        />
                                        Período de inscrições: {{ formatDate(job.applyStart) }} - {{ formatDate(job.applyEnd) }}
                                    </div>

                                    <div class="text-body2 text-grey-8 row items-center">
                                        <q-icon
                                            name="event"
                                            size="13px"
                                            class="q-mr-xs text-grey-7"
                                        />
                                        Criada em: {{ formatDateTime(job.createdAt) }}
                                    </div>

                                    <!-- Required Skills -->
                                    <div
                                        v-if="job.requiredSkills && job.requiredSkills.length > 0"
                                        class="q-mt-sm"
                                    >
                                        <div class="text-body2 text-grey-8 row items-center q-mb-xs">
                                            <q-icon
                                                name="checklist"
                                                size="13px"
                                                class="q-mr-xs text-grey-7"
                                            />
                                            Habilidades obrigatórias:
                                        </div>
                                        <div class="q-ml-lg">
                                            <div
                                                v-for="(skill, index) in job.requiredSkills"
                                                :key="index"
                                                class="text-caption text-grey-7 q-mb-xs"
                                            >
                                                <div class="text-weight-medium">
                                                    • {{ skill }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Nice to Have Skills -->
                                    <div
                                        v-if="job.niceToHaveSkills && job.niceToHaveSkills.length > 0"
                                        class="q-mt-sm"
                                    >
                                        <div class="text-body2 text-grey-8 row items-center q-mb-xs">
                                            <q-icon
                                                name="star_border"
                                                size="13px"
                                                class="q-mr-xs text-grey-7"
                                            />
                                            Habilidades desejáveis:
                                        </div>
                                        <div class="q-ml-lg">
                                            <div
                                                v-for="(skill, index) in job.niceToHaveSkills"
                                                :key="index"
                                                class="text-caption text-grey-7 q-mb-xs"
                                            >
                                                <div class="text-weight-medium">
                                                    • {{ skill }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Languages -->
                                    <div
                                        v-if="job.languagesRequired && job.languagesRequired.length > 0"
                                        class="q-mt-sm"
                                    >
                                        <div class="text-body2 text-grey-8 row items-center q-mb-xs">
                                            <q-icon
                                                name="language"
                                                size="13px"
                                                class="q-mr-xs text-grey-7"
                                            />
                                            Idiomas necessários:
                                        </div>
                                        <div class="q-ml-lg">
                                            <div
                                                v-for="(language, index) in job.languagesRequired"
                                                :key="index"
                                                class="text-caption text-grey-7 q-mb-xs"
                                            >
                                                <div class="text-weight-medium">
                                                    • {{ language }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Job Status Details -->
                                    <div class="q-mt-sm">
                                        <div class="text-body2 text-grey-8 row items-center q-mb-xs">
                                            <q-icon
                                                name="info"
                                                size="13px"
                                                class="q-mr-xs text-grey-7"
                                            />
                                            Status da Vaga:
                                        </div>
                                        <div class="q-ml-lg">
                                            <div class="text-caption text-grey-7 q-mb-xs">
                                                <div class="text-weight-medium">
                                                    • Status: {{ getStatusLabel(job.status) }}
                                                </div>
                                                <div
                                                    v-if="job.status === 'open'"
                                                    class="q-ml-md q-mt-xs"
                                                >
                                                    <div class="text-grey-6">
                                                        - {{ getExpirationStatus(job).text }}
                                                    </div>
                                                    <div
                                                        v-if="!isJobExpired(job)"
                                                        class="text-grey-6"
                                                    >
                                                        - Aceita inscrições até {{ formatDate(job.applyEnd) }}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Right side: Action buttons -->
                            <div class="col-auto">
                                <div class="column q-gutter-xs">
                                    <q-btn
                                        v-if="showEditAction"
                                        flat
                                        round
                                        size="sm"
                                        icon="edit"
                                        color="primary"
                                        @click="emit('edit-job', job)"
                                    >
                                        <q-tooltip>Editar vaga</q-tooltip>
                                    </q-btn>

                                    <q-btn
                                        v-if="showCloseAction && job.status === 'open'"
                                        flat
                                        round
                                        size="sm"
                                        icon="close"
                                        color="negative"
                                        @click="emit('close-job', job)"
                                    >
                                        <q-tooltip>Fechar vaga</q-tooltip>
                                    </q-btn>

                                    <q-btn
                                        v-if="showReopenAction && job.status === 'closed'"
                                        flat
                                        round
                                        size="sm"
                                        icon="launch"
                                        color="positive"
                                        @click="emit('reopen-job', job)"
                                    >
                                        <q-tooltip>Reabrir vaga</q-tooltip>
                                    </q-btn>
                                </div>
                            </div>
                        </div>
                    </q-card-section>
                </q-card>
            </q-expansion-item>
        </div>
    </div>
</template>

<style scoped lang="scss">
.status-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 0.75rem;
    font-weight: 600;
}

.status-open {
    background-color: #acfeac49;
    color: #209526;
}

.status-closed {
    background-color: #f3e5f5;
    color: #8e44ad;
}

.status-default {
    background-color: #e3f2fd;
    color: #1976d2;
}

.job-expansion-card {
    border-radius: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #3e3e3e;
    overflow: hidden;
    transition: box-shadow 0.2s ease;

    &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
}

.job-expansion-header {
    padding: 16px;
}

.expansion-content {
    border-top: 1px solid rgba(0, 0, 0, 0.05);
}

// Responsive adjustments
@media (max-width: 599px) {
    .job-expansion-header {
        padding: 12px;
    }

    .expansion-content {
        .q-card-section {
            padding: 12px !important;
        }
    }
}
</style>
