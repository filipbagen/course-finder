'use client';

import { ReactNode, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface ForgotPasswordFormProps {
  children: ReactNode;
  action: (formData: FormData) => Promise<void>;
}

export function ForgotPasswordForm({ children, action }: ForgotPasswordFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await action(formData);
        toast.success('E-post skickat!', {
          description: 'Kolla din inkorg för instruktioner om att återställa ditt lösenord.',
        });
      } catch (error) {
        console.error('Forgot password error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Okänt fel';
        toast.error('Fel vid skickande av e-post', {
          description: errorMessage,
        });
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      {children}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Skickar...' : 'Skicka återställningslänk'}
      </Button>
    </form>
  );
}