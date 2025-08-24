'use client';

import { useState } from 'react';
import { HelpCircle, Info, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HelpTooltipProps {
  content: string;
  title?: string;
  type?: 'help' | 'info' | 'tip';
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  children?: React.ReactNode;
}

export function HelpTooltip({ 
  content, 
  title, 
  type = 'help', 
  position = 'top',
  className,
  children 
}: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = () => {
    switch (type) {
      case 'info':
        return <Info className="w-4 h-4" />;
      case 'tip':
        return <Lightbulb className="w-4 h-4" />;
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'info':
        return 'text-blue-500 hover:text-blue-600';
      case 'tip':
        return 'text-yellow-500 hover:text-yellow-600';
      default:
        return 'text-muted-foreground hover:text-foreground';
    }
  };

  const getTooltipPosition = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowPosition = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-background';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-background';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-background';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-background';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-background';
    }
  };

  return (
    <div className={cn("relative inline-block", className)}>
      {children ? (
        <div
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className="cursor-help"
        >
          {children}
        </div>
      ) : (
        <button
          type="button"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className={cn(
            "transition-colors duration-200 cursor-help",
            getColors()
          )}
        >
          {getIcon()}
        </button>
      )}

      {isOpen && (
        <div className={cn(
          "absolute z-50 w-64 p-3 bg-background border rounded-lg shadow-lg animate-in fade-in-0 zoom-in-95",
          getTooltipPosition()
        )}>
          {/* Arrow */}
          <div className={cn("absolute w-0 h-0 border-4", getArrowPosition())} />
          
          {/* Content */}
          {title && (
            <h4 className="font-medium text-sm mb-1">{title}</h4>
          )}
          <p className="text-xs text-muted-foreground leading-relaxed">
            {content}
          </p>
        </div>
      )}
    </div>
  );
}