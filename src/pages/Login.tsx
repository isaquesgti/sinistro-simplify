
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, type UserRole } from '@/components/AccessControl';
import { User, Shield, Key } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<UserRole>('client');

  React.useEffect(() => {
    if (auth.isAuthenticated && auth.role) {
      if (auth.role === 'admin') navigate('/admin');
      else if (auth.role === 'insurer') navigate('/insurer');
      else navigate('/dashboard');
    }
  }, [auth.isAuthenticated, auth.role, navigate]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!identifier || !password) {
        toast({
          title: "Erro de login",
          description: "Por favor, preencha email e senha.",
          variant: "destructive",
        });
        return;
      }

      await auth.login({ email: identifier, password });

      // Navegação será tratada no useEffect quando o perfil carregar
    } catch (error) {
      toast({
        title: "Erro de login",
        description: "Credenciais inválidas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!identifier) {
      toast({
        title: "Campo obrigatório",
        description: "Digite seu email ou CPF/CNPJ para recuperar a senha.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Email enviado",
      description: "Instruções para redefinir sua senha foram enviadas para o seu email.",
    });
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
                    <Label htmlFor="client-identifier">CPF ou Email</Label>
                    <Input 
                      id="client-identifier" 
                      type="text" 
                      placeholder="Digite seu CPF ou email"
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
                    <Label htmlFor="insurer-identifier">CNPJ ou Email</Label>
                    <Input 
                      id="insurer-identifier" 
                      type="text" 
                      placeholder="Digite o CNPJ ou email"
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
