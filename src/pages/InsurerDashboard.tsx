
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
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth, type UserRole } from '@/components/AccessControl';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
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

// Mock data
const mockClaims = [
  {
    id: "SIN-2023-0001",
    title: "Sinistro Automóvel - Colisão",
    date: "15/05/2023",
    clientName: "João Silva",
    status: "in_progress" as const,
    description: "Colisão traseira na Av. Paulista, envolvendo dois veículos. Danos moderados no para-choque e porta traseira."
  },
  {
    id: "SIN-2023-0002",
    title: "Sinistro Residencial - Alagamento",
    date: "03/06/2023",
    clientName: "Maria Oliveira",
    status: "completed" as const,
    description: "Alagamento no apartamento devido a um vazamento no encanamento do vizinho de cima. Danos em móveis e no piso."
  },
  {
    id: "SIN-2023-0003",
    title: "Sinistro Saúde - Cirurgia",
    date: "22/07/2023",
    clientName: "Carlos Mendes",
    status: "pending" as const,
    description: "Solicitação de reembolso para cirurgia de emergência realizada no Hospital São Luiz."
  },
  {
    id: "SIN-2023-0004",
    title: "Sinistro Automóvel - Furto",
    date: "10/08/2023",
    clientName: "Ana Pereira",
    status: "rejected" as const,
    description: "Furto de veículo no estacionamento do Shopping Morumbi. O veículo não foi recuperado."
  }
];

// Generate chart data
const generateChartData = (claims) => {
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
  const [claims, setClaims] = useState(mockClaims);
  const { toast } = useToast();
  const auth = useAuth();
  
  const filteredClaims = claims.filter(claim => 
    claim.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    claim.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    claim.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = generateChartData(claims);

  const updateClaimStatus = (id: string, newStatus: 'pending' | 'in_progress' | 'completed' | 'rejected') => {
    setClaims(prevClaims => 
      prevClaims.map(claim => 
        claim.id === id ? { ...claim, status: newStatus } : claim
      )
    );
    
    // Status message mapping
    const statusMessages = {
      pending: 'O sinistro foi marcado como pendente',
      in_progress: 'O sinistro está em análise',
      completed: 'O sinistro foi aprovado e concluído',
      rejected: 'O sinistro foi negado'
    };
    
    toast({
      title: "Status atualizado",
      description: statusMessages[newStatus],
    });
  };

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
                className="border-insurance-primary text-insurance-primary hover:bg-insurance-primary/5"
                onClick={() => auth.login('client' as UserRole)}
              >
                <User className="w-4 h-4 mr-2" />
                Ver como Cliente
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
                Gerenciamento de Sinistros
              </h2>
              <div className="mt-4 md:mt-0 flex items-center">
                <Badge className="mr-4 bg-gray-200 text-gray-800 hover:bg-gray-300">
                  <UserCog className="w-4 h-4 mr-1" />
                  Analista de Sinistros
                </Badge>
              </div>
            </div>
            
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
                          <TableCell>{claim.clientName}</TableCell>
                          <TableCell className="max-w-xs truncate">{claim.title}</TableCell>
                          <TableCell>{claim.date}</TableCell>
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
              
              {/* Similar content for other tabs, filter by status */}
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
                            <TableCell>{claim.clientName}</TableCell>
                            <TableCell className="max-w-xs truncate">{claim.title}</TableCell>
                            <TableCell>{claim.date}</TableCell>
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

              {/* Similar content for the other tabs (in_progress, completed, rejected) */}
            </Tabs>
          </div>

          {/* Chart Section */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-insurance-primary mb-6">
              Análise de Sinistros por Status
            </h2>
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
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InsurerDashboard;
