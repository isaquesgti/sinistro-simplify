-- Create the admin user profile if it doesn't exist
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data, is_super_admin, role)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'isaque.ti@gmail.com',
  crypt('123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Admin User", "role": "admin"}'::jsonb,
  false,
  'authenticated'
) 
ON CONFLICT (email) DO UPDATE SET
  encrypted_password = crypt('123456', gen_salt('bf')),
  raw_user_meta_data = '{"full_name": "Admin User", "role": "admin"}'::jsonb;

-- Create admin profile
INSERT INTO public.profiles (id, full_name, role)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Admin User',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET
  full_name = 'Admin User',
  role = 'admin';

-- Create the insurer user profile
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data, is_super_admin, role)
VALUES (
  '00000000-0000-0000-0000-000000000002'::uuid,
  'seguradora@seguradora.com.br',
  crypt('123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Seguradora Teste", "role": "insurer"}'::jsonb,
  false,
  'authenticated'
) 
ON CONFLICT (email) DO UPDATE SET
  encrypted_password = crypt('123456', gen_salt('bf')),
  raw_user_meta_data = '{"full_name": "Seguradora Teste", "role": "insurer"}'::jsonb;

-- Create insurer profile
INSERT INTO public.profiles (id, full_name, role)
VALUES (
  '00000000-0000-0000-0000-000000000002'::uuid,
  'Seguradora Teste',
  'insurer'
)
ON CONFLICT (id) DO UPDATE SET
  full_name = 'Seguradora Teste',
  role = 'insurer';

-- Create insurer company record
INSERT INTO public.insurers (id, profile_id, cnpj, company_name, status, approved_at, approved_by)
VALUES (
  '00000000-0000-0000-0000-000000000003'::uuid,
  '00000000-0000-0000-0000-000000000002'::uuid,
  '12345678000123',
  'Seguradora Teste Ltda',
  'approved',
  now(),
  '00000000-0000-0000-0000-000000000001'::uuid
)
ON CONFLICT (profile_id) DO UPDATE SET
  company_name = 'Seguradora Teste Ltda',
  status = 'approved',
  approved_at = now(),
  approved_by = '00000000-0000-0000-0000-000000000001'::uuid;