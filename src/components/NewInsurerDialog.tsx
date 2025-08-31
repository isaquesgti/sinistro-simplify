
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import InsurerRegistrationForm from './InsurerRegistrationForm';

interface NewInsurerDialogProps {
  onSuccess?: () => void;
}

const NewInsurerDialog: React.FC<NewInsurerDialogProps> = ({ onSuccess }) => {
  const [open, setOpen] = React.useState(false);

  const handleSuccess = () => {
    setOpen(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Nova Seguradora</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Nova Seguradora</DialogTitle>
          <DialogDescription>
            Preencha os dados da seguradora para criar uma nova conta.
          </DialogDescription>
        </DialogHeader>
        <InsurerRegistrationForm onSuccess={handleSuccess} />
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewInsurerDialog;
