import {
    Agent,
    RunContext,
    tool,
} from '@openai/agents';
import { z } from 'zod';

export interface TemplateAgentContext {
    template: string;
}

const templateTool = tool({
    name: 'template',
    description: 'Retorna o template de texto',
    parameters: z.object({
        template: z.string().describe('Template de texto'),
    }),
    strict: true,
    execute: async (
        { template }: {
            template: string;
        },
        runCtx?: RunContext<TemplateAgentContext>,
    ): Promise<string> => {
        return template;
    },
});

const buildPrompt = (context: TemplateAgentContext): string => {
    const { template } = context;

    let instructions = 'Você é um assistente especializado em gerar templates de texto. Sua função é gerar um template de texto com base nas informações fornecidas pelo usuário.\n\n';
    instructions += 'O template de texto é: ' + template + '\n\n';

    return instructions;
};

export const createTemplateAgent = (context: TemplateAgentContext): Agent<TemplateAgentContext> => {
    return new Agent<TemplateAgentContext>({
        name: 'Template Agent',
        model: 'gpt-4.1',
        instructions: buildPrompt(context),
        tools: [templateTool],
    });
};
