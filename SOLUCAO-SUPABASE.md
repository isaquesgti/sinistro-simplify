# 🔧 Solução para Problemas do Supabase

## 🚨 **Problemas Identificados**

### 1. **Políticas RLS Problemáticas**
- As políticas RLS estavam tentando acessar `auth.users` incorretamente
- Funções auxiliares com problemas de permissão
- Trigger de criação de perfil falhando

### 2. **Falta de Botão de Sair**
- Navbar não tinha botão de logout
- Usuários não conseguiam sair do sistema

## ✅ **Soluções Implementadas**

### 1. **Correção das Políticas RLS**

Criado arquivo `fix-supabase-policies.sql` com:

```sql
-- Remove políticas problemáticas
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
-- ... outras políticas problemáticas

-- Cria políticas simples e funcionais
CREATE POLICY "profiles_own_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_own_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_own_insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### 2. **Correção do Trigger de Criação de Perfil**

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuário'),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'client')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$;
```

### 3. **Botão de Sair no Navbar**

Adicionado botão de logout em:
- ✅ **Desktop**: Botão "Sair" com ícone
- ✅ **Mobile**: Botão "Sair" no menu mobile
- ✅ **Todas as roles**: Admin, Cliente, Seguradora

## 🚀 **Como Aplicar as Correções**

### **Passo 1: Executar a Migração SQL**
```bash
# Execute o arquivo fix-supabase-policies.sql no Supabase Dashboard
# ou via SQL Editor
```

### **Passo 2: Testar o Sistema**
```bash
# Execute o script de teste
node test-supabase-fix.js
```

### **Passo 3: Verificar no Frontend**
1. Acesse `http://localhost:8080/login`
2. Use os botões de teste para fazer login
3. Verifique se o botão "Sair" aparece no navbar
4. Teste o logout

## 📋 **O que Precisa para o Supabase Funcionar**

### **1. Configurações Necessárias**
- ✅ **URL**: `https://mibkeebaghmxseobmjxj.supabase.co`
- ✅ **Chave**: Configurada no `client.ts`
- ❌ **Políticas RLS**: Precisam ser corrigidas

### **2. Tabelas Necessárias**
- ✅ **profiles**: Tabela principal de usuários
- ✅ **insurers**: Seguradoras
- ✅ **clients**: Clientes
- ✅ **claims**: Sinistros

### **3. Funções Necessárias**
- ✅ **handle_new_user()**: Trigger para criar perfis
- ✅ **get_user_role_simple()**: Função auxiliar
- ❌ **Políticas RLS**: Precisam ser aplicadas

## 🔧 **Scripts de Teste**

### **1. Diagnóstico**
```bash
node diagnose-supabase.js
```

### **2. Teste de Correção**
```bash
node test-supabase-fix.js
```

### **3. Criação de Usuários**
```bash
node create-simple-users.js
```

## 📊 **Status Atual**

- ✅ **Frontend**: Funcionando com login de teste
- ✅ **Navbar**: Botão de sair implementado
- ✅ **Navegação**: Funcionando para todas as roles
- ⚠️ **Supabase**: Precisa aplicar correções SQL
- ⚠️ **Login Real**: Depende das correções do Supabase

## 🎯 **Próximos Passos**

1. **Aplicar migração SQL** no Supabase Dashboard
2. **Testar criação de usuários** reais
3. **Verificar login** com credenciais reais
4. **Testar todas as funcionalidades** do sistema

## 🆘 **Se Ainda Não Funcionar**

1. **Verificar logs** do Supabase Dashboard
2. **Executar script de diagnóstico** novamente
3. **Verificar permissões** do usuário do Supabase
4. **Contatar suporte** do Supabase se necessário

---

**Nota**: O sistema está funcionando com login de teste. Para usar login real, é necessário aplicar as correções SQL no Supabase.
