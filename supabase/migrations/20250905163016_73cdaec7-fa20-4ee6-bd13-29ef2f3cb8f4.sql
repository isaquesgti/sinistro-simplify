-- Corrigir role do usuário seguradora
UPDATE profiles 
SET role = 'insurer' 
WHERE id = 'caac72bc-0766-4363-983b-5de4afa57be8';

-- Verificar se existe o registro do insurer na tabela insurers
INSERT INTO insurers (profile_id, company_name, cnpj, phone, status)
VALUES ('caac72bc-0766-4363-983b-5de4afa57be8', 'Seguradora Demo', '12.345.678/0001-99', '(11) 99999-9999', 'approved')
ON CONFLICT (profile_id) DO NOTHING;