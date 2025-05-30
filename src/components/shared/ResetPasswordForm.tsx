'use client';

import { ReactNode, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ResetPasswordFormProps {
  children: ReactNode;
  action: (formData: FormData) => Promise<void>;
}

export function ResetPasswordForm({ children, action }: ResetPasswordFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await action(formData);
        toast.success('Lösenord uppdaterat!', {
          description: 'Ditt lösenord har ändrats framgångsrikt.',
        });
      } catch (error) {
        console.error('Reset password error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Kunde inte uppdatera lösenord';
        toast.error('Fel vid uppdatering', {
          description: errorMessage,
        });
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      {children}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uppdaterar...
          </>
        ) : (
          'Uppdatera lösenord'
        )}
      </Button>
    </form>
  );
}
