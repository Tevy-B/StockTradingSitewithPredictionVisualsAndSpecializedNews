import React, { useState, useEffect } from 'react';
import { Search, DollarSign, Activity, Info } from 'lucide-react';
import { StockCard } from './components/StockCard';
import { StockDetail } from './components/StockDetail';
import { MarketSummary } from './components/MarketSummary';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from './components/ui/tooltip';
import { mockStocks, initialMarketSummary } from './constants/mockData';
import { simulateStockUpdate, filterStocks, Stock } from './utils/stockUtils';

export default function App() {
  const [stocks, setStocks] = useState<Stock[]>(mockStocks);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [marketSummary, setMarketSummary] = useState(initialMarketSummary);

  // Simulate real-time stock updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prevStocks => prevStocks.map(simulateStockUpdate));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const filteredStocks = filterStocks(stocks, searchTerm);

  if (selectedStock) {
    return (
      <StockDetail 
        stock={selectedStock} 
        onBack={() => setSelectedStock(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">StockPredict</h1>
            </div>
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="gap-1 cursor-help">
                    <Activity className="h-4 w-4 animate-pulse text-green-500" />
                    Live Market
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs max-w-xs">
                  Prices and prediction scores update every 3 seconds with simulated market data.
                  Click any stock card to view full details, balance sheet, and analyst ratings.
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Market Summary */}
        <MarketSummary stocks={stocks} marketSummary={marketSummary} />

        {/* Search */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stocks by symbol or name (e.g. AAPL, Tesla)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-600 inline-block" />
            Strong Buy (75–100)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />
            Buy (60–75)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
            Hold (40–60)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
            Sell (25–40)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
            Strong Sell (0–25)
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1 cursor-help underline decoration-dotted">
                <Info className="h-3 w-3" /> How scores work
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs text-xs">
              The AI Prediction Score (0–100) combines: technical signals (RSI, MACD, moving averages),
              Wall Street analyst consensus from major banks, and fundamental strength metrics. 
              Updated every 3 seconds. Click a card to see the full breakdown.
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Stock Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStocks.map((stock) => (
            <StockCard
              key={stock.symbol}
              stock={stock}
              onClick={() => setSelectedStock(stock)}
            />
          ))}
        </div>

        {filteredStocks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No stocks found matching "<span className="font-medium text-foreground">{searchTerm}</span>". Try searching by symbol (e.g. AAPL) or company name.
          </div>
        )}
      </div>
    </div>
  );
}