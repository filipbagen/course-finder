'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <Button disabled className="w-fit">
          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
          Vänligen vänta...
        </Button>
      ) : (
        <Button type="submit" className="w-fit">
          Spara
        </Button>
      )}
    </>
  );
}

export function StripeSubscriptionCreationButton() {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <Button disabled className="w-full">
          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
          Vänligen vänta...
        </Button>
      ) : (
        <Button type="submit" className="w-full">
          Skapa prenumeration
        </Button>
      )}
    </>
  );
}

export function StripePortal() {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <Button disabled className="w-fit">
          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
          Vänligen vänta...
        </Button>
      ) : (
        <Button type="submit" className="w-fit">
          Visa betalningsdetaljer
        </Button>
      )}
    </>
  );
}
