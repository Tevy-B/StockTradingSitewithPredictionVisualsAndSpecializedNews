import { Stock, StockExtendedDetail } from '../utils/stockUtils';

interface PortfolioResponse { symbols: string[]; }
interface StocksResponse { stocks: Stock[]; lastRefreshDate: string; usedCacheOnly: boolean; }
interface StockDetailResponse { detail: StockExtendedDetail; }
interface SearchResponse { results: Array<{ symbol: string; name: string; exchange?: string; type?: string }>; }
interface StockNewsResponse { news: StockNewsItem[]; }
interface AuthResponse { token: string; user: { id: string; email: string }; }

export interface StockNewsItem {
  id: number;
  headline: string;
  source: string;
  summary: string;
  datetime: number;
  url: string;
}

const TOKEN_KEY = 'stockpredict_token';

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY) || '';
export const setStoredToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearStoredToken = () => localStorage.removeItem(TOKEN_KEY);

const apiFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const token = getStoredToken();
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error || `Request failed: ${response.status}`);
  return payload as T;
};

export const register = async (email: string, password: string) => apiFetch<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) });
export const login = async (email: string, password: string) => apiFetch<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const getMe = async () => apiFetch<{ user: { id: string; email: string } }>('/api/auth/me');

export const getPortfolio = async () => (await apiFetch<PortfolioResponse>('/api/portfolio')).symbols;
export const addTickerToPortfolio = async (symbol: string) => (await apiFetch<PortfolioResponse>('/api/portfolio', { method: 'POST', body: JSON.stringify({ symbol }) })).symbols;
export const getStocks = async (symbols: string[]) => apiFetch<StocksResponse>(`/api/stocks?symbols=${encodeURIComponent(symbols.join(','))}`);
export const searchSymbols = async (query: string) => query.trim() ? (await apiFetch<SearchResponse>(`/api/stocks/search?q=${encodeURIComponent(query)}`)).results : [];
export const getStockDetail = async (symbol: string) => (await apiFetch<StockDetailResponse>(`/api/stocks/${encodeURIComponent(symbol)}/detail`)).detail;
export const getStockNews = async (symbol: string) => (await apiFetch<StockNewsResponse>(`/api/stocks/${encodeURIComponent(symbol)}/news`)).news;
