
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth, type UserRole } from '@/components/AccessControl';
import { User, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Login = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const handleLogin = (role: UserRole) => {
    auth.login(role);
    if (role === 'client') {
      navigate('/dashboard');
    } else {
      navigate('/insurer');
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
              Escolha seu tipo de acesso para continuar
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <Button 
              className="flex justify-center items-center gap-2 p-6 text-lg" 
              onClick={() => handleLogin('client')}
            >
              <User className="h-6 w-6" />
              Área do Cliente
            </Button>
            <Button 
              variant="outline" 
              className="flex justify-center items-center gap-2 p-6 text-lg border-insurance-primary text-insurance-primary hover:bg-insurance-primary/10" 
              onClick={() => handleLogin('insurer')}
            >
              <Shield className="h-6 w-6" />
              Área da Seguradora
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">
              Selecione o tipo de acesso apropriado para o seu perfil
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
