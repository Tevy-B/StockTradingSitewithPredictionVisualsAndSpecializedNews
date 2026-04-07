import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, BarChart3, Activity, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { PredictionMeter } from './PredictionMeter';
import { StockPriceOverview } from './StockPriceOverview';
import { BalanceSheet } from './BalanceSheet';
import { AnalystRatings } from './AnalystRatings';
import { InfoTooltip } from './InfoTooltip';
import {
  Stock, simulateStockUpdate, getPredictionLabel, getPredictionColor,
  getAnalystConsensusColor, generateChartData, METRIC_TOOLTIPS
} from '../utils/stockUtils';
import { mockNews, stockDetailsMap } from '../constants/mockData';

interface StockDetailProps {
  stock: Stock;
  onBack: () => void;
}

const chartRanges = [
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
];

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const val = payload[0].value as number;
    return (
      <div className="bg-card border border-border rounded-lg p-2.5 shadow-lg text-xs">
        <p className="text-muted-foreground mb-1">Day {label}</p>
        <p className="font-semibold text-foreground">${val.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export function StockDetail({ stock, onBack }: StockDetailProps) {
  const [currentStock, setCurrentStock] = useState(stock);
  const [chartRange, setChartRange] = useState(30);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStock(prev => simulateStockUpdate(prev));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const predictionLabel = getPredictionLabel(currentStock.prediction);
  const predictionColor = getPredictionColor(currentStock.prediction);
  const detail = stockDetailsMap[currentStock.symbol];

  const chartData = useMemo(() => generateChartData(currentStock.price, chartRange), [chartRange, currentStock.symbol]);
  const chartMin = Math.min(...chartData.map(d => d.price)) * 0.99;
  const chartMax = Math.max(...chartData.map(d => d.price)) * 1.01;
  const chartStart = chartData[0]?.price ?? currentStock.price;
  const chartEnd = chartData[chartData.length - 1]?.price ?? currentStock.price;
  const chartIsUp = chartEnd >= chartStart;

  const analystConsensus = detail?.analystConsensus;
  const analystColor = analystConsensus ? getAnalystConsensusColor(analystConsensus.consensus) : '';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{currentStock.symbol}</h1>
                {analystConsensus && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded border cursor-help ${analystColor}`}>
                        Analyst: {analystConsensus.consensus}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs max-w-xs">
                      Wall Street consensus from {analystConsensus.buyCount + analystConsensus.holdCount + analystConsensus.sellCount} analysts.
                      Avg. price target: ${analystConsensus.averagePriceTarget}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              <p className="text-muted-foreground text-sm">{currentStock.name}</p>
            </div>
            <Badge variant="secondary" className="gap-1 shrink-0">
              <Activity className="h-4 w-4 animate-pulse text-green-500" />
              Live
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Price Summary Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <StockPriceOverview stock={currentStock} detail={detail} />

          {/* Prediction Card */}
          <Card className="border-2 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <InfoTooltip content={METRIC_TOOLTIPS.prediction}>
                  AI Prediction Score
                </InfoTooltip>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Score */}
              <div className="text-center space-y-1">
                <div className="text-5xl font-bold tabular-nums">
                  {currentStock.prediction.toFixed(0)}
                </div>
                <div className="text-sm text-muted-foreground">out of 100</div>
                <Badge className={`${predictionColor} text-white text-sm px-3 py-1`}>
                  {predictionLabel}
                </Badge>
              </div>

              <PredictionMeter value={currentStock.prediction} />

              {/* Signal breakdown */}
              <div className="space-y-2 text-xs border-t border-border pt-3">
                <p className="text-muted-foreground font-medium mb-2">Signal Inputs</p>
                {[
                  { label: 'Technical Signals', value: Math.round(currentStock.prediction * 0.4 + (Math.random() * 5)), tooltip: 'RSI, MACD, moving averages, Bollinger Bands, and momentum indicators' },
                  { label: 'Analyst Sentiment', value: analystConsensus ? Math.round(((analystConsensus.buyCount / (analystConsensus.buyCount + analystConsensus.holdCount + analystConsensus.sellCount)) * 100)) : 50, tooltip: 'Wall Street analyst buy/hold/sell consensus weighted by firm reputation' },
                  { label: 'Fundamental Strength', value: Math.round(currentStock.prediction * 0.35 + 15), tooltip: 'Revenue growth, profit margins, cash flow, and balance sheet health' },
                ].map(sig => (
                  <div key={sig.label} className="flex items-center gap-2">
                    <div className="flex-1">
                      <InfoTooltip content={sig.tooltip}>
                        <span className="text-muted-foreground">{sig.label}</span>
                      </InfoTooltip>
                    </div>
                    <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          sig.value >= 60 ? 'bg-green-500' : sig.value <= 40 ? 'bg-red-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${sig.value}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-medium text-foreground">{sig.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="chart" className="space-y-4">
          <TabsList className="flex flex-wrap gap-1 h-auto">
            <TabsTrigger value="chart">📈 Chart</TabsTrigger>
            <TabsTrigger value="financials">🏦 Financials</TabsTrigger>
            <TabsTrigger value="analysts">🏛️ Analyst Ratings</TabsTrigger>
            <TabsTrigger value="technical">🔬 Technical</TabsTrigger>
            <TabsTrigger value="news">📰 News</TabsTrigger>
          </TabsList>

          {/* ── Chart Tab ── */}
          <TabsContent value="chart" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="flex items-center gap-2">
                    Price Chart
                    <Badge variant="outline" className="text-xs">Simulated</Badge>
                  </CardTitle>
                  <div className="flex gap-1">
                    {chartRanges.map(r => (
                      <button
                        key={r.label}
                        onClick={() => setChartRange(r.days)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          chartRange === r.days
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm flex-wrap">
                  <span className="text-muted-foreground">Start: ${chartStart.toFixed(2)}</span>
                  <span className={`flex items-center gap-1 font-medium ${chartIsUp ? 'text-green-600' : 'text-red-600'}`}>
                    {chartIsUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {chartIsUp ? '+' : ''}
                    {(((chartEnd - chartStart) / chartStart) * 100).toFixed(2)}% over period
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartIsUp ? '#22c55e' : '#ef4444'} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={chartIsUp ? '#22c55e' : '#ef4444'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 10 }}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(v) => `D${v}`}
                    />
                    <YAxis
                      domain={[chartMin, chartMax]}
                      tick={{ fontSize: 10 }}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(v) => `$${v.toFixed(0)}`}
                      width={55}
                    />
                    <RechartsTooltip content={<CustomChartTooltip />} />
                    <ReferenceLine
                      y={chartStart}
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="4 4"
                      label={{ value: 'Start', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={chartIsUp ? '#22c55e' : '#ef4444'}
                      strokeWidth={2}
                      fill="url(#colorPrice)"
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Simulated price movement — for demonstration only. Not based on real market data.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Financials Tab ── */}
          <TabsContent value="financials">
            <Card>
              <CardHeader>
                <CardTitle>Balance Sheet & Financials</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Key financial data for {currentStock.name}. All figures in USD billions.
                </p>
              </CardHeader>
              <CardContent>
                {detail ? (
                  <BalanceSheet detail={detail} stockPrice={currentStock.price} symbol={currentStock.symbol} />
                ) : (
                  <p className="text-muted-foreground text-sm">Financial data not available for this stock.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Analyst Ratings Tab ── */}
          <TabsContent value="analysts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Wall Street Analyst Ratings
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs text-xs">
                      {METRIC_TOOLTIPS.analystConsensus}
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Aggregated ratings from major investment banks and research institutions
                </p>
              </CardHeader>
              <CardContent>
                {detail?.analystConsensus ? (
                  <AnalystRatings
                    consensus={detail.analystConsensus}
                    currentPrice={currentStock.price}
                    symbol={currentStock.symbol}
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">Analyst data not available for this stock.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Technical Analysis Tab ── */}
          <TabsContent value="technical" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Momentum Indicators</CardTitle>
                  <p className="text-xs text-muted-foreground">Short-term price momentum signals</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        label: 'RSI (14)',
                        value: (35 + currentStock.prediction * 0.3).toFixed(1),
                        tooltipKey: 'rsi',
                        unit: '',
                        color: (35 + currentStock.prediction * 0.3) > 70 ? 'text-red-500' : (35 + currentStock.prediction * 0.3) < 30 ? 'text-green-600' : 'text-foreground'
                      },
                      {
                        label: 'MACD',
                        value: (currentStock.change * 0.23).toFixed(2),
                        tooltipKey: 'macd',
                        unit: '',
                        color: currentStock.change >= 0 ? 'text-green-600' : 'text-red-500'
                      },
                      {
                        label: 'Stochastic %K',
                        value: (currentStock.prediction * 0.8 + 10).toFixed(1),
                        tooltipKey: 'rsi',
                        unit: '',
                        color: 'text-foreground'
                      },
                      {
                        label: 'Williams %R',
                        value: (-100 + currentStock.prediction).toFixed(1),
                        tooltipKey: 'rsi',
                        unit: '',
                        color: 'text-foreground'
                      },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-border/40 last:border-0">
                        <InfoTooltip content={METRIC_TOOLTIPS[item.tooltipKey] || item.label} side="right">
                          <span className="text-sm text-muted-foreground">{item.label}</span>
                        </InfoTooltip>
                        <span className={`font-medium text-sm ${item.color}`}>{item.value}{item.unit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Moving Averages</CardTitle>
                  <p className="text-xs text-muted-foreground">Trend-following price averages</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: 'SMA (20)', value: currentStock.price * 0.97, desc: '20-day Simple Moving Average — short-term trend indicator' },
                      { label: 'SMA (50)', value: currentStock.price * 0.95, desc: '50-day Simple Moving Average — medium-term trend' },
                      { label: 'SMA (200)', value: currentStock.price * 0.88, desc: '200-day Simple Moving Average — long-term trend benchmark' },
                      { label: 'EMA (12)', value: currentStock.price * 0.98, desc: '12-day Exponential Moving Average — reacts faster to recent price changes' },
                    ].map(item => {
                      const aboveMa = currentStock.price > item.value;
                      return (
                        <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-border/40 last:border-0">
                          <InfoTooltip content={item.desc} side="right">
                            <span className="text-sm text-muted-foreground">{item.label}</span>
                          </InfoTooltip>
                          <div className="text-right">
                            <div className="font-medium text-sm">${item.value.toFixed(2)}</div>
                            <div className={`text-xs ${aboveMa ? 'text-green-600' : 'text-red-500'}`}>
                              {aboveMa ? '▲ Price above' : '▼ Price below'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Support & Resistance</CardTitle>
                  <p className="text-xs text-muted-foreground">Key price levels to watch</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: 'Strong Resistance', value: currentStock.price * 1.12, color: 'text-red-500', desc: 'Price level where strong selling pressure historically emerges' },
                      { label: 'Resistance', value: currentStock.price * 1.06, color: 'text-red-400', desc: 'Near-term ceiling where the stock may face selling pressure' },
                      { label: 'Current Price', value: currentStock.price, color: 'text-primary font-bold', desc: 'Current trading price' },
                      { label: 'Support', value: currentStock.price * 0.94, color: 'text-green-500', desc: 'Near-term floor where buying interest may emerge' },
                      { label: 'Strong Support', value: currentStock.price * 0.87, color: 'text-green-600', desc: 'Key long-term support where strong buying interest historically appears' },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-border/40 last:border-0">
                        <InfoTooltip content={item.desc} side="right">
                          <span className={`text-sm ${item.label === 'Current Price' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                            {item.label}
                          </span>
                        </InfoTooltip>
                        <span className={`font-medium text-sm ${item.color}`}>${item.value.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Price Targets</CardTitle>
                  <p className="text-xs text-muted-foreground">Near and long-term price projections</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: '1-Week Target', value: currentStock.price * (1 + (currentStock.changePercent / 100) * 5), color: '' },
                      { label: '1-Month Target', value: detail?.analystConsensus?.averagePriceTarget ?? currentStock.price * 1.08, color: 'text-blue-500', source: 'analyst avg' },
                      { label: 'Bull Case', value: detail?.analystConsensus?.highTarget ?? currentStock.price * 1.20, color: 'text-green-600', source: 'analyst high' },
                      { label: 'Bear Case', value: detail?.analystConsensus?.lowTarget ?? currentStock.price * 0.85, color: 'text-red-500', source: 'analyst low' },
                    ].map(item => {
                      const diff = ((item.value - currentStock.price) / currentStock.price * 100);
                      return (
                        <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-border/40 last:border-0">
                          <div>
                            <span className="text-sm text-muted-foreground">{item.label}</span>
                            {item.source && <span className="text-xs text-muted-foreground ml-1">({item.source})</span>}
                          </div>
                          <div className="text-right">
                            <div className={`font-medium text-sm ${item.color}`}>${item.value.toFixed(2)}</div>
                            <div className={`text-xs ${diff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                              {diff >= 0 ? '+' : ''}{diff.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── News Tab ── */}
          <TabsContent value="news" className="space-y-3">
            {mockNews.map((news, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                      news.sentiment === 'positive' ? 'bg-green-500' :
                      news.sentiment === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <h3 className="font-medium text-sm">
                          {currentStock.name}: {news.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-xs shrink-0 ${
                            news.sentiment === 'positive' ? 'border-green-200 text-green-700 bg-green-50' :
                            news.sentiment === 'negative' ? 'border-red-200 text-red-700 bg-red-50' :
                            'border-yellow-200 text-yellow-700 bg-yellow-50'
                          }`}
                        >
                          {news.sentiment.charAt(0).toUpperCase() + news.sentiment.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{news.summary}</p>
                      <div className="text-xs text-muted-foreground mt-2">{news.time}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
