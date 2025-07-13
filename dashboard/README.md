# Holee App - Dashboard

> **Painel Administrativo para Plataforma de Recrutamento com IA**

O Dashboard do Holee App é uma aplicação web moderna construída com Vue 3 e Quasar Framework, oferecendo uma interface administrativa completa para gerenciar vagas de emprego, candidatos e agentes de IA na plataforma de recrutamento.

## 🎯 Visão Geral

O Dashboard serve como centro de controle para empresas e recrutadores, proporcionando:

- **📊 Gerenciamento de Vagas**: Criação, edição e monitoramento de vagas de emprego
- **👥 Análise de Candidatos**: Visualização de aplicações, rankings e estatísticas
- **🤖 Agente de Voz**: Configuração e controle de entrevistas por voz com IA
- **📈 Analytics**: Dashboard com métricas e gráficos em tempo real
- **🏢 Configuração de Lojas**: Gerenciamento de informações da empresa
- **🔐 Autenticação**: Sistema seguro com Google Auth e Firebase

## 🏗️ Arquitetura e Tecnologias

### Stack Principal
- **Vue 3** - Framework JavaScript reativo com Composition API
- **Quasar Framework** - Framework UI multiplataforma baseado em Vue
- **TypeScript** - Tipagem estática para maior robustez
- **Pinia** - Gerenciamento de estado moderno para Vue
- **Firebase** - Backend completo (Auth, Firestore, Functions)
- **Chart.js** - Bibliotecas para gráficos e visualizações

### Ferramentas de Desenvolvimento
- **Vite** - Build tool rápido e moderno
- **ESLint** - Linter para qualidade de código
- **PostCSS** - Processamento de CSS
- **Sass/SCSS** - Preprocessador CSS

### Integrações
- **ElevenLabs** - Síntese de voz para agentes de IA
- **Google Auth** - Autenticação segura
- **Firestore** - Banco de dados NoSQL em tempo real

## 🚀 Funcionalidades Principais

### 1. **Gerenciamento de Vagas**
- ✅ Criação e edição de vagas com formulários avançados
- ✅ Controle de status (Aberta/Fechada)
- ✅ Configuração de requisitos técnicos e comportamentais
- ✅ Definição de faixas salariais e benefícios
- ✅ Controle de datas de inscrição
- ✅ Filtros e busca avançada

### 2. **Dashboard de Candidatos**
- ✅ Visualização de todas as aplicações
- ✅ Sistema de ranking automático
- ✅ Estatísticas detalhadas por vaga
- ✅ Gráficos de pipeline de contratação
- ✅ Filtros por etapa do processo
- ✅ Perfis detalhados dos candidatos

### 3. **Agente de Voz Inteligente**
- ✅ Configuração de entrevistas por voz
- ✅ Seleção de candidatos para entrevista
- ✅ Monitoramento em tempo real
- ✅ Visualização de ondas sonoras
- ✅ Integração com ElevenLabs
- ✅ Transcrição automática

### 4. **Sistema de Autenticação**
- ✅ Login seguro com Google
- ✅ Controle de acesso por rotas
- ✅ Gerenciamento de sessões
- ✅ Proteção contra usuários não autorizados

### 5. **Configuração de Empresa**
- ✅ Setup inicial da empresa
- ✅ Configuração de informações básicas
- ✅ Upload de logo e imagens
- ✅ Definição de missão, visão e valores

## 📁 Estrutura de Arquivos

```
dashboard/
├── src/
│   ├── assets/                 # 🖼️ Recursos estáticos
│   │   ├── logo.png           # Logo principal
│   │   ├── logo-white.png     # Logo para tema escuro
│   │   └── mini-logo.png      # Logo mini para sidebar
│   │
│   ├── boot/                   # 🚀 Plugins de inicialização
│   │   ├── axios.ts           # Configuração HTTP
│   │   ├── firebase/          # Setup Firebase
│   │   └── router-guards.ts   # Guards de rota
│   │
│   ├── components/             # 🧩 Componentes reutilizáveis
│   │   ├── layout/            # Componentes de layout
│   │   │   ├── navbar.vue     # Barra de navegação
│   │   │   └── sidebar.vue    # Menu lateral
│   │   └── ui/                # Componentes UI
│   │       ├── base-button.vue      # Botão customizado
│   │       ├── base-input.vue       # Input customizado
│   │       ├── base-select.vue      # Select customizado
│   │       ├── base-file-upload.vue # Upload de arquivos
│   │       ├── job-dialog.vue       # Modal de vagas
│   │       ├── jobs-table.vue       # Tabela de vagas
│   │       ├── stat-card.vue        # Cards de estatísticas
│   │       └── tab-component.vue    # Componente de tabs
│   │
│   ├── css/                    # 🎨 Estilos globais
│   │   ├── app.scss           # Estilos principais
│   │   ├── quasar.variables.scss # Variáveis do Quasar
│   │   └── transitions.scss    # Animações e transições
│   │
│   ├── domain/                 # 📊 Modelos de domínio
│   │   ├── applications/       # Aplicações para vagas
│   │   │   ├── entity.ts      # Entidades
│   │   │   └── repository.ts  # Repositório
│   │   ├── conversations/      # Conversas (candidatos)
│   │   ├── jobs/              # Vagas de emprego
│   │   ├── stores/            # Lojas/Empresas
│   │   └── index.ts           # Tipos base
│   │
│   ├── hooks/                  # 🪝 Composables Vue
│   │   ├── useConfirm.ts      # Hook de confirmação
│   │   ├── useError.ts        # Hook de erro
│   │   ├── useSuccess.ts      # Hook de sucesso
│   │   ├── useGlobalSearch.ts # Busca global
│   │   ├── useSidebarMenu.ts  # Menu lateral
│   │   ├── useStandardLayout.ts # Layout padrão
│   │   └── useStoreSelector.ts # Seletor de loja
│   │
│   ├── layouts/                # 📐 Layouts da aplicação
│   │   ├── login-layout.vue   # Layout de login
│   │   └── main-layout.vue    # Layout principal
│   │
│   ├── pages/                  # 📄 Páginas da aplicação
│   │   ├── index.vue          # Página de login
│   │   ├── home.vue           # Dashboard principal
│   │   ├── job-details.vue    # Detalhes da vaga
│   │   ├── voice-agent.vue    # Agente de voz
│   │   ├── voice-agent-public.vue # Agente público
│   │   ├── faq.vue            # FAQ
│   │   ├── getting-started/   # Onboarding
│   │   │   └── store-configuration.vue
│   │   └── ErrorNotFound.vue  # Página 404
│   │
│   ├── router/                 # 🛤️ Configuração de rotas
│   │   ├── index.ts           # Setup do router
│   │   └── routes.ts          # Definição de rotas
│   │
│   ├── stores/                 # 🗄️ Gerenciamento de estado
│   │   ├── index.ts           # Setup do Pinia
│   │   ├── session.ts         # Estado de sessão
│   │   ├── stores.ts          # Estado das lojas
│   │   ├── onboarding.ts      # Estado de onboarding
│   │   └── store-flag.d.ts    # Tipos TypeScript
│   │
│   ├── utils/                  # 🔧 Utilitários
│   │   ├── firestore.ts       # Helpers Firestore
│   │   ├── phone.ts           # Utilidades de telefone
│   │   ├── resolveWhen.ts     # Resolução condicional
│   │   └── storage.ts         # Gerenciamento de storage
│   │
│   ├── App.vue                 # 🏠 Componente raiz
│   ├── env.d.ts               # Tipos de ambiente
│   ├── quasar.d.ts            # Tipos do Quasar
│   └── shims-vue.d.ts         # Tipos Vue
│
├── public/                     # 📁 Arquivos públicos
│   ├── favicon.png            # Favicon
│   └── icons/                 # Ícones da aplicação
│
├── index.html                  # 📄 HTML principal
├── package.json               # 📦 Dependências
├── quasar.config.js           # ⚙️ Configuração Quasar
├── tsconfig.json              # 📘 Configuração TypeScript
├── postcss.config.cjs         # 🎨 Configuração PostCSS
├── .eslintignore              # 🚫 Ignorar ESLint
├── .gitignore                 # 🚫 Ignorar Git
├── .npmrc                     # 📦 Configuração NPM
└── README.md                  # 📖 Documentação
```

## 🛠️ Setup e Configuração

### Pré-requisitos
- **Node.js** 16+ ou 18+
- **npm** >= 6.13.4 ou **yarn** >= 1.21.1
- **Quasar CLI** instalado globalmente
- **Firebase CLI** (opcional, para deploy)

### Instalação

```bash
# Instalar dependências
npm install
# ou
yarn install

# Instalar Quasar CLI globalmente (se não tiver)
npm install -g @quasar/cli
```

### Configuração do Firebase

1. **Criar projeto Firebase:**
   - Acesse [Firebase Console](https://console.firebase.google.com/)
   - Crie um novo projeto
   - Ative Authentication (Google)
   - Configure Firestore Database

2. **Configurar credenciais:**
   - Copie as credenciais do Firebase
   - Atualize o arquivo `src/boot/firebase/index.ts`

### Variáveis de Ambiente

```bash
# Configurações do Firebase (já configuradas no código)
VITE_FIREBASE_API_KEY="sua-api-key"
VITE_FIREBASE_AUTH_DOMAIN="seu-projeto.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="seu-projeto"
```

## 🚀 Desenvolvimento

### Comandos Principais

```bash
# Iniciar servidor de desenvolvimento
npm run dev
# ou
quasar dev

# Build para produção
npm run build
# ou
quasar build

# Linting
npm run lint
# ou
yarn lint

# Executar testes
npm run test
```

### Modo de Desenvolvimento

```bash
# Desenvolvimento com hot-reload
quasar dev

# Desenvolvimento para específicas plataformas
quasar dev -m electron    # Electron
quasar dev -m capacitor   # Capacitor (mobile)
quasar dev -m cordova     # Cordova (mobile)
```

### Build de Produção

```bash
# Build para web
quasar build

# Build para Electron
quasar build -m electron

# Build para mobile
quasar build -m capacitor
```

## Tema Escuro
- ✅ Suporte completo a tema escuro
- ✅ Alternância automática de logos
- ✅ Cores adaptativas
- ✅ Persistência de preferência


## 🛤️ Roteamento

### Estrutura de Rotas

```typescript
// Rotas principais
const routes = [
  { path: '/', component: LoginLayout },
  { path: '/dashboard', component: MainLayout, meta: { access: 'auth-only' } },
  { path: '/job/:jobId', component: JobDetails, meta: { access: 'auth-only' } },
  { path: '/voice-agent', component: VoiceAgent, meta: { access: 'auth-only' } },
  { path: '/getting-started', component: StoreConfiguration, meta: { access: 'auth-only' } },
];
```

### Guards de Rota
- **Autenticação**: Protege rotas que requerem login
- **Onboarding**: Redireciona para configuração inicial
- **Autorização**: Controla acesso baseado em roles

## 🔧 Hooks (Composables)

### Hooks de UI
- **useStandardLayout** - Layout padrão responsivo
- **useGlobalSearch** - Busca global na aplicação
- **useSidebarMenu** - Menu lateral dinâmico
- **useStoreSelector** - Seleção de loja ativa

### Hooks de Feedback
- **useError** - Exibição de erros
- **useSuccess** - Mensagens de sucesso
- **useConfirm** - Diálogos de confirmação


## 🔒 Segurança

### Autenticação
- ✅ Firebase Authentication
- ✅ Google OAuth 2.0
- ✅ Tokens JWT seguros
- ✅ Renovação automática

### Autorização
- ✅ Guards de rota
- ✅ Controle de acesso
- ✅ Validação de permissões
- ✅ Proteção de APIs

---

**Holee App Dashboard** - Transformando o recrutamento através da tecnologia 🚀
