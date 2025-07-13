/**
 * Concrete MatchAgent implementation.
 */
/* eslint-disable camelcase */
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

export class MatchAgent {

    private openai: OpenAI;
    private model: string;
    private temperature: number;
    private config = {
        model: 'gpt-4.1',
        temperature: 0.0,
    };
    private schema = z.object({
        reasoning: z.string(),
        matchScore: z.number(),
    });
    private responseFormat = zodResponseFormat(this.schema, 'MatchAgentResponse');
    private prompt = '';

    private buildPrompt() {
        this.prompt = `
# AGENTE DE MATCH DE VAGAS

Você é um assistente especializado em ajudar candidatos a aplicar às vagas de emprego.

Você receberá uma descrição da vaga e uma descrição do perfil do candidato.

Você deve avaliar a compatibilidade entre a vaga e o perfil do candidato e retornar uma pontuação de 0 a 100.

Lembre de avaliar muito bem, o usuário não quer entrar em uma vaga que não é compatível com o seu perfil e o empregador não quer perder tempo com candidatos que não são compatíveis.

retorne pontuações entre 0 e 30 para candidatos que não são compatíveis, entre 31 e 69 para candidatos mediocres, e entre 70 e 100 para candidatos que são compatíveis.
`;
    }

    constructor(conversationId: string) {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        this.model = this.config.model;
        this.temperature = this.config.temperature;
    }

    public async process(jobDescription: string, userDescription: string): Promise<{
        reasoning: string;
        matchScore: number;
    } | undefined> {
        try {
            this.buildPrompt();

            const response = await this.openai.chat.completions.create({
                model: this.model,
                response_format: this.responseFormat,
                temperature: this.temperature,
                messages: [
                    {
                        role: 'system',
                        content: this.prompt,
                    },
                    {
                        role: 'user',
                        content: `
                        Descrição da vaga: ${jobDescription}
                        Descrição do perfil do candidato: ${userDescription}
                        `,
                    },
                ],
            });

            const message = response.choices[0]?.message;
            const content = message?.content;
            if (!content) {
                throw new Error('Nenhuma resposta do modelo');
            }

            return JSON.parse(content);
        } catch (error) {
            throw new Error(`Erro ao analisar resposta do modelo: ${error}`);
        }
    }
}
