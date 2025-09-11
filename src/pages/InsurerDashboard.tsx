import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  FileCheck, 
  Search, 
  Filter, 
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  UserCog,
  LogOut,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AccessControl';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import InsurerClientManager from '@/components/InsurerClientManager';
import {
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

type DbClaim = {
  id: string;
  title: string;
  client_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  created_at: string;
  description: string;
  client_name: string;
};

// Generate chart data
const generateChartData = (claims: DbClaim[]) => {
  const statusCounts = claims.reduce((acc, claim) => {
    acc[claim.status] = (acc[claim.status] || 0) + 1;
    return acc;
  }, {});

  return [
    { name: 'Pendentes', value: statusCounts.pending || 0, color: '#EAB308' },
    { name: 'Em Análise', value: statusCounts.in_progress || 0, color: '#3B82F6' },
    { name: 'Concluídos', value: statusCounts.completed || 0, color: '#22C55E' },
    { name: 'Negados', value: statusCounts.rejected || 0, color: '#EF4444' }
  ];
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pendente</Badge>;
    case 'in_progress':
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">Em Análise</Badge>;
    case 'completed':
      return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">Concluído</Badge>;
    case 'rejected':
      return <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200">Negado</Badge>;
    default:
      return <Badge variant="secondary">Desconhecido</Badge>;
  }
};

const InsurerDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('claims');
  const { toast } = useToast();
  const auth = useAuth();
  
  const { data: claims = [], isLoading, refetch } = useQuery<DbClaim[]>({
    queryKey: ['claims', 'insurer', auth.user?.id],
    queryFn: async () => {
      if (!auth.user?.id) return [];
      const { data, error } = await supabase
        .from('claims')
        .select(`
          id,
          title,
          description,
          status,
          created_at,
          clients:client_id (
            full_name
          )
        `)
        .eq('insurer_id', auth.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(claim => ({
        ...claim,
        client_name: claim.clients.full_name
      })) as DbClaim[];
    },
    enabled: !!auth.user?.id,
  });

  const filteredClaims = claims.filter(claim => 
    claim.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    claim.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    claim.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = generateChartData(claims);
  
  const updateClaimStatus = async (id: string, newStatus: 'pending' | 'in_progress' | 'completed' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('claims')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Status atualizado",
        description: `O status do sinistro foi alterado para: ${newStatus}`,
      });
      
      refetch(); // Recarregar os dados para refletir a mudança
      
    } catch (error) {
      console.error('Error updating claim status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do sinistro.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-insurance-primary">
                Painel da Seguradora
              </h1>
              <p className="text-gray-600">
                Gerencie sinistros e atendimentos aos clientes
              </p>
            </div>
            <div className="flex space-x-2 mt-4 md:mt-0">
              <Button 
                variant="outline" 
                className="border-red-500 text-red-500 hover:bg-red-500/5"
                onClick={() => auth.signOut()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="claims">Sinistros</TabsTrigger>
              <TabsTrigger value="clients">Clientes</TabsTrigger>
            </TabsList>

            <TabsContent value="claims" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileCheck className="w-5 h-5 mr-2 text-insurance-secondary" />
                    Gerenciamento de Sinistros
                  </CardTitle>
                </CardHeader>
                <CardContent>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Buscar por ID, descrição ou cliente..."
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
                <TabsTrigger value="rejected">Negados</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClaims.length > 0 ? (
                      filteredClaims.map(claim => (
                        <TableRow key={claim.id}>
                          <TableCell className="font-medium">{claim.id}</TableCell>
                          <TableCell>{claim.client_name}</TableCell>
                          <TableCell className="max-w-xs truncate">{claim.title}</TableCell>
                          <TableCell>{new Date(claim.created_at).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell>{getStatusBadge(claim.status)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-2 text-gray-600 border-gray-200 hover:bg-gray-50"
                                asChild
                              >
                                <Link to={`/insurer/claim/${claim.id}`}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  Detalhes
                                </Link>
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                                onClick={() => updateClaimStatus(claim.id, 'in_progress')}
                              >
                                <Clock className="h-4 w-4 mr-1" />
                                Analisar
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-2 text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => updateClaimStatus(claim.id, 'completed')}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Aprovar
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => updateClaimStatus(claim.id, 'rejected')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Negar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <AlertCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                          <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum sinistro encontrado</h3>
                          <p className="text-gray-500 mb-4">Não encontramos sinistros correspondentes à sua busca.</p>
                          <Button onClick={() => setSearchTerm('')} variant="outline">
                            Limpar filtros
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="pending" className="mt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClaims.filter(claim => claim.status === 'pending').length > 0 ? (
                      filteredClaims
                        .filter(claim => claim.status === 'pending')
                        .map(claim => (
                          <TableRow key={claim.id}>
                            <TableCell className="font-medium">{claim.id}</TableCell>
                            <TableCell>{claim.client_name}</TableCell>
                            <TableCell className="max-w-xs truncate">{claim.title}</TableCell>
                            <TableCell>{new Date(claim.created_at).toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell>{getStatusBadge(claim.status)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 px-2 text-gray-600 border-gray-200 hover:bg-gray-50"
                                  asChild
                                >
                                  <Link to={`/insurer/claim/${claim.id}`}>
                                    <Eye className="h-4 w-4 mr-1" />
                                    Detalhes
                                  </Link>
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 px-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                                  onClick={() => updateClaimStatus(claim.id, 'in_progress')}
                                >
                                  <Clock className="h-4 w-4 mr-1" />
                                  Analisar
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 px-2 text-green-600 border-green-200 hover:bg-green-50"
                                  onClick={() => updateClaimStatus(claim.id, 'completed')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Aprovar
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() => updateClaimStatus(claim.id, 'rejected')}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Negar
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <AlertCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                          <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum sinistro pendente</h3>
                          <p className="text-gray-500">Não há sinistros pendentes no momento.</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

                </Tabs>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Análise de Sinistros por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" name="Quantidade" fill="#3B82F6">
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name) => [`${value} sinistros`, name]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clients" className="space-y-4">
              <InsurerClientManager />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InsurerDashboard;