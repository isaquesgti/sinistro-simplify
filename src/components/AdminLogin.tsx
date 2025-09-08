import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/AccessControl';
import { Key, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AdminLogin = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (auth.loading) return;
    
    if (auth.isAuthenticated && auth.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [auth.isAuthenticated, auth.role, auth.loading, navigate]);

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

  const handleDevLogin = () => {
    auth.login('admin');
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Key className="w-8 h-8 text-insurance-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-insurance-primary">Acesso Administrativo</CardTitle>
        <CardDescription>
          Área restrita para administradores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-identifier">Email</Label>
            <Input 
              id="admin-identifier" 
              type="email" 
              placeholder="Digite o email de administrador"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Senha</Label>
            <Input 
              id="admin-password" 
              type="password" 
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Verificando...' : 'Acessar Sistema'}
          </Button>
        </form>
        
        {/* Botão de desenvolvimento - apenas para teste */}
        <div className="mt-6 pt-4 border-t">
          <p className="text-sm text-gray-600 mb-3 text-center">Acesso de Desenvolvimento:</p>
          <Button 
            type="button" 
            variant="outline" 
            className="w-full" 
            onClick={handleDevLogin}
          >
            Admin (Desenvolvimento)
          </Button>
        </div>

        <div className="mt-4 pt-4 border-t">
          <Button 
            type="button" 
            variant="ghost" 
            className="w-full" 
            onClick={() => navigate('/login')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Login Principal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminLogin;