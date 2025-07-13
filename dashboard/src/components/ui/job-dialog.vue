<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { BaseRef } from '../../domain';
import { Job, WorkMode, JobType, JobStatus } from '../../domain/jobs/entity';
import BaseButton from './base-button.vue';
import BaseInput from './base-input.vue';
import BaseSelect from './base-select.vue';
import { useQuasar } from 'quasar';

interface JobFormData {
    title: string;
    description: string;
    location: string;
    numberOfPositions: number | string;
    seniorityLevel: string;
    requiredSkills: string[];
    niceToHaveSkills: string[];
    languagesRequired: string[];
    salaryRange: {
        min: number | string;
        max: number | string;
    };
    minExperienceYears: number | string;
    workMode: WorkMode;
    jobType: JobType;
    applyStart: string;
    applyEnd: string;
    status: JobStatus;
}

interface Props {
    modelValue: boolean;
    job?: BaseRef<Job> | null;
    loading?: boolean;
    mode: 'create' | 'edit';
}

interface Emits {
    (e: 'update:modelValue', value: boolean): void;
    (e: 'save', formData: JobFormData): void;
}

const props = withDefaults(defineProps<Props>(), {
    job: null,
    loading: false,
});

const emit = defineEmits<Emits>();

const $q = useQuasar();
const isMobile = computed(() => $q.screen.lt.md);

// Form data
const jobForm = ref<JobFormData>({
    title: '',
    description: '',
    location: '',
    numberOfPositions: 1,
    seniorityLevel: '',
    requiredSkills: [],
    niceToHaveSkills: [],
    languagesRequired: [],
    salaryRange: {
        min: '',
        max: '',
    },
    minExperienceYears: '',
    workMode: 'remote',
    jobType: 'full_time',
    applyStart: '',
    applyEnd: '',
    status: 'open',
});

// New skill inputs
const newRequiredSkill = ref('');
const newNiceToHaveSkill = ref('');
const newLanguage = ref('');

// Options for selects
const workModeOptions = [
    { label: 'Remoto', value: 'remote' },
    { label: 'Híbrido', value: 'hybrid' },
    { label: 'Presencial', value: 'on_site' },
];

const jobTypeOptions = [
    { label: 'Tempo Integral', value: 'full_time' },
    { label: 'Meio Período', value: 'part_time' },
    { label: 'Contrato', value: 'contract' },
];

const statusOptions = [
    { label: 'Aberta', value: 'open' },
    { label: 'Fechada', value: 'closed' },
];

const seniorityOptions = [
    { label: 'Estagiário', value: 'intern' },
    { label: 'Júnior', value: 'junior' },
    { label: 'Pleno', value: 'mid' },
    { label: 'Sênior', value: 'senior' },
    { label: 'Especialista', value: 'specialist' },
    { label: 'Líder Técnico', value: 'tech_lead' },
];

// Validation rules
const titleRules = [(val: string) => Boolean(val) || 'Título é obrigatório'];
const descriptionRules = [(val: string) => Boolean(val) || 'Descrição é obrigatória'];
const locationRules = [(val: string) => Boolean(val) || 'Localização é obrigatória'];
const numberOfPositionsRules = [(val: number | string) => {
    const num = Number(val);
    return (Boolean(val) && num > 0) || 'Número de vagas deve ser maior que 0';
}];
const startDateRules = [(val: string) => Boolean(val) || 'Data de início é obrigatória'];
const endDateRules = [(val: string) => Boolean(val) || 'Data de fim é obrigatória'];

// Computed properties
const dialogTitle = computed(() => props.mode === 'create' ? 'Nova Vaga' : 'Editar Vaga');
const submitButtonLabel = computed(() => props.mode === 'create' ? 'Criar Vaga' : 'Salvar Alterações');

const showDialog = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value),
});

// Watch for job changes to populate form
watch(() => props.job, newJob => {
    if (newJob && props.mode === 'edit') {
        jobForm.value = {
            title: newJob.title,
            description: newJob.description,
            location: newJob.location,
            numberOfPositions: newJob.numberOfPositions || 1,
            seniorityLevel: newJob.seniorityLevel,
            requiredSkills: [...newJob.requiredSkills],
            niceToHaveSkills: [...(newJob.niceToHaveSkills || [])],
            languagesRequired: [...(newJob.languagesRequired || [])],
            salaryRange: {
                min: newJob.salaryRange?.min || '',
                max: newJob.salaryRange?.max || '',
            },
            minExperienceYears: newJob.minExperienceYears || '',
            workMode: newJob.workMode,
            jobType: newJob.jobType,
            applyStart: new Date(newJob.applyStart).toISOString().split('T')[0],
            applyEnd: new Date(newJob.applyEnd).toISOString().split('T')[0],
            status: newJob.status,
        };
    } else if (props.mode === 'create') {
        // Reset form for create mode
        jobForm.value = {
            title: '',
            description: '',
            location: '',
            numberOfPositions: 1,
            seniorityLevel: '',
            requiredSkills: [],
            niceToHaveSkills: [],
            languagesRequired: [],
            salaryRange: {
                min: '',
                max: '',
            },
            minExperienceYears: '',
            workMode: 'remote',
            jobType: 'full_time',
            applyStart: '',
            applyEnd: '',
            status: 'open',
        };
    }
}, { immediate: true });

// Watch for mode changes to reset form
watch(() => props.mode, newMode => {
    if (newMode === 'create') {
        jobForm.value = {
            title: '',
            description: '',
            location: '',
            numberOfPositions: 1,
            seniorityLevel: '',
            requiredSkills: [],
            niceToHaveSkills: [],
            languagesRequired: [],
            salaryRange: {
                min: '',
                max: '',
            },
            minExperienceYears: '',
            workMode: 'remote',
            jobType: 'full_time',
            applyStart: '',
            applyEnd: '',
            status: 'open',
        };
        newRequiredSkill.value = '';
        newNiceToHaveSkill.value = '';
        newLanguage.value = '';
    }
});

// Form functions
function addRequiredSkill() {
    if (newRequiredSkill.value.trim()) {
        jobForm.value.requiredSkills.push(newRequiredSkill.value.trim());
        newRequiredSkill.value = '';
    }
}

function removeRequiredSkill(index: number) {
    jobForm.value.requiredSkills.splice(index, 1);
}

function addNiceToHaveSkill() {
    if (newNiceToHaveSkill.value.trim()) {
        jobForm.value.niceToHaveSkills.push(newNiceToHaveSkill.value.trim());
        newNiceToHaveSkill.value = '';
    }
}

function removeNiceToHaveSkill(index: number) {
    jobForm.value.niceToHaveSkills.splice(index, 1);
}

function addLanguage() {
    if (newLanguage.value.trim()) {
        jobForm.value.languagesRequired.push(newLanguage.value.trim());
        newLanguage.value = '';
    }
}

function removeLanguage(index: number) {
    jobForm.value.languagesRequired.splice(index, 1);
}

function handleSubmit() {
    emit('save', { ...jobForm.value });
}

function closeDialog() {
    showDialog.value = false;
}
</script>

<template>
    <q-dialog
        v-model="showDialog"
        persistent
        :maximized="isMobile"
        :transition-show="isMobile ? 'slide-up' : 'scale'"
        :transition-hide="isMobile ? 'slide-down' : 'scale'"
    >
        <q-card
            :class="[
                'full-width',
                { 'dialog-desktop': !isMobile }
            ]"
        >
            <q-card-section class="row items-center q-pb-none">
                <div class="text-h6">
                    {{ dialogTitle }}
                </div>
                <q-space />
                <q-btn
                    v-close-popup
                    icon="close"
                    flat
                    round
                    dense
                />
            </q-card-section>

            <q-card-section class="q-pt-none">
                <q-form @submit="handleSubmit">
                    <div class="q-gutter-md">
                        <!-- Basic Information -->
                        <div class="row q-gutter-md">
                            <div class="col">
                                <base-input
                                    v-model="jobForm.title"
                                    label="Título da Vaga"
                                    placeholder="Ex: Desenvolvedor Frontend"
                                    :rules="titleRules"
                                    required
                                />
                            </div>
                        </div>

                        <base-input
                            v-model="jobForm.description"
                            label="Descrição"
                            placeholder="Descreva a vaga..."
                            type="textarea"
                            rows="4"
                            :rules="descriptionRules"
                            required
                        />

                        <div class="row q-gutter-md">
                            <div class="col">
                                <base-input
                                    v-model="jobForm.location"
                                    label="Localização"
                                    placeholder="Ex: São Paulo, SP"
                                    :rules="locationRules"
                                    required
                                />
                            </div>
                            <div class="col">
                                <base-input
                                    v-model.number="jobForm.numberOfPositions"
                                    label="Número de Vagas"
                                    placeholder="Ex: 2"
                                    type="number"
                                    :rules="numberOfPositionsRules"
                                    required
                                />
                            </div>
                            <div class="col">
                                <base-select
                                    v-model="jobForm.seniorityLevel"
                                    label="Nível de Senioridade"
                                    placeholder="Selecione o nível"
                                    :options="seniorityOptions"
                                    emit-value
                                    map-options
                                    required
                                />
                            </div>
                        </div>

                        <!-- Work Details -->
                        <div class="row q-gutter-md">
                            <div class="col">
                                <base-select
                                    v-model="jobForm.workMode"
                                    label="Modo de Trabalho"
                                    placeholder="Selecione o modo"
                                    :options="workModeOptions"
                                    emit-value
                                    map-options
                                    required
                                />
                            </div>
                            <div class="col">
                                <base-select
                                    v-model="jobForm.jobType"
                                    label="Tipo de Contrato"
                                    placeholder="Selecione o tipo"
                                    :options="jobTypeOptions"
                                    emit-value
                                    map-options
                                    required
                                />
                            </div>
                        </div>

                        <!-- Salary and Experience -->
                        <div class="row q-gutter-md">
                            <div class="col">
                                <base-input
                                    v-model.number="jobForm.salaryRange.min"
                                    label="Salário Mínimo"
                                    placeholder="Ex: 5000"
                                    type="number"
                                />
                            </div>
                            <div class="col">
                                <base-input
                                    v-model.number="jobForm.salaryRange.max"
                                    label="Salário Máximo"
                                    placeholder="Ex: 8000"
                                    type="number"
                                />
                            </div>
                            <div class="col">
                                <base-input
                                    v-model.number="jobForm.minExperienceYears"
                                    label="Experiência Mínima (anos)"
                                    placeholder="Ex: 2"
                                    type="number"
                                />
                            </div>
                        </div>

                        <!-- Dates -->
                        <div class="row q-gutter-md">
                            <div class="col">
                                <base-input
                                    v-model="jobForm.applyStart"
                                    label="Data de Início das Inscrições"
                                    placeholder="DD/MM/YYYY"
                                    type="date"
                                    :rules="startDateRules"
                                    required
                                />
                            </div>
                            <div class="col">
                                <base-input
                                    v-model="jobForm.applyEnd"
                                    label="Data de Fim das Inscrições"
                                    placeholder="DD/MM/YYYY"
                                    type="date"
                                    :rules="endDateRules"
                                    required
                                />
                            </div>
                        </div>

                        <!-- Status (for edit mode) -->
                        <div v-if="props.mode === 'edit'">
                            <base-select
                                v-model="jobForm.status"
                                label="Status da Vaga"
                                placeholder="Selecione o status"
                                :options="statusOptions"
                                emit-value
                                map-options
                                required
                            />
                        </div>

                        <!-- Required Skills Section -->
                        <div>
                            <div class="text-subtitle2 q-mb-sm">
                                Habilidades Obrigatórias
                            </div>
                            <div class="row q-gutter-sm q-mb-md">
                                <div class="col">
                                    <base-input
                                        v-model="newRequiredSkill"
                                        placeholder="Digite uma habilidade obrigatória..."
                                        @keyup.enter="addRequiredSkill"
                                    />
                                </div>
                                <div class="col-auto">
                                    <base-button
                                        icon="add"
                                        color="accent"
                                        @click="addRequiredSkill"
                                    />
                                </div>
                            </div>
                            <div
                                v-if="jobForm.requiredSkills.length > 0"
                                class="q-gutter-xs"
                            >
                                <q-chip
                                    v-for="(skill, index) in jobForm.requiredSkills"
                                    :key="index"
                                    removable
                                    color="red-1"
                                    text-color="red-8"
                                    @remove="removeRequiredSkill(index)"
                                >
                                    {{ skill }}
                                </q-chip>
                            </div>
                        </div>

                        <!-- Nice to Have Skills Section -->
                        <div>
                            <div class="text-subtitle2 q-mb-sm">
                                Habilidades Desejáveis
                            </div>
                            <div class="row q-gutter-sm q-mb-md">
                                <div class="col">
                                    <base-input
                                        v-model="newNiceToHaveSkill"
                                        placeholder="Digite uma habilidade desejável..."
                                        @keyup.enter="addNiceToHaveSkill"
                                    />
                                </div>
                                <div class="col-auto">
                                    <base-button
                                        icon="add"
                                        color="accent"
                                        @click="addNiceToHaveSkill"
                                    />
                                </div>
                            </div>
                            <div
                                v-if="jobForm.niceToHaveSkills.length > 0"
                                class="q-gutter-xs"
                            >
                                <q-chip
                                    v-for="(skill, index) in jobForm.niceToHaveSkills"
                                    :key="index"
                                    removable
                                    color="blue-1"
                                    text-color="blue-8"
                                    @remove="removeNiceToHaveSkill(index)"
                                >
                                    {{ skill }}
                                </q-chip>
                            </div>
                        </div>

                        <!-- Languages Section -->
                        <div>
                            <div class="text-subtitle2 q-mb-sm">
                                Idiomas Necessários
                            </div>
                            <div class="row q-gutter-sm q-mb-md">
                                <div class="col">
                                    <base-input
                                        v-model="newLanguage"
                                        placeholder="Digite um idioma..."
                                        @keyup.enter="addLanguage"
                                    />
                                </div>
                                <div class="col-auto">
                                    <base-button
                                        icon="add"
                                        color="accent"
                                        @click="addLanguage"
                                    />
                                </div>
                            </div>
                            <div
                                v-if="jobForm.languagesRequired.length > 0"
                                class="q-gutter-xs"
                            >
                                <q-chip
                                    v-for="(language, index) in jobForm.languagesRequired"
                                    :key="index"
                                    removable
                                    color="green-1"
                                    text-color="green-8"
                                    @remove="removeLanguage(index)"
                                >
                                    {{ language }}
                                </q-chip>
                            </div>
                        </div>
                    </div>

                    <q-card-actions
                        align="right"
                        class="q-pt-lg"
                    >
                        <base-button
                            flat
                            label="Cancelar"
                            @click="closeDialog"
                        />
                        <base-button
                            type="submit"
                            color="accent"
                            :label="submitButtonLabel"
                            :loading="loading"
                        />
                    </q-card-actions>
                </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<style scoped lang="scss">
.dialog-desktop {
    border-radius: 10px;
    max-width: 800px;
    width: 100%;
}
</style>
