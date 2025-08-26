import { prisma } from './db';
import { headers } from 'next/headers';

export function getClientIP(): string {
  const headersList = headers();
  
  // Try different header names for IP address
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIP = headersList.get('x-real-ip');
  const cfConnectingIP = headersList.get('cf-connecting-ip');
  
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to localhost for development
  return '127.0.0.1';
}

export async function hasUsedTrial(email: string, ipAddress: string): Promise<boolean> {
  try {
    const existingTrial = await prisma.trial.findUnique({
      where: {
        email_ipAddress: {
          email: email.toLowerCase(),
          ipAddress,
        },
      },
    });
    
    return !!existingTrial;
  } catch (error) {
    console.error('Error checking trial usage:', error);
    return false;
  }
}

export async function createTrial(email: string, ipAddress: string, userId?: string): Promise<void> {
  try {
    await prisma.trial.upsert({
      where: {
        email_ipAddress: {
          email: email.toLowerCase(),
          ipAddress,
        },
      },
      update: {
        userId,
        usedAt: new Date(),
      },
      create: {
        email: email.toLowerCase(),
        ipAddress,
        userId,
        usedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error creating trial:', error);
  }
}

export async function getTrialStatus(email: string, ipAddress: string): Promise<{
  hasUsedTrial: boolean;
  canUseTrial: boolean;
  redirectTo: string;
}> {
  const hasUsed = await hasUsedTrial(email, ipAddress);
  
  return {
    hasUsedTrial: hasUsed,
    canUseTrial: !hasUsed,
    redirectTo: hasUsed ? '/subscription' : '/dashboard',
  };
}