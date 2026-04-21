import React, { useEffect, useMemo, useState } from 'react';
import { DollarSign, Activity, Info, ShieldCheck, ExternalLink, Sparkles, Gem, Rocket, BarChart4, Shield } from 'lucide-react';
import { StockCard } from './components/StockCard';
import { StockDetail } from './components/StockDetail';
import { MarketSummary } from './components/MarketSummary';
import { Badge } from './components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from './components/ui/tooltip';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { filterStocks, Stock } from './utils/stockUtils';
import {
  addTickerToPortfolio,
  getMe,
  getPortfolio,
  getStocks,
  login,
  register,
  searchSymbols,
  setStoredToken,
  clearStoredToken,
  getStoredToken,
} from './services/api';
import { StockSearch, StockSuggestion } from './components/StockSearch';

const LAST_EMAIL_KEY = 'stockpredict_last_email';
const getLocalPortfolioKey = (email: string) => `stockpredict_portfolio_${email.toLowerCase()}`;
const getStockSymbolFromUrl = () => new URL(window.location.href).searchParams.get('stock')?.toUpperCase() || '';

export default function App() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [portfolioSymbols, setPortfolioSymbols] = useState<string[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<StockSuggestion[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefreshDate, setLastRefreshDate] = useState('');
  const [usedCacheOnly, setUsedCacheOnly] = useState(false);

  const [userEmail, setUserEmail] = useState('');
  const [loginEmail, setLoginEmail] = useState(() => localStorage.getItem(LAST_EMAIL_KEY) || '');
  const [loginPassword, setLoginPassword] = useState('');

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
    const payload = await getStocks(symbols);
    setStocks(payload.stocks);
    setLastRefreshDate(payload.lastRefreshDate);
    setUsedCacheOnly(payload.usedCacheOnly);
  };

  const bootstrap = async () => {
    try {
      setError('');
      if (!getStoredToken()) {
        setIsLoading(false);
        return;
      }
      const me = await getMe();
      setUserEmail(me.user.email);
      const symbols = await getPortfolio();
      let localSymbols: string[] = [];
      try {
        const parsed = JSON.parse(localStorage.getItem(getLocalPortfolioKey(me.user.email)) || '[]');
        localSymbols = Array.isArray(parsed) ? parsed : [];
      } catch {
        localSymbols = [];
      }
      const mergedSymbols = Array.from(new Set([...(symbols || []), ...localSymbols]));

      if (mergedSymbols.length > symbols.length) {
        for (const symbol of mergedSymbols) {
          if (!symbols.includes(symbol)) {
            await addTickerToPortfolio(symbol);
          }
        }
      }

      setPortfolioSymbols(mergedSymbols);
      await refreshStocks(mergedSymbols);
    } catch {
      clearStoredToken();
      setUserEmail('');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    bootstrap();
  }, []);


  useEffect(() => {
    if (!userEmail) return;
    localStorage.setItem(LAST_EMAIL_KEY, userEmail);
  }, [userEmail]);

  useEffect(() => {
    localStorage.setItem(LAST_EMAIL_KEY, loginEmail.trim().toLowerCase());
  }, [loginEmail]);

  useEffect(() => {
    if (!userEmail || portfolioSymbols.length === 0) return;
    localStorage.setItem(getLocalPortfolioKey(userEmail), JSON.stringify(portfolioSymbols));
  }, [userEmail, portfolioSymbols]);

  useEffect(() => {
    if (!portfolioSymbols.length || !userEmail) return;
    const interval = setInterval(() => {
      refreshStocks(portfolioSymbols).catch(() => null);
    }, 60000);
    return () => clearInterval(interval);
  }, [portfolioSymbols, userEmail]);

  useEffect(() => {
    const query = searchTerm.trim();
    if (!query || !userEmail) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setIsSuggestionsLoading(true);
        const results = await searchSymbols(query);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSuggestionsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchTerm, userEmail]);

  const addTicker = async (symbolInput: string) => {
    const symbol = symbolInput.trim().toUpperCase();
    if (!symbol) return;

    try {
      setError('');
      const symbols = await addTickerToPortfolio(symbol);
      setPortfolioSymbols(symbols);
      await refreshStocks(symbols);
      setSearchTerm('');
      setSuggestions([]);
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : 'Unable to add ticker.');
    }
  };

  const filteredStocks = filterStocks(stocks, searchTerm);
  const featuredTape = (stocks.length ? stocks : []).slice(0, 8);

  const openStockDetail = (stock: Stock) => {
    setSelectedStock(stock);
    const url = new URL(window.location.href);
    url.searchParams.set('stock', stock.symbol);
    window.history.pushState({ stock: stock.symbol }, '', url.toString());
  };

  const closeStockDetail = () => {
    const url = new URL(window.location.href);
    if (!url.searchParams.get('stock')) {
      setSelectedStock(null);
      return;
    }
    window.history.back();
  };

  const handleAuth = async (mode: 'login' | 'register') => {
    try {
      setError('');
      const payload = mode === 'login'
        ? await login(loginEmail, loginPassword)
        : await register(loginEmail, loginPassword);
      setStoredToken(payload.token);
      setUserEmail(payload.user.email);
      localStorage.setItem(LAST_EMAIL_KEY, payload.user.email);
      const symbols = await getPortfolio();
      let localSymbols: string[] = [];
      try {
        const parsed = JSON.parse(localStorage.getItem(getLocalPortfolioKey(payload.user.email)) || '[]');
        localSymbols = Array.isArray(parsed) ? parsed : [];
      } catch {
        localSymbols = [];
      }
      const mergedSymbols = Array.from(new Set([...(symbols || []), ...localSymbols]));

      if (mergedSymbols.length > symbols.length) {
        for (const symbol of mergedSymbols) {
          if (!symbols.includes(symbol)) {
            await addTickerToPortfolio(symbol);
          }
        }
      }

      setPortfolioSymbols(mergedSymbols);
      await refreshStocks(mergedSymbols);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Authentication failed.');
    }
  };

  useEffect(() => {
    if (!userEmail) return;

    const syncFromLocation = () => {
      const symbol = getStockSymbolFromUrl();
      if (!symbol) {
        setSelectedStock(null);
        return;
      }

      const located = stocks.find((item) => item.symbol === symbol);
      if (located) {
        setSelectedStock(located);
        return;
      }

      setSelectedStock({
        symbol,
        name: symbol,
        exchange: '',
        price: 0,
        change: 0,
        changePercent: 0,
        prediction: 50,
        volume: 'N/A',
        marketCap: 'N/A',
        pe: 0,
      });
    };

    syncFromLocation();
    window.addEventListener('popstate', syncFromLocation);
    return () => window.removeEventListener('popstate', syncFromLocation);
  }, [userEmail, stocks]);

  if (!userEmail) {
    return (
      <div className="min-h-screen grid place-items-center p-4 bg-gradient-to-b from-background via-background to-primary/10">
        <div className="w-full max-w-md border rounded-2xl p-6 bg-card/95 backdrop-blur space-y-3 shadow-xl">
          <h1 className="text-xl font-semibold">Sign in to StockPredict</h1>
          <Input placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
          <Input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={() => handleAuth('login')}>Login</Button>
            <Button variant="outline" onClick={() => handleAuth('register')}>Register</Button>
          </div>
          <p className="text-xs text-muted-foreground">Your ticker dashboard is saved per account on the backend store.</p>
        </div>
      </div>
    );
  }

  if (selectedStock) {
    const latest = stocks.find((stock) => stock.symbol === selectedStock.symbol) || selectedStock;
    return <StockDetail stock={latest} onBack={closeStockDetail} />;
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-primary" />
              <h1 className="text-xl sm:text-2xl font-bold">StockPredict</h1>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-1 cursor-help">
                <Activity className="h-4 w-4 animate-pulse text-green-500" />
                Live Market
              </Badge>
              <Button variant="outline" size="sm" onClick={() => { clearStoredToken(); setLoginEmail(userEmail); setUserEmail(''); }}>Logout</Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Signed in as {userEmail}</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <section className="lux-grid-bg relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-8 mb-6">
          <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-fuchsia-500/20 blur-2xl animate-pulse" />
          <div className="absolute -bottom-10 left-10 h-32 w-32 rounded-full bg-blue-400/20 blur-2xl animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_45%)]" />
          <div className="relative grid gap-4 sm:grid-cols-2 items-center">
            <div className="space-y-2">
              <Badge className="bg-white/15 text-white border-white/30"><Sparkles className="h-3 w-3 mr-1" />Premium Live Intelligence</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold leading-tight">Professional-grade financial intelligence, designed for confident decisions.</h2>
              <p className="text-sm text-slate-200">Track your personal watchlist, review chart trends, and validate prices with trusted real-market sources.</p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="secondary" className="bg-white/10 text-white border-white/30"><Rocket className="h-3 w-3 mr-1" /> Fast live dashboard</Badge>
                <Badge variant="secondary" className="bg-white/10 text-white border-white/30"><BarChart4 className="h-3 w-3 mr-1" /> Actionable visuals</Badge>
                <Badge variant="secondary" className="bg-white/10 text-white border-white/30"><Shield className="h-3 w-3 mr-1" /> Transparent sourcing</Badge>
              </div>
            </div>
            <div className="grid gap-2 sm:justify-items-end">
              <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 w-full sm:max-w-xs animate-pulse">
                <p className="text-xs text-slate-200">Last refresh market date</p>
                <p className="font-semibold">{lastRefreshDate || 'Loading...'}</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 w-full sm:max-w-xs">
                <p className="text-xs text-slate-200 flex items-center gap-1"><Gem className="h-3 w-3" /> Data confidence</p>
                <p className="font-semibold">{usedCacheOnly ? 'Weekend cached snapshot' : 'Live + cached blend'}</p>
              </div>
            </div>
          </div>

          <div className="relative mt-5 overflow-hidden rounded-xl border border-white/20 bg-black/20">
            <div className="marquee-track py-2">
              <div className="marquee-content">
                {(featuredTape.length ? featuredTape : [
                  { symbol: 'AAPL', price: 0, changePercent: 0 },
                  { symbol: 'MSFT', price: 0, changePercent: 0 },
                  { symbol: 'NVDA', price: 0, changePercent: 0 },
                ]).map((item, idx) => (
                  <span key={`${item.symbol}-${idx}`} className="mx-4 inline-flex items-center gap-2 text-xs sm:text-sm">
                    <strong>{item.symbol}</strong>
                    <span>{item.price ? `$${item.price.toFixed(2)}` : 'Loading…'}</span>
                    <span className={item.changePercent >= 0 ? 'text-emerald-300' : 'text-red-300'}>
                      {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                    </span>
                  </span>
                ))}
              </div>
              <div className="marquee-content" aria-hidden="true">
                {(featuredTape.length ? featuredTape : [
                  { symbol: 'AAPL', price: 0, changePercent: 0 },
                  { symbol: 'MSFT', price: 0, changePercent: 0 },
                  { symbol: 'NVDA', price: 0, changePercent: 0 },
                ]).map((item, idx) => (
                  <span key={`${item.symbol}-clone-${idx}`} className="mx-4 inline-flex items-center gap-2 text-xs sm:text-sm">
                    <strong>{item.symbol}</strong>
                    <span>{item.price ? `$${item.price.toFixed(2)}` : 'Loading…'}</span>
                    <span className={item.changePercent >= 0 ? 'text-emerald-300' : 'text-red-300'}>
                      {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <MarketSummary stocks={stocks} marketSummary={marketSummary} />

        <div className="mb-2 text-xs text-muted-foreground">
          Last refresh market date: <span className="font-medium">{lastRefreshDate || 'N/A'}</span>
          {usedCacheOnly && <span className="ml-2">(served from cached snapshot)</span>}
        </div>

        <div className="mb-6">
          <StockSearch
            value={searchTerm}
            onQueryChange={setSearchTerm}
            onAddTicker={() => addTicker(searchTerm)}
            onSelectSuggestion={(suggestion) => addTicker(suggestion.symbol)}
            suggestions={suggestions}
            isLoading={isSuggestionsLoading}
          />
        </div>

        <div className="rounded-lg border border-border bg-card p-4 mb-6 text-sm">
          <div className="flex items-start gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Data transparency</p>
              <p className="text-muted-foreground mt-1">
                Live quote, profile, and news data are fetched from Finnhub on the backend.
                Weekend requests are served from saved snapshots whenever available.
              </p>
              <div className="flex flex-wrap gap-3 mt-2">
                <a href="https://finnhub.io/docs/api" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">
                  Finnhub API docs <ExternalLink className="h-3 w-3" />
                </a>
                <a href="https://finance.yahoo.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">
                  Yahoo Finance <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
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
            <StockCard key={stock.symbol} stock={stock} onClick={() => openStockDetail(stock)} />
          ))}
        </div>
      </div>
    </div>
  );
}
