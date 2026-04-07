import React from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface InfoTooltipProps {
  content: string;
  children?: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function InfoTooltip({ content, children, side = 'top' }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 cursor-help group">
          {children}
          <Info className="h-3 w-3 text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity" />
        </span>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs text-xs leading-relaxed">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
