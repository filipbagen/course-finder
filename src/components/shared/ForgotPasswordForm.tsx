'use client';

import { ReactNode, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

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
          description: 'Kolla din inkorg för återställningslänken.',
        });
      } catch (error) {
        console.error('Forgot password error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Kunde inte skicka återställningsmail';
        toast.error('Fel vid skickning', {
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
            Skickar...
          </>
        ) : (
          'Skicka återställningslänk'
        )}
      </Button>
    </form>
  );
}
