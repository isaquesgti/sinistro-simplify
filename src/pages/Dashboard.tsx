import React, { useState, useEffect } from 'react';
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
import { createClient } from '@supabase/supabase-js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Inicializa o cliente Supabase com as variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Claim {
  id: string;
  title: string;
  date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  description: string;
  unreadMessages: number;
}

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClaimTitle, setNewClaimTitle] = useState('');
  const [newClaimDescription, setNewClaimDescription] = useState('');
  const auth = useAuth();
  
  // Função para buscar os sinistros no Supabase
  const fetchClaims = async () => {
    // Busca todos os registros na tabela 'claims'
    const { data, error } = await supabase.from('claims').select('*');
    if (error) {
      console.error('Erro ao buscar sinistros:', error.message);
      return;
    }
    setClaims(data as Claim[]);
  };

  // Função para adicionar um novo sinistro no Supabase
  const handleAddClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    const newClaim = {
      title: newClaimTitle,
      description: newClaimDescription,
      date: new Date().toLocaleDateString('pt-BR'),
      status: 'pending',
      unreadMessages: 0,
      id: crypto.randomUUID(), // Gera um ID único para o novo sinistro
    };

    // Insere o novo registro na tabela 'claims'
    const { error } = await supabase.from('claims').insert([newClaim]);

    if (error) {
      console.error('Erro ao adicionar sinistro:', error.message);
      return;
    }

    // Fecha o modal e limpa o formulário
    setIsModalOpen(false);
    setNewClaimTitle('');
    setNewClaimDescription('');

    // Atualiza a lista de sinistros
    fetchClaims();
  };

  // Carrega os dados do Supabase quando o componente é montado
  useEffect(() => {
    fetchClaims();
  }, []);

  const filteredClaims = claims.filter(claim => 
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
              <Button 
                className="mt-4 md:mt-0 bg-insurance-primary hover:bg-insurance-dark flex items-center"
                onClick={() => setIsModalOpen(true)}
              >
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
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Sinistro</DialogTitle>
            <DialogDescription>
              Preencha os campos para abrir um novo sinistro.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddClaim} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Título
              </Label>
              <Input
                id="title"
                value={newClaimTitle}
                onChange={(e) => setNewClaimTitle(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Textarea
                id="description"
                value={newClaimDescription}
                onChange={(e) => setNewClaimDescription(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit">Adicionar Sinistro</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
