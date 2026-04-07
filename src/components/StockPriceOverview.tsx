import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { InfoTooltip } from './InfoTooltip';
import { Stock, METRIC_TOOLTIPS } from '../utils/stockUtils';
import { StockExtendedDetail } from '../utils/stockUtils';

interface StockPriceOverviewProps {
  stock: Stock;
  detail?: StockExtendedDetail;
}

interface StatRowProps {
  label: string;
  value: string;
  tooltipKey: string;
  valueClass?: string;
}

function StatRow({ label, value, tooltipKey, valueClass = 'font-medium' }: StatRowProps) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-border/40 last:border-0">
      <InfoTooltip content={METRIC_TOOLTIPS[tooltipKey] || label} side="right">
        <span className="text-muted-foreground text-xs">{label}</span>
      </InfoTooltip>
      <span className={`text-sm ${valueClass}`}>{value}</span>
    </div>
  );
}

export function StockPriceOverview({ stock, detail }: StockPriceOverviewProps) {
  const isPositive = stock.change >= 0;

  const high52w = detail?.high52w ?? stock.price * 1.2;
  const low52w = detail?.low52w ?? stock.price * 0.8;
  const rangePercent = ((stock.price - low52w) / (high52w - low52w)) * 100;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Price Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Price & Change */}
          <div className="flex items-end gap-4 flex-wrap">
            <div className="text-4xl font-bold">
              ${stock.price.toFixed(2)}
            </div>
            <div className={`flex items-center gap-1 text-lg mb-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              {isPositive ? '+' : ''}${stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
            </div>
            <div className="text-xs text-muted-foreground mb-1">Today's change</div>
          </div>

          {/* 52-Week Range Visual */}
          <div className="space-y-1.5">
            <InfoTooltip content="The bar shows where the current price sits within its 52-week trading range. Left = near 52-week low; Right = near 52-week high." side="right">
              <span className="text-xs text-muted-foreground">52-Week Range Position</span>
            </InfoTooltip>
            <div className="relative h-2 bg-muted rounded-full">
              <div
                className="absolute inset-y-0 bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 rounded-full"
                style={{ width: '100%' }}
              />
              <div
                className="absolute top-1/2 w-3 h-3 bg-primary rounded-full border-2 border-background shadow-md"
                style={{
                  left: `${Math.max(0, Math.min(100, rangePercent))}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                title={`Current: $${stock.price.toFixed(2)}`}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="text-red-500">Low: ${low52w.toFixed(2)}</span>
              <span className="text-green-600">High: ${high52w.toFixed(2)}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0 border border-border/50 rounded-lg px-4 py-2">
            <StatRow label="Volume" value={stock.volume} tooltipKey="volume" />
            <StatRow label="Market Cap" value={stock.marketCap} tooltipKey="marketCap" />
            <StatRow label="P/E Ratio" value={`${stock.pe}x`} tooltipKey="pe" />
            {detail && (
              <>
                <StatRow
                  label="EPS (TTM)"
                  value={`$${detail.eps.toFixed(2)}`}
                  tooltipKey="eps"
                  valueClass={`font-medium ${detail.eps > 0 ? 'text-green-600' : 'text-red-600'}`}
                />
                <StatRow
                  label="Beta"
                  value={detail.beta.toFixed(2)}
                  tooltipKey="beta"
                  valueClass={`font-medium ${detail.beta > 1.5 ? 'text-red-500' : detail.beta < 0.8 ? 'text-green-600' : 'text-foreground'}`}
                />
                <StatRow
                  label="Annual Dividend"
                  value={detail.dividend > 0 ? `$${detail.dividend.toFixed(2)}` : 'None'}
                  tooltipKey="dividend"
                />
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
