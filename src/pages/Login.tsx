import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, type UserRole } from '@/components/AccessControl';
import { User, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

const Login = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<UserRole>('client');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // O Supabase exige que o identificador seja um email
    // Usaremos o campo de email, independente do tab selecionado
    const email = identifier;

    try {
      if (!email || !password) {
        toast({
          title: "Erro de login",
          description: "Por favor, preencha todos os campos.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }
      
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (userError) {
          throw userError;
        }

        // O redirecionamento agora é baseado no role retornado do banco de dados
        const role = userData.role as UserRole;
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'insurer') {
          navigate('/insurer');
        } else {
          navigate('/dashboard');
        }
      }

    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Credenciais inválidas. Tente novamente.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!identifier) {
      toast({
        title: "Campo obrigatório",
        description: "Digite seu email para recuperar a senha.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(identifier, {
        redirectTo: `${window.location.origin}/reset-password`, // Adapte para a URL de redefinição de senha
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Email enviado",
        description: "Instruções para redefinir sua senha foram enviadas para o seu email.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao tentar redefinir a senha.",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-insurance-primary">Acesso ao Sistema</CardTitle>
            <CardDescription>
              Faça login para acessar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="client" onValueChange={(value) => setSelectedTab(value as UserRole)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="client" className="flex items-center justify-center gap-2">
                  <User className="h-4 w-4" />
                  Cliente
                </TabsTrigger>
                <TabsTrigger value="insurer" className="flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4" />
                  Seguradora
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="client">
                <form onSubmit={handleLogin} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-identifier">Email</Label>
                    <Input 
                      id="client-identifier" 
                      type="email" 
                      placeholder="Digite seu email"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="client-password">Senha</Label>
                      <Button 
                        type="button" 
                        variant="link" 
                        size="sm" 
                        className="px-0 h-auto font-normal text-xs"
                        onClick={handleForgotPassword}
                      >
                        Esqueci a senha
                      </Button>
                    </div>
                    <Input 
                      id="client-password" 
                      type="password" 
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Processando...' : 'Entrar'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="insurer">
                <form onSubmit={handleLogin} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="insurer-identifier">Email</Label>
                    <Input 
                      id="insurer-identifier" 
                      type="email" 
                      placeholder="Digite o email"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="insurer-password">Senha</Label>
                      <Button 
                        type="button" 
                        variant="link" 
                        size="sm" 
                        className="px-0 h-auto font-normal text-xs"
                        onClick={handleForgotPassword}
                      >
                        Esqueci a senha
                      </Button>
                    </div>
                    <Input 
                      id="insurer-password" 
                      type="password" 
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Processando...' : 'Entrar'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">
              Para dúvidas, entre em contato com o suporte
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
