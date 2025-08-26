import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useSubscription } from './use-subscription';

interface TrialStatus {
  isTrial: boolean;
  isSubscribed: boolean;
  canCreateProject: boolean;
  projectCount: number;
  maxProjects: number;
  isLoading: boolean;
}

export function useTrialStatus(): TrialStatus {
  const { data: session } = useSession();
  const { isSubscribed, isLoading: subLoading } = useSubscription();
  const [trialData, setTrialData] = useState<TrialStatus>({
    isTrial: false,
    isSubscribed: false,
    canCreateProject: false,
    projectCount: 0,
    maxProjects: 0,
    isLoading: true,
  });

  useEffect(() => {
    const fetchTrialStatus = async () => {
      if (!session?.user?.email || subLoading) {
        return;
      }

      try {
        const response = await fetch('/api/user/trial-status');
        const data = await response.json();
        
        if (response.ok) {
          const maxProjects = isSubscribed ? Infinity : 1; // 1 free project for trial users
          
          setTrialData({
            isTrial: !isSubscribed && data.isTrial,
            isSubscribed,
            canCreateProject: isSubscribed || data.projectCount < 1,
            projectCount: data.projectCount,
            maxProjects,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error fetching trial status:', error);
        setTrialData(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchTrialStatus();
  }, [session?.user?.email, isSubscribed, subLoading]);

  return trialData;
}