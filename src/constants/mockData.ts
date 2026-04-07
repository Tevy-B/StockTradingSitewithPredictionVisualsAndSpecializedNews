import { BalanceSheetEntry, AnalystConsensus, StockExtendedDetail } from '../utils/stockUtils';

export const mockStocks = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 195.84,
    change: 2.45,
    changePercent: 1.27,
    prediction: 75,
    volume: '45.2M',
    marketCap: '3.1T',
    pe: 29.1
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.37,
    change: -1.23,
    changePercent: -0.86,
    prediction: 68,
    volume: '28.4M',
    marketCap: '1.8T',
    pe: 22.5
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 428.89,
    change: 5.67,
    changePercent: 1.34,
    prediction: 82,
    volume: '21.1M',
    marketCap: '3.2T',
    pe: 31.2
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 248.42,
    change: -8.15,
    changePercent: -3.18,
    prediction: 35,
    volume: '67.8M',
    marketCap: '789B',
    pe: 42.8
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 178.25,
    change: 3.42,
    changePercent: 1.96,
    prediction: 71,
    volume: '33.9M',
    marketCap: '1.9T',
    pe: 35.7
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 875.30,
    change: 15.67,
    changePercent: 1.82,
    prediction: 89,
    volume: '41.2M',
    marketCap: '2.1T',
    pe: 55.4
  }
];

export const mockNews = [
  {
    title: "Company Reports Strong Q4 Earnings",
    summary: "Company beats analyst expectations with strong revenue growth and improved margins, driven by robust demand across all product segments.",
    time: "2 hours ago",
    sentiment: "positive"
  },
  {
    title: "Analysts Upgrade Price Target",
    summary: "Multiple Wall Street firms raise price targets following recent product announcements and better-than-expected guidance for the coming quarter.",
    time: "5 hours ago",
    sentiment: "positive"
  },
  {
    title: "Market Volatility Impacts Stock",
    summary: "Stock experiences increased volatility amid broader market uncertainty and rising interest rate concerns, though fundamentals remain intact.",
    time: "1 day ago",
    sentiment: "neutral"
  },
  {
    title: "New Product Launch Draws Attention",
    summary: "The company unveiled its latest product lineup at an industry event, drawing positive reactions from investors and industry analysts.",
    time: "2 days ago",
    sentiment: "positive"
  },
  {
    title: "Supply Chain Pressures Ease",
    summary: "Improved supply chain conditions are expected to boost margins in the coming quarters, according to management commentary.",
    time: "3 days ago",
    sentiment: "positive"
  }
];

export const initialMarketSummary = {
  totalValue: 12847.65,
  dailyChange: 156.42,
  dailyChangePercent: 1.23
};

// ─── Extended stock details (balance sheets + analyst data) ───────────────────

export const stockDetailsMap: Record<string, StockExtendedDetail> = {
  AAPL: {
    beta: 1.28,
    eps: 6.73,
    dividend: 0.96,
    high52w: 219.38,
    low52w: 164.08,
    balanceSheet: {
      annual: [
        { period: 'FY2020', revenue: 274.5, netIncome: 57.4, totalAssets: 323.9, totalLiabilities: 258.5, shareholdersEquity: 65.4, operatingCashFlow: 80.7 },
        { period: 'FY2021', revenue: 365.8, netIncome: 94.7, totalAssets: 351.0, totalLiabilities: 287.9, shareholdersEquity: 63.1, operatingCashFlow: 104.0 },
        { period: 'FY2022', revenue: 394.3, netIncome: 99.8, totalAssets: 352.8, totalLiabilities: 302.1, shareholdersEquity: 50.7, operatingCashFlow: 122.2 },
        { period: 'FY2023', revenue: 383.3, netIncome: 97.0, totalAssets: 352.6, totalLiabilities: 290.4, shareholdersEquity: 62.2, operatingCashFlow: 110.5 },
      ],
      quarterly: [
        { period: 'Q1 2023', revenue: 117.2, netIncome: 30.0, totalAssets: 346.7, totalLiabilities: 284.0, shareholdersEquity: 62.7, operatingCashFlow: 34.0 },
        { period: 'Q2 2023', revenue: 94.8, netIncome: 24.2, totalAssets: 335.0, totalLiabilities: 270.8, shareholdersEquity: 64.2, operatingCashFlow: 28.9 },
        { period: 'Q3 2023', revenue: 81.8, netIncome: 19.9, totalAssets: 335.4, totalLiabilities: 274.8, shareholdersEquity: 60.6, operatingCashFlow: 21.2 },
        { period: 'Q4 2023', revenue: 89.5, netIncome: 22.9, totalAssets: 352.6, totalLiabilities: 290.4, shareholdersEquity: 62.2, operatingCashFlow: 26.4 },
      ],
    },
    analystConsensus: {
      consensus: 'Buy',
      averagePriceTarget: 220,
      highTarget: 250,
      lowTarget: 150,
      buyCount: 28,
      holdCount: 8,
      sellCount: 2,
      ratings: [
        { firm: 'Goldman Sachs', rating: 'Buy', priceTarget: 250, date: 'Mar 2024', action: 'Reiterated' },
        { firm: 'Morgan Stanley', rating: 'Overweight', priceTarget: 230, date: 'Mar 2024', action: 'Reiterated' },
        { firm: 'JP Morgan', rating: 'Overweight', priceTarget: 225, date: 'Feb 2024', action: 'Upgraded' },
        { firm: 'Bank of America', rating: 'Buy', priceTarget: 240, date: 'Feb 2024', action: 'Reiterated' },
        { firm: 'Barclays', rating: 'Equal Weight', priceTarget: 185, date: 'Jan 2024', action: 'Reiterated' },
        { firm: 'Citigroup', rating: 'Buy', priceTarget: 235, date: 'Jan 2024', action: 'Initiated' },
        { firm: 'UBS', rating: 'Buy', priceTarget: 245, date: 'Dec 2023', action: 'Upgraded' },
        { firm: 'Wells Fargo', rating: 'Overweight', priceTarget: 220, date: 'Dec 2023', action: 'Reiterated' },
      ],
    },
  },

  GOOGL: {
    beta: 1.05,
    eps: 5.80,
    dividend: 0,
    high52w: 153.78,
    low52w: 115.83,
    balanceSheet: {
      annual: [
        { period: 'FY2020', revenue: 182.5, netIncome: 40.3, totalAssets: 319.6, totalLiabilities: 97.1, shareholdersEquity: 222.5, operatingCashFlow: 65.1 },
        { period: 'FY2021', revenue: 257.6, netIncome: 76.0, totalAssets: 359.3, totalLiabilities: 107.6, shareholdersEquity: 251.6, operatingCashFlow: 91.7 },
        { period: 'FY2022', revenue: 282.8, netIncome: 60.0, totalAssets: 359.3, totalLiabilities: 110.2, shareholdersEquity: 256.1, operatingCashFlow: 91.5 },
        { period: 'FY2023', revenue: 307.4, netIncome: 73.8, totalAssets: 402.4, totalLiabilities: 119.1, shareholdersEquity: 283.4, operatingCashFlow: 101.7 },
      ],
      quarterly: [
        { period: 'Q1 2023', revenue: 69.8, netIncome: 15.1, totalAssets: 376.1, totalLiabilities: 110.2, shareholdersEquity: 265.9, operatingCashFlow: 24.0 },
        { period: 'Q2 2023', revenue: 74.6, netIncome: 18.4, totalAssets: 381.6, totalLiabilities: 112.8, shareholdersEquity: 268.8, operatingCashFlow: 24.5 },
        { period: 'Q3 2023', revenue: 76.7, netIncome: 19.7, totalAssets: 389.0, totalLiabilities: 113.7, shareholdersEquity: 275.3, operatingCashFlow: 26.5 },
        { period: 'Q4 2023', revenue: 86.3, netIncome: 20.6, totalAssets: 402.4, totalLiabilities: 119.1, shareholdersEquity: 283.4, operatingCashFlow: 26.7 },
      ],
    },
    analystConsensus: {
      consensus: 'Buy',
      averagePriceTarget: 165,
      highTarget: 210,
      lowTarget: 120,
      buyCount: 33,
      holdCount: 10,
      sellCount: 2,
      ratings: [
        { firm: 'Goldman Sachs', rating: 'Buy', priceTarget: 200, date: 'Mar 2024', action: 'Reiterated' },
        { firm: 'Morgan Stanley', rating: 'Overweight', priceTarget: 175, date: 'Mar 2024', action: 'Reiterated' },
        { firm: 'JP Morgan', rating: 'Overweight', priceTarget: 170, date: 'Feb 2024', action: 'Reiterated' },
        { firm: 'Bank of America', rating: 'Buy', priceTarget: 180, date: 'Feb 2024', action: 'Upgraded' },
        { firm: 'Barclays', rating: 'Overweight', priceTarget: 160, date: 'Jan 2024', action: 'Initiated' },
        { firm: 'Citigroup', rating: 'Buy', priceTarget: 185, date: 'Jan 2024', action: 'Reiterated' },
        { firm: 'Deutsche Bank', rating: 'Buy', priceTarget: 155, date: 'Dec 2023', action: 'Reiterated' },
        { firm: 'Bernstein', rating: 'Market Perform', priceTarget: 130, date: 'Dec 2023', action: 'Reiterated' },
      ],
    },
  },

  MSFT: {
    beta: 0.90,
    eps: 11.45,
    dividend: 3.00,
    high52w: 468.35,
    low52w: 309.45,
    balanceSheet: {
      annual: [
        { period: 'FY2020', revenue: 143.0, netIncome: 44.3, totalAssets: 301.3, totalLiabilities: 183.0, shareholdersEquity: 118.3, operatingCashFlow: 60.7 },
        { period: 'FY2021', revenue: 168.1, netIncome: 61.3, totalAssets: 333.8, totalLiabilities: 191.8, shareholdersEquity: 141.9, operatingCashFlow: 76.7 },
        { period: 'FY2022', revenue: 198.3, netIncome: 72.7, totalAssets: 364.8, totalLiabilities: 198.3, shareholdersEquity: 166.5, operatingCashFlow: 89.0 },
        { period: 'FY2023', revenue: 227.6, netIncome: 72.4, totalAssets: 411.9, totalLiabilities: 205.8, shareholdersEquity: 206.2, operatingCashFlow: 87.6 },
      ],
      quarterly: [
        { period: 'Q1 FY24', revenue: 56.5, netIncome: 22.3, totalAssets: 406.9, totalLiabilities: 203.5, shareholdersEquity: 203.4, operatingCashFlow: 30.6 },
        { period: 'Q2 FY24', revenue: 62.0, netIncome: 21.9, totalAssets: 411.9, totalLiabilities: 205.8, shareholdersEquity: 206.2, operatingCashFlow: 18.8 },
        { period: 'Q3 FY24', revenue: 61.9, netIncome: 21.4, totalAssets: 415.2, totalLiabilities: 208.1, shareholdersEquity: 207.1, operatingCashFlow: 31.9 },
        { period: 'Q4 FY24', revenue: 64.7, netIncome: 24.7, totalAssets: 422.2, totalLiabilities: 211.0, shareholdersEquity: 211.2, operatingCashFlow: 31.9 },
      ],
    },
    analystConsensus: {
      consensus: 'Strong Buy',
      averagePriceTarget: 480,
      highTarget: 550,
      lowTarget: 370,
      buyCount: 35,
      holdCount: 3,
      sellCount: 0,
      ratings: [
        { firm: 'Goldman Sachs', rating: 'Buy', priceTarget: 520, date: 'Mar 2024', action: 'Upgraded' },
        { firm: 'Morgan Stanley', rating: 'Overweight', priceTarget: 500, date: 'Mar 2024', action: 'Reiterated' },
        { firm: 'JP Morgan', rating: 'Overweight', priceTarget: 490, date: 'Feb 2024', action: 'Reiterated' },
        { firm: 'Bank of America', rating: 'Buy', priceTarget: 510, date: 'Feb 2024', action: 'Reiterated' },
        { firm: 'Barclays', rating: 'Overweight', priceTarget: 470, date: 'Jan 2024', action: 'Upgraded' },
        { firm: 'Citigroup', rating: 'Buy', priceTarget: 485, date: 'Jan 2024', action: 'Reiterated' },
        { firm: 'UBS', rating: 'Buy', priceTarget: 480, date: 'Dec 2023', action: 'Initiated' },
        { firm: 'Wedbush Securities', rating: 'Outperform', priceTarget: 550, date: 'Dec 2023', action: 'Reiterated' },
      ],
    },
  },

  TSLA: {
    beta: 2.01,
    eps: 4.30,
    dividend: 0,
    high52w: 299.29,
    low52w: 138.80,
    balanceSheet: {
      annual: [
        { period: 'FY2020', revenue: 31.5, netIncome: 0.7, totalAssets: 52.1, totalLiabilities: 28.2, shareholdersEquity: 22.2, operatingCashFlow: 5.9 },
        { period: 'FY2021', revenue: 53.8, netIncome: 5.5, totalAssets: 62.1, totalLiabilities: 30.2, shareholdersEquity: 30.2, operatingCashFlow: 11.5 },
        { period: 'FY2022', revenue: 81.5, netIncome: 12.6, totalAssets: 82.3, totalLiabilities: 36.4, shareholdersEquity: 44.7, operatingCashFlow: 14.5 },
        { period: 'FY2023', revenue: 96.8, netIncome: 15.0, totalAssets: 106.6, totalLiabilities: 43.0, shareholdersEquity: 62.6, operatingCashFlow: 13.3 },
      ],
      quarterly: [
        { period: 'Q1 2023', revenue: 23.3, netIncome: 2.5, totalAssets: 86.8, totalLiabilities: 37.1, shareholdersEquity: 49.7, operatingCashFlow: 2.5 },
        { period: 'Q2 2023', revenue: 24.9, netIncome: 2.7, totalAssets: 90.6, totalLiabilities: 38.2, shareholdersEquity: 52.4, operatingCashFlow: 3.1 },
        { period: 'Q3 2023', revenue: 23.4, netIncome: 1.9, totalAssets: 93.0, totalLiabilities: 38.8, shareholdersEquity: 54.2, operatingCashFlow: 3.3 },
        { period: 'Q4 2023', revenue: 25.2, netIncome: 7.9, totalAssets: 106.6, totalLiabilities: 43.0, shareholdersEquity: 62.6, operatingCashFlow: 4.4 },
      ],
    },
    analystConsensus: {
      consensus: 'Hold',
      averagePriceTarget: 230,
      highTarget: 380,
      lowTarget: 85,
      buyCount: 18,
      holdCount: 14,
      sellCount: 8,
      ratings: [
        { firm: 'Morgan Stanley', rating: 'Overweight', priceTarget: 380, date: 'Mar 2024', action: 'Reiterated' },
        { firm: 'Wedbush Securities', rating: 'Outperform', priceTarget: 300, date: 'Mar 2024', action: 'Reiterated' },
        { firm: 'Goldman Sachs', rating: 'Neutral', priceTarget: 235, date: 'Feb 2024', action: 'Downgraded' },
        { firm: 'JP Morgan', rating: 'Underweight', priceTarget: 130, date: 'Feb 2024', action: 'Reiterated' },
        { firm: 'Bank of America', rating: 'Neutral', priceTarget: 220, date: 'Jan 2024', action: 'Reiterated' },
        { firm: 'Barclays', rating: 'Equal Weight', priceTarget: 200, date: 'Jan 2024', action: 'Downgraded' },
        { firm: 'Deutsche Bank', rating: 'Hold', priceTarget: 190, date: 'Dec 2023', action: 'Reiterated' },
        { firm: 'RBC Capital', rating: 'Sector Perform', priceTarget: 218, date: 'Dec 2023', action: 'Reiterated' },
      ],
    },
  },

  AMZN: {
    beta: 1.15,
    eps: 2.90,
    dividend: 0,
    high52w: 191.75,
    low52w: 118.35,
    balanceSheet: {
      annual: [
        { period: 'FY2020', revenue: 386.1, netIncome: 21.3, totalAssets: 321.2, totalLiabilities: 227.8, shareholdersEquity: 93.4, operatingCashFlow: 66.1 },
        { period: 'FY2021', revenue: 469.8, netIncome: 33.4, totalAssets: 420.5, totalLiabilities: 282.3, shareholdersEquity: 138.2, operatingCashFlow: 46.3 },
        { period: 'FY2022', revenue: 513.0, netIncome: -2.7, totalAssets: 462.7, totalLiabilities: 316.6, shareholdersEquity: 146.0, operatingCashFlow: -1.0 },
        { period: 'FY2023', revenue: 574.8, netIncome: 30.4, totalAssets: 527.9, totalLiabilities: 325.9, shareholdersEquity: 201.9, operatingCashFlow: 84.9 },
      ],
      quarterly: [
        { period: 'Q1 2023', revenue: 127.4, netIncome: 3.2, totalAssets: 462.7, totalLiabilities: 316.6, shareholdersEquity: 146.0, operatingCashFlow: 16.5 },
        { period: 'Q2 2023', revenue: 134.4, netIncome: 6.8, totalAssets: 477.3, totalLiabilities: 317.5, shareholdersEquity: 159.8, operatingCashFlow: 21.4 },
        { period: 'Q3 2023', revenue: 143.1, netIncome: 9.9, totalAssets: 502.4, totalLiabilities: 323.2, shareholdersEquity: 179.2, operatingCashFlow: 21.4 },
        { period: 'Q4 2023', revenue: 169.9, netIncome: 10.5, totalAssets: 527.9, totalLiabilities: 325.9, shareholdersEquity: 201.9, operatingCashFlow: 25.6 },
      ],
    },
    analystConsensus: {
      consensus: 'Strong Buy',
      averagePriceTarget: 210,
      highTarget: 260,
      lowTarget: 155,
      buyCount: 49,
      holdCount: 4,
      sellCount: 0,
      ratings: [
        { firm: 'Goldman Sachs', rating: 'Buy', priceTarget: 230, date: 'Mar 2024', action: 'Reiterated' },
        { firm: 'Morgan Stanley', rating: 'Overweight', priceTarget: 220, date: 'Mar 2024', action: 'Upgraded' },
        { firm: 'JP Morgan', rating: 'Overweight', priceTarget: 225, date: 'Feb 2024', action: 'Reiterated' },
        { firm: 'Bank of America', rating: 'Buy', priceTarget: 215, date: 'Feb 2024', action: 'Reiterated' },
        { firm: 'Citigroup', rating: 'Buy', priceTarget: 205, date: 'Jan 2024', action: 'Reiterated' },
        { firm: 'Barclays', rating: 'Overweight', priceTarget: 200, date: 'Jan 2024', action: 'Upgraded' },
        { firm: 'Piper Sandler', rating: 'Overweight', priceTarget: 240, date: 'Dec 2023', action: 'Initiated' },
        { firm: 'Oppenheimer', rating: 'Outperform', priceTarget: 235, date: 'Dec 2023', action: 'Reiterated' },
      ],
    },
  },

  NVDA: {
    beta: 1.68,
    eps: 16.85,
    dividend: 0.16,
    high52w: 974.00,
    low52w: 466.37,
    balanceSheet: {
      annual: [
        { period: 'FY2020', revenue: 16.7, netIncome: 4.3, totalAssets: 28.8, totalLiabilities: 11.9, shareholdersEquity: 16.9, operatingCashFlow: 5.4 },
        { period: 'FY2021', revenue: 26.9, netIncome: 9.8, totalAssets: 44.2, totalLiabilities: 17.6, shareholdersEquity: 26.6, operatingCashFlow: 9.1 },
        { period: 'FY2022', revenue: 26.9, netIncome: 4.4, totalAssets: 41.2, totalLiabilities: 17.0, shareholdersEquity: 22.1, operatingCashFlow: 5.1 },
        { period: 'FY2023', revenue: 60.9, netIncome: 29.8, totalAssets: 65.7, totalLiabilities: 22.1, shareholdersEquity: 42.9, operatingCashFlow: 28.1 },
      ],
      quarterly: [
        { period: 'Q1 FY24', revenue: 22.1, netIncome: 14.9, totalAssets: 65.7, totalLiabilities: 22.1, shareholdersEquity: 42.9, operatingCashFlow: 14.9 },
        { period: 'Q2 FY24', revenue: 18.1, netIncome: 6.2, totalAssets: 52.8, totalLiabilities: 19.8, shareholdersEquity: 33.0, operatingCashFlow: 5.9 },
        { period: 'Q3 FY24', revenue: 13.5, netIncome: 4.2, totalAssets: 45.9, totalLiabilities: 18.5, shareholdersEquity: 27.4, operatingCashFlow: 3.5 },
        { period: 'Q4 FY24', revenue: 22.1, netIncome: 12.3, totalAssets: 65.7, totalLiabilities: 22.1, shareholdersEquity: 43.0, operatingCashFlow: 11.5 },
      ],
    },
    analystConsensus: {
      consensus: 'Strong Buy',
      averagePriceTarget: 1000,
      highTarget: 1200,
      lowTarget: 700,
      buyCount: 38,
      holdCount: 4,
      sellCount: 0,
      ratings: [
        { firm: 'Goldman Sachs', rating: 'Buy', priceTarget: 1100, date: 'Mar 2024', action: 'Upgraded' },
        { firm: 'Morgan Stanley', rating: 'Overweight', priceTarget: 1000, date: 'Mar 2024', action: 'Reiterated' },
        { firm: 'JP Morgan', rating: 'Overweight', priceTarget: 1050, date: 'Feb 2024', action: 'Upgraded' },
        { firm: 'Bank of America', rating: 'Buy', priceTarget: 1100, date: 'Feb 2024', action: 'Upgraded' },
        { firm: 'Citigroup', rating: 'Buy', priceTarget: 1030, date: 'Jan 2024', action: 'Reiterated' },
        { firm: 'Barclays', rating: 'Overweight', priceTarget: 900, date: 'Jan 2024', action: 'Reiterated' },
        { firm: 'Wedbush Securities', rating: 'Outperform', priceTarget: 1200, date: 'Dec 2023', action: 'Upgraded' },
        { firm: 'Piper Sandler', rating: 'Overweight', priceTarget: 950, date: 'Dec 2023', action: 'Reiterated' },
      ],
    },
  },
};
