import {
    Agent,
    RunContext,
    tool,
} from '@openai/agents';
import { z } from 'zod';

export interface UserAgentContext {
    user: string;
}

const userTool = tool({
    name: 'user',
    description: 'Retorna o usuário',
    parameters: z.object({
        user: z.string().describe('Usuário'),
    }),
    strict: true,
    execute: async (
        { user }: {
            user: string;
        },
        runCtx?: RunContext<UserAgentContext>,
    ): Promise<string> => {
        return user;
    },
});

const buildPrompt = (context: UserAgentContext): string => {
    const { user } = context;

    let instructions = 'Você é um assistente especializado em gerar templates de texto. Sua função é gerar um template de texto com base nas informações fornecidas pelo usuário.\n\n';
    instructions += 'O usuário é: ' + user + '\n\n';

    return instructions;
};

export const createUserAgent = (context: UserAgentContext): Agent<UserAgentContext> => {
    return new Agent<UserAgentContext>({
        name: 'User Agent',
        model: 'gpt-4.1',
        instructions: buildPrompt(context),
        tools: [userTool],
    });
};
