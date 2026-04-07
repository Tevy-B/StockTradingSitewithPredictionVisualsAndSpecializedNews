import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface PredictionMeterProps {
  value: number; // 0-100 scale
  showZones?: boolean;
}

const zones = [
  { label: 'Strong Sell', range: '0–25', color: 'bg-red-600', textColor: 'text-red-600', min: 0, max: 25 },
  { label: 'Sell', range: '25–40', color: 'bg-red-400', textColor: 'text-red-500', min: 25, max: 40 },
  { label: 'Hold', range: '40–60', color: 'bg-yellow-400', textColor: 'text-yellow-600', min: 40, max: 60 },
  { label: 'Buy', range: '60–75', color: 'bg-green-400', textColor: 'text-green-500', min: 60, max: 75 },
  { label: 'Strong Buy', range: '75–100', color: 'bg-green-600', textColor: 'text-green-600', min: 75, max: 100 },
];

function getZoneInfo(val: number) {
  return zones.find(z => val >= z.min && val <= z.max) || zones[2];
}

function getBarGradient(val: number) {
  if (val >= 75) return 'from-green-400 to-green-600';
  if (val >= 60) return 'from-green-300 to-green-500';
  if (val >= 40) return 'from-yellow-300 to-yellow-500';
  if (val >= 25) return 'from-red-300 to-red-500';
  return 'from-red-500 to-red-700';
}

export function PredictionMeter({ value, showZones = true }: PredictionMeterProps) {
  const clampedValue = Math.max(0, Math.min(100, value));
  const zone = getZoneInfo(clampedValue);
  const gradient = getBarGradient(clampedValue);

  return (
    <div className="space-y-2">
      {/* Meter Bar with tooltip */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative h-4 bg-muted rounded-full overflow-hidden cursor-help">
            {/* Colored fill */}
            <div
              className={`h-full bg-gradient-to-r ${gradient} transition-all duration-700 ease-out`}
              style={{ width: `${clampedValue}%` }}
            />
            {/* Zone dividers */}
            <div className="absolute top-0 left-[25%] w-px h-full bg-background/60" />
            <div className="absolute top-0 left-[40%] w-px h-full bg-background/60" />
            <div className="absolute top-0 left-[60%] w-px h-full bg-background/60" />
            <div className="absolute top-0 left-[75%] w-px h-full bg-background/60" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
          <p className="font-semibold mb-1">AI Prediction Score: {clampedValue.toFixed(0)}/100</p>
          <p className="mb-1">Current zone: <span className={zone.textColor}>{zone.label}</span> ({zone.range})</p>
          <p>Combines technical signals (RSI, MACD, moving averages), analyst sentiment, and fundamental metrics. Updated every few seconds.</p>
        </TooltipContent>
      </Tooltip>

      {/* Zone labels */}
      {showZones && (
        <div className="flex justify-between text-xs">
          {zones.map((z) => (
            <Tooltip key={z.label}>
              <TooltipTrigger asChild>
                <span
                  className={`cursor-help font-medium transition-opacity ${
                    zone.label === z.label ? z.textColor : 'text-muted-foreground opacity-50'
                  }`}
                >
                  {z.label === 'Strong Sell' ? 'S.Sell' :
                   z.label === 'Strong Buy' ? 'S.Buy' :
                   z.label}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <span className="font-medium">{z.label}</span>: Score {z.range}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      )}
    </div>
  );
}
