
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, User, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  read: boolean;
}

interface Claim {
  id: string;
  title: string;
  unreadMessages?: number;
  [key: string]: any;
}

interface ClaimMessagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claim: Claim;
}

// Dados de exemplo para as mensagens
const mockMessages: Record<string, Message[]> = {
  "SIN-2023-0001": [
    {
      id: "MSG-001",
      sender: "agent",
      text: "Olá! Recebemos seu reporte de sinistro. Precisamos que você envie mais fotos do veículo para análise.",
      timestamp: "16/05/2023 10:30",
      read: true
    },
    {
      id: "MSG-002",
      sender: "user",
      text: "Bom dia! Acabei de enviar as fotos adicionais que vocês solicitaram. Tem mais alguma coisa que precisam?",
      timestamp: "16/05/2023 14:15",
      read: true
    },
    {
      id: "MSG-003",
      sender: "agent",
      text: "Agradecemos o envio das fotos. A vistoria foi agendada para o dia 19/05. Um perito entrará em contato para confirmar o horário.",
      timestamp: "17/05/2023 09:45",
      read: false
    },
    {
      id: "MSG-004",
      sender: "agent",
      text: "Atenção: O perito chegará entre 13h e 15h. Por favor, mantenha o veículo disponível para inspeção durante esse período.",
      timestamp: "18/05/2023 11:20",
      read: false
    }
  ],
  "SIN-2023-0002": [
    {
      id: "MSG-101",
      sender: "agent",
      text: "Recebemos seu reporte de sinistro residencial. Um vistoriador irá até seu endereço amanhã entre 9h e 12h.",
      timestamp: "03/06/2023 15:40",
      read: true
    },
    {
      id: "MSG-102",
      sender: "user",
      text: "Obrigado pela agilidade. Estarei em casa aguardando.",
      timestamp: "03/06/2023 16:05",
      read: true
    },
    {
      id: "MSG-103",
      sender: "agent",
      text: "A vistoria foi concluída. Estamos analisando o relatório e em breve informaremos o valor da indenização.",
      timestamp: "04/06/2023 18:30",
      read: true
    },
    {
      id: "MSG-104",
      sender: "agent",
      text: "Sua indenização foi aprovada! O pagamento será processado em até 5 dias úteis.",
      timestamp: "10/06/2023 14:20",
      read: true
    }
  ],
  "SIN-2023-0003": [
    {
      id: "MSG-201",
      sender: "agent",
      text: "Recebemos sua solicitação de reembolso. Precisamos do relatório médico detalhado com o CID da cirurgia.",
      timestamp: "23/07/2023 09:15",
      read: false
    },
    {
      id: "MSG-202",
      sender: "user",
      text: "Vou solicitar ao hospital. Existe um prazo máximo para envio?",
      timestamp: "23/07/2023 10:40",
      read: true
    },
    {
      id: "MSG-203",
      sender: "agent",
      text: "Sim, você tem até 30 dias após o procedimento para enviar toda a documentação.",
      timestamp: "23/07/2023 11:25",
      read: false
    },
    {
      id: "MSG-204",
      sender: "agent",
      text: "Também precisamos dos recibos originais de todas as despesas médicas para processamento completo.",
      timestamp: "23/07/2023 11:28",
      read: false
    },
    {
      id: "MSG-205",
      sender: "agent",
      text: "Por favor, verifique se o relatório médico está assinado e carimbado pelo médico responsável.",
      timestamp: "24/07/2023 15:10",
      read: false
    },
    {
      id: "MSG-206",
      sender: "agent",
      text: "Gostaríamos de confirmar se você já conseguiu a documentação solicitada.",
      timestamp: "26/07/2023 10:05",
      read: false
    }
  ],
  "SIN-2023-0004": [
    {
      id: "MSG-301",
      sender: "agent",
      text: "Recebemos seu relato sobre o furto do veículo. Precisamos do Boletim de Ocorrência e do documento do veículo.",
      timestamp: "11/08/2023 09:30",
      read: true
    },
    {
      id: "MSG-302",
      sender: "user",
      text: "Já anexei o BO na plataforma. O documento do veículo enviarei hoje à tarde.",
      timestamp: "11/08/2023 11:45",
      read: true
    },
    {
      id: "MSG-303",
      sender: "agent",
      text: "Documentação recebida. Nossa equipe de investigação está analisando o caso.",
      timestamp: "12/08/2023 14:35",
      read: true
    },
    {
      id: "MSG-304",
      sender: "agent",
      text: "Lamentamos informar que seu sinistro foi negado. Nossa investigação concluiu que houve uso indevido do veículo, o que viola a cláusula 12.3 do seu contrato de seguro.",
      timestamp: "18/08/2023 09:45",
      read: false
    }
  ]
};

export const ClaimMessagesDialog = ({ open, onOpenChange, claim }: ClaimMessagesDialogProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(mockMessages[claim.id] || []);
  
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const newMsg: Message = {
      id: `MSG-NEW-${Date.now()}`,
      sender: 'user',
      text: newMessage,
      timestamp: new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      read: true
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };
  
  // Marcar todas as mensagens como lidas ao abrir o diálogo
  React.useEffect(() => {
    if (open && messages.some(msg => !msg.read)) {
      setMessages(messages.map(msg => ({ ...msg, read: true })));
    }
  }, [open]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-insurance-primary flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-insurance-secondary" />
            Mensagens - {claim.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto my-4 max-h-[400px] pr-1">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Nenhuma mensagem ainda</p>
              </div>
            ) : (
              messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-lg p-3 ${
                      message.sender === 'user' 
                        ? 'bg-insurance-primary text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      {message.sender === 'user' ? (
                        <User className="w-4 h-4 mr-1.5" />
                      ) : (
                        <MessageSquare className="w-4 h-4 mr-1.5" />
                      )}
                      <span className="text-xs font-medium">
                        {message.sender === 'user' ? 'Você' : 'Analista'}
                      </span>
                    </div>
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <DialogFooter className="flex-shrink-0">
          <div className="flex w-full items-center space-x-2">
            <Input
              placeholder="Digite sua mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1"
            />
            <Button 
              type="submit" 
              onClick={handleSendMessage}
              className="bg-insurance-secondary hover:bg-insurance-accent"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
