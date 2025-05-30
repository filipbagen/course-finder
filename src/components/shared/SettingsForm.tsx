'use client';

import { ReactNode, useTransition } from 'react';
import { toast } from 'sonner';

interface SettingsFormProps {
  children: ReactNode;
  action: (formData: FormData) => Promise<void>;
}

export function SettingsForm({ children, action }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        const pictureFile = formData.get('picture') as File;
        const hasImageUpload = pictureFile && pictureFile.size > 0;

        await action(formData);

        if (hasImageUpload) {
          toast.success('Profilbild uppladdad', {
            description:
              'Din nya profilbild har laddats upp och inställningarna sparade.',
          });
        } else {
          toast.success('Inställningar sparade', {
            description: 'Dina inställningar har uppdaterats.',
          });
        }
      } catch (error) {
        console.error('Settings form error:', error);
        toast.error('Fel vid sparande', {
          description: 'Kunde inte spara dina inställningar. Försök igen.',
        });
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-8">
      {children}
    </form>
  );
}
