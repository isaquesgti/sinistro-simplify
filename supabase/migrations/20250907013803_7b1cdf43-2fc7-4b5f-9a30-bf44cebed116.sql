-- Corrigir role do usuário seguradora
UPDATE profiles 
SET role = 'insurer' 
WHERE id = 'caac72bc-0766-4363-983b-5de4afa57be8';

-- Inserir registro do insurer na tabela insurers se não existir
INSERT INTO insurers (profile_id, company_name, cnpj, phone, status)
SELECT 'caac72bc-0766-4363-983b-5de4afa57be8', 'Seguradora Demo', '12.345.678/0001-99', '(11) 99999-9999', 'approved'
WHERE NOT EXISTS (
    SELECT 1 FROM insurers WHERE profile_id = 'caac72bc-0766-4363-983b-5de4afa57be8'
);