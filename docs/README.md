# 📚 Documentação - Sinistro Simplify

Bem-vindo à documentação completa do projeto **Sinistro Simplify**. Esta pasta contém toda a informação necessária para desenvolvedores seniores entenderem e contribuírem com o projeto.

## 📋 Índice da Documentação

### 🚀 **Guia Principal**
- **[GUIA-DESENVOLVEDOR.md](./GUIA-DESENVOLVEDOR.md)** - Guia completo para desenvolvedores
  - Visão geral do projeto
  - Stack tecnológica
  - Estrutura do projeto
  - Configuração do ambiente
  - Funcionalidades implementadas

### 🗄️ **Banco de Dados**
- **[ESTRUTURA-BANCO-DADOS.md](./ESTRUTURA-BANCO-DADOS.md)** - Documentação técnica do banco
  - Esquema completo das tabelas
  - Relacionamentos e constraints
  - Políticas de segurança (RLS)
  - Migrações e histórico
  - Triggers e funções

### 🎯 **Planejamento e Roadmap**
- **[ROADMAP-PROJETO.md](./ROADMAP-PROJETO.md)** - Planejamento de funcionalidades
  - Status atual do projeto
  - Próximas funcionalidades planejadas
  - Cronograma estimado
  - Métricas de sucesso
  - Recursos necessários

## 🎯 **Sobre o Projeto**

**Sinistro Simplify** é uma plataforma SaaS que visa simplificar todo o processo de resolução de sinistros, conectando seguradoras e clientes em uma plataforma única. O sistema agiliza todo o fluxo de atendimento e resolução de sinistros através de uma interface moderna e intuitiva.

### **Principais Objetivos**
- ✅ **Simplificar** o processo de abertura e acompanhamento de sinistros
- ✅ **Conectar** seguradoras e clientes em uma plataforma única
- ✅ **Agilizar** o fluxo de atendimento e resolução
- ✅ **Centralizar** toda a comunicação e documentação relacionada aos sinistros

## 🛠️ **Stack Tecnológica**

### **Frontend**
- React 18.3.1 + TypeScript 5.5.3
- Vite 5.4.1 + Tailwind CSS 3.4.11
- shadcn/ui + Radix UI
- React Query + React Hook Form

### **Backend**
- Supabase (PostgreSQL + Auth + Storage)
- Row Level Security (RLS)
- Real-time subscriptions

## 🚀 **Começando Rápido**

### **Para Desenvolvedores Novos**
1. Leia o **[GUIA-DESENVOLVEDOR.md](./GUIA-DESENVOLVEDOR.md)** primeiro
2. Configure o ambiente seguindo as instruções
3. Explore a estrutura do projeto
4. Leia o **[ROADMAP-PROJETO.md](./ROADMAP-PROJETO.md)** para entender o futuro

### **Para Desenvolvedores Experientes**
1. Leia a **[ESTRUTURA-BANCO-DADOS.md](./ESTRUTURA-BANCO-DADOS.md)** para entender a arquitetura
2. Verifique as próximas tarefas no roadmap
3. Escolha uma funcionalidade para implementar
4. Siga os padrões estabelecidos no projeto

## 📊 **Status Atual**

### **✅ Implementado (FASE 1)**
- Sistema de autenticação completo
- Dashboards para todos os tipos de usuário
- CRUD de sinistros
- Sistema de mensagens
- Upload de documentos
- Controle de acesso baseado em roles
- Interface responsiva

### **🚧 Em Desenvolvimento (FASE 2)**
- Sistema de notificações
- Relatórios e analytics
- Melhorias no sistema de documentos

### **🔮 Planejado (FASE 3)**
- Integração com APIs externas
- Sistema de auditoria
- Sistema de avaliação

## 🎯 **Próximas Tarefas Prioritárias**

### **Alta Prioridade**
1. **Sistema de Notificações** - 2-3 sprints
2. **Sistema de Relatórios** - 3-4 sprints
3. **Melhorias em Documentos** - 2-3 sprints

### **Média Prioridade**
4. **Integração com APIs** - 3-4 sprints
5. **Sistema de Auditoria** - 2-3 sprints
6. **Sistema de Avaliação** - 2 sprints

## 🔧 **Configuração do Ambiente**

### **Pré-requisitos**
- Node.js 18+
- npm ou bun
- Conta no Supabase

### **Instalação Rápida**
```bash
# Clone o repositório
git clone <url-do-repositorio>
cd sinistro-simplify

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Execute o projeto
npm run dev
```

## 📞 **Suporte e Contato**

### **Canais de Comunicação**
- **Slack**: #sinistro-simplify-dev
- **Email**: dev@sinistrosimplify.com
- **Jira**: Projeto SINISTRO

### **Equipe de Desenvolvimento**
- **Tech Lead**: [Nome] - [email]
- **Product Owner**: [Nome] - [email]
- **DevOps**: [Nome] - [email]

## 📝 **Contribuindo**

### **Padrões de Código**
- Conventional Commits para mensagens
- ESLint + Prettier para qualidade
- TypeScript para tipagem
- Testes para novas funcionalidades

### **Fluxo de Trabalho**
1. Fork do repositório
2. Criação de branch para feature
3. Desenvolvimento e testes
4. Pull Request com descrição detalhada
5. Code Review
6. Merge após aprovação

## 🔄 **Atualizações da Documentação**

Esta documentação é atualizada regularmente conforme o projeto evolui. Para sugerir melhorias ou reportar inconsistências:

1. Abra uma issue no repositório
2. Mencione `@docs` na descrição
3. Descreva a mudança sugerida
4. Aguarde o feedback da equipe

---

## 📚 **Recursos Adicionais**

### **Documentação Externa**
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

### **Ferramentas de Desenvolvimento**
- **ESLint** - Linting de código
- **Prettier** - Formatação automática
- **TypeScript** - Verificação de tipos
- **Vite** - Build tool rápido

---

*Última atualização: Setembro 2024*

**Nota**: Esta documentação é um documento vivo. Mantenha-a atualizada conforme o projeto evolui.
