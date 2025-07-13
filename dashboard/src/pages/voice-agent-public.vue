<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { Conversation } from '@elevenlabs/client';
import {
    mdiMicrophone,
    mdiMicrophoneOff,
    mdiAccountVoice,
    mdiPhoneHangup,
} from '@quasar/extras/mdi-v6';
import { useQuasar } from 'quasar';
import useError from '../hooks/useError';
import baseButton from 'components/ui/base-button.vue';
import JobRepository from '../domain/jobs/repository';
import ConversationRepository from '../domain/conversations/repository';
import StoreRepository from '../domain/stores/repository';
import { BaseRef } from '../domain';
import { Job } from '../domain/jobs/entity';
import { Conversation as ConversationEntity } from '../domain/conversations/entity';
import { Store } from '../domain/stores/entity';

const $q = useQuasar();
const route = useRoute();
const error = useError();

// State management
const isConnected = ref(false);
const isConnecting = ref(false);
const agentMode = ref<'listening' | 'speaking'>('listening');
const conversation = ref<any>(null);

// Data from route
const jobId = computed(() => route.params.jobId as string);
const candidateId = computed(() => route.params.candidateId as string);

// Loaded data
const job = ref<BaseRef<Job> | null>(null);
const candidate = ref<BaseRef<ConversationEntity> | null>(null);
const store = ref<BaseRef<Store> | null>(null);
const loading = ref(false);
const loadingError = ref<string | null>(null);

// Audio visualization
const canvasRef = ref<HTMLCanvasElement | null>(null);
const animationId = ref<number | null>(null);
const audioContext = ref<AudioContext | null>(null);
const analyser = ref<AnalyserNode | null>(null);
const dataArray = ref<Uint8Array | null>(null);
const audioLevel = ref(0);

// Replace with your actual agent ID from ElevenLabs
const AGENT_ID = 'agent_01k002cjj1edjage0m0gzfvg35';

const connectionStatus = ref<'disconnected' | 'connecting' | 'connected'>('disconnected');

// Computed properties for form validation
const canStartInterview = computed(() => {
    return job.value && candidate.value && store.value && !isConnecting.value && !isConnected.value && !loading.value;
});

// Load job, candidate, and store data
const loadData = async () => {
    if (!jobId.value || !candidateId.value) {
        loadingError.value = 'IDs de vaga e candidato são obrigatórios';
        return;
    }

    try {
        loading.value = true;
        loadingError.value = null;

        // Load job and candidate in parallel
        const [jobData, candidateData] = await Promise.all([
            JobRepository.getJob(jobId.value),
            ConversationRepository.getConversation(candidateId.value),
        ]);

        if (!jobData) {
            loadingError.value = 'Vaga não encontrada';
            return;
        }

        if (!candidateData) {
            loadingError.value = 'Candidato não encontrado';
            return;
        }

        job.value = jobData;
        candidate.value = candidateData;

        // Load store data
        const storeData = await StoreRepository.getStore(jobData.storeId);
        if (!storeData) {
            loadingError.value = 'Empresa não encontrada';
            return;
        }

        store.value = storeData;

    } catch (err) {
        console.error('Error loading data:', err);
        loadingError.value = 'Erro ao carregar dados da entrevista';
    } finally {
        loading.value = false;
    }
};

// Build dynamic variables for the agent
const buildDynamicVariables = () => {
    if (!job.value || !candidate.value || !store.value) {
        return {};
    }

    const jobData = job.value;
    const candidateData = candidate.value;
    const storeData = store.value;

    // Helper function to create conditional variables
    const createConditional = (condition: boolean, value = '') => {
        return condition ? value : '';
    };

    const variables = {
        // Required variables
        agentName: 'Assistente de Recrutamento',
        jobTitle: jobData.title || '',

        // Job information
        companyName: storeData.name || 'Empresa',
        title: jobData.title || '',
        seniorityLevel: jobData.seniorityLevel || '',
        location: jobData.location || '',
        workMode: jobData.workMode || '',
        jobType: jobData.jobType || '',
        numberOfPositions: jobData.numberOfPositions?.toString() || '1',
        minExperienceYears: jobData.minExperienceYears?.toString() || '0',
        description: jobData.description || '',
        requiredSkills: Array.isArray(jobData.requiredSkills) ? jobData.requiredSkills.join(', ') : jobData.requiredSkills || '',
        niceToHaveSkills: Array.isArray(jobData.niceToHaveSkills) ? jobData.niceToHaveSkills.join(', ') : jobData.niceToHaveSkills || '',
        languagesRequired: Array.isArray(jobData.languagesRequired) ? jobData.languagesRequired.join(', ') : jobData.languagesRequired || '',

        // Salary information
        salaryRangemin: jobData.salaryRange?.min?.toString() || '',
        salaryRangemax: jobData.salaryRange?.max?.toString() || '',

        // Candidate information
        candidateFullName: candidateData.relevantData?.fullName || candidateData.name || '',
        candidateRegion: candidateData.relevantData?.region || '',
        candidateExpectedSalary: candidateData.relevantData?.expectedSalary?.toString() || '',
        candidateEmploymentStatus: candidateData.employed ? 'Empregado' : 'Desempregado',
        candidateInterests: Array.isArray(candidateData.relevantData?.interests) ? candidateData.relevantData.interests.join(', ') : '',
        candidateLinkedIn: candidateData.relevantData?.linkedin?.url || '',
        candidateResumeUrl: candidateData.relevantData?.resume?.url || '',

        // Conditional variables (if_xxx)
        ifSalaryRange: createConditional(Boolean(jobData.salaryRange?.min && jobData.salaryRange?.max)),
        ifCandidateFullName: createConditional(Boolean(candidateData.relevantData?.fullName || candidateData.name)),
        ifNiceToHaveSkills: createConditional(Boolean(jobData.niceToHaveSkills && jobData.niceToHaveSkills.length > 0)),
        ifLanguagesRequired: createConditional(Boolean(jobData.languagesRequired && jobData.languagesRequired.length > 0)),
        ifCandidateInterests: createConditional(Boolean(candidateData.relevantData?.interests && candidateData.relevantData.interests.length > 0)),
        ifCandidateRegion: createConditional(Boolean(candidateData.relevantData?.region)),
        ifLocation: createConditional(Boolean(jobData.location)),
        ifWorkMode: createConditional(Boolean(jobData.workMode)),
        ifMinExperienceYears: createConditional(Boolean(jobData.minExperienceYears && jobData.minExperienceYears > 0)),
        ifCandidateResumeUrl: createConditional(Boolean(candidateData.relevantData?.resume?.url)),
        ifCandidateEmployed: createConditional(Boolean(candidateData.employed)),
        ifCandidateExpectedSalary: createConditional(Boolean(candidateData.relevantData?.expectedSalary)),
        ifNumberOfPositions: createConditional(Boolean(jobData.numberOfPositions && jobData.numberOfPositions > 1)),
        ifSeniorityLevel: createConditional(Boolean(jobData.seniorityLevel)),
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

    // Load data when component mounts
    loadData();
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
</script>

<template>
    <q-page class="flex flex-center">
        <div
            class="column items-center q-gutter-lg"
            style="max-width: 800px; width: 100%;"
        >
            <!-- Loading State -->
            <div
                v-if="loading"
                class="text-center"
            >
                <q-spinner
                    color="primary"
                    size="3em"
                />
                <div class="text-h6 q-mt-md">
                    Carregando dados da entrevista...
                </div>
            </div>

            <!-- Error State -->
            <div
                v-else-if="loadingError"
                class="text-center"
            >
                <q-icon
                    name="error"
                    color="negative"
                    size="3em"
                />
                <div class="text-h6 q-mt-md text-negative">
                    {{ loadingError }}
                </div>
            </div>

            <!-- Main Content -->
            <template v-else-if="job && candidate && store">
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
                        {{ store.name }}
                    </div>
                </div>

                <!-- Interview Information -->
                <div class="row q-gutter-md full-width">
                    <div class="col-12 col-md-6">
                        <q-card>
                            <q-card-section>
                                <div class="text-h6 q-mb-md">
                                    <q-icon
                                        name="work"
                                        class="q-mr-sm"
                                    />
                                    Vaga
                                </div>
                                <div class="text-subtitle1">
                                    {{ job.title }}
                                </div>
                                <div class="text-caption text-grey-6">
                                    {{ job.seniorityLevel }} • {{ job.location }}
                                </div>
                            </q-card-section>
                        </q-card>
                    </div>
                    <div class="col-12 col-md-6">
                        <q-card>
                            <q-card-section>
                                <div class="text-h6 q-mb-md">
                                    <q-icon
                                        name="person"
                                        class="q-mr-sm"
                                    />
                                    Candidato
                                </div>
                                <div class="text-subtitle1">
                                    {{ candidate.relevantData?.fullName || candidate.name }}
                                </div>
                                <div class="text-caption text-grey-6">
                                    {{ candidate.relevantData?.region }}
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
                                <li>Clique em "Iniciar Entrevista" para começar</li>
                                <li>Permita o acesso ao microfone quando solicitado</li>
                                <li>Participe da entrevista normalmente</li>
                                <li>Clique em "Parar Entrevista" quando terminar</li>
                            </ol>
                        </div>
                    </q-card-section>
                </q-card>
            </template>
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
