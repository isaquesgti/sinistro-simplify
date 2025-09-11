import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Building, 
  Search, 
  CheckCircle, 
  XCircle, 
  Users, 
  UserCheck, 
  UserX,
  Mail,
  Phone,
  Settings
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AdminInsurerForm from './AdminInsurerForm';

interface Insurer {
  id: string;
  company_name: string;
  cnpj: string;
  email: string;
  phone?: string;
  plan: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  active_clients: number;
  inactive_clients: number;
  total_clients: number;
}

const AdminInsurerManager = () => {
  const [insurers, setInsurers] = useState<Insurer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadInsurers = async () => {
    try {
      // Buscar seguradoras
      const { data: insurersData, error: insurersError } = await supabase
        .from('insurers')
        .select('*')
        .order('created_at', { ascending: false });

      if (insurersError) throw insurersError;

      // Para cada seguradora, buscar estatísticas de clientes
      const insurersWithStats = await Promise.all(
        (insurersData || []).map(async (insurer) => {
          const { count: activeClients } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('insurer_id', insurer.id)
            .eq('role', 'client')
            .eq('status', 'active');

          const { count: inactiveClients } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('insurer_id', insurer.id)
            .eq('role', 'client')
            .eq('status', 'inactive');

          return {
            ...insurer,
            active_clients: activeClients || 0,
            inactive_clients: inactiveClients || 0,
            total_clients: (activeClients || 0) + (inactiveClients || 0)
          };
        })
      );

      setInsurers(insurersWithStats);
    } catch (error) {
      console.error('Error loading insurers:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar seguradoras.",
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
          approved_at: new Date().toISOString()
        })
        .eq('id', insurerId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Seguradora ${action === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso.`
      });

      loadInsurers();
    } catch (error) {
      console.error('Error updating insurer:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da seguradora.",
        variant: "destructive"
      });
    }
  };

  const toggleInsurerStatus = async (insurerId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'approved' ? 'rejected' : 'approved';
      
      const { error } = await supabase
        .from('insurers')
        .update({ 
          status: newStatus,
          approved_at: new Date().toISOString()
        })
        .eq('id', insurerId);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: `Seguradora ${newStatus === 'approved' ? 'ativada' : 'desativada'} com sucesso.`,
      });

      loadInsurers();
    } catch (error) {
      console.error('Error updating insurer status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da seguradora.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadInsurers();
  }, []);

  const filteredInsurers = insurers.filter(insurer =>
    insurer.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    insurer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    insurer.cnpj.includes(searchTerm)
  );

  const totalInsurers = insurers.length;
  const approvedInsurers = insurers.filter(i => i.status === 'approved').length;
  const pendingInsurers = insurers.filter(i => i.status === 'pending').length;
  const totalClients = insurers.reduce((sum, insurer) => sum + insurer.total_clients, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Aprovada</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejeitada</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    const planColors = {
      basic: 'bg-blue-100 text-blue-800',
      standard: 'bg-green-100 text-green-800',
      premium: 'bg-purple-100 text-purple-800'
    };
    
    const planNames = {
      basic: 'Básico',
      standard: 'Padrão',
      premium: 'Premium'
    };

    return (
      <Badge variant="secondary" className={planColors[plan as keyof typeof planColors]}>
        {planNames[plan as keyof typeof planNames]}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando seguradoras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Seguradoras</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInsurers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedInsurers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <XCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingInsurers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
          </CardContent>
        </Card>
      </div>

      {/* Insurer Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gerenciar Seguradoras</CardTitle>
              <CardDescription>
                Cadastre, ative/desative e monitore seguradoras
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Building className="w-4 h-4 mr-2" />
                  Nova Seguradora
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Cadastrar Nova Seguradora</DialogTitle>
                  <DialogDescription>
                    Preencha os dados da seguradora para criar uma nova conta.
                  </DialogDescription>
                </DialogHeader>
                <AdminInsurerForm onSuccess={() => {
                  setIsDialogOpen(false);
                  loadInsurers();
                }} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar seguradoras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Clientes Ativos</TableHead>
                <TableHead>Clientes Inativos</TableHead>
                <TableHead>Total Clientes</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInsurers.map((insurer) => (
                <TableRow key={insurer.id}>
                  <TableCell className="font-medium">{insurer.company_name}</TableCell>
                  <TableCell>{insurer.cnpj}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                      {insurer.email}
                    </div>
                  </TableCell>
                  <TableCell>{getPlanBadge(insurer.plan)}</TableCell>
                  <TableCell>{getStatusBadge(insurer.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center text-green-600">
                      <UserCheck className="w-4 h-4 mr-1" />
                      {insurer.active_clients}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-red-600">
                      <UserX className="w-4 h-4 mr-1" />
                      {insurer.inactive_clients}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {insurer.total_clients}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(insurer.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {insurer.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleInsurerAction(insurer.id, 'approve')}
                            className="text-green-600 hover:bg-green-50"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleInsurerAction(insurer.id, 'reject')}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rejeitar
                          </Button>
                        </>
                      )}
                      {insurer.status === 'approved' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleInsurerStatus(insurer.id, insurer.status)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Desativar
                        </Button>
                      )}
                      {insurer.status === 'rejected' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleInsurerStatus(insurer.id, insurer.status)}
                          className="text-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Ativar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredInsurers.length === 0 && (
            <div className="text-center py-8">
              <Building className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhuma seguradora encontrada</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Nenhuma seguradora corresponde à sua busca.' : 'Você ainda não possui seguradoras cadastradas.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInsurerManager;
