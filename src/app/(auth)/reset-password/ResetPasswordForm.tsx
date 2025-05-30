'use client';

import { ReactNode, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

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
        toast.success('Lösenord återställt!', {
          description: 'Ditt lösenord har uppdaterats. Du kan nu logga in.',
        });
      } catch (error) {
        console.error('Reset password error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Okänt fel';
        toast.error('Fel vid återställning av lösenord', {
          description: errorMessage,
        });
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      {children}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Återställer...' : 'Återställ lösenord'}
      </Button>
    </form>
  );
}