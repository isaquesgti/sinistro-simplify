
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Paperclip, 
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ClaimMessagesDialog } from '@/components/ClaimMessagesDialog';

type ClaimStatus = 'pending' | 'in_progress' | 'completed' | 'rejected';

interface Claim {
  id: string;
  title: string;
  date: string;
  status: ClaimStatus;
  description: string;
  unreadMessages?: number;
  documents?: {
    id: string;
    name: string;
    date: string;
    type: string;
  }[];
  updates?: {
    id: string;
    date: string;
    description: string;
    status?: ClaimStatus;
  }[];
}

const getStatusDetails = (status: ClaimStatus) => {
  switch (status) {
    case 'pending':
      return {
        text: 'Pendente',
        icon: Clock,
        colorClass: 'bg-yellow-100 text-yellow-700',
        badgeClass: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
      };
    case 'in_progress':
      return {
        text: 'Em análise',
        icon: Clock,
        colorClass: 'bg-blue-100 text-blue-700',
        badgeClass: 'bg-blue-100 text-blue-700 hover:bg-blue-100'
      };
    case 'completed':
      return {
        text: 'Concluído',
        icon: CheckCircle2,
        colorClass: 'bg-green-100 text-green-700',
        badgeClass: 'bg-green-100 text-green-700 hover:bg-green-100'
      };
    case 'rejected':
      return {
        text: 'Negado',
        icon: AlertCircle,
        colorClass: 'bg-red-100 text-red-700',
        badgeClass: 'bg-red-100 text-red-700 hover:bg-red-100'
      };
    default:
      return {
        text: 'Desconhecido',
        icon: Clock,
        colorClass: 'bg-gray-100 text-gray-700',
        badgeClass: 'bg-gray-100 text-gray-700 hover:bg-gray-100'
      };
  }
};

// Dados de exemplo para o sinistro
const mockClaimDetails: Record<string, Claim> = {
  "SIN-2023-0001": {
    id: "SIN-2023-0001",
    title: "Sinistro Automóvel - Colisão",
    date: "15/05/2023",
    status: "in_progress",
    description: "Colisão traseira na Av. Paulista, envolvendo dois veículos. Danos moderados no para-choque e porta traseira. O acidente ocorreu às 18:45 quando o veículo da frente freou bruscamente devido a um pedestre que atravessava fora da faixa.",
    unreadMessages: 2,
    documents: [
      { id: "DOC-001", name: "Boletim de Ocorrência", date: "15/05/2023", type: "PDF" },
      { id: "DOC-002", name: "Fotos do Veículo", date: "15/05/2023", type: "ZIP" },
      { id: "DOC-003", name: "Orçamento da Oficina", date: "17/05/2023", type: "PDF" }
    ],
    updates: [
      { id: "UPD-001", date: "15/05/2023 14:30", description: "Sinistro reportado", status: "pending" },
      { id: "UPD-002", date: "16/05/2023 09:15", description: "Documentos analisados pela seguradora", status: "in_progress" },
      { id: "UPD-003", date: "17/05/2023 11:45", description: "Vistoria agendada para 19/05/2023" }
    ]
  },
  "SIN-2023-0002": {
    id: "SIN-2023-0002",
    title: "Sinistro Residencial - Alagamento",
    date: "03/06/2023",
    status: "completed",
    description: "Alagamento no apartamento devido a um vazamento no encanamento do vizinho de cima. Danos em móveis e no piso. O incidente ocorreu durante a madrugada enquanto os moradores dormiam, causando danos significativos na sala de estar e cozinha.",
    unreadMessages: 0,
    documents: [
      { id: "DOC-101", name: "Laudo do Encanador", date: "04/06/2023", type: "PDF" },
      { id: "DOC-102", name: "Fotos dos Danos", date: "03/06/2023", type: "ZIP" },
      { id: "DOC-103", name: "Nota Fiscal dos Móveis", date: "05/06/2023", type: "PDF" }
    ],
    updates: [
      { id: "UPD-101", date: "03/06/2023 08:20", description: "Sinistro reportado", status: "pending" },
      { id: "UPD-102", date: "04/06/2023 15:30", description: "Vistoria realizada", status: "in_progress" },
      { id: "UPD-103", date: "10/06/2023 14:15", description: "Indenização aprovada", status: "completed" },
      { id: "UPD-104", date: "15/06/2023 09:00", description: "Pagamento realizado", status: "completed" }
    ]
  },
  "SIN-2023-0003": {
    id: "SIN-2023-0003",
    title: "Sinistro Saúde - Cirurgia",
    date: "22/07/2023",
    status: "pending",
    description: "Solicitação de reembolso para cirurgia de emergência realizada no Hospital São Luiz. A cirurgia foi necessária após o segurado apresentar sintomas agudos de apendicite durante uma viagem de negócios.",
    unreadMessages: 5,
    documents: [
      { id: "DOC-201", name: "Relatório Médico", date: "22/07/2023", type: "PDF" },
      { id: "DOC-202", name: "Nota Fiscal Hospital", date: "22/07/2023", type: "PDF" },
      { id: "DOC-203", name: "Pedido Médico", date: "21/07/2023", type: "PDF" }
    ],
    updates: [
      { id: "UPD-201", date: "22/07/2023 18:45", description: "Sinistro reportado", status: "pending" },
      { id: "UPD-202", date: "23/07/2023 10:30", description: "Documentação sendo analisada" }
    ]
  },
  "SIN-2023-0004": {
    id: "SIN-2023-0004",
    title: "Sinistro Automóvel - Furto",
    date: "10/08/2023",
    status: "rejected",
    description: "Furto de veículo no estacionamento do Shopping Morumbi. O veículo não foi recuperado. O furto ocorreu por volta das 20:30, quando o proprietário retornou das compras e não encontrou o veículo no local onde havia estacionado.",
    unreadMessages: 1,
    documents: [
      { id: "DOC-301", name: "Boletim de Ocorrência", date: "10/08/2023", type: "PDF" },
      { id: "DOC-302", name: "Documento do Veículo", date: "11/08/2023", type: "PDF" }
    ],
    updates: [
      { id: "UPD-301", date: "10/08/2023 22:15", description: "Sinistro reportado", status: "pending" },
      { id: "UPD-302", date: "12/08/2023 14:30", description: "Investigação iniciada", status: "in_progress" },
      { id: "UPD-303", date: "18/08/2023 09:45", description: "Sinistro negado - Uso indevido do veículo", status: "rejected" }
    ]
  }
};

const ClaimDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [messagesOpen, setMessagesOpen] = React.useState(false);
  
  // Extrair o ID do sinistro da URL
  const claimId = location.pathname.split('/claim/')[1];
  
  // Buscar detalhes do sinistro pelo ID
  const claim = mockClaimDetails[claimId];
  
  if (!claim) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-gray-50 flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-insurance-primary mb-4">Sinistro não encontrado</h1>
            <p className="text-gray-600 mb-6">O sinistro que você está procurando não existe ou foi removido.</p>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="bg-insurance-primary hover:bg-insurance-dark"
            >
              Voltar para o Dashboard
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const statusDetails = getStatusDetails(claim.status);
  const StatusIcon = statusDetails.icon;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o Dashboard
            </Button>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl font-bold text-insurance-primary">
                  {claim.title}
                </h1>
                <p className="text-gray-600">
                  ID: {claim.id} • Aberto em: {claim.date}
                </p>
              </div>
              <Badge className={statusDetails.badgeClass + " flex items-center mt-2 md:mt-0 px-3 py-1.5"}>
                <StatusIcon className="w-4 h-4 mr-1.5" />
                {statusDetails.text}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-insurance-primary flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-insurance-secondary" />
                    Detalhes do Sinistro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Descrição</h3>
                      <p className="text-gray-600">{claim.description}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Documentos</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead className="text-right">Ação</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {claim.documents?.map(doc => (
                            <TableRow key={doc.id}>
                              <TableCell className="font-medium">{doc.name}</TableCell>
                              <TableCell>{doc.date}</TableCell>
                              <TableCell>{doc.type}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm">
                                  <Paperclip className="w-4 h-4 mr-2" />
                                  Baixar
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-xl text-insurance-primary flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-insurance-secondary" />
                    Histórico de Atualizações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    <div className="space-y-4">
                      {claim.updates?.map(update => {
                        const updateStatus = update.status ? getStatusDetails(update.status) : null;
                        return (
                          <div key={update.id} className="relative pl-8">
                            <div className="absolute left-0 top-2 w-6 h-6 rounded-full bg-insurance-primary flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border">
                              <p className="text-sm text-gray-500 mb-1">{update.date}</p>
                              <p className="text-gray-700">{update.description}</p>
                              {updateStatus && (
                                <Badge className={updateStatus.badgeClass + " mt-2"}>
                                  {updateStatus.text}
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-insurance-primary flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-insurance-secondary" />
                    Comunicação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Comunique-se diretamente com o analista responsável pelo seu sinistro.
                    </p>
                    
                    <Button 
                      className="w-full bg-insurance-secondary hover:bg-insurance-accent flex items-center justify-center"
                      onClick={() => setMessagesOpen(true)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Ver Mensagens
                      {claim.unreadMessages ? (
                        <span className="ml-2 bg-white text-insurance-secondary rounded-full px-1.5 py-0.5 text-xs font-bold">
                          {claim.unreadMessages}
                        </span>
                      ) : null}
                    </Button>
                    
                    <div className="pt-4 border-t">
                      <h3 className="font-medium text-gray-700 mb-2">Contatos</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium">Analista Responsável</p>
                          <p className="text-gray-600">Maria Silva</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">E-mail</p>
                          <p className="text-gray-600">suporte@seguros.com</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Telefone</p>
                          <p className="text-gray-600">(11) 3456-7890</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      <ClaimMessagesDialog 
        open={messagesOpen} 
        onOpenChange={setMessagesOpen}
        claim={claim}
      />
    </div>
  );
};

export default ClaimDetails;
