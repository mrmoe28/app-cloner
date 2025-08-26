import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    const isSubscribed = !!(
      user.stripeSubscriptionId && 
      user.stripeCurrentPeriodEnd &&
      user.stripeCurrentPeriodEnd > now
    );

    return Response.json({
      isSubscribed,
      subscriptionEnd: user.stripeCurrentPeriodEnd?.toISOString(),
      priceId: user.stripePriceId,
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}