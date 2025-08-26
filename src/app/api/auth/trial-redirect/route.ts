import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getClientIP, getTrialStatus, createTrial } from '@/lib/trial';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        stripeSubscriptionId: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has an active subscription
    const now = new Date();
    const hasActiveSubscription = !!(
      user.stripeSubscriptionId && 
      user.stripeCurrentPeriodEnd &&
      user.stripeCurrentPeriodEnd > now
    );

    if (hasActiveSubscription) {
      return Response.json({ redirectTo: '/dashboard' });
    }

    // Get user's IP address
    const ipAddress = getClientIP();
    
    // Check trial status for this email+IP combination
    const trialStatus = await getTrialStatus(user.email, ipAddress);
    
    // If they can use a trial, create the trial record and redirect to dashboard
    if (trialStatus.canUseTrial) {
      await createTrial(user.email, ipAddress, user.id);
      return Response.json({ 
        redirectTo: '/dashboard',
        message: 'Welcome! You have access to one free project.',
        isTrial: true 
      });
    }
    
    // If they've already used their trial, redirect to subscription
    return Response.json({ 
      redirectTo: '/subscription',
      message: 'You\'ve already used your free trial from this location. Subscribe to continue.',
      isTrial: false 
    });
    
  } catch (error) {
    console.error('Trial redirect error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}