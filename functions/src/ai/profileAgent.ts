import {
    Agent,
    RunContext,
    tool,
} from '@openai/agents';
import { z } from 'zod';

export interface ProfileAgentContext {
    data?: {
        name?: string;
        description?: string;
        phone?: string;
        email?: string;
        address?: string;
        gender?: string;
        pcd?: boolean;
        race?: string;
    }
    updateInfo: (data: ProfileAgentContext['data']) => void;
}

const updateData = tool({
    name: 'update_data',
    description: 'Atualiza os dados do perfil',
    parameters: z.object({
        name: z.string().nullable().optional().describe('Nome do cliente'),
        description: z.string().nullable().optional().describe('Descrição do cliente'),
        phone: z.string().nullable().optional().describe('Telefone do cliente'),
        email: z.string().nullable().optional().describe('Email do cliente'),
        address: z.string().nullable().optional().describe('Endereço do cliente'),
        gender: z.string().nullable().optional().describe('Gênero do cliente'),
        pcd: z.boolean().nullable().optional().describe('Se o cliente é PCD'),
        race: z.string().nullable().optional().describe('Raça do cliente'),
    }),
    strict: true,
    execute: async (
        { name, description, phone, email, address, gender, pcd, race }: {
            name?: string | null,
            description?: string | null,
            phone?: string | null,
            email?: string | null,
            address?: string | null,
            gender?: string | null,
            pcd?: boolean | null,
            race?: string | null
        },
        runCtx?: RunContext<ProfileAgentContext>,
    ): Promise<string> => {
        runCtx?.context.updateInfo({
            name: name ?? undefined,
            description: description ?? undefined,
            phone: phone ?? undefined,
            email: email ?? undefined,
            address: address ?? undefined,
            gender: gender ?? undefined,
            pcd: pcd ?? undefined,
            race: race ?? undefined,
        } as ProfileAgentContext['data']);

        // Retorna o estado atual do perfil
        const currentData = runCtx?.context.data || {};
        let response = 'Dados atualizados com sucesso!\n\n';
        response += 'ESTADO ATUAL DO PERFIL:\n';

        if (currentData.name) response += `- Nome: ${currentData.name}\n`;
        if (currentData.description) response += `- Descrição: ${currentData.description}\n`;
        if (currentData.phone) response += `- Telefone: ${currentData.phone}\n`;
        if (currentData.email) response += `- Email: ${currentData.email}\n`;
        if (currentData.address) response += `- Endereço: ${currentData.address}\n`;
        if (currentData.gender) response += `- Gênero: ${currentData.gender}\n`;
        if (currentData.pcd !== undefined) response += `- PCD: ${currentData.pcd ? 'Sim' : 'Não'}\n`;
        if (currentData.race) response += `- Raça: ${currentData.race}\n`;

        if (Object.keys(currentData).length === 0) {
            response += 'Nenhum dado cadastrado ainda.';
        }

        return response;
    },
});

const buildPrompt = (context: ProfileAgentContext): string => {
    const { data } = context;

    let instructions = 'Você é um assistente especializado em gerenciar perfis de usuários. Sua função é atualizar os dados do perfil com base nas informações fornecidas pelo usuário.\n\n';

    if (data && Object.keys(data).length > 0) {
        instructions += 'DADOS ATUAIS DO PERFIL:\n';

        if (data.name) instructions += `- Nome: ${data.name}\n`;
        if (data.description) instructions += `- Descrição: ${data.description}\n`;
        if (data.phone) instructions += `- Telefone: ${data.phone}\n`;
        if (data.email) instructions += `- Email: ${data.email}\n`;
        if (data.address) instructions += `- Endereço: ${data.address}\n`;
        if (data.gender) instructions += `- Gênero: ${data.gender}\n`;
        if (data.pcd !== undefined) instructions += `- PCD: ${data.pcd ? 'Sim' : 'Não'}\n`;
        if (data.race) instructions += `- Raça: ${data.race}\n`;

        instructions += '\nCom base nesses dados existentes, ajude o usuário a atualizar ou complementar as informações do perfil conforme necessário.';
    } else {
        instructions += 'Nenhum dado do perfil foi encontrado. Ajude o usuário a criar um perfil completo coletando todas as informações necessárias.';
    }

    instructions += '\n\nUse a ferramenta update_data para atualizar os campos do perfil conforme solicitado pelo usuário.';

    return instructions;
};

export const createProfileAgent = (context: ProfileAgentContext): Agent<ProfileAgentContext> => {
    return new Agent<ProfileAgentContext>({
        name: 'Profile Agent',
        model: 'gpt-4.1',
        instructions: buildPrompt(context),
        tools: [updateData],
    });
};
