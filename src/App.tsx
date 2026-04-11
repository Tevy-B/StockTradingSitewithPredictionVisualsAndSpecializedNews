import React, { useEffect, useMemo, useState } from 'react';
import { Search, DollarSign, Activity, Info, Plus } from 'lucide-react';
import { StockCard } from './components/StockCard';
import { StockDetail } from './components/StockDetail';
import { MarketSummary } from './components/MarketSummary';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './components/ui/tooltip';
import { filterStocks, Stock } from './utils/stockUtils';
import { addTickerToPortfolio, getPortfolio, getStocks } from './services/api';

export default function App() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [portfolioSymbols, setPortfolioSymbols] = useState<string[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const marketSummary = useMemo(() => {
    const totalValue = stocks.reduce((sum, stock) => sum + stock.price, 0);
    const dailyChange = stocks.reduce((sum, stock) => sum + stock.change, 0);
    const dailyChangePercent = totalValue ? (dailyChange / Math.max(totalValue - dailyChange, 1)) * 100 : 0;

    return { totalValue, dailyChange, dailyChangePercent };
  }, [stocks]);

  const refreshStocks = async (symbols: string[]) => {
    if (!symbols.length) {
      setStocks([]);
      return;
    }

    const liveStocks = await getStocks(symbols);
    setStocks(liveStocks);
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setError('');
        const symbols = await getPortfolio();
        if (!mounted) return;

        setPortfolioSymbols(symbols);
        await refreshStocks(symbols);
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : 'Failed to load live data.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!portfolioSymbols.length) return;

    const interval = setInterval(() => {
      refreshStocks(portfolioSymbols).catch(() => null);
    }, 30000);

    return () => clearInterval(interval);
  }, [portfolioSymbols]);

  const handleAddTicker = async () => {
    const symbol = searchTerm.trim().toUpperCase();
    if (!symbol) return;

    try {
      setError('');
      const symbols = await addTickerToPortfolio(symbol);
      setPortfolioSymbols(symbols);
      await refreshStocks(symbols);
      setSearchTerm('');
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : 'Unable to add ticker.');
    }
  };

  const filteredStocks = filterStocks(stocks, searchTerm);

  if (selectedStock) {
    const latest = stocks.find((stock) => stock.symbol === selectedStock.symbol) || selectedStock;
    return <StockDetail stock={latest} onBack={() => setSelectedStock(null)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">StockPredict</h1>
            </div>
            <Badge variant="secondary" className="gap-1 cursor-help">
              <Activity className="h-4 w-4 animate-pulse text-green-500" />
              Live Market
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <MarketSummary stocks={stocks} marketSummary={marketSummary} />

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search or type a ticker to add (e.g. AAPL, NFLX)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={handleAddTicker} className="gap-2">
            <Plus className="h-4 w-4" />
            Add ticker
          </Button>
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        {isLoading && <p className="text-sm text-muted-foreground mb-4">Loading live portfolio data…</p>}

        <div className="flex flex-wrap items-center gap-4 mb-4 text-xs text-muted-foreground">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1 cursor-help underline decoration-dotted">
                <Info className="h-3 w-3" /> Prediction score note
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs text-xs">
              Prediction is model-derived using live price movement + valuation metrics.
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStocks.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} onClick={() => setSelectedStock(stock)} />
          ))}
        </div>

        {!isLoading && filteredStocks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No stocks found matching <span className="font-medium text-foreground">"{searchTerm}"</span>.
          </div>
        )}
      </div>
    </div>
  );
}
