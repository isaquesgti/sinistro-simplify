import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from '@/components/AccessControl';
import { Shield, Users, CreditCard, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import NewInsurerDialog from '@/components/NewInsurerDialog';

interface Insurer {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'blocked' | 'pending';
  plan: string;
}

const mockInsurers: Insurer[] = [
  { id: '1', name: 'Seguradora Alpha', email: 'contato@alpha.com', status: 'active', plan: 'Premium' },
  { id: '2', name: 'Seguros Beta', email: 'contato@beta.com', status: 'blocked', plan: 'Basic' },
  { id: '3', name: 'Proteção Total', email: 'contato@protecaototal.com', status: 'pending', plan: 'Standard' },
];

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

const mockPlans: Plan[] = [
  { id: '1', name: 'Basic', price: 99.90, features: ['Up to 50 clients', 'Basic support', 'Standard reports'] },
  { id: '2', name: 'Standard', price: 199.90, features: ['Up to 200 clients', 'Priority support', 'Advanced reports'] },
  { id: '3', name: 'Premium', price: 299.90, features: ['Unlimited clients', '24/7 support', 'Custom reports', 'White-label'] },
];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState('insurers');

  const getStatusBadge = (status: Insurer['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Ativo</Badge>;
      case 'blocked':
        return <Badge variant="destructive">Bloqueado</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Pendente</Badge>;
    }
  };

  const handleLogout = () => {
    auth.logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-insurance-primary flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Sistema de Seguros - Painel Administrativo
          </h1>
          <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="insurers" onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="insurers" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Seguradoras
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Planos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insurers" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gerenciamento de Seguradoras</h2>
              <NewInsurerDialog />
            </div>

            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockInsurers.map((insurer) => (
                      <TableRow key={insurer.id}>
                        <TableCell className="font-medium">{insurer.name}</TableCell>
                        <TableCell>{insurer.email}</TableCell>
                        <TableCell>{insurer.plan}</TableCell>
                        <TableCell>{getStatusBadge(insurer.status)}</TableCell>
                        <TableCell className="text-right space-x-2">
                          {insurer.status === 'blocked' ? (
                            <Button size="sm" variant="outline" className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700">
                              Desbloquear
                            </Button>
                          ) : insurer.status === 'pending' ? (
                            <Button size="sm" variant="outline" className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700">
                              Aprovar
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700">
                              Bloquear
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            Resetar Senha
                          </Button>
                          <Button size="sm" variant="outline">
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gerenciamento de Planos</h2>
              <Button>Novo Plano</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mockPlans.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>R$ {plan.price.toFixed(2)} / mês</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-insurance-primary"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <div className="p-6 pt-0 flex justify-end gap-2">
                    <Button variant="outline" size="sm">Editar</Button>
                    <Button variant="destructive" size="sm">Excluir</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
