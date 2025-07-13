<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { BaseRef } from '../../domain';
import { Job } from '../../domain/jobs/entity';
import BaseButton from './base-button.vue';
import BaseInput from './base-input.vue';
import { useQuasar } from 'quasar';

interface JobFormData {
    title: string;
    description: string;
    requirements: string[];
    applyStart: string;
    applyEnd: string;
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
    requirements: [],
    applyStart: '',
    applyEnd: '',
});

// New requirement input
const newRequirement = ref('');

// Validation rules
const titleRules = [(val: string) => Boolean(val) || 'Título é obrigatório'];
const descriptionRules = [(val: string) => Boolean(val) || 'Descrição é obrigatória'];
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
            requirements: [...newJob.requirements],
            applyStart: new Date(newJob.applyStart).toISOString().split('T')[0],
            applyEnd: new Date(newJob.applyEnd).toISOString().split('T')[0],
        };
    } else if (props.mode === 'create') {
        // Reset form for create mode
        jobForm.value = {
            title: '',
            description: '',
            requirements: [],
            applyStart: '',
            applyEnd: '',
        };
    }
}, { immediate: true });

// Watch for mode changes to reset form
watch(() => props.mode, newMode => {
    if (newMode === 'create') {
        jobForm.value = {
            title: '',
            description: '',
            requirements: [],
            applyStart: '',
            applyEnd: '',
        };
        newRequirement.value = '';
    }
});

// Form functions
function addRequirement() {
    if (newRequirement.value.trim()) {
        jobForm.value.requirements.push(newRequirement.value.trim());
        newRequirement.value = '';
    }
}

function removeRequirement(index: number) {
    jobForm.value.requirements.splice(index, 1);
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
                        <base-input
                            v-model="jobForm.title"
                            label="Título da Vaga"
                            placeholder="Ex: Desenvolvedor Frontend"
                            :rules="titleRules"
                            required
                        />

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

                        <!-- Requirements Section -->
                        <div>
                            <div class="text-subtitle2 q-mb-sm">
                                Requisitos
                            </div>
                            <div class="row q-gutter-sm q-mb-md">
                                <div class="col">
                                    <base-input
                                        v-model="newRequirement"
                                        placeholder="Digite um requisito..."
                                        @keyup.enter="addRequirement"
                                    />
                                </div>
                                <div class="col-auto">
                                    <base-button
                                        icon="add"
                                        color="accent"
                                        @click="addRequirement"
                                    />
                                </div>
                            </div>
                            <div
                                v-if="jobForm.requirements.length > 0"
                                class="q-gutter-xs"
                            >
                                <q-chip
                                    v-for="(requirement, index) in jobForm.requirements"
                                    :key="index"
                                    removable
                                    color="blue-1"
                                    text-color="blue-8"
                                    @remove="removeRequirement(index)"
                                >
                                    {{ requirement }}
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
    max-width: 600px;
    width: 100%;
}
</style>
