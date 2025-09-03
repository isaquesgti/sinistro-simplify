import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/components/AccessControl';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Users, Building, CheckCircle, XCircle, Clock, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import NewInsurerDialog from '@/components/NewInsurerDialog';

interface Insurer {
  id: string;
  company_name: string;
  cnpj: string;
  phone?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profile_id?: string;
}

interface DashboardStats {
  totalInsurers: number;
  pendingInsurers: number;
  approvedInsurers: number;
  totalClients: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState('insurers');
  const [insurers, setInsurers] = useState<Insurer[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalInsurers: 0,
    pendingInsurers: 0,
    approvedInsurers: 0,
    totalClients: 0
  });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      // Load insurers
      const { data: insurersData, error: insurersError } = await supabase
        .from('insurers')
        .select('*')
        .order('created_at', { ascending: false });

      if (insurersError) throw insurersError;

      const insurersList = insurersData || [];
      setInsurers(insurersList);

      // Calculate stats
      const newStats = {
        totalInsurers: insurersList.length,
        pendingInsurers: insurersList.filter(i => i.status === 'pending').length,
        approvedInsurers: insurersList.filter(i => i.status === 'approved').length,
        totalClients: 0 // Will be calculated from profiles table
      };

      // Count clients (profiles with insurer_id)
      const { count: clientsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .not('insurer_id', 'is', null);

      newStats.totalClients = clientsCount || 0;
      setStats(newStats);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do dashboard.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInsurerAction = async (insurerId: string, action: 'approve' | 'reject') => {
    try {
      const { error } = await supabase
        .from('insurers')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          approved_by: auth.user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', insurerId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Seguradora ${action === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso.`
      });

      loadData(); // Reload data
    } catch (error) {
      console.error('Error updating insurer:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da seguradora.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Aprovada</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejeitada</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
    }
  };

  const handleLogout = async () => {
    await auth.logout();
    navigate('/');
  };

  useEffect(() => {
    if (auth.role !== 'admin') {
      navigate('/login');
      return;
    }
    loadData();
  }, [auth.role, navigate]);

  if (loading) {
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Seguradoras</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInsurers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingInsurers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approvedInsurers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="insurers">Seguradoras</TabsTrigger>
            </TabsList>
            <NewInsurerDialog onSuccess={loadData} />
          </div>

          <TabsContent value="insurers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Seguradoras</CardTitle>
                <CardDescription>
                  Aprove ou rejeite cadastros de seguradoras
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {insurers.map((insurer) => (
                      <TableRow key={insurer.id}>
                        <TableCell className="font-medium">{insurer.company_name}</TableCell>
                        <TableCell>{insurer.cnpj}</TableCell>
                        <TableCell>{insurer.phone || '-'}</TableCell>
                        <TableCell>{getStatusBadge(insurer.status)}</TableCell>
                        <TableCell>{new Date(insurer.created_at).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>
                          {insurer.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleInsurerAction(insurer.id, 'approve')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleInsurerAction(insurer.id, 'reject')}
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Rejeitar
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;