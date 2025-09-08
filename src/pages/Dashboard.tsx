
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  FileCheck, 
  Plus, 
  Search, 
  Filter, 
  MessageSquare, 
  Bell, 
  User,
  FileText,
  Clock,
  Shield, 
  LogOut 
} from 'lucide-react';
import ClaimCard from '@/components/ClaimCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth, type UserRole } from '@/components/AccessControl';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type DbClaim = {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  created_at: string;
};

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const auth = useAuth();

  const { data: claims = [], isLoading } = useQuery<DbClaim[]>({
    queryKey: ['claims', 'client', auth.user?.id],
    queryFn: async () => {
      if (!auth.user?.id) return [];
      const { data, error } = await supabase
        .from('claims')
        .select('id, title, description, status, created_at')
        .eq('client_id', auth.user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as DbClaim[];
    },
    enabled: !!auth.user?.id,
  });

  const mappedClaims = claims.map((c) => ({
    id: c.id,
    title: c.title,
    date: new Date(c.created_at).toLocaleDateString('pt-BR'),
    status: c.status,
    description: c.description,
    unreadMessages: 0,
  }));

  const filteredClaims = mappedClaims.filter(claim => 
    claim.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    claim.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-insurance-primary">
                Dashboard do Cliente
              </h1>
              <p className="text-gray-600">
                Gerencie e acompanhe seus sinistros
              </p>
            </div>
            <div className="flex space-x-2 mt-4 md:mt-0">
              <Button 
                variant="outline" 
                className="border-insurance-primary text-insurance-primary hover:bg-insurance-primary/5"
                onClick={() => auth.login('insurer' as UserRole)}
              >
                <Shield className="w-4 h-4 mr-2" />
                Ver como Seguradora
              </Button>
              <Button 
                variant="outline" 
                className="border-red-500 text-red-500 hover:bg-red-500/5"
                onClick={() => auth.logout()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
          
          <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h2 className="text-xl font-semibold text-insurance-primary flex items-center">
                <FileCheck className="w-5 h-5 mr-2 text-insurance-secondary" />
                Meus Sinistros
              </h2>
              <Button className="mt-4 md:mt-0 bg-insurance-primary hover:bg-insurance-dark flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Novo Sinistro
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Buscar por ID ou descrição..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
            
            <Tabs defaultValue="all">
              <TabsList className="mb-6">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="pending">Pendentes</TabsTrigger>
                <TabsTrigger value="in_progress">Em Análise</TabsTrigger>
                <TabsTrigger value="completed">Concluídos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-0">
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredClaims.length > 0 ? (
                    filteredClaims.map(claim => (
                      <ClaimCard key={claim.id} {...claim} />
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8">
                      <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum sinistro encontrado</h3>
                      <p className="text-gray-500 mb-4">Não encontramos sinistros correspondentes à sua busca.</p>
                      <Button onClick={() => setSearchTerm('')} variant="outline">
                        Limpar filtros
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="pending" className="mt-0">
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredClaims.filter(claim => claim.status === 'pending').length > 0 ? (
                    filteredClaims
                      .filter(claim => claim.status === 'pending')
                      .map(claim => (
                        <ClaimCard key={claim.id} {...claim} />
                      ))
                  ) : (
                    <div className="col-span-2 text-center py-8">
                      <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum sinistro pendente</h3>
                      <p className="text-gray-500">Você não possui sinistros pendentes no momento.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="in_progress" className="mt-0">
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredClaims
                    .filter(claim => claim.status === 'in_progress')
                    .map(claim => (
                      <ClaimCard key={claim.id} {...claim} />
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="completed" className="mt-0">
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredClaims
                    .filter(claim => claim.status === 'completed')
                    .map(claim => (
                      <ClaimCard key={claim.id} {...claim} />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-insurance-primary flex items-center mb-6">
              <MessageSquare className="w-5 h-5 mr-2 text-insurance-secondary" />
              Mensagens Recentes
            </h2>
            <div className="text-center py-8">
              <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Centro de Mensagens</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-4">
                Comunique-se diretamente com os analistas responsáveis pelos seus sinistros.
              </p>
              <Button className="bg-insurance-secondary hover:bg-insurance-accent">
                Ver todas as mensagens
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
