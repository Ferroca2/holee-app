/**
 * Concrete HistoryAgent implementation.
 */
/* eslint-disable camelcase */
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { ChatCompletionMessageParam } from 'openai/resources';
import { z } from 'zod';
import conversationsRepository from '../domain/conversations/repository';
import { CandidateRelevantData, Conversation } from '../domain/conversations/entity';
import { getCrawlResult } from './utils';

export class ProfileAgent {

    private openai: OpenAI;
    private model: string;
    private temperature: number;
    private conversationId: string;
    private currentProfile: Conversation | null = null;
    private config = {
        model: 'gpt-4.1',
        temperature: 0.0,
    };
    private schema = z.object({
        reasoning: z.string(),
        response: z.string(),
    });
    private responseFormat = zodResponseFormat(this.schema, 'ProfileAgentResponse');
    private prompt = '';

    private buildPrompt() {
        const relevantData = this.currentProfile?.relevantData || {};

        this.prompt = `
# AGENTE DE PERFIL PROFISSIONAL

Você é um assistente especializado em ajudar candidatos a construir perfis completos para conseguir vagas de emprego.

Os candidatos precisam concluir o perfil para poder se candidatar às vagas.

Seu nome é HOLEE, um assistente virtual que ajuda candidatos a completar seus perfis profissionais.

## ESTADO ATUAL DO PERFIL

### Informações Básicas
- **Nome:** ${relevantData.name || 'Não informado'}
- **Descrição profissional:** ${relevantData.description || 'Não informada'}
- **Habilidades:** ${relevantData.skills || 'Não informadas'}
- **Interesses:** ${relevantData.interests || 'Não informados'}

### Informações Complementares
- **Salário esperado:** ${relevantData.expectedSalary ? 'R$ ' + relevantData.expectedSalary : 'Não informado'}
- **LinkedIn:** ${relevantData.linkedin || 'Não informado'}
- **Email:** ${relevantData.email || 'Não informado'}
- **Endereço:** ${relevantData.address || 'Não informado'}
- **Gênero:** ${relevantData.gender || 'Não informado'}
- **Pessoa com deficiência:** ${relevantData.pcd !== undefined ? (relevantData.pcd ? 'Sim' : 'Não') : 'Não informado'}
- **Raça/Etnia:** ${relevantData.race || 'Não informado'}

### Status do Perfil
- **Completo:** ${this.currentProfile?.profileCompleted ? 'Sim' : 'Não'}

## OBJETIVO

Seu objetivo é ajudar o candidato a completar seu perfil profissional fazendo perguntas estratégicas e coletando informações relevantes. O perfil será considerado completo quando tiver pelo menos:
- Nome
- Descrição profissional
- Habilidades
- Interesses

## DIRETRIZES

1. **Seja conversacional e acolhedor** - Mantenha um tom amigável e profissional
2. **Faça perguntas específicas** - Não faça várias perguntas de uma vez
3. **Valorize as respostas** - Sempre reconheça e valide as informações compartilhadas
4. **Seja proativo** - Sugira melhorias e complementos quando apropriado
5. **Priorize as informações essenciais** - Foque primeiro nas informações obrigatórias

## ESTRATÉGIA DE COLETA

1. **Primeiro:** Colete nome, descrição, habilidades e interesses
2. **Depois:** Colete informações complementares se o usuário estiver disposto
3. **Finalmente:** Marque o perfil como completo quando tiver os dados essenciais

## FERRAMENTAS DISPONÍVEIS

- updateProfile: Use para atualizar qualquer informação do perfil
- completeProfile: Use APENAS quando tiver nome, descrição, habilidades e interesses

# IMPORTANTE
- O usuário pode fornecer o pdf do seu currículo. Sugira que ele mande o pdf.

# EXEMPLOS
<user_query exemple_id="1">
    Olá, gostaria de me candidatar para vagas.
</user_query>
<assistant_response exemple_id="1">
    Olá! Sou o HOLEE, para receber vagas personalizadas, precisamos completar seu perfil.
    Você pode me enviar o pdf do seu curriculo ou me mandar informações por aqui mesmo, o que acha?
</assistant_response>

<user_query exemple_id="2">
    <informações básicas>
</user_query>
<assistant_response exemple_id="2">
    Pronto, tenho todas as informações necessárias para te enviar vagas personalizadas.
    Mas ainda tenho algumas informações opcionais que podem ajudar a te enviar vagas mais relevantes.
    Quer terminar de preencher o seu perfil ou já quer começar a receber vagas?
</assistant_response>

<user_query exemple_id="3">
    <informações complementares>
</user_query>
<assistant_response exemple_id="3">
    🎉 Parabéns! Seu perfil foi completado com sucesso! Logo mais você receberá vagas personalizadas.
</assistant_response>

## INSTRUÇÕES ESPECÍFICAS

- Sempre confirme as informações antes de salvá-las
- Se o usuário fornecer informações incompletas, peça esclarecimentos
- Mantenha o foco na experiência profissional do candidato
- Seja específico sobre habilidades técnicas e comportamentais
- Para descrição profissional, ajude a criar um resumo conciso e impactante
- NUNCA CHAME A TOOL completeProfile sem a confirmação do usuário
        `;
    }

    constructor(conversationId: string) {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        this.model = this.config.model;
        this.temperature = this.config.temperature;
        this.conversationId = conversationId;
    }

    private async loadCurrentProfile(): Promise<void> {
        try {
            const conversation = await conversationsRepository.getConversationById(this.conversationId);
            this.currentProfile = conversation || null;
        } catch (error) {
            console.error('Erro ao carregar perfil atual:', error);
            this.currentProfile = null;
        }
    }

    public async process(messages: ChatCompletionMessageParam[]): Promise<{
        reasoning: string;
        response: string;
    } | undefined> {
        try {
            await this.loadCurrentProfile();
            this.buildPrompt();

            const filteredTools = tools;

            const maxIterations = 12;
            let currentMessages = [...messages];
            let lastResponse = null;

            for (let iteration = 1; iteration <= maxIterations; iteration++) {
                // eslint-disable-next-line no-await-in-loop
                const response = await this.openai.chat.completions.create({
                    model: this.model,
                    response_format: this.responseFormat,
                    temperature: this.temperature,
                    messages: [
                        {
                            role: 'system',
                            content: this.prompt,
                        },
                        ...currentMessages,
                    ],
                    tools: filteredTools,
                });

                lastResponse = response;
                const message = response.choices[0]?.message;

                if (!message) {
                    throw new Error('Nenhuma resposta do modelo encontrada');
                }

                if (message.tool_calls && message.tool_calls.length > 0) {
                    const toolCall = message.tool_calls[0];
                    if (!toolCall) {
                        throw new Error('Nenhuma tool call encontrada');
                    }

                    const toolName = toolCall.function.name;
                    let toolArgs;

                    try {
                        toolArgs = JSON.parse(toolCall.function.arguments || '{}');
                    } catch (error) {
                        throw new Error(`Erro ao analisar argumentos da ferramenta: ${error}`);
                    }

                    let toolCallResponse;
                    switch (toolName) {
                        case 'updateProfile':
                            toolCallResponse = await this.handleUpdateProfile(toolArgs);
                            break;
                        case 'completeProfile':
                            toolCallResponse = await this.handleCompleteProfile(toolArgs);
                            break;
                        default:
                            throw new Error(`Ferramenta desconhecida: ${toolName}`);
                    }

                    if (!toolCallResponse) {
                        throw new Error('Nenhuma resposta da função encontrada');
                    }

                    console.log(`[ProfileAgent] Tool call (${toolName}: ${JSON.stringify(toolArgs)}) response: ${toolCallResponse.response.response}`);

                    if (toolCallResponse.final) {
                        return this.schema.parse(toolCallResponse.response);
                    }

                    // Atualizar as mensagens mantendo o contexto das chamadas de ferramentas
                    currentMessages = [
                        ...currentMessages,
                        {
                            role: 'assistant',
                            content: null,
                            tool_calls: [toolCall],
                        },
                        {
                            role: 'tool',
                            content: JSON.stringify(toolCallResponse.response),
                            tool_call_id: toolCall.id,
                        },
                    ];
                } else {
                    const content = message.content;
                    if (!content) {
                        throw new Error('Nenhuma resposta do modelo');
                    }
                    try {
                        const parsedContent = JSON.parse(content);
                        return this.schema.parse(parsedContent);
                    } catch (error) {
                        throw new Error(`Erro ao analisar resposta do modelo: ${error}`);
                    }
                }
            }

            // Se chegou aqui, processa a última resposta
            if (!lastResponse) {
                throw new Error('Nenhuma resposta válida após todas as iterações');
            }
        } catch (error) {
            throw new Error(`Error in ProfileAgent: ${error}`);
        }
    }

    private async handleUpdateProfile(args: any): Promise<{
        final: boolean;
        response: {
            reasoning: string;
            response: string;
        };
    }> {
        try {
            const { data } = args;

            // Preparar dados para atualização
            const updateData: Partial<Conversation> = {
                relevantData: {
                    ...this.currentProfile?.relevantData,
                    ...data,
                },
            };

            // Atualizar no banco
            await conversationsRepository.updateConversation(this.conversationId, updateData);

            // Atualizar cache local
            if (this.currentProfile) {
                this.currentProfile.relevantData = updateData.relevantData;
            }

            return {
                final: false,
                response: {
                    reasoning: 'Perfil atualizado com sucesso no banco de dados',
                    response: 'Informações salvas com sucesso! Continue coletando mais dados ou faça uma nova pergunta.',
                },
            };
        } catch (error) {
            return {
                final: false,
                response: {
                    reasoning: 'Erro ao atualizar perfil',
                    response: `Erro ao salvar informações: ${error}`,
                },
            };
        }
    }

    private async handleCompleteProfile(args: any): Promise<{
        final: boolean;
        response: {
            reasoning: string;
            response: string;
        };
    }> {
        try {
            const relevantData = this.currentProfile?.relevantData;

            // Verificar se tem as informações essenciais
            if (!relevantData?.name || !relevantData?.description || !relevantData?.skills || !relevantData?.interests) {
                return {
                    final: false,
                    response: {
                        reasoning: 'Perfil ainda não tem todas as informações essenciais',
                        response: 'Para completar o perfil, ainda precisamos de: ' +
                            [
                                !relevantData?.name ? 'nome' : null,
                                !relevantData?.description ? 'descrição profissional' : null,
                                !relevantData?.skills ? 'habilidades' : null,
                                !relevantData?.interests ? 'interesses' : null,
                            ].filter(Boolean).join(', '),
                    },
                };
            }

            // Marcar perfil como completo
            await conversationsRepository.updateConversation(this.conversationId, {
                profileCompleted: true,
            });

            // Atualizar cache local
            if (this.currentProfile) {
                this.currentProfile.profileCompleted = true;
            }

            return {
                final: true,
                response: {
                    reasoning: 'Perfil marcado como completo com sucesso',
                    response: '🎉 Parabéns! Seu perfil foi completado com sucesso! Agora você pode visualizar as vagas disponíveis e se candidatar às oportunidades que mais combinam com você.',
                },
            };
        } catch (error) {
            return {
                final: false,
                response: {
                    reasoning: 'Erro ao completar perfil',
                    response: `Erro ao finalizar perfil: ${error}`,
                },
            };
        }
    }

    private async handleGetLinkedinProfile(args: any): Promise<{
        final: boolean;
        response: {
            reasoning: string;
            response: string;
        };
    }> {
        try {
            const { linkedinUrl } = args;
            const profile = await getCrawlResult(linkedinUrl);
            console.log(profile);
            return {
                final: true,
                response: {
                    reasoning: 'Perfil do LinkedIn obtido com sucesso',
                    response: profile || 'Não foi possível obter o perfil do LinkedIn',
                },
            };
        } catch (error) {
            throw new Error(`Erro ao obter perfil do LinkedIn: ${error}`);
        }
    }
}

/**
 * Array de ferramentas disponíveis para o agente
 */
export const tools = [
    {
        type: 'function' as const,
        function: {
            name: 'updateProfile',
            description: 'Atualiza informações específicas do perfil do usuário',
            parameters: {
                type: 'object',
                properties: {
                    data: {
                        type: 'object',
                        properties: {
                            name: { type: 'string', description: 'Nome completo do candidato' },
                            description: { type: 'string', description: 'Descrição profissional resumida' },
                            skills: { type: 'string', description: 'Habilidades técnicas e comportamentais' },
                            interests: { type: 'string', description: 'Interesses profissionais e áreas de atuação' },
                            expectedSalary: { type: 'number', description: 'Salário esperado em reais' },
                            linkedin: { type: 'string', description: 'URL do perfil LinkedIn' },
                            email: { type: 'string', description: 'Endereço de email' },
                            address: { type: 'string', description: 'Endereço completo' },
                            gender: { type: 'string', description: 'Gênero do candidato' },
                            pcd: { type: 'boolean', description: 'Pessoa com deficiência' },
                            race: { type: 'string', description: 'Raça/etnia do candidato' },
                        },
                        additionalProperties: false,
                        description: 'Dados do perfil do usuário para atualização',
                    },
                },
                required: ['data'],
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'completeProfile',
            description: 'Marca o perfil como completo quando tiver as informações essenciais: nome, descrição, habilidades e interesses',
            parameters: {
                type: 'object',
                properties: {},
                additionalProperties: false,
            },
        },
    },
];
