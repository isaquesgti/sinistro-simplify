# Estrutura do Banco de Dados - Sinistro Simplify

## 📊 Visão Geral

Este documento detalha a estrutura completa do banco de dados PostgreSQL do projeto Sinistro Simplify, incluindo todas as tabelas, relacionamentos, políticas de segurança e migrações.

## 🗄️ Esquema do Banco

### Tabelas Principais

#### 1. **profiles** - Perfis de Usuários
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos:**
- `id`: UUID único, referência para auth.users
- `email`: Email do usuário
- `full_name`: Nome completo
- `role`: Tipo de usuário (admin, insurer, client)
- `created_at`: Data de criação
- `updated_at`: Data da última atualização

#### 2. **insurers** - Seguradoras
```sql
CREATE TABLE public.insurers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  cnpj TEXT NOT NULL UNIQUE,
  phone TEXT,
  status public.insurer_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos:**
- `id`: UUID único da seguradora
- `profile_id`: Referência para o perfil do usuário
- `company_name`: Nome da empresa
- `cnpj`: CNPJ único da empresa
- `phone`: Telefone de contato
- `status`: Status de aprovação (pending, approved, rejected)
- `approved_by`: ID do admin que aprovou
- `approved_at`: Data da aprovação
- `created_at`: Data de criação
- `updated_at`: Data da última atualização

#### 3. **clients** - Clientes
```sql
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  insurer_id UUID NOT NULL REFERENCES public.insurers(id) ON DELETE CASCADE,
  cpf TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, insurer_id)
);
```

**Campos:**
- `id`: UUID único do cliente
- `profile_id`: Referência para o perfil do usuário
- `insurer_id`: Referência para a seguradora
- `cpf`: CPF do cliente
- `phone`: Telefone de contato
- `created_at`: Data de criação
- `updated_at`: Data da última atualização

#### 4. **claims** - Sinistros
```sql
CREATE TABLE public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  insurer_id UUID NOT NULL REFERENCES public.insurers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos:**
- `id`: UUID único do sinistro
- `client_id`: Referência para o cliente
- `insurer_id`: Referência para a seguradora
- `title`: Título do sinistro
- `description`: Descrição detalhada
- `status`: Status atual (pending, in_progress, completed, rejected)
- `created_at`: Data de criação
- `updated_at`: Data da última atualização

#### 5. **messages** - Sistema de Mensagens
```sql
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos:**
- `id`: UUID único da mensagem
- `claim_id`: Referência para o sinistro
- `sender_id`: Referência para o remetente
- `content`: Conteúdo da mensagem
- `created_at`: Data de criação

#### 6. **documents** - Documentos
```sql
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos:**
- `id`: UUID único do documento
- `claim_id`: Referência para o sinistro
- `user_id`: Referência para o usuário que fez upload
- `filename`: Nome original do arquivo
- `file_path`: Caminho no storage
- `created_at`: Data de criação

### Tabelas Adicionais

#### 7. **claim_updates** - Atualizações de Sinistros
```sql
CREATE TABLE public.claim_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 8. **plans** - Planos de Seguro
```sql
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  features JSONB,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 9. **blog_posts** - Posts do Blog
```sql
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id),
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔗 Relacionamentos

### Diagrama de Relacionamentos
```
profiles (1) ←→ (1) insurers
    ↓
profiles (1) ←→ (1) clients
    ↓
clients (1) ←→ (N) claims
    ↓
claims (1) ←→ (N) messages
claims (1) ←→ (N) documents
claims (1) ←→ (N) claim_updates
```

### Chaves Estrangeiras
- `profiles.id` → `auth.users.id`
- `insurers.profile_id` → `profiles.id`
- `clients.profile_id` → `profiles.id`
- `clients.insurer_id` → `insurers.id`
- `claims.client_id` → `profiles.id`
- `claims.insurer_id` → `insurers.id`
- `messages.claim_id` → `claims.id`
- `messages.sender_id` → `profiles.id`
- `documents.claim_id` → `claims.id`
- `documents.user_id` → `profiles.id`

## 🔐 Sistema de Segurança

### Row Level Security (RLS)
Todas as tabelas principais têm RLS habilitado para garantir isolamento de dados entre usuários e seguradoras.

### Políticas de Acesso

#### Profiles
```sql
-- Usuários veem apenas seus próprios dados
CREATE POLICY "Profiles: self select" ON public.profiles 
FOR SELECT USING (id = auth.uid());

-- Admins veem todos os perfis
CREATE POLICY "Profiles: admin all" ON public.profiles 
FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Seguradoras veem perfis de seus clientes
CREATE POLICY "Profiles: insurer can see clients" ON public.profiles 
FOR SELECT USING (
  public.get_user_role(auth.uid()) = 'insurer' AND
  id IN (SELECT c.profile_id FROM public.clients c 
         WHERE c.insurer_id = public.get_user_insurer_id(auth.uid()))
);
```

#### Insurers
```sql
-- Admins gerenciam todas as seguradoras
CREATE POLICY "Insurers: admin all" ON public.insurers 
FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Seguradoras veem apenas seus próprios dados
CREATE POLICY "Insurers: owner select" ON public.insurers 
FOR SELECT USING (profile_id = auth.uid());

-- Seguradoras aprovadas podem atualizar seus dados
CREATE POLICY "Insurers: owner update if approved" ON public.insurers 
FOR UPDATE USING (profile_id = auth.uid() AND status = 'approved');
```

#### Claims
```sql
-- Usuários veem apenas seus próprios sinistros
CREATE POLICY "Claims: users see own" ON public.claims 
FOR SELECT USING (
  client_id = auth.uid() OR 
  insurer_id = public.get_user_insurer_id(auth.uid()) OR 
  public.get_user_role(auth.uid()) = 'admin'
);

-- Usuários podem criar sinistros
CREATE POLICY "Claims: users can create" ON public.claims 
FOR INSERT WITH CHECK (client_id = auth.uid());

-- Admins gerenciam todos os sinistros
CREATE POLICY "Claims: admin can manage" ON public.claims 
FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');
```

### Funções Auxiliares

#### get_user_role
```sql
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.profiles WHERE id = _user_id;
$$;
```

#### get_user_insurer_id
```sql
CREATE OR REPLACE FUNCTION public.get_user_insurer_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT insurer_id FROM public.profiles WHERE id = _user_id;
$$;
```

#### get_client_insurer_id
```sql
CREATE OR REPLACE FUNCTION public.get_client_insurer_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.insurer_id FROM public.clients c 
  WHERE c.profile_id = _user_id;
$$;
```

## 📝 Migrações

### Estrutura das Migrações
As migrações estão organizadas cronologicamente e seguem o padrão:
```
YYYYMMDDHHMMSS_nome-descritivo.sql
```

### Migrações Principais

#### 1. **20250902135810** - Estrutura Base
- Criação das tabelas principais
- Definição dos enums
- Configuração inicial do RLS

#### 2. **20250902140008** - Ajustes de Estrutura
- Correções nas tabelas
- Atualização das políticas
- Melhorias nas funções auxiliares

#### 3. **20250902140318** - Workflow de Aprovação
- Sistema de aprovação de seguradoras
- Políticas de acesso refinadas
- Funções de utilidade

#### 4. **20250902140357** - Refinamentos
- Correções de constraints
- Melhorias na estrutura
- Otimizações de performance

#### 5. **20250903111229** - Segurança
- Habilitação de RLS em todas as tabelas
- Criação de políticas de segurança
- Correções de vulnerabilidades

#### 6. **20250903111255** - Políticas de Segurança
- Implementação de políticas RLS
- Controle de acesso granular
- Segurança por tipo de usuário

#### 7. **20250903111306** - Segurança Avançada
- Políticas para todas as tabelas
- Controle de acesso refinado
- Segurança por relacionamentos

#### 8. **20250903111350** - Finalização de Segurança
- Políticas idempotentes
- Controle de acesso completo
- Segurança robusta

#### 9. **20250903111550** - Otimizações
- Correções de search_path
- Melhorias de performance
- Padrões de segurança

#### 10. **20250903111638** - Finalizações
- Correções finais de segurança
- Otimizações de funções
- Padrões consistentes

## 🔧 Triggers e Funções

### Triggers Automáticos

#### Atualização de Timestamps
```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END; 
$$;

-- Aplicado em todas as tabelas com updated_at
CREATE TRIGGER trg_profiles_set_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

#### Criação Automática de Perfis
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 📊 Índices e Performance

### Índices Recomendados
```sql
-- Índices para performance de consultas
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_insurers_status ON public.insurers(status);
CREATE INDEX idx_claims_status ON public.claims(status);
CREATE INDEX idx_claims_client_id ON public.claims(client_id);
CREATE INDEX idx_claims_insurer_id ON public.claims(insurer_id);
CREATE INDEX idx_messages_claim_id ON public.messages(claim_id);
CREATE INDEX idx_documents_claim_id ON public.documents(claim_id);
```

### Otimizações de Consulta
- Uso de `SELECT` específico ao invés de `SELECT *`
- Índices em campos frequentemente consultados
- Políticas RLS otimizadas
- Funções auxiliares com `SECURITY DEFINER`

## 🚀 Próximas Melhorias

### Estrutura de Dados
1. **Sistema de Categorias** para sinistros
2. **Histórico de Status** com timestamps
3. **Sistema de Tags** para organização
4. **Auditoria Completa** de todas as ações

### Performance
1. **Partitioning** para tabelas grandes
2. **Materialized Views** para relatórios
3. **Connection Pooling** otimizado
4. **Caching** de consultas frequentes

### Segurança
1. **Encryption** de dados sensíveis
2. **Audit Logs** detalhados
3. **Rate Limiting** por usuário
4. **Backup** automático e seguro

---

*Documento atualizado em: Setembro 2024*
