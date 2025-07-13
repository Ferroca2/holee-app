/**
 * Job-related utilities and constants
 */

// Padrão de opt-in para inscrição em vagas
export const JOB_OPTIN_PATTERN = 'Quero me inscrever! (:jobId)';

/**
 * Gera a mensagem de opt-in para um job específico
 * @param jobId - ID do job
 * @returns Mensagem de opt-in formatada
 *
 * @example
 * generateJobOptinMessage('job123') // Returns: "Quero me inscrever! (job123)"
 */
export function generateJobOptinMessage(jobId: string): string {
    return JOB_OPTIN_PATTERN.replace(':jobId', jobId);
}

/**
 * Verifica se uma mensagem é um opt-in de job e retorna o jobId se for
 * @param message - Mensagem do usuário
 * @returns jobId se for um opt-in válido, null caso contrário
 *
 * @example
 * parseJobOptinMessage('Quero me inscrever! (job123)') // Returns: 'job123'
 * parseJobOptinMessage('Oi, tudo bem?') // Returns: null
 */
export function parseJobOptinMessage(message: string): string | null {
    // Remove espaços extras e normaliza a mensagem
    const normalizedMessage = message.trim();

    // Regex para capturar o padrão "Quero me inscrever! (jobId)"
    const optinRegex = /^Quero me inscrever!\s*\(([^)]+)\)$/i;
    const match = normalizedMessage.match(optinRegex);

    if (match && match[1]) {
        return match[1].trim();
    }

    return null;
}

/**
 * Verifica se uma mensagem é um opt-in de job
 * @param message - Mensagem do usuário
 * @returns true se for um opt-in válido, false caso contrário
 *
 * @example
 * isJobOptinMessage('Quero me inscrever! (job123)') // Returns: true
 * isJobOptinMessage('Oi, tudo bem?') // Returns: false
 */
export function isJobOptinMessage(message: string): boolean {
    return parseJobOptinMessage(message) !== null;
}
