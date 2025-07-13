import { Message } from "../domain/messages/entity";
import { AgentInputItem } from "@openai/agents";
import { ChatCompletionMessageParam } from "openai/resources";
import { ChatCompletionContentPart } from "openai/resources";
import FirecrawlApp, { ScrapeResponse } from '@mendable/firecrawl-js';


export const getCrawlResult = async (url: string) => {
    const app = new FirecrawlApp({ apiKey: "fc-2412664d6e8c426fb13ee3428ebf20de" });
    const scrapeResult = await app.scrapeUrl(url, { formats: ['markdown'] }) as ScrapeResponse;
    return scrapeResult.markdown;
}

/**
 * Converte um link de PDF para base64 para uso com a API do OpenAI.
 *
 * @param pdfUrl - URL do PDF a ser convertido
 * @returns Promise<string> - String base64 do PDF
 * @throws Error se não conseguir baixar ou converter o PDF
 */
export async function convertPdfLinkToBase64(pdfUrl: string): Promise<string> {
    try {
        // Baixa o PDF do link
        const response = await fetch(pdfUrl);

        if (!response.ok) {
            throw new Error(`Erro ao baixar PDF: ${response.status} ${response.statusText}`);
        }

        // Verifica se o content-type é realmente um PDF
        const contentType = response.headers.get('content-type');
        if (contentType && !contentType.includes('application/pdf')) {
            console.warn(`Aviso: Content-Type não é PDF: ${contentType}`);
        }

        // Converte para ArrayBuffer
        const arrayBuffer = await response.arrayBuffer();

        // Converte para Buffer (Node.js)
        const buffer = Buffer.from(arrayBuffer);

        // Converte para base64
        const base64String = buffer.toString('base64');

        return base64String;
    } catch (error) {
        console.error('Erro ao converter PDF para base64:', error);
        throw new Error(`Falha ao converter PDF para base64: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
}

/**
 * Converte um link de PDF para o formato esperado pela API do OpenAI Vision.
 *
 * @param pdfUrl - URL do PDF a ser convertido
 * @returns Promise<object> - Objeto formatado para a API do OpenAI
 */
export async function convertPdfLinkForOpenAI(pdfUrl: string, filename?: string): Promise<{
    type: "input_file";
    file: string;
    providerData: {
        filename: string;
    };
}> {
    try {
        const base64String = await convertPdfLinkToBase64(pdfUrl);

        return {
            type: "input_file",
            file: `data:application/pdf;base64,${base64String}`,
            providerData: {
                filename: filename || 'curriculum.pdf'
            }
        };
    } catch (error) {
        console.error('Erro ao converter PDF para formato OpenAI:', error);
        throw error;
    }
}

/**
 * Verifica se uma URL é um PDF válido.
 *
 * @param url - URL a ser verificada
 * @returns Promise<boolean> - true se for um PDF válido
 */
export async function isPdfUrl(url: string): Promise<boolean> {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        if (!response.ok) return false;

        const contentType = response.headers.get('content-type');
        return contentType?.includes('application/pdf') || url.toLowerCase().endsWith('.pdf');
    } catch {
        return false;
    }
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
