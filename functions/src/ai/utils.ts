import { Message } from "../domain/messages/entity";
import { ChatCompletionMessageParam } from "openai/resources";
import { ChatCompletionContentPart } from "openai/resources";
import FirecrawlApp, { ScrapeResponse } from '@mendable/firecrawl-js';
import conversationsRepository from "../domain/conversations/repository";
import OpenAI from 'openai';


export const getCrawlResult = async (url: string) => {
    // TODO: add the api key to the environment variables
    const app = new FirecrawlApp({ apiKey: "fc-2412664d6e8c426fb13ee3428ebf20de" });
    const scrapeResult = await app.scrapeUrl(url, { formats: ['markdown'] }) as ScrapeResponse;
    return scrapeResult.markdown;
}

/**
 * Builds a context array for OpenAI Chat Completion from an array of messages.
 * Groups consecutive messages of the same role together and uses proper role naming.
 *
 * @param messages - Array of Message objects from the conversation.
 * @param options - Optional configuration for context building.
 * @param options.hideUserMessages - If true, user messages will be replaced with a placeholder.
 * @param options.userMessagePlaceholder - Custom placeholder for hidden user messages.
 * @returns An array of ChatCompletionMessageParam formatted for OpenAI.
 */
export async function buildOpenAiContext(
    messages: Message[],
): Promise<ChatCompletionMessageParam[]> {
    // Process messages to apply role and content formatting
    let lastRole: 'assistant' | 'user' | null = null;
    let roleCounter = 0;

    // First convert messages to correct role format and track role changes
    const promisses = messages
        .map(async (message: Message) => {
            // Get the appropriate message content
            let messageContent = '';
            const currentRole = message.isMe ? 'assistant' : 'user' as 'assistant' | 'user';

            // Reset counter when role changes
            if (lastRole !== currentRole) {
                roleCounter = 0;
                lastRole = currentRole;
            } else {
                roleCounter++;
            }

            if (message.messagePayload.type === 'text') {
                // For normal text messages
                messageContent = message.messagePayload.text;
            } else if (message.messagePayload.type === 'image') {
                messageContent = message.messagePayload.transcription || 'Imagem sem descrição.';
                // Adicionar o texto apenas se existir e não estiver vazio
                if (message.messagePayload.text && message.messagePayload.text.trim() !== '') {
                    messageContent = `${messageContent}\n\n${message.messagePayload.text}`;
                }
            } else if (message.messagePayload.type === 'audio') {
                messageContent = message.messagePayload.transcription || 'Audio message without transcription.';
            } else if (message.messagePayload.type === 'button-actions') {
                messageContent = `Mensagem automática do sistema: ${message.messagePayload.text}`;
            } else if (message.messagePayload.type === 'document') {
                messageContent = await getCrawlResult(message.messagePayload.documentUrl || '') || 'Documento sem descrição.';
            } else if (message.messagePayload.type === 'carousel') {
                // Constrói representação textual do carousel
                let carouselText = message.messagePayload.text;

                if (message.messagePayload.cards && message.messagePayload.cards.length > 0) {
                    carouselText += '\n\n📋 Opções do Carousel:';

                    message.messagePayload.cards.forEach((card, index) => {
                        const cardNumber = index + 1;
                        const cardText = card.text || `Card ${cardNumber}`;
                        carouselText += `\n${cardNumber}. ${cardText}`;
                    });
                }

                messageContent = carouselText;
            }

            return {
                role: currentRole,
                content: [{
                    type: 'text',
                    text: messageContent,
                }] as ChatCompletionContentPart[],
            };
        });

    const formattedMessages = await Promise.all(promisses);

    // Then group consecutive messages of the same role
    const groupedMessages: ChatCompletionMessageParam[] = [];

    for (const message of formattedMessages) {
        const lastMessage = groupedMessages[groupedMessages.length - 1];

        // If this message has the same role as the previous one and both have text content, combine them
        if (lastMessage &&
            lastMessage.role === message.role &&
            Array.isArray(lastMessage.content) &&
            Array.isArray(message.content) &&
            lastMessage.content[0]?.type === 'text' &&
            message.content[0]?.type === 'text') {
            // Combine the text content
            lastMessage.content[0].text = `${lastMessage.content[0].text}\n\n${message.content[0].text}`;
        } else {
            // Add as a new message
            groupedMessages.push(message as ChatCompletionMessageParam);
        }
    }

    console.log(`[buildOpenAiContext] groupedMessages: ${JSON.stringify(groupedMessages)}`);

    return groupedMessages;
}

/**
 * Parses the reasoning response from the OpenAI API.
 * @param response - The response from the OpenAI API.
 * @returns The parsed response.
 */
export function parseResoningResponse(response: {
    reasoning: string;
    response: string;
}): string {
    return `
<reasoning>
${response.reasoning}
</reasoning>
${response.response}
    `.trim();
}

/**
 * Gets the user description from the conversation.
 * @param conversationId - The id of the conversation.
 * @returns The user description.
 */
export async function getUserDescription(conversationId: string): Promise<string> {
    const conversation = await conversationsRepository.getConversationById(conversationId);
    return `
    Nome: ${conversation?.relevantData?.name || ''}
    Descrição: ${conversation?.relevantData?.description || 'Não informado'}
    Habilidades: ${conversation?.relevantData?.skills || 'Não informado'}
    Interesses: ${conversation?.relevantData?.interests || 'Não informado'}
    `;
}


/**
 * Gets the embeddings of the messages.
 * @param messages - The messages of the conversation.
 * @returns The embeddings of the messages.
 */
export async function getMessageEmbeddings(messages: string[]): Promise<(number[] | undefined)[]> {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const embeddingsPromise = messages.map(async message => {
        return openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: message,
        });
    });
    const embeddings = await Promise.all(embeddingsPromise);
    return embeddings.map(embedding => embedding.data[0]?.embedding);
}

/**
 * Calcula a similaridade de cosseno entre dois vetores de embedding.
 * @param vectorA - Primeiro vetor de embedding.
 * @param vectorB - Segundo vetor de embedding.
 * @returns Valor da similaridade de cosseno entre 0 e 1.
 */
export function calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
        throw new Error('Vectors must have the same length');
    }

    // Calcula o produto escalar
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vectorA.length; i++) {
        const valueA = vectorA[i];
        const valueB = vectorB[i];

        // Verifica se os valores não são undefined
        if (valueA !== undefined && valueB !== undefined) {
            dotProduct += valueA * valueB;
            magnitudeA += valueA * valueA;
            magnitudeB += valueB * valueB;
        }
    }

    // Calcula as magnitudes
    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    // Evita divisão por zero
    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    // Retorna a similaridade de cosseno
    return dotProduct / (magnitudeA * magnitudeB);
}
