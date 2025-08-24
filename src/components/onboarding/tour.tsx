'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, ArrowLeft, Sparkles, Upload, Code, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  icon: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    text: string;
    href?: string;
    onClick?: () => void;
  };
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to App Cloner! 🎉',
    description: 'Transform any screenshot into production-ready code using AI. Let us show you how it works.',
    icon: <Sparkles className="w-6 h-6 text-primary" />,
    action: {
      text: 'Get Started',
    }
  },
  {
    id: 'upload',
    title: 'Upload Your Screenshot',
    description: 'Simply drag and drop or click to upload any app interface screenshot. We support all common image formats.',
    target: '.upload-area',
    icon: <Upload className="w-6 h-6 text-primary" />,
    position: 'top',
    action: {
      text: 'Try Upload',
      href: '/create'
    }
  },
  {
    id: 'analysis',
    title: 'AI Analysis Magic',
    description: 'Our advanced computer vision AI analyzes your screenshot, identifying components, layouts, and platform patterns with 99% accuracy.',
    icon: <Code className="w-6 h-6 text-primary" />,
  },
  {
    id: 'generation',
    title: 'Code Generation',
    description: 'Get complete project code with APIs, database schemas, and deployment configs. Choose from React, React Native, Flutter, and more.',
    icon: <Zap className="w-6 h-6 text-primary" />,
    action: {
      text: 'View Examples',
      href: '/dashboard'
    }
  }
];

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingTour({ isOpen, onClose, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen && tourSteps[currentStep]?.target) {
      const element = document.querySelector(tourSteps[currentStep].target!) as HTMLElement;
      setTargetElement(element);
    } else {
      setTargetElement(null);
    }
  }, [currentStep, isOpen]);

  useEffect(() => {
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [targetElement]);

  if (!isOpen) return null;

  const currentStepData = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const getTooltipPosition = () => {
    if (!targetElement) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    
    const rect = targetElement.getBoundingClientRect();
    const position = currentStepData.position || 'bottom';
    
    switch (position) {
      case 'top':
        return {
          top: rect.top - 20,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, -100%)'
        };
      case 'bottom':
        return {
          top: rect.bottom + 20,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, 0)'
        };
      case 'left':
        return {
          top: rect.top + rect.height / 2,
          left: rect.left - 20,
          transform: 'translate(-100%, -50%)'
        };
      case 'right':
        return {
          top: rect.top + rect.height / 2,
          left: rect.right + 20,
          transform: 'translate(0, -50%)'
        };
      default:
        return {
          top: rect.bottom + 20,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, 0)'
        };
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
      
      {/* Highlight overlay for target element */}
      {targetElement && (
        <div
          className="fixed z-50 border-2 border-primary rounded-lg pointer-events-none animate-pulse"
          style={{
            top: targetElement.getBoundingClientRect().top - 4,
            left: targetElement.getBoundingClientRect().left - 4,
            width: targetElement.getBoundingClientRect().width + 8,
            height: targetElement.getBoundingClientRect().height + 8,
          }}
        />
      )}

      {/* Tour tooltip */}
      <div
        className={cn(
          "fixed z-50 w-80 bg-background border rounded-xl shadow-xl p-6",
          !targetElement && "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        )}
        style={targetElement ? getTooltipPosition() : undefined}
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="space-y-4">
          {/* Icon */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-full">
              {currentStepData.icon}
            </div>
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {tourSteps.length}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold">{currentStepData.title}</h3>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">
            {currentStepData.description}
          </p>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSkip}
              >
                Skip Tour
              </Button>
              {!isFirstStep && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>
              )}
            </div>

            <div className="flex space-x-2">
              {currentStepData.action && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (currentStepData.action?.href) {
                      window.location.href = currentStepData.action.href;
                    } else if (currentStepData.action?.onClick) {
                      currentStepData.action.onClick();
                    }
                  }}
                >
                  {currentStepData.action.text}
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleNext}
                className="gap-2"
              >
                {isLastStep ? 'Complete' : 'Next'}
                {!isLastStep && <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}