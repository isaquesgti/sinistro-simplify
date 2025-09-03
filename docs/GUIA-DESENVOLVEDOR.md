# Guia do Desenvolvedor - Sinistro Simplify

## 📋 Visão Geral do Projeto

**Sinistro Simplify** é uma plataforma SaaS (Software as a Service) que visa simplificar todo o processo de resolução de sinistros, conectando seguradoras e clientes em uma plataforma única. O sistema agiliza todo o fluxo de atendimento e resolução de sinistros através de uma interface moderna e intuitiva.

### 🎯 Objetivos Principais
- **Simplificar** o processo de abertura e acompanhamento de sinistros
- **Conectar** seguradoras e clientes em uma plataforma única
- **Agilizar** o fluxo de atendimento e resolução
- **Centralizar** toda a comunicação e documentação relacionada aos sinistros

## 🏗️ Arquitetura do Sistema

### Estrutura de Usuários
O sistema possui três tipos de usuários principais:

1. **Clientes** - Usuários finais que abrem sinistros
2. **Seguradoras** - Empresas que gerenciam e resolvem sinistros
3. **Administradores** - Usuários com acesso total ao sistema

### Fluxo de Funcionamento
```
Cliente → Abre Sinistro → Seguradora Analisa → Comunicação → Resolução
```

## 🛠️ Stack Tecnológica

### Frontend
- **React 18.3.1** - Biblioteca principal para interface
- **TypeScript 5.5.3** - Tipagem estática
- **Vite 5.4.1** - Build tool e dev server
- **Tailwind CSS 3.4.11** - Framework CSS utilitário
- **shadcn/ui** - Componentes UI reutilizáveis
- **Radix UI** - Componentes primitivos acessíveis

### Backend & Banco de Dados
- **Supabase** - Backend as a Service
  - PostgreSQL como banco de dados
  - Autenticação integrada
  - Row Level Security (RLS)
  - Storage para arquivos
  - Real-time subscriptions

### Gerenciamento de Estado
- **TanStack Query (React Query) 5.56.2** - Gerenciamento de estado do servidor
- **React Hook Form 7.53.0** - Gerenciamento de formulários
- **Zod 3.23.8** - Validação de schemas

### Roteamento
- **React Router DOM 6.26.2** - Navegação SPA

### Utilitários
- **date-fns 3.6.0** - Manipulação de datas
- **lucide-react 0.462.0** - Ícones
- **clsx & tailwind-merge** - Classes CSS condicionais
- **sonner** - Notificações toast

## 📁 Estrutura do Projeto

```
sinistro-simplify/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── ui/             # Componentes base (shadcn/ui)
│   │   ├── AccessControl.tsx
│   │   ├── ClaimCard.tsx
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── pages/              # Páginas da aplicação
│   │   ├── Index.tsx       # Página inicial
│   │   ├── Login.tsx       # Autenticação
│   │   ├── Dashboard.tsx   # Dashboard do cliente
│   │   ├── InsurerDashboard.tsx  # Dashboard da seguradora
│   │   ├── AdminDashboard.tsx    # Dashboard administrativo
│   │   └── ClaimDetails.tsx      # Detalhes do sinistro
│   ├── lib/                # Configurações e utilitários
│   │   ├── supabaseClient.ts
│   │   └── utils.ts
│   ├── hooks/              # Hooks customizados
│   ├── integrations/       # Integrações externas
│   ├── App.tsx            # Componente principal
│   └── main.tsx           # Ponto de entrada
├── supabase/               # Configurações do Supabase
│   ├── migrations/         # Migrações do banco
│   └── config.toml
├── public/                 # Arquivos estáticos
├── docs/                   # Documentação
└── package.json            # Dependências
```

## 🗄️ Modelo de Dados

### Tabelas Principais

#### 1. **profiles** (Usuários do sistema)
```sql
- id: UUID (PK, referência para auth.users)
- email: TEXT
- full_name: TEXT
- role: ENUM('admin', 'insurer', 'client')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 2. **insurers** (Seguradoras)
```sql
- id: UUID (PK)
- profile_id: UUID (FK para profiles)
- company_name: TEXT
- cnpj: TEXT (UNIQUE)
- phone: TEXT
- status: ENUM('pending', 'approved', 'rejected')
- approved_by: UUID (FK para profiles)
- approved_at: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 3. **clients** (Clientes)
```sql
- id: UUID (PK)
- profile_id: UUID (FK para profiles)
- insurer_id: UUID (FK para insurers)
- cpf: TEXT
- phone: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 4. **claims** (Sinistros)
```sql
- id: UUID (PK)
- client_id: UUID (FK para profiles)
- insurer_id: UUID (FK para insurers)
- title: TEXT
- description: TEXT
- status: ENUM('pending', 'in_progress', 'completed', 'rejected')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 5. **messages** (Comunicação)
```sql
- id: UUID (PK)
- claim_id: UUID (FK para claims)
- sender_id: UUID (FK para profiles)
- content: TEXT
- created_at: TIMESTAMP
```

#### 6. **documents** (Documentos)
```sql
- id: UUID (PK)
- claim_id: UUID (FK para claims)
- user_id: UUID (FK para profiles)
- filename: TEXT
- file_path: TEXT
- created_at: TIMESTAMP
```

### Relacionamentos
- **profiles** ↔ **insurers**: 1:1 (quando role = 'insurer')
- **profiles** ↔ **clients**: 1:1 (quando role = 'client')
- **insurers** ↔ **clients**: 1:N (uma seguradora pode ter vários clientes)
- **clients** ↔ **claims**: 1:N (um cliente pode ter vários sinistros)
- **claims** ↔ **messages**: 1:N (um sinistro pode ter várias mensagens)
- **claims** ↔ **documents**: 1:N (um sinistro pode ter vários documentos)

## 🔐 Sistema de Autenticação e Autorização

### Autenticação
- **Supabase Auth** para gerenciamento de usuários
- **JWT tokens** para sessões
- **Triggers automáticos** para criação de perfis

### Autorização (Row Level Security)
- **Políticas granulares** por tipo de usuário
- **Funções auxiliares** para verificação de permissões
- **Isolamento de dados** entre seguradoras

### Políticas de Segurança
```sql
-- Usuários veem apenas seus próprios dados
-- Seguradoras veem apenas dados de seus clientes
-- Administradores têm acesso total
-- Clientes veem apenas seus próprios sinistros
```

## 🚀 Funcionalidades Implementadas

### 1. **Sistema de Autenticação**
- Login/Logout
- Registro de usuários
- Controle de acesso baseado em roles

### 2. **Dashboard do Cliente**
- Visualização de sinistros
- Filtros e busca
- Status dos sinistros
- Comunicação com seguradora

### 3. **Dashboard da Seguradora**
- Gestão de sinistros
- Aprovação/rejeição
- Estatísticas e relatórios
- Comunicação com clientes

### 4. **Dashboard Administrativo**
- Gestão de seguradoras
- Aprovação de cadastros
- Estatísticas gerais
- Controle de usuários

### 5. **Gestão de Sinistros**
- Abertura de sinistros
- Acompanhamento de status
- Sistema de mensagens
- Upload de documentos

## 🔧 Configuração do Ambiente

### Pré-requisitos
- Node.js 18+ 
- npm ou bun
- Conta no Supabase

### Variáveis de Ambiente
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### Instalação
```bash
# Clone o repositório
git clone <url-do-repositorio>
cd sinistro-simplify

# Instale as dependências
npm install
# ou
bun install

# Configure as variáveis de ambiente
cp .env.example .env

# Execute o projeto
npm run dev
```

## 📊 Estado Atual do Projeto

### ✅ Implementado
- [x] Estrutura base do projeto
- [x] Sistema de autenticação
- [x] Dashboards para todos os tipos de usuário
- [x] CRUD básico de sinistros
- [x] Sistema de mensagens
- [x] Upload de documentos
- [x] Controle de acesso baseado em roles
- [x] Interface responsiva

### 🚧 Em Desenvolvimento
- [ ] Sistema de notificações em tempo real
- [ ] Relatórios avançados
- [ ] Integração com APIs externas
- [ ] Sistema de avaliação de atendimento

### 📋 Próximas Tarefas Sugeridas

#### Prioridade Alta
1. **Implementar sistema de notificações**
   - Notificações push para mudanças de status
   - Emails automáticos para atualizações

2. **Melhorar sistema de documentos**
   - Validação de tipos de arquivo
   - Compressão de imagens
   - OCR para documentos

3. **Sistema de relatórios**
   - Dashboards analíticos
   - Exportação de dados
   - Métricas de performance

#### Prioridade Média
4. **Integração com APIs externas**
   - CEP (correios)
   - Validação de CPF/CNPJ
   - Geolocalização

5. **Sistema de auditoria**
   - Log de todas as ações
   - Histórico de mudanças
   - Compliance com regulamentações

#### Prioridade Baixa
6. **Melhorias de UX/UI**
   - Temas personalizáveis
   - Internacionalização
   - Acessibilidade avançada

## 🧪 Testes

### Estrutura de Testes
```bash
# Executar testes
npm run test

# Testes de cobertura
npm run test:coverage

# Testes E2E
npm run test:e2e
```

### Tipos de Testes
- **Unitários**: Componentes isolados
- **Integração**: APIs e banco de dados
- **E2E**: Fluxos completos do usuário

## 🚀 Deploy

### Ambientes
- **Desenvolvimento**: `npm run dev`
- **Staging**: `npm run build:dev`
- **Produção**: `npm run build`

### Plataformas de Deploy
- **Vercel** (recomendado para React)
- **Netlify**
- **Supabase** (para o backend)

## 📚 Recursos Adicionais

### Documentação
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

### Ferramentas de Desenvolvimento
- **ESLint** - Linting de código
- **Prettier** - Formatação automática
- **TypeScript** - Verificação de tipos
- **Vite** - Build tool rápido

## 🤝 Contribuição

### Padrões de Código
- **Conventional Commits** para mensagens de commit
- **ESLint** para qualidade do código
- **Prettier** para formatação
- **TypeScript** para tipagem

### Fluxo de Trabalho
1. Fork do repositório
2. Criação de branch para feature
3. Desenvolvimento e testes
4. Pull Request com descrição detalhada
5. Code Review
6. Merge após aprovação

### Checklist de Pull Request
- [ ] Código segue padrões estabelecidos
- [ ] Testes passam
- [ ] Documentação atualizada
- [ ] Screenshots (se aplicável)
- [ ] Descrição clara das mudanças

## 🆘 Suporte e Contato

### Equipe de Desenvolvimento
- **Tech Lead**: [Nome]
- **Product Owner**: [Nome]
- **DevOps**: [Nome]

### Canais de Comunicação
- **Slack**: #sinistro-simplify-dev
- **Email**: dev@sinistrosimplify.com
- **Jira**: Projeto SINISTRO

---

## 📝 Notas Importantes

### Arquitetura de Segurança
- **Row Level Security (RLS)** é fundamental para isolamento de dados
- **Funções auxiliares** devem sempre usar `SECURITY DEFINER`
- **Políticas de acesso** devem ser testadas regularmente

### Performance
- **React Query** para cache e sincronização de dados
- **Lazy loading** para componentes pesados
- **Otimização de imagens** para melhor performance

### Escalabilidade
- **Componentes reutilizáveis** para manutenibilidade
- **Separação clara de responsabilidades**
- **Padrões consistentes** em todo o código

---

*Este guia deve ser atualizado conforme o projeto evolui. Última atualização: Setembro 2024*
