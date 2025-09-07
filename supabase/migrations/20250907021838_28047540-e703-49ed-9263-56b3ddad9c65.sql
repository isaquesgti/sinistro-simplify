-- Garantir que o trigger de criação de perfil existe e funciona corretamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recriar o trigger se não existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Inserir usuários de teste para cada role se não existirem
DO $$
BEGIN
    -- Admin user
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = 'fa1708f5-41e0-42e7-9f13-7bb6cfc33b00') THEN
        INSERT INTO public.profiles (id, full_name, role)
        VALUES ('fa1708f5-41e0-42e7-9f13-7bb6cfc33b00', 'Admin User', 'admin');
    ELSE
        UPDATE public.profiles 
        SET role = 'admin', full_name = 'Admin User'
        WHERE id = 'fa1708f5-41e0-42e7-9f13-7bb6cfc33b00';
    END IF;
    
    -- Criar IDs para usuários de teste
    INSERT INTO public.profiles (id, full_name, role) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Cliente Teste', 'client'),
    ('22222222-2222-2222-2222-222222222222', 'Seguradora Teste', 'insurer')
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;
END $$;

-- Atualizar função get_user_insurer_id para funcionar corretamente
CREATE OR REPLACE FUNCTION public.get_user_insurer_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT i.id FROM public.insurers i WHERE i.profile_id = _user_id;
$function$;

-- Criar seguradora de teste para o usuário insurer
INSERT INTO public.insurers (id, profile_id, company_name, cnpj, status)
VALUES (
    gen_random_uuid(),
    '22222222-2222-2222-2222-222222222222',
    'Seguradora Teste Ltda',
    '12.345.678/0001-99',
    'approved'
) ON CONFLICT DO NOTHING;