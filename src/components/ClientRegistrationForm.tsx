import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AccessControl';

const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Nome completo é obrigatório' }),
  email: z.string().email({ message: 'Email inválido' }),
  cpf: z.string().min(11, { message: 'CPF inválido' }),
  phone: z.string().min(10, { message: 'Telefone inválido' }),
  password: z.string().min(6, { message: 'Senha deve ter no mínimo 6 caracteres' }),
});

interface ClientRegistrationFormProps {
  onSuccess?: () => void;
}

const ClientRegistrationForm: React.FC<ClientRegistrationFormProps> = ({ onSuccess }) => {
  const auth = useAuth();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      cpf: '',
      phone: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Get insurer ID for the current user
      const { data: insurerData } = await supabase
        .from('insurers')
        .select('id')
        .eq('profile_id', auth.user?.id)
        .single();

      if (!insurerData) {
        throw new Error('Seguradora não encontrada');
      }

      // Create user in Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            role: 'client'
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update the profile to link with insurer
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            insurer_id: insurerData.id,
            email: values.email,
            full_name: values.fullName
          })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;

        // Create client record
        const { error: clientError } = await supabase
          .from('clients')
          .insert({
            profile_id: authData.user.id,
            insurer_id: insurerData.id,
            cpf: values.cpf,
            phone: values.phone
          });

        if (clientError) throw clientError;
      }

      toast({
        title: "Cliente cadastrado com sucesso",
        description: "Um email de confirmação foi enviado para o cliente.",
      });

      form.reset();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast({
        title: "Erro ao cadastrar cliente",
        description: err.message || "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder="João da Silva" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="joao@exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF</FormLabel>
              <FormControl>
                <Input placeholder="000.000.000-00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input placeholder="(00) 00000-0000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha Inicial</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Digite a senha inicial" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">Cadastrar Cliente</Button>
      </form>
    </Form>
  );
};

export default ClientRegistrationForm;