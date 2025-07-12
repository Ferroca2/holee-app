import 'dotenv/config';

import {
    AgentInputItem,
    run,
} from '@openai/agents';
import readline from 'node:readline/promises';
import { createProfileAgent, ProfileAgentContext } from '../profileAgent';

let thread: AgentInputItem[] = [];

const context: ProfileAgentContext = {
    updateInfo: (data: ProfileAgentContext['data']) => {
        context.data = {
            ...context.data,
            ...data,
        }
    }
}


export async function askProfileAssistant(
    userMessage: string,
): Promise<string> {
    const res = await run(
        createProfileAgent(context),
        thread.concat({ role: 'user', content: userMessage }),
        { context: context }
    );

    thread = res.history;

    // History log
    console.log('💬 Histórico da conversa:', res.history);
    console.log('💬 Dados do perfil:', context.data);
    return res.finalOutput ?? 'Desculpe, não consegui responder.';
}

export function clearConversationHistory(): void {
    thread = [];
}

/* ------------------------------------------------------------------ */
/* 7. CLI DE TESTE                                                     */
/* ------------------------------------------------------------------ */

(async () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    console.log('Assistente de Perfil\n');
    console.log('Comandos disponíveis:');
    console.log('• "sair" - encerrar o programa');
    console.log('• "limpar" - limpar histórico da conversa');
    console.log('• Digite sua pergunta para começar!\n');

    while (true) {
        const q = await rl.question('👤 ');

        if (q.toLowerCase() === 'sair') {
            console.log('👋 Obrigado por usar o Assistente de Perfil! Até breve!\n');
            break;
        }

        if (q.toLowerCase() === 'limpar') {
            clearConversationHistory();
            console.log('🧹 Histórico da conversa limpo!\n');
            continue;
        }

        try {
            const a = await askProfileAssistant(q);
            console.log('🤖', a, '\n');
        } catch (error) {
            console.log('❌ Ops! Ocorreu um erro:', error);
            console.log('Tente novamente ou digite "limpar" para reiniciar.\n');
        }
    }

    rl.close();
})();
