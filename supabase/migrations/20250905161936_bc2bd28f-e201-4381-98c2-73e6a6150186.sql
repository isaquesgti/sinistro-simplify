DO $$
DECLARE
  admin_id uuid;
  ins_id uuid;
BEGIN
  -- Find admin by email and upsert profile as admin
  SELECT id INTO admin_id FROM auth.users WHERE email = 'isaque.ti@gmail.com';
  IF admin_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (admin_id, 'Admin User', 'admin')
    ON CONFLICT (id) DO UPDATE SET full_name = 'Admin User', role = 'admin';
  END IF;

  -- Find insurer by email and upsert profile as insurer
  SELECT id INTO ins_id FROM auth.users WHERE email = 'seguradora@seguradora.com.br';
  IF ins_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (ins_id, 'Seguradora Teste', 'insurer')
    ON CONFLICT (id) DO UPDATE SET full_name = 'Seguradora Teste', role = 'insurer';

    -- Create or update insurer company record
    IF NOT EXISTS (SELECT 1 FROM public.insurers WHERE profile_id = ins_id) THEN
      INSERT INTO public.insurers (profile_id, cnpj, company_name, status, approved_at, approved_by)
      VALUES (ins_id, '12345678000123', 'Seguradora Teste Ltda', 'approved', now(), admin_id);
    ELSE
      UPDATE public.insurers
      SET company_name = 'Seguradora Teste Ltda', status = 'approved', approved_at = now(), approved_by = admin_id
      WHERE profile_id = ins_id;
    END IF;
  END IF;
END $$;