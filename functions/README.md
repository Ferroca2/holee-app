# Holee App - Functions

> **Sistema de Backend para Plataforma de Recrutamento com IA**

Este diretório contém todas as Firebase Cloud Functions que alimentam a plataforma Holee App - uma solução inovadora que conecta candidatos a vagas de emprego através de conversas inteligentes no WhatsApp, powered by AI.

## 🚀 Visão Geral

O Holee App é uma plataforma de recrutamento que utiliza inteligência artificial para:
- **Completar perfis profissionais** através de conversas naturais
- **Fazer matching inteligente** entre candidatos e vagas
- **Processar aplicações** de forma automatizada
- **Gerenciar conversas** via WhatsApp com integração ZApi

## 🏗️ Arquitetura

### Fluxo Principal
```
WhatsApp → ZApi Webhook → Firebase Functions → AI Processing → Firestore → Response
```

### Componentes Core
- **🤖 AI Agents**: Processamento inteligente de mensagens
- **💬 Messaging System**: Sistema robusto de mensageria
- **📱 WhatsApp Integration**: Integração completa com ZApi
- **🔄 Task Queues**: Processamento assíncrono de jobs
- **🗄️ Domain Repositories**: Camada de acesso a dados

## 📁 Estrutura de Arquivos

```
functions/
├── src/
│   ├── ai/                     # 🤖 Agentes de IA
│   │   ├── profileAgent.ts     # Agente para completar perfis
│   │   ├── userAgent.ts        # Agente para usuários com perfil completo
│   │   ├── matchAgent.ts       # Agente para matching de vagas
│   │   └── utils.ts            # Utilitários para IA
│   │
│   ├── core/                   # 🏗️ Sistema central
│   │   └── messaging/          # Sistema de mensageria
│   │       ├── handlers/       # Handlers por tipo de mensagem
│   │       ├── schemas/        # Schemas Zod para validação
│   │       └── registry.ts     # Registro de handlers
│   │
│   ├── domain/                 # 📊 Modelos de domínio
│   │   ├── applications/       # Aplicações para vagas
│   │   ├── conversations/      # Conversas no WhatsApp
│   │   ├── jobs/              # Vagas de emprego
│   │   ├── messages/          # Mensagens
│   │   └── stores/            # Lojas/Empresas
│   │
│   ├── firestore/             # 🔥 Triggers do Firestore
│   │   ├── onMessageWrite/    # Trigger para novas mensagens
│   │   └── onConversationWrite/ # Trigger para mudanças em conversas
│   │
│   ├── jobs/                  # ⚙️ Tarefas em background
│   │   └── tasks/             # Cloud Tasks
│   │
│   ├── pubsub/               # 📡 Pub/Sub handlers
│   │   └── onChatAi/         # Processamento de IA
│   │
│   ├── webService/           # 🌐 APIs REST
│   │   └── voiceAgent/       # Serviço de voz
│   │
│   └── wpp/                  # 📱 Integração WhatsApp
│       └── zapi/             # Cliente ZApi
│
├── db/                       # 🌱 Scripts de seed
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Setup e Configuração

### Pré-requisitos
- Node.js 22+
- Firebase CLI
- Conta Firebase configurada
- Chave API OpenAI
- Token ZApi para WhatsApp

### Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
firebase functions:config:set \
  openai.api_key="sk-..." \
  zapi.token="..." \
  zapi.instance_id="..." \
  zapi.instance_token="..."
```

### Desenvolvimento

```bash
# Compilar TypeScript
npm run build

# Modo watch para desenvolvimento
npm run build:watch

# Executar emulators locais
npm run serve

# Visualizar logs
npm run logs
```

## 🚀 Deploy

```bash
# Deploy todas as functions
npm run deploy

# Deploy específico
firebase deploy --only functions:onMessageReceiveWebhook
```

## 🤖 Principais Funcionalidades

### 1. Sistema de Mensageria
- **Tipos suportados**: Texto, Imagem, Áudio, Botões, Carrossel, Documentos
- **Validação**: Schemas Zod para type safety
- **Handlers**: Processamento especializado por tipo

### 2. Agentes de IA

#### ProfileAgent
- **Objetivo**: Completar perfis profissionais
- **Funcionalidades**:
  - Coleta dados pessoais e profissionais
  - Processa currículos (PDF)
  - Extrai informações do LinkedIn
  - Valida completude do perfil

#### UserAgent
- **Objetivo**: Atender usuários com perfil completo
- **Funcionalidades**:
  - Busca vagas relevantes
  - Lista aplicações ativas
  - Consulta informações de empresas
  - Verifica status do perfil

#### MatchAgent
- **Objetivo**: Fazer matching inteligente
- **Funcionalidades**:
  - Analisa compatibilidade candidato-vaga
  - Calcula score de fit
  - Sugere vagas relevantes

#### ReadMapAgent
- **Objetivo**: Criar roteiros personalizados de entrevistas
- **Funcionalidades**:
  - Gera roteiros detalhados baseados na vaga e perfil
  - Estrutura entrevistas de 20-30 minutos
  - Inclui perguntas técnicas e comportamentais
  - Fornece checklist estratégico para entrevistadores

#### CompareCandidates
- **Objetivo**: Comparar múltiplos candidatos para uma vaga
- **Funcionalidades**:
  - Análise crítica e objetiva entre candidatos
  - Avaliação baseada em critérios ponderados
  - Recomendação do melhor candidato
  - Justificativa detalhada da escolha

### 3. Fluxo de Aplicações

```
Usuário → Perfil Completo → Matching → Aplicação → Entrevista
```

#### Estados da Aplicação
- `FIT`: Candidato compatível com vaga
- `APPLIED`: Aplicação enviada
- `INTERVIEW`: Agendamento de entrevista
- `APPROVED`/`REJECTED`: Resultado final

### 4. Integração WhatsApp (ZApi)

#### Webhooks
- **Mensagens recebidas**: Processamento automático
- **Mensagens enviadas**: Tracking e confirmação
- **Suporte a**: Texto, mídias, botões interativos

#### Funcionalidades
- Validação de números
- Envio de mensagens tipadas
- Tratamento de erros robusto
- Rate limiting

## 📊 Modelos de Dados

### Conversation
```typescript
interface Conversation {
  name: string;
  photo?: string;
  role: 'ADMIN' | 'USER';
  profileCompleted: boolean;
  relevantData?: CandidateRelevantData;
  fitResults?: Array<{
    jobId: string;
    fitScore: number;
  }>;
}
```

### Job
```typescript
interface Job {
  title: string;
  description: string;
  location: string;
  requiredSkills: string[];
  salaryRange?: { min: number; max: number };
  workMode: 'REMOTE' | 'HYBRID' | 'ON_SITE';
  status: 'OPEN' | 'CLOSED';
}
```

### Application
```typescript
interface Application {
  conversationId: string;
  jobId: string;
  status: ApplicationStatus;
  step: ApplicationStep;
  fitScore: number;
}
```

### Message
```typescript
interface Message {
  timestamp: number;
  messagePayload: MessagePayload;
  referenceMessageId?: string;
  isGroup: boolean;
  isMe: boolean;
  isOptInMessage?: boolean;
  sender: {
    phone: string;
    name?: string;
    photo?: string;
  };
}
```

### Store
```typescript
interface Store {
  name: string;
  address: Address;
  phone: string;
  email: string;
  links: {
    website?: string;
    instagram?: string;
    linkedin?: string;
  };
  owner: {
    name: string;
    id: string;
  };
  mission: string;
  vision: string;
  values: string[];
  description: string;
  logo: string;
  isActive: boolean;
}
```


## 🌍 Variáveis de Ambiente

### Obrigatórias
- `OPENAI_API_KEY`: Chave da OpenAI
- `ZAPI_TOKEN`: Token do ZApi
- `ZAPI_INSTANCE_ID`: ID da instância ZApi
- `ZAPI_INSTANCE_TOKEN`: Token da instância ZApi

## 📚 Recursos Adicionais

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [ZApi Documentation](https://zapi.com.br/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Holee App** - Revolucionando o recrutamento através da IA 🚀
