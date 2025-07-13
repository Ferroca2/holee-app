export enum WorkMode {
    REMOTE = 'remote',
    HYBRID = 'hybrid',
    ON_SITE = 'on_site',
}

export enum JobType {
    FULL_TIME = 'full_time',
    PART_TIME = 'part_time',
    CONTRACT = 'contract',
}

export enum JobStatus {
    OPEN = 'open',
    CLOSED = 'closed',
}

export interface Job {
    storeId: string;                          // ID da store que criou a vaga

    title: string;                            // Título da vaga
    description: string;                      // Descrição detalhada da vaga
    location: string;                         // Localização da vaga
    numberOfPositions: number;                // Número de vagas disponíveis

    seniorityLevel: string;                   // Nível de senioridade (Junior, Pleno, Senior, etc.)
    requiredSkills: string[];                 // Habilidades obrigatórias
    niceToHaveSkills?: string[];              // Habilidades desejáveis
    languagesRequired?: string[];             // Idiomas necessários

    salaryRange?: {
        min: number;
        max: number;
    };                // Faixa salarial

    minExperienceYears?: number;              // Anos mínimos de experiência

    workMode: WorkMode;                       // Modo de trabalho (REMOTE, HYBRID, ON_SITE)
    jobType: JobType;                         // Tipo de contrato (FULL_TIME, PART_TIME, CONTRACT)

    applyStart: number;                       // Início das inscrições (epoch ms) (timestamp)
    applyEnd: number;                         // Fim das inscrições (epoch ms) (timestamp)

    status: JobStatus;                        // Status da vaga (OPEN, CLOSED)

    finalRanking?: string[];                  // IDs dos candidatos finalistas (após ranking)

    createdAt: number;                        // Data de criação (epoch ms) (timestamp)
    updatedAt?: number;                       // Data de atualização (epoch ms) (timestamp)
}
