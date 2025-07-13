/**
 * Concrete UserAgent implementation.
 */
/* eslint-disable camelcase */
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { ChatCompletionMessageParam } from 'openai/resources';
import { z } from 'zod';

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

1.  **buscar_vagas_correlatas**: Use esta ferramenta para encontrar e exibir um carrossel de vagas de emprego. **A busca é automática e baseada nas informações do perfil do usuário (habilidades, experiências, interesses).**
    * **Quando usar:** Acione quando o usuário pedir para procurar vagas, mostrar oportunidades, ou expressar um desejo geral de ver novas posições.
    * **Exemplos de gatilho:** "Me mostre vagas", "Estou procurando um novo emprego", "Tem alguma oportunidade para mim?", "Encontre vagas de emprego".

2.  **listar_candidaturas_ativas**: Use esta ferramenta para buscar e exibir o carrossel de vagas às quais o usuário já se candidatou.
    * **Quando usar:** Acione quando o usuário perguntar sobre o status de suas aplicações, "minhas vagas", "meus processos", "em que pé estão minhas candidaturas?" ou qualquer pergunta sobre as vagas que ele já está participando.
    * **Exemplos de gatilho:** "Como estão minhas aplicações?", "Pode me mostrar as vagas que eu apliquei?", "Quero ver minhas candidaturas".

3.  **pesquisar_sobre_empresa**: Use esta ferramenta para fazer uma busca textual e retornar informações sobre uma empresa específica.
    * **Quando usar:** Acione quando o usuário pedir informações sobre uma empresa. Ideal para ajudar o usuário a se preparar para uma entrevista.
    * **Exemplos de gatilho:** "Me fale mais sobre a [nome da empresa]", "Como é a cultura da [nome da empresa]?", "O que você sabe sobre a [nome da empresa]?".

# Regras de Comportamento e Fluxo de Conversa

1.  **Tom de Voz:** Mantenha sempre um tom positivo, empático e motivador. A busca por emprego pode ser estressante, e seu papel é ser um parceiro confiável.
2.  **Transparência na Busca:** Ao usar buscar_vagas_correlatas, seja transparente. Informe ao usuário que a busca será feita com base no perfil dele. **Não peça por termos de busca como "qual cargo?"**, pois a ferramenta não os utiliza.
    * **Exemplo de resposta:** "Claro! Vou buscar algumas vagas que combinam com o seu perfil. Só um momento..."
3.  **Proatividade:** Seja proativo para criar uma conversa fluida e útil.
    * Após usar buscar_vagas_correlatas e mostrar as vagas, sugira o próximo passo: "Alguma dessas vagas te interessou? Se quiser, posso buscar mais informações sobre a empresa para te ajudar a se preparar!".
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

    public async process(messages: ChatCompletionMessageParam[]): Promise<{
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
                        case 'buscar_vagas_correlatas':
                            toolCallResponse = {
                                final: true,
                                response: {
                                    reasoning: 'buscando vagas de emprego que combinam com o perfil do usuário',
                                    response: 'teste',
                                },
                            }
                            break;
                        case 'listar_candidaturas_ativas':
                            toolCallResponse = {
                                final: true,
                                response: {
                                    reasoning: 'listando candidaturas ativas do usuário',
                                    response: 'teste',
                                },
                            }
                            break;
                        case 'pesquisar_sobre_empresa':
                            toolCallResponse = {
                                final: true,
                                response: {
                                    reasoning: 'pesquisando informações sobre a empresa',
                                    response: 'teste',
                                },
                            }
                            break;
                        default:
                            throw new Error(`Ferramenta desconhecida: ${toolName}`);
                    }

                    if (!toolCallResponse) {
                        throw new Error('Nenhuma resposta da função encontrada');
                    }

                    console.log(`[HistoryAgent] Tool call (${toolName}: ${JSON.stringify(toolArgs)}) response: ${toolCallResponse.response.response}`);

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
            throw new Error(`Error in HistoryAgent: ${error}`);
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
            name: 'buscar_vagas_correlatas',
            description: 'Retorna vagas de emprego que combinam com o perfil do usuário',
            strict: true,
            parameters: {},
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'listar_candidaturas_ativas',
            description: 'Retorna vagas de emprego que o usuário já se candidatou',
            strict: true,
            parameters: {},
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'pesquisar_sobre_empresa',
            description: 'Retorna informações sobre uma empresa específica',
            strict: true,
            parameters: {
                type: 'object',
                properties: {
                    nome_da_empresa: { type: 'string', description: 'Nome da empresa a ser pesquisada' },
                },
                required: ['nome_da_empresa'],
                additionalProperties: false,
            },
        },
    },
];
