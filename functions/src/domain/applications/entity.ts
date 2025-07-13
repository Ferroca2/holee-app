export type ApplicationStatus = 'IN_PROGRESS' | 'REJECTED';

export type ApplicationStep =
    | 'MATCH_WITH_JOB'            // 1) Match com o job
    | 'ACCEPT_JOB'                // 2) Aceitar a vaga (opt-in/subscriber)
    | 'INTERVIEW'                 // 3) Realizar entrevista
    | 'RANKING'                   // 4) Ser ranqueado entre os top 3*num_de_vagas para passar para a proxima etapa
    | 'FINALIST';                 // 5) Ser finalista (Foi ranqueado bem em relação ao número de vagas)

export interface Application {
    jobId: string;                            // ID da vaga
    conversationId: string;                   // ID da conversa (candidato)

    status: ApplicationStatus;                // Status geral da aplicação
    currentStep: ApplicationStep;             // Step atual no processo

    createdAt: number;                        // Data de criação (epoch ms)
    updatedAt?: number;                       // Data de atualização (epoch ms)
}
