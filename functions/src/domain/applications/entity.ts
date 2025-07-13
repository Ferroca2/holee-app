export enum ApplicationStatus {
    IN_PROGRESS = 'in_progress',
    REJECTED = 'rejected',
}

export enum ApplicationStep {
    MATCH_WITH_JOB = 'match_with_job',            // 1) Match com o job
    INTERVIEW = 'interview',                      // 2) Realizar entrevista
    RANKING = 'ranking',                          // 3) Ser ranqueado entre os top 3*num_de_vagas para passar para a proxima etapa
    FINALIST = 'finalist',                        // 4) Ser finalista (Foi ranqueado bem em relação ao número de vagas)
}

export interface InterviewData {
    checklist: { text: string; tick: boolean }[]; // Checklist de itens a serem verificados (pré-entrevista)
    script: string;                               // Script da entrevista (pré-entrevista)
    notes?: string;                               // Anotações preenchidas durante/após a entrevista
}

export interface Application {
    jobId: string;                            // ID da vaga
    conversationId: string;                   // ID da conversa (candidato)

    status: ApplicationStatus;                // Status geral da aplicação
    currentStep: ApplicationStep;             // Step atual no processo

    interviewData?: InterviewData;            // Dados da entrevista (pré + pós)

    createdAt: number;                        // Data de criação (epoch ms)
    updatedAt?: number;                       // Data de atualização (epoch ms)
}
