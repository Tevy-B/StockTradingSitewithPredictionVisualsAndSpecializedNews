import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Layers, Droplets } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';
import { BalanceSheetEntry, METRIC_TOOLTIPS } from '../utils/stockUtils';
import { StockExtendedDetail } from '../utils/stockUtils';

interface BalanceSheetProps {
  detail: StockExtendedDetail;
  stockPrice: number;
  symbol: string;
}

const formatBillions = (val: number) => {
  if (Math.abs(val) >= 1000) return `$${(val / 1000).toFixed(1)}T`;
  return `$${val.toFixed(1)}B`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
        <p className="font-medium mb-2 text-foreground">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-foreground">{formatBillions(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  tooltipKey: string;
  trend?: number;
  highlight?: 'positive' | 'negative' | 'neutral';
}

function MetricCard({ icon, label, value, tooltipKey, trend, highlight }: MetricCardProps) {
  const highlightClass =
    highlight === 'positive' ? 'text-green-600' :
    highlight === 'negative' ? 'text-red-600' :
    'text-foreground';

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="flex-1 min-w-0">
        <InfoTooltip content={METRIC_TOOLTIPS[tooltipKey] || label}>
          <p className="text-xs text-muted-foreground truncate">{label}</p>
        </InfoTooltip>
        <p className={`font-semibold truncate ${highlightClass}`}>{value}</p>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{trend >= 0 ? '+' : ''}{trend.toFixed(1)}% YoY</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function BalanceSheet({ detail, stockPrice, symbol }: BalanceSheetProps) {
  const [period, setPeriod] = useState<'annual' | 'quarterly'>('annual');
  const data = period === 'annual' ? detail.balanceSheet.annual : detail.balanceSheet.quarterly;
  const latest = data[data.length - 1];
  const prior = data[data.length - 2];

  const revTrend = prior ? ((latest.revenue - prior.revenue) / Math.abs(prior.revenue)) * 100 : undefined;
  const netTrend = prior && prior.netIncome !== 0
    ? ((latest.netIncome - prior.netIncome) / Math.abs(prior.netIncome)) * 100
    : undefined;
  const ocfTrend = prior ? ((latest.operatingCashFlow - prior.operatingCashFlow) / Math.abs(prior.operatingCashFlow)) * 100 : undefined;

  const debtToEquity = latest.shareholdersEquity !== 0
    ? (latest.totalLiabilities / latest.shareholdersEquity).toFixed(2)
    : 'N/A';
  const netMargin = latest.revenue !== 0
    ? ((latest.netIncome / latest.revenue) * 100).toFixed(1)
    : 'N/A';
  const assetTurnover = latest.totalAssets !== 0
    ? (latest.revenue / latest.totalAssets).toFixed(2)
    : 'N/A';

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Financial Statements</h3>
          <p className="text-xs text-muted-foreground">All figures in USD billions. Source: company filings (simulated).</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('annual')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              period === 'annual'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Annual
          </button>
          <button
            onClick={() => setPeriod('quarterly')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              period === 'quarterly'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Quarterly
          </button>
        </div>
      </div>

      {/* Key metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <MetricCard
          icon={<DollarSign className="h-4 w-4" />}
          label="Total Revenue"
          value={formatBillions(latest.revenue)}
          tooltipKey="revenue"
          trend={revTrend}
          highlight={revTrend !== undefined && revTrend >= 0 ? 'positive' : 'negative'}
        />
        <MetricCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Net Income"
          value={formatBillions(latest.netIncome)}
          tooltipKey="netIncome"
          trend={netTrend}
          highlight={latest.netIncome >= 0 ? 'positive' : 'negative'}
        />
        <MetricCard
          icon={<Layers className="h-4 w-4" />}
          label="Total Assets"
          value={formatBillions(latest.totalAssets)}
          tooltipKey="totalAssets"
        />
        <MetricCard
          icon={<Layers className="h-4 w-4" />}
          label="Total Liabilities"
          value={formatBillions(latest.totalLiabilities)}
          tooltipKey="totalLiabilities"
        />
        <MetricCard
          icon={<BarChart3 className="h-4 w-4" />}
          label="Shareholders' Equity"
          value={formatBillions(latest.shareholdersEquity)}
          tooltipKey="shareholdersEquity"
          highlight={latest.shareholdersEquity >= 0 ? 'positive' : 'negative'}
        />
        <MetricCard
          icon={<Droplets className="h-4 w-4" />}
          label="Operating Cash Flow"
          value={formatBillions(latest.operatingCashFlow)}
          tooltipKey="operatingCashFlow"
          trend={ocfTrend}
          highlight={latest.operatingCashFlow >= 0 ? 'positive' : 'negative'}
        />
        <MetricCard
          icon={<BarChart3 className="h-4 w-4" />}
          label="Debt-to-Equity"
          value={`${debtToEquity}x`}
          tooltipKey="totalLiabilities"
          highlight={parseFloat(debtToEquity as string) > 2 ? 'negative' : 'positive'}
        />
        <MetricCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Net Profit Margin"
          value={`${netMargin}%`}
          tooltipKey="netIncome"
          highlight={parseFloat(netMargin as string) > 15 ? 'positive' : parseFloat(netMargin as string) > 5 ? 'neutral' : 'negative'}
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="income" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full sm:w-auto">
          <TabsTrigger value="income">Revenue & Earnings</TabsTrigger>
          <TabsTrigger value="balance">Assets & Equity</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="income">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Revenue vs. Net Income
                <Badge variant="outline" className="text-xs ml-2">in USD billions</Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Revenue is the total income before expenses. Net Income is what remains after all costs and taxes.
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tickFormatter={(v) => `$${v}B`} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.85} />
                  <Bar dataKey="netIncome" name="Net Income" fill="#22c55e" radius={[4, 4, 0, 0]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Assets vs. Liabilities vs. Equity
                <Badge variant="outline" className="text-xs ml-2">in USD billions</Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Assets = Liabilities + Shareholders' Equity. A growing equity base signals financial health.
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tickFormatter={(v) => `$${v}B`} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="totalAssets" name="Total Assets" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.85} />
                  <Bar dataKey="totalLiabilities" name="Total Liabilities" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.75} />
                  <Bar dataKey="shareholdersEquity" name="Shareholders' Equity" fill="#22c55e" radius={[4, 4, 0, 0]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                Operating Cash Flow Trend
                <Badge variant="outline" className="text-xs ml-2">in USD billions</Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Operating cash flow shows how much cash the company generates from its core business — often more reliable than net income.
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tickFormatter={(v) => `$${v}B`} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="operatingCashFlow"
                    name="Operating Cash Flow"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="netIncome"
                    name="Net Income"
                    stroke="#22c55e"
                    strokeWidth={2.5}
                    strokeDasharray="5 5"
                    dot={{ r: 4, fill: '#22c55e' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground border-t border-border pt-3">
        ⚠️ Financial data is simulated for demonstration purposes and does not represent actual company financials.
        Always consult official SEC filings, Bloomberg, or Reuters for investment decisions.
      </p>
    </div>
  );
}
