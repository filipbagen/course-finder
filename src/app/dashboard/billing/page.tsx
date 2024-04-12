// shadcn
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// next
import { redirect } from 'next/navigation';

// icons
import { CheckCircle2 } from 'lucide-react';

// prisma
import prisma from '@/app/lib/db';

// kinde
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

// stripe
import { getStripeSession } from '@/app/lib/stripe';

// components
import { StripeSubscriptionCreationButton } from '@/app/components/SubmitButtons';

const featureItems = [
  {
    name: 'AI course recommendations',
    description: 'Get personalized course recommendations',
  },
  {
    name: 'Unlimited access to all courses',
    description: 'Access to all premium courses',
  },
  {
    name: 'Download courses for offline viewing',
    description: 'Download courses to watch offline',
  },
  {
    name: 'Custom playlists',
    description: 'Create custom playlists of courses',
  },
  {
    name: 'Course notes',
    description: 'Take notes on courses',
  },
  {
    name: 'Priority support',
    description: 'Get help when you need it',
  },
];

async function getData(userId: string) {
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
  const data = await getData(user?.id as string);

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
      domainUrl: 'http://localhost:3000',
      priceId: process.env.STRIPE_PRICE_ID as string,
    });

    return redirect(subscriptionUrl);
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <Card className="flex flex-col">
        <CardContent className="py-8">
          <div>
            <h3 className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-primary/10 text-primary">
              Monthly
            </h3>
          </div>

          <div className="mt-4 flex items-baseline text-6xl font-extrabold">
            49kr{' '}
            <span className="ml-1 text-2xl text-muted-foreground">/mo</span>
          </div>
          <p className="mt-5 text-lg text-muted-foreground">
            Let AI choose courses for you and get access to all premium features
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
  );
}
