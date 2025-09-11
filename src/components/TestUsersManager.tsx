import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TestUser {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'insurer' | 'client';
  fullName: string;
  status: 'created' | 'error';
}

const TestUsersManager = () => {
  const [testUsers, setTestUsers] = useState<TestUser[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role: 'client' as 'admin' | 'insurer' | 'client',
    fullName: ''
  });

  const createTestUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.fullName) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para criar o usuário.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            full_name: newUser.fullName,
            role: newUser.role
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        const testUser: TestUser = {
          id: authData.user.id,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
          fullName: newUser.fullName,
          status: 'created'
        };

        setTestUsers(prev => [...prev, testUser]);
        
        toast({
          title: "Usuário criado",
          description: `Usuário ${newUser.email} criado com sucesso!`,
        });

        // Limpar formulário
        setNewUser({
          email: '',
          password: '',
          role: 'client',
          fullName: ''
        });
      }
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      
      const testUser: TestUser = {
        id: Math.random().toString(),
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        fullName: newUser.fullName,
        status: 'error'
      };

      setTestUsers(prev => [...prev, testUser]);

      toast({
        title: "Erro ao criar usuário",
        description: error.message || "Erro desconhecido ao criar usuário.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const removeTestUser = (id: string) => {
    setTestUsers(prev => prev.filter(user => user.id !== id));
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'insurer':
        return 'bg-blue-100 text-blue-800';
      case 'client':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'created' ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Criar Usuários de Teste
          </CardTitle>
          <CardDescription>
            Crie usuários de teste para diferentes roles no sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@teste.com"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="senha123"
                value={newUser.password}
                onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                placeholder="Nome do Usuário"
                value={newUser.fullName}
                onChange={(e) => setNewUser(prev => ({ ...prev, fullName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={newUser.role}
                onValueChange={(value: 'admin' | 'insurer' | 'client') => 
                  setNewUser(prev => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="insurer">Seguradora</SelectItem>
                  <SelectItem value="client">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={createTestUser} 
            disabled={isCreating}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isCreating ? 'Criando...' : 'Criar Usuário de Teste'}
          </Button>
        </CardContent>
      </Card>

      {testUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Usuários de Teste Criados</CardTitle>
            <CardDescription>
              Lista de usuários de teste criados nesta sessão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(user.status)}
                    <div>
                      <div className="font-medium">{user.fullName}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-gray-500">
                      Senha: {user.password}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTestUser(user.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Usuários de Teste Pré-definidos</CardTitle>
          <CardDescription>
            Use estes usuários para testar o sistema rapidamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-red-600 mb-2">Administrador</h4>
              <p className="text-sm text-gray-600 mb-2">admin@teste.com</p>
              <p className="text-sm text-gray-600">admin123</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-blue-600 mb-2">Seguradora</h4>
              <p className="text-sm text-gray-600 mb-2">seguradora@teste.com</p>
              <p className="text-sm text-gray-600">seguradora123</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-green-600 mb-2">Cliente</h4>
              <p className="text-sm text-gray-600 mb-2">cliente@teste.com</p>
              <p className="text-sm text-gray-600">cliente123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestUsersManager;
