// shadcn
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// next
import Link from 'next/link';

// icon
import { XIcon } from 'lucide-react';

export default function CancelledRoute() {
  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center">
      <Card className="w-[350px]">
        <div className="p-6">
          <div className="w-full flex justify-center">
            <XIcon className="w-12 h-12 rounded-full bg-red-500/30 text-red-500 p-2" />
          </div>

          <div className="mt-3 text-center sm:mt-5 w-full">
            <h4>Betalning misslyckades</h4>
            <div className="mt-2">
              <p>
                Ingen fara, du kommer inte att bli debiterad. Vänligen försök
                igen.
              </p>
            </div>
            <div className="mt-5 sm:mt-6 w-full">
              <Button className="w-full" asChild>
                <Link href="/">Go back to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
