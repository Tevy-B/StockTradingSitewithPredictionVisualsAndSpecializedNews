import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BarChart3, Activity, TrendingUp, TrendingDown, Info, ExternalLink, ShieldCheck } from 'lucide-react';
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
import {
  Stock, getPredictionLabel, getPredictionColor,
  getAnalystConsensusColor, generateChartData, METRIC_TOOLTIPS, StockExtendedDetail
} from '../utils/stockUtils';
import { stockDetailsMap } from '../constants/mockData';
import { getStockDetail, getStockNews, StockNewsItem } from '../services/api';

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
  const [chartRange, setChartRange] = useState(30);
  const [news, setNews] = useState<StockNewsItem[]>([]);
  const [liveDetail, setLiveDetail] = useState<StockExtendedDetail | null>(null);

  useEffect(() => {
    getStockNews(stock.symbol).then(setNews).catch(() => setNews([]));
    getStockDetail(stock.symbol).then(setLiveDetail).catch(() => setLiveDetail(null));
  }, [stock.symbol]);

  const predictionLabel = getPredictionLabel(stock.prediction);
  const predictionColor = getPredictionColor(stock.prediction);
  const detail = liveDetail ?? stockDetailsMap[stock.symbol];

  const chartData = useMemo(() => generateChartData(stock.price, chartRange), [chartRange, stock.price]);
  const chartMin = Math.min(...chartData.map(d => d.price)) * 0.99;
  const chartMax = Math.max(...chartData.map(d => d.price)) * 1.01;
  const chartStart = chartData[0]?.price ?? stock.price;
  const chartEnd = chartData[chartData.length - 1]?.price ?? stock.price;
  const chartIsUp = chartEnd >= chartStart;

  const analystConsensus = detail?.analystConsensus;
  const analystColor = analystConsensus ? getAnalystConsensusColor(analystConsensus.consensus) : '';

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{stock.symbol}</h1>
                {stock.exchange && <Badge variant="outline">{stock.exchange}</Badge>}
                {analystConsensus && <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${analystColor}`}>Analyst: {analystConsensus.consensus}</span>}
              </div>
              <p className="text-muted-foreground text-sm">{stock.name}</p>
              <div className="text-xs mt-1 flex gap-3 flex-wrap">
                <a href={`https://finance.yahoo.com/quote/${stock.symbol}`} target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1">Yahoo Finance <ExternalLink className="h-3 w-3" /></a>
                <a href={`https://www.google.com/finance/quote/${stock.symbol}:${stock.exchange?.includes('NASDAQ') ? 'NASDAQ' : 'NYSE'}`} target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1">Google Finance <ExternalLink className="h-3 w-3" /></a>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1 shrink-0">
              <Activity className="h-4 w-4 text-green-500" />
              Live
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <StockPriceOverview stock={stock} detail={detail} />
          <Card className="border-2 border-primary/10">
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />AI Prediction Score</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-1">
                <div className="text-5xl font-bold tabular-nums">{stock.prediction.toFixed(0)}</div>
                <div className="text-sm text-muted-foreground">out of 100</div>
                <Badge className={`${predictionColor} text-white text-sm px-3 py-1`}>{predictionLabel}</Badge>
              </div>
              <PredictionMeter value={stock.prediction} />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="chart" className="space-y-4">
          <TabsList className="flex flex-wrap gap-1 h-auto">
            <TabsTrigger value="chart">📈 Chart</TabsTrigger>
            <TabsTrigger value="financials">🏦 Financials</TabsTrigger>
            <TabsTrigger value="analysts">🏛️ Analyst Ratings</TabsTrigger>
            <TabsTrigger value="news">📰 News</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="flex items-center gap-2">Price Chart <Badge variant="outline" className="text-xs">Modelled</Badge></CardTitle>
                  <div className="flex gap-1">{chartRanges.map(r => <button key={r.label} onClick={() => setChartRange(r.days)} className={`px-2 py-1 rounded text-xs font-medium ${chartRange === r.days ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{r.label}</button>)}</div>
                </div>
                <div className="flex items-center gap-3 text-sm flex-wrap">
                  <span className="text-muted-foreground">Start: ${chartStart.toFixed(2)}</span>
                  <span className={`flex items-center gap-1 font-medium ${chartIsUp ? 'text-green-600' : 'text-red-600'}`}>
                    {chartIsUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {(((chartEnd - chartStart) / chartStart) * 100).toFixed(2)}%
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="time" tick={{ fontSize: 10 }} /><YAxis domain={[chartMin, chartMax]} tick={{ fontSize: 10 }} width={55} /><RechartsTooltip content={<CustomChartTooltip />} /><ReferenceLine y={chartStart} strokeDasharray="4 4" /><Area type="monotone" dataKey="price" stroke={chartIsUp ? '#22c55e' : '#ef4444'} strokeWidth={2} dot={false} /></AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financials"><Card><CardHeader><CardTitle>Balance Sheet & Financials</CardTitle></CardHeader><CardContent>{detail ? <BalanceSheet detail={detail} stockPrice={stock.price} symbol={stock.symbol} /> : <p className="text-muted-foreground text-sm">Financial data not available for this stock.</p>}</CardContent></Card></TabsContent>

          <TabsContent value="analysts"><Card><CardHeader><CardTitle className="flex items-center gap-2">Wall Street Analyst Ratings <Tooltip><TooltipTrigger asChild><Info className="h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent side="right" className="max-w-xs text-xs">{METRIC_TOOLTIPS.analystConsensus}</TooltipContent></Tooltip></CardTitle></CardHeader><CardContent>{detail?.analystConsensus ? <AnalystRatings consensus={detail.analystConsensus} currentPrice={stock.price} symbol={stock.symbol} /> : <p className="text-muted-foreground text-sm">Analyst data not available for this stock.</p>}</CardContent></Card></TabsContent>

          <TabsContent value="news" className="space-y-3">
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-3 pb-3 text-sm flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-green-600 mt-0.5" />
                <span>News and quote data are sourced from Finnhub. Cross-check using Yahoo/Google links above.</span>
              </CardContent>
            </Card>
            {news.map((item) => (
              <Card key={item.id}><CardContent className="pt-4 pb-4"><h3 className="font-medium text-sm">{item.headline}</h3><p className="text-sm text-muted-foreground mt-1">{item.summary}</p><div className="text-xs text-muted-foreground mt-2 flex items-center gap-3"><span>{item.source}</span><a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">Open <ExternalLink className="h-3 w-3" /></a></div></CardContent></Card>
            ))}
            {news.length === 0 && <p className="text-sm text-muted-foreground">No recent news found for {stock.symbol}.</p>}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
