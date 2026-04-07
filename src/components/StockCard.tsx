import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { PredictionMeter } from './PredictionMeter';
import { InfoTooltip } from './InfoTooltip';
import { Stock, getPredictionLabel, getPredictionColor, METRIC_TOOLTIPS } from '../utils/stockUtils';

interface StockCardProps {
  stock: Stock;
  onClick: () => void;
}

const predictionDescription = (label: string): string => {
  switch (label) {
    case 'Strong Buy': return 'Strong signals suggest significant upside potential based on technical and fundamental analysis.';
    case 'Buy': return 'Positive signals indicate the stock is likely to outperform in the near term.';
    case 'Hold': return 'Mixed signals — neither compelling buy nor sell. Monitor for directional clarity.';
    case 'Sell': return 'Negative signals suggest the stock may underperform. Consider risk management.';
    case 'Strong Sell': return 'Strong bearish signals indicate significant downside risk. High caution advised.';
    default: return 'Prediction score based on technical and fundamental analysis.';
  }
};

export function StockCard({ stock, onClick }: StockCardProps) {
  const isPositive = stock.change >= 0;
  const predictionLabel = getPredictionLabel(stock.prediction);
  const predictionColor = getPredictionColor(stock.prediction);

  return (
    <Card
      className="cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-200 border-border group"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg group-hover:text-primary transition-colors">{stock.symbol}</CardTitle>
            <p className="text-sm text-muted-foreground truncate max-w-[160px]" title={stock.name}>{stock.name}</p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="gap-1 cursor-help">
                <Activity className="h-3 w-3 animate-pulse text-green-500" />
                Live
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">
              Price and prediction update every 3 seconds with simulated market data
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price Information */}
        <div className="space-y-1">
          <div className="text-2xl font-bold">
            ${stock.price.toFixed(2)}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`flex items-center gap-1 text-sm cursor-help w-fit ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {isPositive ? '+' : ''}${stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              Change in price today: {isPositive ? '+' : ''}${stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)<br />
              {isPositive ? '↑ Gaining today' : '↓ Declining today'}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Prediction Meter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <InfoTooltip content={METRIC_TOOLTIPS.prediction}>
              <span className="text-sm text-muted-foreground">AI Prediction</span>
            </InfoTooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className={`${predictionColor} text-white cursor-help`}>
                  {predictionLabel}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-[200px] text-xs">
                {predictionDescription(predictionLabel)}
              </TooltipContent>
            </Tooltip>
          </div>
          <PredictionMeter value={stock.prediction} />
          <div className="text-xs text-muted-foreground text-center">
            Score: {stock.prediction.toFixed(0)}/100 — Click card for full analysis
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm pt-1 border-t border-border/50">
          <div>
            <InfoTooltip content={METRIC_TOOLTIPS.volume}>
              <span className="text-muted-foreground text-xs">Volume</span>
            </InfoTooltip>
            <div className="font-medium">{stock.volume}</div>
          </div>
          <div>
            <InfoTooltip content={METRIC_TOOLTIPS.pe}>
              <span className="text-muted-foreground text-xs">P/E Ratio</span>
            </InfoTooltip>
            <div className="font-medium">{stock.pe}x</div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center opacity-0 group-hover:opacity-100 transition-opacity">
          Click to view full details →
        </div>
      </CardContent>
    </Card>
  );
}
