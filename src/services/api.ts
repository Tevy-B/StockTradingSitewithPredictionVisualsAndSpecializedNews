import { Stock } from '../utils/stockUtils';

interface PortfolioResponse {
  symbols: string[];
}

interface StocksResponse {
  stocks: Stock[];
}

export interface StockNewsItem {
  id: number;
  headline: string;
  source: string;
  summary: string;
  datetime: number;
  url: string;
}

interface StockNewsResponse {
  news: StockNewsItem[];
}

interface SearchResponse {
  results: Array<{ symbol: string; name: string }>;
}

const apiFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error || `Request failed: ${response.status}`);
  }

  return payload as T;
};

export const getPortfolio = async () => {
  const payload = await apiFetch<PortfolioResponse>('/api/portfolio');
  return payload.symbols;
};

export const addTickerToPortfolio = async (symbol: string) => {
  const payload = await apiFetch<PortfolioResponse>('/api/portfolio', {
    method: 'POST',
    body: JSON.stringify({ symbol }),
  });

  return payload.symbols;
};

export const getStocks = async (symbols: string[]) => {
  const payload = await apiFetch<StocksResponse>(`/api/stocks?symbols=${encodeURIComponent(symbols.join(','))}`);
  return payload.stocks;
};

export const searchSymbols = async (query: string) => {
  if (!query.trim()) return [];
  const payload = await apiFetch<SearchResponse>(`/api/stocks/search?q=${encodeURIComponent(query)}`);
  return payload.results;
};

export const getStockNews = async (symbol: string) => {
  const payload = await apiFetch<StockNewsResponse>(`/api/stocks/${encodeURIComponent(symbol)}/news`);
  return payload.news;
};
