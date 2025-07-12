import {
    Agent,
} from '@openai/agents';

export interface MatchAgentContext {
    jobDescription: string;
    userProfile: string;
}

const buildPrompt = (context: MatchAgentContext): string => {
    const { jobDescription, userProfile } = context;

    let instructions = 'Você é um assistente especializado em analisar perfis de usuários e vagas de emprego. Sua função é analisar o perfil do usuário e a descrição da vaga de emprego e retornar uma pontuação de compatibilidade entre 0 e 100.\n\n';
    instructions += 'O perfil do usuário é: ' + userProfile + '\n\n';
    instructions += 'A descrição da vaga de emprego é: ' + jobDescription + '\n\n';

    return instructions;
};

export const createMatchAgent = (context: MatchAgentContext): Agent<MatchAgentContext> => {
    return new Agent<MatchAgentContext>({
        name: 'Match Agent',
        model: 'gpt-4.1',
        instructions: buildPrompt(context),
    });
};
