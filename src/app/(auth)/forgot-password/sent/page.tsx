import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function ForgotPasswordSentPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>E-post skickat!</CardTitle>
          <CardDescription>
            Vi har skickat en återställningslänk till din e-postadress. Kolla
            din inkorg och följ instruktionerna för att återställa ditt
            lösenord.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Ser du inte mailet? Kolla din skräppost-mapp. Länken är giltig i
              24 timmar.
            </p>
            <div className="text-center">
              <Link href="/login">
                <Button className="w-full">Tillbaka till inloggning</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
