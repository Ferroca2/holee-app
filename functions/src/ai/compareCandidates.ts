/**
 * Concrete CompareCandidates implementation.
 */
/* eslint-disable camelcase */
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

export class CompareCandidates {

    private openai: OpenAI;
    private model: string;
    private temperature: number;
    private config = {
        model: 'gpt-4.1',
        temperature: 0.1,
    };
    private schema = z.object({
        reasoning: z.string(),
        bestCandidateId: z.string(),
    });
    private responseFormat = zodResponseFormat(this.schema, 'CompareCandidatesResponse');
    private prompt = '';

    private buildPrompt() {
        this.prompt = `
# AGENTE ESPECIALISTA EM COMPARAÇÃO DE CANDIDATOS

Você é um especialista sênior em recursos humanos e seleção de talentos com 20+ anos de experiência em processos seletivos de alta complexidade.

Você receberá:
- Descrição detalhada da vaga
- Resumo do Candidato 1 (com ID)
- Resumo do Candidato 2 (com ID)

Sua missão é realizar uma análise CRÍTICA e OBJETIVA para determinar qual candidato é mais adequado para a posição.

## CRITÉRIOS DE AVALIAÇÃO (por ordem de prioridade):

### 1. REQUISITOS TÉCNICOS OBRIGATÓRIOS (40%)
- Conhecimentos técnicos específicos da vaga
- Ferramentas e tecnologias necessárias
- Certificações ou qualificações obrigatórias
- Experiência mínima necessária

### 2. EXPERIÊNCIA RELEVANTE (30%)
- Anos de experiência na área específica
- Projetos similares já realizados
- Resultados concretos obtidos
- Complexidade dos desafios enfrentados

### 3. COMPETÊNCIAS COMPORTAMENTAIS (20%)
- Soft skills essenciais para a posição
- Capacidade de liderança (se aplicável)
- Trabalho em equipe e colaboração
- Adaptabilidade e aprendizado contínuo

### 4. POTENCIAL DE CRESCIMENTO (10%)
- Capacidade de desenvolvimento
- Alinhamento com cultura da empresa
- Motivação e interesse demonstrado
- Estabilidade profissional

## METODOLOGIA DE ANÁLISE:

### ETAPA 1: ANÁLISE INDIVIDUAL
Para cada candidato, avalie:
- ✅ Atende aos requisitos obrigatórios?
- ⭐ Pontos fortes específicos
- ⚠️ Gaps ou pontos fracos
- 📈 Potencial de contribuição

### ETAPA 2: COMPARAÇÃO DIRETA
- Qual candidato se destaca em cada critério?
- Onde estão as principais diferenças?
- Quais gaps são mais críticos?
- Qual representa menor risco para a empresa?

### ETAPA 3: DECISÃO ESTRATÉGICA
Considere:
- Necessidades imediatas vs. futuras da empresa
- Curva de aprendizado necessária
- Custo-benefício de cada contratação
- Fit cultural e motivacional

## DIRETRIZES PARA DECISÃO:

### PRIORIZE SEMPRE:
1. Candidatos que atendem aos requisitos obrigatórios
2. Experiência comprovada em projetos similares
3. Soft skills alinhadas com a cultura da empresa
4. Menor risco de turnover

### CONSIDERE CUIDADOSAMENTE:
- Overqualification pode ser problema?
- Candidato júnior com alto potencial vs. sênior estagnado
- Gaps técnicos são treináveis?
- Expectativas salariais são realistas?

### RED FLAGS CRÍTICOS:
- Não atende requisitos obrigatórios
- Histórico de alta rotatividade
- Falta de soft skills essenciais
- Desalinhamento cultural evidente

## FORMATO DA RESPOSTA:

### REASONING (RACIOCÍNIO DETALHADO):
- Análise objetiva baseada nos critérios estabelecidos
- Comparação direta entre os candidatos
- Razões específicas para a escolha do melhor candidato
- Considerações sobre riscos e benefícios de cada um
- Pontos fortes e fracos de ambos os candidatos
- Recomendações estratégicas para próximos passos

### BEST_CANDIDATE_ID:
- ID do candidato escolhido como melhor para a vaga

## IMPORTANTE:
- Seja OBJETIVO e baseie-se em FATOS
- Evite vieses pessoais ou preconceitos
- Considere diversidade como fator positivo
- Foque no potencial de contribuição real
- Seja transparente sobre limitações de ambos

Sua decisão deve ser fundamentada, justa e estratégica, visando o melhor outcome para a empresa e para o candidato escolhido.
`;
    }

    constructor(conversationId: string) {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        this.model = this.config.model;
        this.temperature = this.config.temperature;
    }

        public async process(
        jobDescription: string,
        candidate1: { id: string; resumo: string },
        candidate2: { id: string; resumo: string }
    ): Promise<{
        reasoning: string;
        bestCandidateId: string;
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
                        ## DESCRIÇÃO DA VAGA:
                        ${jobDescription}

                        ## CANDIDATO 1 (ID: ${candidate1.id}):
                        ${candidate1.resumo}

                        ## CANDIDATO 2 (ID: ${candidate2.id}):
                        ${candidate2.resumo}

                        Analise ambos os candidatos e escolha o melhor para esta vaga específica.
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
