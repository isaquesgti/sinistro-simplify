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
import { Shield, Users, CreditCard, LogOut, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import NewInsurerDialog from '@/components/NewInsurerDialog';
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  query, 
  where, 
  serverTimestamp
} from "firebase/firestore";

interface Insurer {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'blocked' | 'pending';
  plan: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

// Mock data for initial seeding
const mockInsurers = [
  { name: 'Seguradora Alpha', email: 'contato@alpha.com', status: 'active', plan: 'Premium' },
  { name: 'Seguros Beta', email: 'contato@beta.com', status: 'blocked', plan: 'Basic' },
  { name: 'Proteção Total', email: 'contato@protecaototal.com', status: 'active', plan: 'Enterprise' },
];

const mockPlans = [
  { name: 'Basic', price: 99.90, features: ['1 Analista', '10 Sinistros/Mês', 'Suporte Básico'] },
  { name: 'Premium', price: 299.90, features: ['5 Analistas', 'Sinistros Ilimitados', 'Suporte Prioritário'] },
  { name: 'Enterprise', price: 999.90, features: ['Analistas Ilimitados', 'Sinistros Ilimitados', 'API Dedicada', 'Suporte 24/7'] },
];

const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [insurers, setInsurers] = useState<Insurer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  
  // Função para popular as coleções de seguradoras e planos
  const seedCollections = async () => {
    try {
      // Inserir seguradoras
      const insurersCollection = collection(db, `artifacts/${__app_id}/public/data/insurers`);
      await Promise.all(
        mockInsurers.map(insurer => addDoc(insurersCollection, { ...insurer, createdAt: serverTimestamp() }))
      );

      // Inserir planos
      const plansCollection = collection(db, `artifacts/${__app_id}/public/data/plans`);
      await Promise.all(
        mockPlans.map(plan => addDoc(plansCollection, { ...plan, createdAt: serverTimestamp() }))
      );
      
      console.log('Coleções "insurers" e "plans" populadas com sucesso!');
    } catch (error) {
      console.error('Erro ao popular coleções:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full bg-white shadow-md p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-insurance-primary">Painel do Administrador</h1>
        <div className="flex space-x-2 items-center">
          <Button variant="ghost" onClick={() => auth.logout()}>
            <LogOut className="w-5 h-5 mr-2" /> Sair
          </Button>
        </div>
      </header>
      <main className="flex-grow bg-gray-50 p-8">
        <Tabs defaultValue="insurers" className="w-full max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="insurers" className="flex items-center gap-2">
                <Users className="w-4 h-4" /> Seguradoras
              </TabsTrigger>
              <TabsTrigger value="plans" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Planos
              </TabsTrigger>
            </TabsList>
            <Button onClick={seedCollections} className="flex items-center gap-2 bg-insurance-secondary hover:bg-insurance-accent">
                <Upload className="w-4 h-4" /> Inserir Dados de Exemplo
            </Button>
          </div>
          <TabsContent value="insurers" className="space-y-4">
            <h2 className="text-xl font-semibold">Gerenciamento de Seguradoras</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Aqui os dados do Firestore serão renderizados */}
                {insurers.length > 0 ? (
                  insurers.map((insurer) => (
                    <TableRow key={insurer.id}>
                      <TableCell className="font-medium">{insurer.name}</TableCell>
                      <TableCell>{insurer.email}</TableCell>
                      <TableCell>
                        <Badge variant={insurer.status === 'active' ? 'default' : 'secondary'}>
                          {insurer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{insurer.plan}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">Gerenciar</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      Nenhuma seguradora encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <NewInsurerDialog />
          </TabsContent>
          <TabsContent value="plans" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gerenciamento de Planos</h2>
              <Button>Novo Plano</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Aqui os dados do Firestore serão renderizados */}
              {plans.length > 0 ? (
                plans.map((plan) => (
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
                ))
              ) : (
                <div className="col-span-3 text-center py-4">
                  Nenhum plano encontrado.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
