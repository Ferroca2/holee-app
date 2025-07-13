/**
 * Concrete UserAgent implementation.
 */
/* eslint-disable camelcase */
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { ChatCompletionMessageParam } from 'openai/resources';
import { z } from 'zod';
import { getUserDescription } from './utils';
import StoresRepository from '../domain/stores/repository';
import JobsRepository from '../domain/jobs/repository';
import ApplicationsRepository from '../domain/applications/repository';
import ConversationsRepository from '../domain/conversations/repository';
import { ZApiServiceSDK } from '../wpp/zapi/service';
import { generateJobOptinMessage } from '../jobs/utils';

export class UserAgent {
    private openai: OpenAI;
    private model: string;
    private temperature: number;
    private config = {
        model: 'gpt-4.1',
        temperature: 0,
    };
    private schema = z.object({
        reasoning: z.string(),
        response: z.string(),
    });
    private responseFormat = zodResponseFormat(this.schema, 'UserAgentResponse');
    private prompt = '';

    private buildPrompt() {
        this.prompt = `
# Persona e Objetivo Principal

Você é o HOLEE, um assistente de IA especialista em carreira e recrutamento. Sua personalidade é proativa, encorajadora e extremamente prestativa. Seu principal objetivo é ajudar os usuários a encontrar a vaga de emprego ideal, acompanhar suas candidaturas e prepará-los para entrevistas, tornando a busca por emprego uma jornada mais simples e humana.

# Ferramentas Disponíveis

Você tem acesso às seguintes ferramentas e deve usá-las para responder às solicitações dos usuários:

1.  **searchRelatedJobs**: Use esta ferramenta para encontrar e exibir um carrossel de vagas de emprego. **A busca é automática e baseada nas informações do perfil do usuário (habilidades, experiências, interesses).**
    * **Quando usar:** Acione quando o usuário pedir para procurar vagas, mostrar oportunidades, ou expressar um desejo geral de ver novas posições.
    * **Exemplos de gatilho:** "Me mostre vagas", "Estou procurando um novo emprego", "Tem alguma oportunidade para mim?", "Encontre vagas de emprego".

2.  **listActiveApplications**: Use esta ferramenta para buscar e exibir o carrossel de vagas às quais o usuário já se candidatou.
    * **Quando usar:** Acione quando o usuário perguntar sobre o status de suas aplicações, "minhas vagas", "meus processos", "em que pé estão minhas candidaturas?" ou qualquer pergunta sobre as vagas que ele já está participando.
    * **Exemplos de gatilho:** "Como estão minhas aplicações?", "Pode me mostrar as vagas que eu apliquei?", "Quero ver minhas candidaturas".

3.  **searchCompanyInfo**: Use esta ferramenta para fazer uma busca textual e retornar informações sobre uma empresa específica.
    * **Quando usar:** Acione quando o usuário pedir informações sobre uma empresa. Ideal para ajudar o usuário a se preparar para uma entrevista.
    * **Exemplos de gatilho:** "Me fale mais sobre a [nome da empresa]", "Como é a cultura da [nome da empresa]?", "O que você sabe sobre a [nome da empresa]?".

4. **verifyUserProfile**: Use esta ferramenta para verificar o perfil do usuário.
    * **Quando usar:** Acione quando o usuário quer saber se uma vaga é compatível com o seu perfil.
    * **Exemplos de gatilho:** "Esta vaga é compatível com o meu perfil?", "Esta vaga é boa para mim?", "Esta vaga é uma boa opção para mim?".

# Regras de Comportamento e Fluxo de Conversa

1.  **Tom de Voz:** Mantenha sempre um tom positivo, empático e motivador. A busca por emprego pode ser estressante, e seu papel é ser um parceiro confiável.
2.  **Transparência na Busca:** Ao usar searchRelatedJobs, seja transparente. Informe ao usuário que a busca será feita com base no perfil dele. **Não peça por termos de busca como "qual cargo?"**, pois a ferramenta não os utiliza.
    * **Exemplo de resposta:** "Claro! Vou buscar algumas vagas que combinam com o seu perfil. Só um momento..."
3.  **Proatividade:** Seja proativo para criar uma conversa fluida e útil.
    * Após usar searchRelatedJobs e mostrar as vagas, sugira o próximo passo: "Alguma dessas vagas te interessou? Se quiser, posso buscar mais informações sobre a empresa para te ajudar a se preparar!".
    * Se o usuário parece perdido, sugira ações: "O que você gostaria de fazer agora? Podemos procurar novas vagas, ver suas candidaturas atuais ou pesquisar sobre alguma empresa específica."
4.  **Uso das Ferramentas:**
    * Sempre confie nas suas ferramentas para obter informações. Não invente dados sobre vagas, salários ou empresas.
    * Informe ao usuário que você está buscando as informações. Ex: "Um momento, estou verificando as melhores vagas para você com base no seu perfil..." ou "Deixa eu consultar o andamento das suas candidaturas...".
5.  **Limitações:** Se não puder atender a um pedido com suas ferramentas, informe educadamente sua limitação e foque no que você *pode* fazer.

Seu objetivo final é ser o melhor parceiro de carreira que um usuário poderia ter. Boa sorte, HOLEE!
        `;
    }
    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        this.model = this.config.model;
        this.temperature = this.config.temperature;
    }

    public async process(messages: ChatCompletionMessageParam[], conversationId: string): Promise<{
        reasoning: string;
        response: string;
    } | undefined> {
        try {
            this.buildPrompt();

            let filteredTools = tools;

            const maxIterations = 12;
            let currentMessages = [...messages];
            let lastResponse = null;
            const aiThoughts = [];

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
                        case 'searchRelatedJobs':
                            toolCallResponse = {
                                final: false,
                                response: {
                                    reasoning: 'buscando vagas de emprego que combinam com o perfil do usuário',
                                    response: await searchRelatedJobs(conversationId),
                                },
                            }
                            break;
                        case 'listActiveApplications':
                            toolCallResponse = {
                                final: false,
                                response: {
                                    reasoning: 'listando candidaturas ativas do usuário',
                                    response: await listActiveApplications(conversationId),
                                },
                            }
                            break;
                        case 'searchCompanyInfo':
                            const response = await searchCompanyInfo(toolArgs.companyName);
                            toolCallResponse = {
                                final: false,
                                response: {
                                    reasoning: 'pesquisando informações sobre a empresa',
                                    response: response,
                                },
                            }
                            break;
                        case 'verifyUserProfile':
                            toolCallResponse = {
                                final: false,
                                response: {
                                    reasoning: 'verificando perfil do usuário',
                                    response: await verifyUserProfile(conversationId),
                                },
                            }
                            break;
                        default:
                            throw new Error(`Ferramenta desconhecida: ${toolName}`);
                    }

                    if (!toolCallResponse) {
                        throw new Error('Nenhuma resposta da função encontrada');
                    }

                    console.log(`[UserAgent] Tool call (${toolName}: ${JSON.stringify(toolArgs)}) response: ${toolCallResponse.response.response}`);

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
                            content: JSON.stringify(toolCallResponse.response.response),
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
                        aiThoughts.push(parsedContent.aiThoughts);
                        return this.schema.parse({
                            ...parsedContent,
                            aiThoughts: aiThoughts.join('\n'),
                        });
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
            throw new Error(`Error in UserAgent: ${error}`);
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
            name: 'searchRelatedJobs',
            description: 'Retorna vagas de emprego que combinam com o perfil do usuário',
            strict: true,
            parameters: {
                type: 'object',
                properties: {},
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'listActiveApplications',
            description: 'Retorna vagas de emprego que o usuário já se candidatou',
            strict: true,
            parameters: {
                type: 'object',
                properties: {},
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'searchCompanyInfo',
            description: 'Retorna informações sobre uma empresa específica',
            strict: true,
            parameters: {
                type: 'object',
                properties: {
                    companyName: { type: 'string', description: 'Nome da empresa a ser pesquisada' },
                },
                required: ['companyName'],
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'verifyUserProfile',
            description: 'Retorna informações sobre o perfil do usuário',
            strict: true,
            parameters: {
                type: 'object',
                properties: {},
                additionalProperties: false,
            },
        },
    },
];

async function verifyUserProfile(conversationId: string) {
    const userDescription = await getUserDescription(conversationId);
    return userDescription;
}

async function searchCompanyInfo(companyName: string) {
    const allStores = await StoresRepository.getAllStores();
    let store = allStores.find(store => store.name === companyName);
    if (!store) {
        // busca por nome similar
        const similarStores = allStores.filter(store => store.name.toLowerCase().includes(companyName.toLowerCase()));
        if (similarStores.length > 0) {
            store = similarStores[0];
        }
    }
    return store?.description || 'Não foi possível encontrar informações sobre a empresa';
}

async function searchRelatedJobs(conversationId: string) {
    try {
        const conversation = await ConversationsRepository.getConversationById(conversationId);

        if (!conversation || !conversation.fitResults || conversation.fitResults.length === 0) {
            return 'Não encontramos vagas abertas no momento. Tente novamente mais tarde.';
        }

        // Inicializar ZApiService
        const zApiService = await ZApiServiceSDK.initialize();

        // Buscar até 5 vagas para mostrar
        const top5Jobs = conversation.fitResults.filter(fitResult => !conversation.currentJobIds?.includes(fitResult.jobId)).slice(0, 5);

        // Buscar informações das empresas para cada vaga
        const jobsWithStores = await Promise.all(top5Jobs.map(async (fitResult) => {
            const job = await JobsRepository.getJobById(fitResult.jobId);
            const store = await StoresRepository.getStoreById(job?.storeId || '');
            if (!store) {
                return null;
            }
            return { job, store };
        }));

        // Filtrar vagas que não encontraram a empresa
        const validJobsWithStores = jobsWithStores.filter((item): item is { job: any; store: any } => item !== null);

        if (validJobsWithStores.length === 0) {
            return 'Encontramos vagas, mas não conseguimos carregar as informações das empresas. Tente novamente mais tarde.';
        }

        // Criar carrossel
        const carousel = validJobsWithStores.map((item) => ({
            image: item.store.logo || 'https://via.placeholder.com/300x200?text=Empresa',
            text: `*${item.job.title}* - ${item.store.name}\n\n${item.job.description}\n\n📍 ${item.job.location}\n💰 ${item.job.salaryRange ? `R$ ${item.job.salaryRange.min.toLocaleString()} - R$ ${item.job.salaryRange.max.toLocaleString()}` : 'Salário a combinar'}\n`,
            buttons: [
                {
                    type: 'REPLY' as const,
                    label: generateJobOptinMessage(item.job.id),
                },
            ],
        }));

        // Enviar carrossel
        await zApiService.sendCarousel({
            phone: conversationId,
            message: `🎯 Encontramos ${validJobsWithStores.length} vaga${validJobsWithStores.length > 1 ? 's' : ''} que pode${validJobsWithStores.length > 1 ? 'm' : ''} ser interessante${validJobsWithStores.length > 1 ? 's' : ''} para você:`,
            carousel,
        });

        return `Enviei um carrossel com ${validJobsWithStores.length} vaga${validJobsWithStores.length > 1 ? 's' : ''} para você! 🚀`;
    } catch (error) {
        console.error('[buscar_vagas_correlatas] Error:', error);
        return 'Ocorreu um erro ao buscar as vagas. Tente novamente mais tarde.';
    }
}

async function listActiveApplications(conversationId: string) {
    try {
        // Buscar candidaturas do usuário
        const conversation = await ConversationsRepository.getConversationById(conversationId);

        if (!conversation) {
            return 'Não encontramos a conversa. Tente novamente mais tarde.';
        }

        if (!conversation.currentJobIds || conversation.currentJobIds.length === 0) {
            return 'Você ainda não tem candidaturas ativas. Que tal procurar por algumas vagas interessantes?';
        }

        // Inicializar ZApiService
        const zApiService = await ZApiServiceSDK.initialize();

        // Buscar informações das vagas e empresas para cada candidatura
        const applicationsWithJobsAndStores = await Promise.all(conversation.currentJobIds.map(async (jobId) => {
            const job = await JobsRepository.getJobById(jobId);
            if (!job) {
                return null;
            }

            const store = await StoresRepository.getStoreById(job.storeId);
            if (!store) {
                return null;
            }

            return { job, store };
        }));

        // Filtrar candidaturas que não encontraram vaga ou empresa
        const validApplicationsWithJobsAndStores = applicationsWithJobsAndStores.filter((item): item is { job: any; store: any } => item !== null);

        if (validApplicationsWithJobsAndStores.length === 0) {
            return 'Encontramos suas candidaturas, mas não conseguimos carregar as informações das vagas. Tente novamente mais tarde.';
        }

        // Função para traduzir o status da candidatura
        const getStatusText = (step: string) => {
            switch (step) {
                case 'match_with_job':
                    return '🎯 Compatível com a vaga';
                case 'accept_job':
                    return '✅ Candidatura enviada';
                case 'interview':
                    return '📋 Processo de entrevista';
                case 'ranking':
                    return '🏆 Em avaliação';
                case 'finalist':
                    return '🎉 Finalista';
                default:
                    return '📄 Em andamento';
            }
        };

        // Criar carrossel
        const carousel = validApplicationsWithJobsAndStores.map((item) => ({
            image: item.store.logo || 'https://via.placeholder.com/300x200?text=Empresa',
            text: `*${item.job.title}* - ${item.store.name}\n\n${item.job.description}\n\n📍 ${item.job.location}\n💰 ${item.job.salaryRange ? `R$ ${item.job.salaryRange.min.toLocaleString()} - R$ ${item.job.salaryRange.max.toLocaleString()}` : 'Salário a combinar'}}\n`,
            buttons: [
                {
                    type: 'REPLY' as const,
                    label: 'Ver mais detalhes',
                },
            ],
        }));

        // Enviar carrossel
        await zApiService.sendCarousel({
            phone: conversationId,
            message: `📝 Suas candidaturas ativas (${validApplicationsWithJobsAndStores.length}):`,
            carousel,
        });

        return `Enviei um carrossel com suas ${validApplicationsWithJobsAndStores.length} candidatura${validApplicationsWithJobsAndStores.length > 1 ? 's' : ''} ativa${validApplicationsWithJobsAndStores.length > 1 ? 's' : ''}! 📋`;
    } catch (error) {
        console.error('[listar_candidaturas_ativas] Error:', error);
        return 'Ocorreu um erro ao buscar suas candidaturas. Tente novamente mais tarde.';
    }
}
