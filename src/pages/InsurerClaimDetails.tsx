
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileText, Image, MessageSquare, Clock, CheckCircle, XCircle, Upload } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AccessControl';

// Mock data for a single claim
const getMockClaimDetails = (id: string) => {
  return {
    id,
    title: "Sinistro Automóvel - Colisão",
    date: "15/05/2023",
    clientName: "João Silva",
    status: "in_progress" as const,
    description: "Colisão traseira na Av. Paulista, envolvendo dois veículos. Danos moderados no para-choque e porta traseira.",
    policyNumber: "AP-2023-78945",
    vehicle: {
      make: "Toyota",
      model: "Corolla",
      year: "2021",
      plate: "ABC-1234"
    },
    location: "Av. Paulista, 1000, São Paulo, SP",
    contactDetails: {
      phone: "(11) 99999-8888",
      email: "joao.silva@exemplo.com"
    },
    images: [
      { id: "img1", name: "Foto Frontal", url: "https://images.unsplash.com/photo-1583267746897-2cf415887172?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" },
      { id: "img2", name: "Foto Lateral", url: "https://images.unsplash.com/photo-1572811467907-1c69b08f7c9d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" },
      { id: "img3", name: "Foto Traseira", url: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" }
    ],
    documents: [
      { id: "doc1", name: "Boletim de Ocorrência", type: "PDF", url: "#" },
      { id: "doc2", name: "Nota Fiscal do Conserto", type: "PDF", url: "#" },
      { id: "doc3", name: "Orçamento da Oficina", type: "DOCX", url: "#" }
    ],
    messages: [
      { id: "msg1", date: "16/05/2023", sender: "João Silva", content: "Bom dia, gostaria de saber quando poderei levar meu carro para a oficina." },
      { id: "msg2", date: "16/05/2023", sender: "Seguradora", content: "Olá João, seu sinistro está em análise. Em breve entraremos em contato para autorizar o reparo." },
      { id: "msg3", date: "18/05/2023", sender: "João Silva", content: "Ok, aguardo retorno. Obrigado!" }
    ]
  };
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

const InsurerClaimDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const claim = getMockClaimDetails(id || '');
  const auth = useAuth();

  const handleBack = () => {
    navigate('/insurer');
  };

  const updateClaimStatus = (newStatus: 'pending' | 'in_progress' | 'completed' | 'rejected') => {
    // In a real application, you would call an API to update the status
    
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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    toast({
      title: "Mensagem enviada",
      description: "Sua mensagem foi enviada com sucesso"
    });
    
    setNewMessage('');
  };

  if (!claim) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Sinistro não encontrado</CardTitle>
              <CardDescription>
                O sinistro que você está procurando não existe ou não está disponível.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={handleBack}>Voltar para a lista</Button>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={handleBack} 
              className="mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-insurance-primary">
              Detalhes do Sinistro {claim.id}
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Claim summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    Resumo
                    {getStatusBadge(claim.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-500">Título</h3>
                    <p>{claim.title}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-500">Cliente</h3>
                    <p>{claim.clientName}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-500">Data</h3>
                    <p>{claim.date}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-500">Apólice</h3>
                    <p>{claim.policyNumber}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-500">Descrição</h3>
                    <p className="text-sm">{claim.description}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 px-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={() => updateClaimStatus('in_progress')}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Analisar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 px-2 text-green-600 border-green-200 hover:bg-green-50"
                    onClick={() => updateClaimStatus('completed')}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Aprovar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => updateClaimStatus('rejected')}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Negar
                  </Button>
                </CardFooter>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Detalhes do Veículo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-500">Marca/Modelo</h3>
                    <p>{claim.vehicle.make} {claim.vehicle.model}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-500">Ano</h3>
                    <p>{claim.vehicle.year}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-500">Placa</h3>
                    <p>{claim.vehicle.plate}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-500">Local da Ocorrência</h3>
                    <p className="text-sm">{claim.location}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-500">Telefone</h3>
                    <p>{claim.contactDetails.phone}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-500">Email</h3>
                    <p>{claim.contactDetails.email}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column - Tabs with details */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Tabs defaultValue="images">
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="images" className="flex items-center">
                        <Image className="h-4 w-4 mr-2" />
                        Fotos
                      </TabsTrigger>
                      <TabsTrigger value="documents" className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Documentos
                      </TabsTrigger>
                      <TabsTrigger value="messages" className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Mensagens
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="images" className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {claim.images.map((image) => (
                          <div key={image.id} className="rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={image.url}
                              alt={image.name}
                              className="w-full h-48 object-cover"
                            />
                            <div className="p-2 bg-white">
                              <p className="text-sm font-medium">{image.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="documents" className="p-4">
                      <div className="space-y-4">
                        {claim.documents.map((doc) => (
                          <div 
                            key={doc.id} 
                            className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <FileText className="h-8 w-8 text-blue-500 mr-3" />
                            <div className="flex-grow">
                              <h3 className="font-medium">{doc.name}</h3>
                              <p className="text-sm text-gray-500">{doc.type}</p>
                            </div>
                            <Button variant="outline" size="sm">
                              <Upload className="h-4 w-4 mr-1" />
                              Baixar
                            </Button>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="messages" className="p-4">
                      <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                        {claim.messages.map((message) => (
                          <div 
                            key={message.id} 
                            className={`p-3 rounded-lg ${
                              message.sender === 'Seguradora' 
                                ? 'bg-blue-50 ml-8' 
                                : 'bg-gray-100 mr-8'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <p className="font-medium text-sm">{message.sender}</p>
                              <p className="text-xs text-gray-500">{message.date}</p>
                            </div>
                            <p className="text-sm">{message.content}</p>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Digite sua mensagem..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Button type="submit">Enviar</Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InsurerClaimDetails;
