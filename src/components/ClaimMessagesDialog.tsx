
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, User, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/AccessControl';

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

// Mensagens serão carregadas do Supabase

export const ClaimMessagesDialog = ({ open, onOpenChange, claim }: ClaimMessagesDialogProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const auth = useAuth();

  const mapDbToUi = (m: any): Message => ({
    id: m.id,
    sender: m.sender_id === auth.user?.id ? 'user' : 'agent',
    text: m.text,
    timestamp: new Date(m.timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    read: m.read,
  });

  useEffect(() => {
    if (!open || !claim?.id) return;

    let cancelled = false;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('id, sender_id, text, timestamp, read')
        .eq('claim_id', claim.id)
        .order('timestamp', { ascending: true });

      if (!cancelled && !error) {
        setMessages((data ?? []).map(mapDbToUi));
      }

      if (auth.user?.id) {
        await supabase
          .from('messages')
          .update({ read: true })
          .eq('claim_id', claim.id)
          .neq('sender_id', auth.user.id);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`messages-claim-${claim.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `claim_id=eq.${claim.id}` },
        (payload) => {
          const m = payload.new as any;
          setMessages((prev) => [...prev, mapDbToUi(m)]);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [open, claim.id, auth.user?.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !auth.user?.id) return;

    const { error } = await supabase.from('messages').insert({
      claim_id: claim.id,
      sender_id: auth.user.id,
      text: newMessage,
      read: true,
      timestamp: new Date().toISOString(),
      topic: 'chat',
      extension: 'text/plain',
      event: 'message',
      private: false,
    });

    if (!error) {
      setNewMessage('');
    }
  };
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
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-white/80' : 'text-gray-500'
                      }`}
                    >
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
