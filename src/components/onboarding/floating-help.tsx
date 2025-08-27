'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, MessageCircle, Book, Play, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingHelpProps {
  onStartTour: () => void;
  className?: string;
}

export function FloatingHelp({ onStartTour, className }: FloatingHelpProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const helpOptions = [
    {
      icon: <Play className="w-4 h-4" />,
      label: 'Take Tour',
      description: 'Interactive walkthrough',
      onClick: () => {
        onStartTour();
        setIsExpanded(false);
      }
    },
    {
      icon: <Book className="w-4 h-4" />,
      label: 'Documentation',
      description: 'Complete guides',
      onClick: () => window.open('/docs', '_blank')
    },
    {
      icon: <MessageCircle className="w-4 h-4" />,
      label: 'Support',
      description: 'Get help from our team',
      onClick: () => window.open('mailto:support@appcloner.ai', '_blank')
    }
  ];

  return (
    <div className={cn("fixed bottom-6 right-6 z-40", className)}>
      {/* Expanded menu */}
      {isExpanded && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 -z-10" 
            onClick={() => setIsExpanded(false)} 
          />
          
          {/* Menu items */}
          <div className="absolute bottom-16 right-0 space-y-2 animate-in slide-in-from-bottom-2 fade-in-0">
            {helpOptions.map((option, index) => (
              <div
                key={option.label}
                className="flex items-center space-x-3 group cursor-pointer"
                onClick={option.onClick}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Tooltip */}
                <div className="bg-background border rounded-lg px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
                
                {/* Button */}
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-10 h-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                >
                  {option.icon}
                </Button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Main help button */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "animate-bounce hover:animate-none",
          isExpanded && "rotate-45"
        )}
      >
        {isExpanded ? (
          <X className="w-5 h-5" />
        ) : (
          <HelpCircle className="w-5 h-5" />
        )}
      </Button>

      {/* Pulse animation for attention */}
      {!isExpanded && (
        <div className="absolute inset-0 rounded-full bg-primary opacity-20 animate-ping" aria-hidden="true" />
      )}
    </div>
  );
}