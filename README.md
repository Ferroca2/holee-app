# Holee App

> **Plataforma de Recrutamento Inteligente com IA**

O Holee App é uma plataforma completa de recrutamento que conecta candidatos a vagas de emprego através de conversas inteligentes no WhatsApp, powered by AI. A solução oferece matching automático, entrevistas por voz e um dashboard administrativo moderno.

## Como Usar na Prática

### Portal (Recrutador)

- https://holee-app.web.app/
- Login: hr@techcorp.com
- Senha: hr123456

### Link do WhatsApp (Candidato)

https://wa.me/5511956029500

### Fluxo do Recrutador

1. Cria uma vaga
2. Esperar a data de fim que ele mesmo define
3. Receber ranking de candidatos super qualificados

### Fluxo do Candidato

1. Se cadastrar via WhatsApp
2. Receber divulgações de vagas
3. Se inscrever em uma vaga
4. Participar de uma entrevista por voz
5. Esperar o recrutador chamar ele após a vaga ser finalizada

## 🎯 Visão Geral

**Para Candidatos:**
- 💬 Conversas naturais via WhatsApp para completar perfil
- 🤖 Recomendações personalizadas de vagas por IA
- 📋 Aplicações automatizadas baseadas em compatibilidade
- 🎙️ Entrevistas por voz com agentes inteligentes

**Para Empresas:**
- 📊 Dashboard web completo para gerenciar vagas e candidatos
- 🔍 Sistema de ranking automático de candidatos
- 📈 Analytics e métricas em tempo real
- ⚙️ Configuração flexível de processos seletivos

## 🏗️ Arquitetura

```
Holee App/
├── functions/          # 🔥 Firebase Cloud Functions (Backend)
│   ├── src/ai/         # Agentes de IA (GPT-4.1, Matching, Entrevistas)
│   ├── src/wpp/        # Integração WhatsApp (ZApi)
│   ├── src/domain/     # Modelos de dados (Jobs, Candidatos, etc.)
│   └── src/core/       # Sistema de mensageria
│
├── dashboard/          # 🖥️ Dashboard Web (Frontend)
│   ├── src/pages/      # Páginas (Login, Jobs, Analytics)
│   ├── src/components/ # Componentes UI (Vue + Quasar)
│   ├── src/stores/     # Estado global (Pinia)
│   └── src/domain/     # Repositories do frontend
│
└── firebase.json       # ⚙️ Configuração Firebase
```

## 🚀 Stack Tecnológico

### Backend (Functions)
- **Firebase Cloud Functions** - Serverless backend
- **OpenAI GPT-4** - Agentes de IA conversacionais
- **TypeScript** - Tipagem estática
- **Firestore** - Banco de dados NoSQL
- **Pub/Sub** - Processamento assíncrono
- **ZApi** - Integração WhatsApp

### Frontend (Dashboard)
- **Vue 3** - Framework JavaScript moderno
- **Quasar Framework** - UI multiplataforma
- **TypeScript** - Desenvolvimento tipado
- **Pinia** - Gerenciamento de estado
- **Chart.js** - Gráficos e analytics
- **ElevenLabs** - Síntese de voz para entrevistas

## 📋 Funcionalidades Principais

### 🤖 **Agentes de IA**
- **ProfileAgent** - Coleta dados do candidato via conversa
- **UserAgent** - Recomenda vagas e responde dúvidas
- **MatchAgent** - Calcula compatibilidade candidato-vaga
- **ReadMapAgent** - Gera roteiros personalizados de entrevista
- **CompareCandidates** - Compara múltiplos candidatos

### 💼 **Gestão de Vagas**
- Criação e edição de vagas com requisitos detalhados
- Sistema automático de matching por IA
- Pipeline de candidatos com etapas customizáveis
- Analytics e relatórios em tempo real

### 🎙️ **Entrevistas Inteligentes**
- Agente de voz para entrevistas automatizadas
- Roteiros personalizados baseados na vaga e perfil
- Transcrição automática e análise de respostas

## 🛠️ Setup Rápido

### Pré-requisitos
- Node.js 22+
- Firebase CLI
- Chaves API: OpenAI, ZApi, ElevenLabs

### Instalação

```bash
# 1. Clonar repositório

# 2. Configurar Firebase Functions
cd functions
npm install
# Configure as variáveis de ambiente (ver functions/README.md)

# 3. Configurar Dashboard
cd ../dashboard
npm install
# Configure Firebase (ver dashboard/README.md)

# 4. Deploy (opcional)
firebase deploy
```

## 📖 Documentação Detalhada

### 🔥 **Backend (Functions)**
**[📖 Ver README Completo](./functions/README.md)**

Documentação técnica detalhada incluindo:
- Setup e configuração de todas as variáveis
- Estrutura dos agentes de IA
- Sistema de mensageria (WhatsApp)
- Modelos de dados e repositories
- Tasks em background e Pub/Sub

### 🖥️ **Frontend (Dashboard)**
**[📖 Ver README Completo](./dashboard/README.md)**

Guia completo do dashboard incluindo:
- Configuração Vue + Quasar
- Componentes UI e sistema de temas
- Gerenciamento de estado com Pinia
- Integração Firebase e deploy

## 🌍 Ambientes

### Desenvolvimento
```bash
# Functions
cd functions && npm run serve

# Dashboard
cd dashboard && npm run dev
```

### Produção
- **Functions**: `https://us-central1-holee-app.cloudfunctions.net/`
- **Dashboard**: `https://holee-app.web.app/`

## 🔐 Variáveis de Ambiente

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# WhatsApp (ZApi)
ZAPI_TOKEN=...
ZAPI_INSTANCE_ID=...
ZAPI_INSTANCE_TOKEN=...

# Voz (ElevenLabs)
ELEVENLABS_API_KEY=...
```

---

**Holee App** - Revolucionando o recrutamento através da IA 🤖✨
