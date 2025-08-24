'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { OnboardingTour } from './tour';
import { FloatingHelp } from './floating-help';

interface OnboardingContextType {
  isTourOpen: boolean;
  startTour: () => void;
  closeTour: () => void;
  isFirstVisit: boolean;
  markAsVisited: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('appcloner-visited');
    if (!hasVisited) {
      setIsFirstVisit(true);
      // Tour will only open when manually triggered
    }
  }, []);

  const startTour = () => {
    setIsTourOpen(true);
  };

  const closeTour = () => {
    setIsTourOpen(false);
  };

  const completeTour = () => {
    setIsTourOpen(false);
    markAsVisited();
  };

  const markAsVisited = () => {
    localStorage.setItem('appcloner-visited', 'true');
    setIsFirstVisit(false);
  };

  return (
    <OnboardingContext.Provider
      value={{
        isTourOpen,
        startTour,
        closeTour,
        isFirstVisit,
        markAsVisited,
      }}
    >
      {children}
      
      {/* Tour component */}
      <OnboardingTour
        isOpen={isTourOpen}
        onClose={closeTour}
        onComplete={completeTour}
      />
      
      {/* Floating help button */}
      <FloatingHelp onStartTour={startTour} />
    </OnboardingContext.Provider>
  );
}