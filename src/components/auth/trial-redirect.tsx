'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function TrialRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkTrialStatus = async () => {
      if (status === 'loading') return;
      
      if (!session?.user) {
        setIsChecking(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/trial-redirect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          if (data.message) {
            toast({
              title: data.isTrial ? 'Welcome!' : 'Trial Used',
              description: data.message,
              variant: data.isTrial ? 'default' : 'destructive',
            });
          }

          if (data.redirectTo && data.redirectTo !== '/subscription') {
            router.push(data.redirectTo);
            return;
          }
        }
      } catch (error) {
        console.error('Error checking trial status:', error);
      }

      setIsChecking(false);
    };

    checkTrialStatus();
  }, [session, status, router, toast]);

  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-lg">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Checking your access...</span>
        </div>
      </div>
    );
  }

  return null;
}