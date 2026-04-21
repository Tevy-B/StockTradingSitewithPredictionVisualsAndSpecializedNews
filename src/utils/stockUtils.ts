export interface Stock {
  symbol: string;
  name: string;
  exchange?: string;
  price: number;
  change: number;
  changePercent: number;
  prediction: number;
  volume: string;
  marketCap: string;
  pe: number;
}

export interface BalanceSheetEntry {
  period: string;
  revenue: number;        // in billions USD
  netIncome: number;      // in billions USD
  totalAssets: number;    // in billions USD
  totalLiabilities: number; // in billions USD
  shareholdersEquity: number; // in billions USD
  operatingCashFlow: number;  // in billions USD
}

export interface AnalystRating {
  firm: string;
  rating: string;
  priceTarget: number;
  date: string;
  action: string;
}

export interface AnalystConsensus {
  consensus: string;
  averagePriceTarget: number;
  highTarget: number;
  lowTarget: number;
  buyCount: number;
  holdCount: number;
  sellCount: number;
  ratings: AnalystRating[];
}

export interface StockExtendedDetail {
  beta: number;
  eps: number;
  dividend: number;
  high52w: number;
  low52w: number;
  balanceSheet: {
    annual: BalanceSheetEntry[];
    quarterly: BalanceSheetEntry[];
  };
  analystConsensus: AnalystConsensus;

  profile?: {
    exchange?: string;
    industry?: string;
    country?: string;
    ipo?: string;
    website?: string;
    logo?: string;
  };
  sourceMeta?: {
    provider: string;
    fetchedAt: string;
  };
}

export const getPredictionLabel = (prediction: number): string => {
  if (prediction >= 75) return 'Strong Buy';
  if (prediction >= 60) return 'Buy';
  if (prediction <= 25) return 'Strong Sell';
  if (prediction <= 40) return 'Sell';
  return 'Hold';
};

export const getPredictionColor = (prediction: number): string => {
  if (prediction >= 75) return 'bg-green-600';
  if (prediction >= 60) return 'bg-green-500';
  if (prediction <= 25) return 'bg-red-600';
  if (prediction <= 40) return 'bg-red-500';
  return 'bg-yellow-500';
};

export const getAnalystConsensusColor = (consensus: string): string => {
  switch (consensus) {
    case 'Strong Buy': return 'text-green-600 bg-green-50 border-green-200';
    case 'Buy': return 'text-green-500 bg-green-50 border-green-200';
    case 'Hold': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'Sell': return 'text-red-500 bg-red-50 border-red-200';
    case 'Strong Sell': return 'text-red-600 bg-red-50 border-red-200';
    default: return 'text-muted-foreground bg-muted border-border';
  }
};

export const getRatingColor = (rating: string): string => {
  const bullish = ['Strong Buy', 'Buy', 'Outperform', 'Overweight', 'Add'];
  const bearish = ['Sell', 'Strong Sell', 'Underperform', 'Underweight', 'Reduce'];
  if (bullish.some(r => rating.toLowerCase().includes(r.toLowerCase()))) return 'text-green-600';
  if (bearish.some(r => rating.toLowerCase().includes(r.toLowerCase()))) return 'text-red-600';
  return 'text-yellow-600';
};

export const simulateStockUpdate = (stock: Stock): Stock => ({
  ...stock,
  price: Math.max(1, stock.price + (Math.random() - 0.5) * 2),
  change: (Math.random() - 0.5) * 10,
  changePercent: (Math.random() - 0.5) * 5,
  prediction: Math.max(0, Math.min(100, stock.prediction + (Math.random() - 0.5) * 5))
});

export const generateChartData = (basePrice: number, length: number = 30) => {
  let price = basePrice * 0.85;
  return Array.from({ length }, (_, i) => {
    price = price + (Math.random() - 0.48) * (basePrice * 0.015);
    const open = price;
    const close = open + (Math.random() - 0.5) * (basePrice * 0.01);
    return {
      time: i + 1,
      price: Math.max(basePrice * 0.7, price),
      open,
      close,
      high: Math.max(open, close) + Math.random() * (basePrice * 0.005),
      low: Math.min(open, close) - Math.random() * (basePrice * 0.005),
    };
  });
};

export const filterStocks = (stocks: Stock[], searchTerm: string): Stock[] => {
  return stocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

// Metric tooltip content
export const METRIC_TOOLTIPS: Record<string, string> = {
  volume: 'The total number of shares traded during the current session. Higher volume typically indicates stronger investor interest and validates price movements.',
  marketCap: 'Market Capitalization is the total market value of all outstanding shares (Price × Shares Outstanding). It categorizes companies as small-cap (<$2B), mid-cap ($2B–$10B), large-cap ($10B–$200B), or mega-cap (>$200B).',
  pe: 'Price-to-Earnings Ratio: compares the stock\'s price to its annual earnings per share. A higher P/E may indicate growth expectations; a lower P/E may suggest undervaluation. Industry averages vary significantly.',
  eps: 'Earnings Per Share: the company\'s net profit divided by the number of outstanding shares. Higher EPS generally indicates greater profitability.',
  beta: 'Beta measures a stock\'s volatility relative to the S&P 500. Beta > 1 means more volatile than the market; Beta < 1 means less volatile. Useful for gauging risk.',
  dividend: 'Annual dividend payment per share. Represents income returned to shareholders. Expressed as dividend yield (%) relative to stock price.',
  high52w: 'The highest price at which the stock traded in the past 52 weeks (one year). Useful for understanding price range and momentum.',
  low52w: 'The lowest price at which the stock traded in the past 52 weeks (one year). Useful for understanding support levels.',
  rsi: 'Relative Strength Index (0–100): measures momentum. Above 70 suggests the stock may be overbought (due for a pullback); below 30 suggests oversold (potential buying opportunity).',
  macd: 'Moving Average Convergence Divergence: shows the relationship between two moving averages. A positive MACD indicates upward momentum; negative indicates downward momentum.',
  prediction: 'AI Prediction Score (0–100): combines technical signals (RSI, MACD, moving averages), analyst sentiment, and fundamental strength. Scores above 60 favor buying; below 40 favor selling.',
  analystConsensus: 'Wall Street consensus rating aggregated from major investment banks and research firms including Goldman Sachs, Morgan Stanley, JP Morgan, and others. Based on publicly available analyst research reports.',
  priceTarget: 'The average price target represents where analysts collectively expect the stock to trade over the next 12 months based on their earnings models and valuation frameworks.',
  revenue: 'Total revenue (top-line) reported by the company for the period. Includes all income from products and services before any expenses are deducted.',
  netIncome: 'Net Income (bottom-line): total revenue minus all expenses, taxes, and costs. Represents the company\'s actual profit for the period.',
  totalAssets: 'Everything a company owns that has economic value — including cash, investments, property, equipment, and intangible assets.',
  totalLiabilities: 'All financial obligations the company owes to creditors, including short-term debt, long-term debt, accounts payable, and other liabilities.',
  shareholdersEquity: 'Also called "book value" — the residual value after subtracting total liabilities from total assets. Represents shareholders\' ownership stake.',
  operatingCashFlow: 'Cash generated from normal business operations, excluding investments and financing activities. Considered a cleaner measure of profitability than net income.',
};
