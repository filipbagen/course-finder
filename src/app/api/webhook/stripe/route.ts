import { stripe } from '@/app/lib/stripe';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import prisma from '@/app/lib/db';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
    console.log('Webhook received:', event.type);
  } catch (error: unknown) {
    console.error('Error constructing webhook event:', error);
    return new Response('webhook error', { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  console.log('event.type', event.type);

  if (event.type === 'checkout.session.completed') {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );
    const customerId = String(session.customer);

    const user = await prisma.user.findUnique({
      where: {
        stripeCustomerId: customerId,
      },
    });

    if (!user) throw new Error('User not found...');

    try {
      const createdSubscription = await prisma.subscription.create({
        data: {
          stripeSubscriptionId: subscription.id,
          userId: user.id,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
          status: subscription.status,
          planId: subscription.items.data[0].plan.id,
          interval: String(subscription.items.data[0].plan.interval),
        },
      });

      console.log('Subscription created:', createdSubscription);
    } catch (error) {
      console.error('Error creating subscription:', error);
      return new Response('error creating subscription', { status: 500 });
    }
  }

  if (event.type === 'invoice.payment_succeeded') {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    const updatedSubscription = await prisma.subscription.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        planId: subscription.items.data[0].price.id,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        status: subscription.status,
      },
    });

    console.log('Subscription updated:', updatedSubscription);
  }

  return new Response(null, { status: 200 });
}
