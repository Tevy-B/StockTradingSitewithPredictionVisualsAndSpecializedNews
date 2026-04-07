import React from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { InfoTooltip } from './InfoTooltip';
import { Stock } from '../utils/stockUtils';

interface MarketSummaryProps {
  stocks: Stock[];
  marketSummary: {
    totalValue: number;
    dailyChange: number;
    dailyChangePercent: number;
  };
}

export function MarketSummary({ stocks, marketSummary }: MarketSummaryProps) {
  const gainers = stocks.filter(stock => stock.change > 0).length;
  const losers = stocks.filter(stock => stock.change < 0).length;
  const strongBuys = stocks.filter(s => s.prediction >= 75).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <Card>
        <CardHeader className="pb-1 pt-4 px-4">
          <CardTitle className="text-xs">
            <InfoTooltip content="Simulated aggregate portfolio value of all tracked stocks. Updates in real-time as prices change." side="bottom">
              Portfolio Value
            </InfoTooltip>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-xl font-bold">${marketSummary.totalValue.toLocaleString()}</div>
          <div className={`flex items-center gap-1 text-xs mt-0.5 ${marketSummary.dailyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {marketSummary.dailyChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {marketSummary.dailyChange >= 0 ? '+' : ''}${Math.abs(marketSummary.dailyChange).toFixed(2)} today
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1 pt-4 px-4">
          <CardTitle className="text-xs">
            <InfoTooltip content="Total number of stocks currently being tracked and updated with live-simulated price data." side="bottom">
              Tracked Stocks
            </InfoTooltip>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-xl font-bold">{stocks.length}</div>
          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <Activity className="h-3 w-3 text-green-500" />
            Updating live
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1 pt-4 px-4">
          <CardTitle className="text-xs">
            <InfoTooltip content="Number of stocks with a positive price change today. Green means market momentum is upward." side="bottom">
              Gainers / Losers
            </InfoTooltip>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-green-600">{gainers}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-xl font-bold text-red-600">{losers}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <ArrowUpCircle className="h-3 w-3 text-green-500" />
            up &nbsp;·&nbsp;
            <ArrowDownCircle className="h-3 w-3 text-red-500" />
            down today
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1 pt-4 px-4">
          <CardTitle className="text-xs">
            <InfoTooltip content="Stocks with an AI prediction score ≥ 75 (Strong Buy signal). Based on technical analysis, analyst sentiment, and fundamental health." side="bottom">
              Strong Buy Signals
            </InfoTooltip>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-xl font-bold text-green-600">{strongBuys}</div>
          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <BarChart2 className="h-3 w-3 text-green-500" />
            of {stocks.length} stocks
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
