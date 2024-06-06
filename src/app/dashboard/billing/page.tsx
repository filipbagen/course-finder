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
import { redirect } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';

// icons
import { CheckCircle2 } from 'lucide-react';

// prisma
import prisma from '@/app/lib/db';

// kinde
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

// stripe
import { getStripeSession, stripe } from '@/app/lib/stripe';

// components
import {
  StripeSubscriptionCreationButton,
  StripePortal,
} from '@/app/components/SubmitButtons';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

const featureItems = [
  {
    name: 'AI-kursrekommendationer',
    description: 'Få personliga kursrekommendationer',
  },
  {
    name: 'Obegränsad tillgång till alla kurser',
    description: 'Tillgång till alla premiumkurser',
  },
  {
    name: 'Ladda ner kurser för offline-visning',
    description: 'Ladda ner kurser för att titta offline',
  },
  {
    name: 'Anpassade spellistor',
    description: 'Skapa anpassade spellistor med kurser',
  },
  {
    name: 'Kursanteckningar',
    description: 'Ta anteckningar om kurser',
  },
  {
    name: 'Prioriterad support',
    description: 'Få hjälp när du behöver det',
  },
];

async function getData(userId: string) {
  noStore();
  const data = await prisma.subscription.findUnique({
    where: {
      userId: userId,
    },
    select: {
      status: true,
      user: {
        select: {
          stripeCustomerId: true,
        },
      },
    },
  });

  return data;
}

export default async function BillingPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user) {
    return redirect('/'); // Redirect if no user is found
  }

  const data = await getData(user.id);

  async function createSubscription() {
    'use server';

    const dbUser = await prisma.user.findUnique({
      where: {
        id: user?.id,
      },
      select: {
        stripeCustomerId: true,
      },
    });

    if (!dbUser?.stripeCustomerId) {
      throw new Error('No stripe customer id found');
    }

    const subscriptionUrl = await getStripeSession({
      customerId: dbUser.stripeCustomerId,
      domainUrl: process.env.NODE_ENV == 'production' ? process.env.PRODUCTION_URL as string : 'http://localhost:3000',
      priceId: process.env.STRIPE_PRICE_ID as string,
    });

    return redirect(subscriptionUrl);
  }

  async function createCustomerPortal() {
    'use server';

    const session = await stripe.billingPortal.sessions.create({
      customer: data?.user.stripeCustomerId as string,
      return_url: process.env.NODE_ENV == 'production' ? process.env.PRODUCTION_URL as string : 'http://localhost:3000/dashboard/billing',
    });

    return redirect(session.url);
  }

  if (data?.status === 'active') {
    return (
      <div className="flex flex-col gap-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Hem</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Betalning</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid items-start gap-8">
          <div className="flex items-center justify-between px-2">
            <div className="grid gap-1">
              <h1>Prenumeration</h1>
              <p className="text-muted-foreground">
                Inställningar för din prenumeration
              </p>
            </div>
          </div>
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Ändra prenumeration</CardTitle>
              <CardDescription>
                Klicka på knappen nedan, detta ger dig möjlighet att ändra dina
                betalningsuppgifter och se din faktura samtidigt.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createCustomerPortal}>
                <StripePortal />
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Hem</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Betalning</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="max-w-md mx-auto space-y-4">
        <Card className="flex flex-col">
          <CardContent className="py-8">
            <div>
              <h3 className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-primary/10 text-primary">
                Premium
              </h3>
            </div>

            <div className="mt-4 flex items-baseline text-6xl font-extrabold">
              49kr{' '}
              <span className="ml-1 text-2xl text-muted-foreground">
                /månad
              </span>
            </div>
            <p className="mt-5 text-lg text-muted-foreground">
              Låt AI välja kurser åt dig och få tillgång till alla
              premiumfunktioner
            </p>
          </CardContent>
          <div className="flex-1 flex flex-col justify-between px-6 pt-6 pb-8 bg-secondary rounded-lg m-1 space-y-6 sm:p-10">
            <ul className="space-y-4">
              {featureItems.map((item) => (
                <li key={item.name} className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  </div>
                  <span className="ml-3 text-base">{item.name}</span>
                </li>
              ))}
            </ul>

            <form action={createSubscription} className="w-full">
              <StripeSubscriptionCreationButton />
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
