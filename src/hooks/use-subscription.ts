import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface SubscriptionData {
  isSubscribed: boolean;
  isLoading: boolean;
  subscriptionEnd?: Date;
  priceId?: string;
}

export function useSubscription(): SubscriptionData {
  const { data: session } = useSession();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    isSubscribed: false,
    isLoading: true,
  });

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!session?.user?.email) {
        setSubscriptionData({ isSubscribed: false, isLoading: false });
        return;
      }

      try {
        const response = await fetch('/api/subscription/status');
        const data = await response.json();
        
        setSubscriptionData({
          isSubscribed: data.isSubscribed || false,
          isLoading: false,
          subscriptionEnd: data.subscriptionEnd ? new Date(data.subscriptionEnd) : undefined,
          priceId: data.priceId,
        });
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        setSubscriptionData({ isSubscribed: false, isLoading: false });
      }
    };

    fetchSubscriptionData();
  }, [session?.user?.email]);

  return subscriptionData;
}