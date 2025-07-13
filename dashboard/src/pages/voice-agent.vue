<!-- eslint-disable camelcase -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Conversation } from '@elevenlabs/client';
import {
    mdiMicrophone,
    mdiMicrophoneOff,
    mdiAccountVoice,
    mdiPhoneHangup,
    mdiMagnify,
    mdiAccount,
    mdiBriefcase,
} from '@quasar/extras/mdi-v6';
import { useQuasar } from 'quasar';
import useError from '../hooks/useError';
import { useStoresStore } from '../stores/stores';
import baseButton from 'components/ui/base-button.vue';
import baseSelect from 'components/ui/base-select.vue';
import JobRepository from '../domain/jobs/repository';
import ConversationRepository from '../domain/conversations/repository';
import { BaseRef } from '../domain';
import { Job } from '../domain/jobs/entity';
import { Conversation as ConversationEntity } from '../domain/conversations/entity';

const $q = useQuasar();
const error = useError();
const storesStore = useStoresStore();

// State management
const isConnected = ref(false);
const isConnecting = ref(false);
const agentMode = ref<'listening' | 'speaking'>('listening');
const conversation = ref<any>(null);

// Data selection
const selectedJob = ref<BaseRef<Job> | null>(null);
const selectedCandidate = ref<BaseRef<ConversationEntity> | null>(null);
const selectedJobId = ref<string>('');
const selectedCandidateId = ref<string>('');
const jobs = ref<BaseRef<Job>[]>([]);
const candidates = ref<BaseRef<ConversationEntity>[]>([]);
const loadingJobs = ref(false);
const loadingCandidates = ref(false);

// Audio visualization
const canvasRef = ref<HTMLCanvasElement | null>(null);
const animationId = ref<number | null>(null);
const audioContext = ref<AudioContext | null>(null);
const analyser = ref<AnalyserNode | null>(null);
const dataArray = ref<Uint8Array | null>(null);
const audioLevel = ref(0);

// Replace with your actual agent ID from ElevenLabs
const AGENT_ID = 'agent_01k013wrazfjvsc9q92va4atvm';

const connectionStatus = ref<'disconnected' | 'connecting' | 'connected'>('disconnected');

// Computed properties for form validation
const canStartInterview = computed(() => {
    console.log('Selected job:', selectedJob.value);
    console.log('Selected candidate:', selectedCandidate.value);
    console.log('Is connecting:', isConnecting.value);
    console.log('Is connected:', isConnected.value);

    return selectedJob.value && selectedCandidate.value && !isConnecting.value && !isConnected.value;
});

// Load jobs and candidates
const loadJobs = async () => {
    if (!storesStore.currentStore) return;

    try {
        loadingJobs.value = true;
        jobs.value = await JobRepository.getAllJobs(storesStore.currentStore.id);
    } catch (err) {
        console.error('Error loading jobs:', err);
        error('Erro ao carregar vagas');
    } finally {
        loadingJobs.value = false;
    }
};

const loadCandidates = async () => {
    try {
        loadingCandidates.value = true;
        // Get candidates with USER role and completed profiles
        const allCandidates = await ConversationRepository.getConversationsByRole('USER');
        candidates.value = allCandidates.filter(candidate => candidate.profileCompleted);
    } catch (err) {
        console.error('Error loading candidates:', err);
        error('Erro ao carregar candidatos');
    } finally {
        loadingCandidates.value = false;
    }
};

// Build dynamic variables for the agent
const buildDynamicVariables = () => {
    if (!selectedJob.value || !selectedCandidate.value || !storesStore.currentStore) {
        return {};
    }

    const job = selectedJob.value;
    const candidate = selectedCandidate.value;
    const store = storesStore.currentStore;

    // Helper function to create conditional variables
    const createConditional = (condition: boolean, value = '') => {
        return condition ? value : '';
    };

    const variables = {
        // Required variables
        agentName: 'Assistente de Recrutamento',
        jobTitle: job.title || '',

        // Job information
        companyName: store.name || 'Empresa',
        title: job.title || '',
        seniorityLevel: job.seniorityLevel || '',
        location: job.location || '',
        workMode: job.workMode || '',
        jobType: job.jobType || '',
        numberOfPositions: job.numberOfPositions?.toString() || '1',
        minExperienceYears: job.minExperienceYears?.toString() || '0',
        description: job.description || '',
        requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : job.requiredSkills || '',
        niceToHaveSkills: Array.isArray(job.niceToHaveSkills) ? job.niceToHaveSkills.join(', ') : job.niceToHaveSkills || '',
        languagesRequired: Array.isArray(job.languagesRequired) ? job.languagesRequired.join(', ') : job.languagesRequired || '',

        // Salary information
        salaryRangemin: job.salaryRange?.min?.toString() || '',
        salaryRangemax: job.salaryRange?.max?.toString() || '',

        // Candidate information
        candidateFullName: candidate.relevantData?.fullName || candidate.name || '',
        candidateRegion: candidate.relevantData?.region || '',
        candidateExpectedSalary: candidate.relevantData?.expectedSalary?.toString() || '',
        candidateEmploymentStatus: candidate.employed ? 'Empregado' : 'Desempregado',
        candidateInterests: Array.isArray(candidate.relevantData?.interests) ? candidate.relevantData.interests.join(', ') : '',
        candidateLinkedIn: candidate.relevantData?.linkedin?.url || '',
        candidateResumeUrl: candidate.relevantData?.resume?.url || '',

        // Conditional variables (if_xxx)
        if_salaryRange: createConditional(Boolean(job.salaryRange?.min && job.salaryRange?.max)),
        if_candidateFullName: createConditional(Boolean(candidate.relevantData?.fullName || candidate.name)),
        if_niceToHaveSkills: createConditional(Boolean(job.niceToHaveSkills && job.niceToHaveSkills.length > 0)),
        if_languagesRequired: createConditional(Boolean(job.languagesRequired && job.languagesRequired.length > 0)),
        if_candidateInterests: createConditional(Boolean(candidate.relevantData?.interests && candidate.relevantData.interests.length > 0)),
        if_candidateRegion: createConditional(Boolean(candidate.relevantData?.region)),
        if_location: createConditional(Boolean(job.location)),
        if_workMode: createConditional(Boolean(job.workMode)),
        if_minExperienceYears: createConditional(Boolean(job.minExperienceYears && job.minExperienceYears > 0)),
        if_candidateResumeUrl: createConditional(Boolean(candidate.relevantData?.resume?.url)),
        if_candidateEmployed: createConditional(Boolean(candidate.employed)),
        if_candidateExpectedSalary: createConditional(Boolean(candidate.relevantData?.expectedSalary)),
        if_numberOfPositions: createConditional(Boolean(job.numberOfPositions && job.numberOfPositions > 1)),
        if_seniorityLevel: createConditional(Boolean(job.seniorityLevel)),
    };

    return variables;
};

// Audio visualization class
class AudioVisualizer {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    centerX: number;
    centerY: number;
    baseRadius: number;
    time = 0;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;
        this.baseRadius = Math.min(canvas.width, canvas.height) * 0.42;
    }

    resize() {
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.baseRadius = Math.min(this.canvas.width, this.canvas.height) * 0.42;
    }

    draw(audioLevel: number, isConnected: boolean, agentMode: 'listening' | 'speaking') {
        const { ctx, centerX, centerY, baseRadius } = this;

        // Clear canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update time
        this.time += 0.05;

        // Determine accent color based on connection and mode
        let accentColor = '#9CA3AF'; // Default gray

        if (isConnected) {
            if (agentMode === 'speaking') {
                accentColor = '#1976D2'; // Primary blue
            } else {
                accentColor = '#21BA45'; // Positive green
            }
        }

        // Draw the main filled circle
        if (audioLevel > 0.05) {
            // When audio is detected, create wave-like border distortions
            ctx.beginPath();
            const wavePoints = 64; // More points for smoother waves
            const angleStep = (Math.PI * 2) / wavePoints;

            for (let i = 0; i <= wavePoints; i++) {
                const angle = i * angleStep;

                // Create wave-like distortions based on audio level
                const wave1 = Math.sin(angle * 3 + this.time * 2) * audioLevel * 12;
                const wave2 = Math.sin(angle * 5 + this.time * 1.5) * audioLevel * 8;
                const wave3 = Math.sin(angle * 7 + this.time * 2.5) * audioLevel * 6;

                // Combine waves for complex audio-reactive border
                const waveDistortion = (wave1 + wave2 + wave3) * 0.4;
                const radius = baseRadius + waveDistortion;

                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            ctx.closePath();
            ctx.fillStyle = accentColor;
            ctx.fill();
        } else {
            // When no audio, draw a perfect circle
            ctx.beginPath();
            ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
            ctx.fillStyle = accentColor;
            ctx.fill();
        }

        // Add subtle inner highlight when connected
        if (isConnected) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, baseRadius * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + audioLevel * 0.15})`;
            ctx.fill();
        }
    }
}

let visualizer: AudioVisualizer | null = null;

const startAudioVisualization = async () => {
    if (!canvasRef.value) return;

    try {
        // Create audio context and analyser
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyserNode = context.createAnalyser();

        // Configure analyser
        analyserNode.fftSize = 2048;
        analyserNode.smoothingTimeConstant = 0.8;

        // Get microphone stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = context.createMediaStreamSource(stream);
        source.connect(analyserNode);

        // Create data array for frequency data
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArrayBuffer = new Uint8Array(bufferLength);

        // Store references
        audioContext.value = context;
        analyser.value = analyserNode;
        dataArray.value = dataArrayBuffer;

        // Create visualizer
        visualizer = new AudioVisualizer(canvasRef.value);

        // Start animation loop
        const animate = () => {
            if (!analyser.value || !dataArray.value || !visualizer) return;

            // Get frequency data
            analyser.value.getByteFrequencyData(dataArray.value);

            // Calculate audio level
            let sum = 0;
            for (let i = 0; i < dataArray.value.length; i++) {
                sum += dataArray.value[i];
            }
            const average = sum / dataArray.value.length;
            audioLevel.value = Math.min(average / 128, 1); // Normalize to 0-1

            // Draw visualization
            visualizer.draw(audioLevel.value, isConnected.value, agentMode.value);

            animationId.value = requestAnimationFrame(animate);
        };

        animate();

    } catch (err) {
        console.error('Error starting audio visualization:', err);
        error('Erro ao iniciar visualização de áudio');
    }
};

const stopAudioVisualization = () => {
    if (animationId.value) {
        cancelAnimationFrame(animationId.value);
        animationId.value = null;
    }

    if (audioContext.value) {
        audioContext.value.close();
        audioContext.value = null;
    }

    analyser.value = null;
    dataArray.value = null;
    visualizer = null;
    audioLevel.value = 0;
};

const resizeCanvas = () => {
    if (!canvasRef.value) return;

    const canvas = canvasRef.value;
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.4;

    canvas.width = size;
    canvas.height = size;

    if (visualizer) {
        visualizer.resize();
    }
};

const startConversation = async () => {
    if (!canStartInterview.value) return;

    try {
        connectionStatus.value = 'connecting';
        isConnecting.value = true;

        // Start audio visualization first
        await startAudioVisualization();

        // Build dynamic variables
        const dynamicVariables = buildDynamicVariables();

        console.log('Dynamic variables:', dynamicVariables);

        // Start the conversation
        conversation.value = await Conversation.startSession({
            agentId: AGENT_ID,
            dynamicVariables,
            onConnect: () => {
                connectionStatus.value = 'connected';
                isConnected.value = true;
                isConnecting.value = false;
                $q.notify({
                    message: 'Conectado ao agente de voz',
                    color: 'positive',
                    icon: mdiAccountVoice,
                });
            },
            onDisconnect: () => {
                connectionStatus.value = 'disconnected';
                isConnected.value = false;
                isConnecting.value = false;
                stopAudioVisualization();
                $q.notify({
                    message: 'Desconectado do agente de voz',
                    color: 'info',
                    icon: mdiMicrophoneOff,
                });
            },
            onError: (err: any) => {
                console.error('Erro na conversa:', err);
                connectionStatus.value = 'disconnected';
                isConnected.value = false;
                isConnecting.value = false;
                stopAudioVisualization();
                error('Erro na conversa com o agente de voz');
            },
            onModeChange: (mode: any) => {
                agentMode.value = mode.mode === 'speaking' ? 'speaking' : 'listening';
            },
        });
    } catch (err: any) {
        console.error('Falha ao iniciar conversa:', err);
        connectionStatus.value = 'disconnected';
        isConnecting.value = false;
        stopAudioVisualization();

        if (err.name === 'NotAllowedError') {
            error('Permissão do microfone negada. Por favor, permita o acesso ao microfone.');
        } else {
            error('Falha ao iniciar conversa com o agente de voz');
        }
    }
};

const stopConversation = async () => {
    if (conversation.value) {
        try {
            await conversation.value.endSession();
            conversation.value = null;
            connectionStatus.value = 'disconnected';
            isConnected.value = false;
            agentMode.value = 'listening';
            stopAudioVisualization();
        } catch (err) {
            console.error('Erro ao parar conversa:', err);
            error('Erro ao parar conversa');
        }
    }
};

// Lifecycle hooks
onMounted(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Load initial data
    loadJobs();
    loadCandidates();
});

onUnmounted(() => {
    window.removeEventListener('resize', resizeCanvas);
    stopAudioVisualization();
    if (conversation.value) {
        conversation.value.endSession();
    }
});

// Status text helpers
const getStatusText = () => {
    switch (connectionStatus.value) {
        case 'connecting':
            return 'Conectando...';
        case 'connected':
            return 'Conectado';
        case 'disconnected':
        default:
            return 'Desconectado';
    }
};

const getStatusColor = () => {
    switch (connectionStatus.value) {
        case 'connecting':
            return 'orange';
        case 'connected':
            return 'positive';
        case 'disconnected':
        default:
            return 'negative';
    }
};

const getAgentModeText = () => {
    return agentMode.value === 'speaking' ? 'falando' : 'ouvindo';
};

const getAgentModeColor = () => {
    return agentMode.value === 'speaking' ? 'primary' : 'positive';
};

// Computed properties for select options
const jobOptions = computed(() => {
    return jobs.value.map(job => ({
        label: `${job.title} - ${storesStore.currentStore?.name || 'Empresa'}`,
        value: job.id,
        job: job,
    }));
});

const candidateOptions = computed(() => {
    return candidates.value.map(candidate => ({
        label: candidate.relevantData?.fullName || candidate.name || 'Candidato',
        value: candidate.id,
        candidate: candidate,
    }));
});

// Handlers for select changes
const onJobChange = (jobId: string) => {
    selectedJobId.value = jobId;
    const job = jobs.value.find(j => j.id === jobId);
    selectedJob.value = job || null;
};

const onCandidateChange = (candidateId: string) => {
    selectedCandidateId.value = candidateId;
    const candidate = candidates.value.find(c => c.id === candidateId);
    selectedCandidate.value = candidate || null;
};
</script>

<template>
    <q-page class="flex flex-center">
        <div
            class="column items-center q-gutter-lg"
            style="max-width: 800px; width: 100%;"
        >
            <!-- Header -->
            <div class="text-center">
                <div class="text-h4 text-weight-bold q-mb-md q-mt-md">
                    <q-icon
                        :name="mdiAccountVoice"
                        size="md"
                        class="q-mr-sm"
                    />
                    Entrevista com IA
                </div>
                <div class="text-body1 text-grey-7">
                    Evolua seu processo de recrutamento com a IA
                </div>
            </div>

            <!-- Selection Cards -->
            <div class="row q-gutter-md full-width">
                <div class="col-12 col-md-6">
                    <q-card class="full-height">
                        <q-card-section>
                            <div class="text-h6 q-mb-md">
                                <q-icon
                                    :name="mdiBriefcase"
                                    class="q-mr-sm"
                                />
                                Selecionar Vaga
                            </div>
                            <base-select
                                v-model="selectedJobId"
                                emit-value
                                map-options
                                option-label="label"
                                option-value="value"
                                :options="jobOptions"
                                label="Escolha a vaga"
                                placeholder="Selecione uma vaga"
                                :loading="loadingJobs"
                                @update:model-value="onJobChange"
                            />
                            <div
                                v-if="selectedJob"
                                class="text-caption text-grey-6 q-mt-sm"
                            >
                                {{ selectedJob.title }} - {{ selectedJob.seniorityLevel }}
                            </div>
                        </q-card-section>
                    </q-card>
                </div>
                <div class="col-12 col-md-6">
                    <q-card class="full-height">
                        <q-card-section>
                            <div class="text-h6 q-mb-md">
                                <q-icon
                                    :name="mdiAccount"
                                    class="q-mr-sm"
                                />
                                Selecionar Candidato
                            </div>
                            <base-select
                                v-model="selectedCandidateId"
                                emit-value
                                map-options
                                option-label="label"
                                option-value="value"
                                :options="candidateOptions"
                                label="Escolha o candidato"
                                placeholder="Selecione um candidato"
                                :loading="loadingCandidates"
                                @update:model-value="onCandidateChange"
                            />
                            <div
                                v-if="selectedCandidate"
                                class="text-caption text-grey-6 q-mt-sm"
                            >
                                {{ selectedCandidate.relevantData?.fullName || selectedCandidate.name }} - {{ selectedCandidate.relevantData?.region }}
                            </div>
                        </q-card-section>
                    </q-card>
                </div>
            </div>

            <!-- Audio Visualization -->
            <div class="audio-visualization-container">
                <canvas
                    ref="canvasRef"
                    class="audio-canvas"
                />
            </div>

            <!-- Controls -->
            <div class="row q-gutter-md">
                <base-button
                    v-if="!isConnected"
                    :loading="isConnecting"
                    :disable="!canStartInterview"
                    color="accent"
                    :icon="mdiMicrophone"
                    label="Iniciar Entrevista"
                    @click="startConversation"
                />
                <base-button
                    v-if="isConnected"
                    color="negative"
                    :icon="mdiPhoneHangup"
                    label="Parar Entrevista"
                    size="lg"
                    @click="stopConversation"
                />
            </div>

            <!-- Status Information -->
            <div
                v-if="isConnected"
                class="row q-gutter-md full-width"
            >
                <div class="col">
                    <q-card class="text-center">
                        <q-card-section>
                            <div class="text-caption text-grey-6">
                                Status da Conexão
                            </div>
                            <div class="text-h6 q-mt-xs">
                                <q-badge
                                    :color="getStatusColor()"
                                    :label="getStatusText()"
                                />
                            </div>
                        </q-card-section>
                    </q-card>
                </div>
                <div class="col">
                    <q-card class="text-center">
                        <q-card-section>
                            <div class="text-caption text-grey-6">
                                Agente está
                            </div>
                            <div class="text-h6 q-mt-xs">
                                <q-badge
                                    :color="getAgentModeColor()"
                                    :label="getAgentModeText()"
                                />
                            </div>
                        </q-card-section>
                    </q-card>
                </div>
            </div>

            <!-- Instructions -->
            <q-card
                class="full-width"
                flat
                bordered
            >
                <q-card-section>
                    <div class="text-h6 q-mb-md">
                        <q-icon
                            name="info"
                            class="q-mr-sm"
                        />
                        Como usar
                    </div>
                    <div class="text-body2">
                        <ol class="q-pl-md">
                            <li>Selecione a vaga que será entrevistada</li>
                            <li>Escolha o candidato para a entrevista</li>
                            <li>Clique em "Iniciar Entrevista" para começar</li>
                            <li>Permita o acesso ao microfone quando solicitado</li>
                            <li>Participe da entrevista normalmente</li>
                            <li>Clique em "Parar Entrevista" quando terminar</li>
                        </ol>
                    </div>
                </q-card-section>
            </q-card>
        </div>
    </q-page>
</template>

<style scoped lang="scss">
.audio-visualization-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}

.audio-canvas {
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.05);
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;

    &:hover {
        transform: scale(1.02);
    }
}

// Responsive adjustments
@media (max-width: 480px) {
    .audio-canvas {
        width: 200px !important;
        height: 200px !important;
    }
}
</style>
