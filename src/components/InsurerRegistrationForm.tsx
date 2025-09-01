
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

const formSchema = z.object({
  companyName: z.string().min(2, { message: 'Nome da empresa é obrigatório' }),
  cnpj: z.string().min(14, { message: 'CNPJ inválido' }),
  email: z.string().email({ message: 'Email inválido' }),
  phone: z.string().min(10, { message: 'Telefone inválido' }),
  plan: z.string({ required_error: 'Selecione um plano' }),
});

interface InsurerRegistrationFormProps {
  onSuccess?: () => void;
}

const InsurerRegistrationForm: React.FC<InsurerRegistrationFormProps> = ({ onSuccess }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      cnpj: '',
      email: '',
      phone: '',
      plan: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { data: plan } = await supabase
        .from('plans')
        .select('id')
        .eq('name', values.plan)
        .single();

      const { error } = await supabase.from('insurers').insert({
        company_name: values.companyName,
        cnpj: values.cnpj,
        phone: values.phone,
        plan_id: plan?.id ?? null,
      });

      if (error) throw error;

      toast({
        title: "Seguradora registrada com sucesso",
        description: "Registro criado com sucesso.",
      });

      form.reset();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast({
        title: "Erro ao registrar",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Empresa</FormLabel>
              <FormControl>
                <Input placeholder="Seguradora Exemplo Ltda" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="cnpj"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CNPJ</FormLabel>
              <FormControl>
                <Input placeholder="00.000.000/0000-00" {...field} />
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
                <Input type="email" placeholder="contato@exemplo.com" {...field} />
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
          name="plan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plano</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="basic">Básico</SelectItem>
                  <SelectItem value="standard">Padrão</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">Registrar Seguradora</Button>
      </form>
    </Form>
  );
};

export default InsurerRegistrationForm;
