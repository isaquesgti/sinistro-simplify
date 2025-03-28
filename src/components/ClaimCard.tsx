
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, FileCheck, X, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClaimMessagesDialog } from './ClaimMessagesDialog';

type ClaimStatus = 'pending' | 'in_progress' | 'completed' | 'rejected';

interface ClaimCardProps {
  id: string;
  title: string;
  date: string;
  status: ClaimStatus;
  description: string;
  unreadMessages?: number;
}

const ClaimCard = ({ id, title, date, status, description, unreadMessages = 0 }: ClaimCardProps) => {
  const navigate = useNavigate();
  const [messagesOpen, setMessagesOpen] = useState(false);
  
  const getStatusDetails = (status: ClaimStatus) => {
    switch (status) {
      case 'pending':
        return {
          text: 'Pendente',
          icon: Clock,
          colorClass: 'bg-yellow-100 text-yellow-700',
          iconClass: 'text-yellow-500'
        };
      case 'in_progress':
        return {
          text: 'Em análise',
          icon: Clock,
          colorClass: 'bg-blue-100 text-blue-700',
          iconClass: 'text-blue-500'
        };
      case 'completed':
        return {
          text: 'Concluído',
          icon: FileCheck,
          colorClass: 'bg-green-100 text-green-700',
          iconClass: 'text-green-500'
        };
      case 'rejected':
        return {
          text: 'Negado',
          icon: X,
          colorClass: 'bg-red-100 text-red-700',
          iconClass: 'text-red-500'
        };
      default:
        return {
          text: 'Desconhecido',
          icon: Clock,
          colorClass: 'bg-gray-100 text-gray-700',
          iconClass: 'text-gray-500'
        };
    }
  };

  const statusDetails = getStatusDetails(status);
  const StatusIcon = statusDetails.icon;

  const handleViewDetails = () => {
    navigate(`/claim/${id}`);
  };

  const handleViewMessages = () => {
    setMessagesOpen(true);
  };

  // Mock claim object for the messages dialog
  const claimForDialog = {
    id,
    title,
    unreadMessages
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-insurance-primary">{title}</CardTitle>
              <CardDescription>ID: {id} • Aberto em: {date}</CardDescription>
            </div>
            <div className={`${statusDetails.colorClass} px-3 py-1 rounded-full text-xs font-medium flex items-center`}>
              <StatusIcon className={`w-4 h-4 ${statusDetails.iconClass} mr-1`} />
              {statusDetails.text}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 line-clamp-2">{description}</p>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <Button 
            variant="outline" 
            className="text-insurance-primary hover:text-insurance-secondary border-insurance-primary hover:bg-insurance-primary/5"
            onClick={handleViewDetails}
          >
            Ver detalhes
          </Button>
          <Button 
            className="bg-insurance-secondary hover:bg-insurance-accent text-white flex items-center"
            onClick={handleViewMessages}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Mensagens
            {unreadMessages > 0 && (
              <span className="ml-2 bg-white text-insurance-secondary rounded-full px-1.5 py-0.5 text-xs font-bold">
                {unreadMessages}
              </span>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <ClaimMessagesDialog 
        open={messagesOpen}
        onOpenChange={setMessagesOpen}
        claim={claimForDialog}
      />
    </>
  );
};

export default ClaimCard;
