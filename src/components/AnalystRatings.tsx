import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Users, Target, TrendingUp, TrendingDown, Award, ExternalLink } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';
import { AnalystConsensus, getRatingColor, getAnalystConsensusColor, METRIC_TOOLTIPS } from '../utils/stockUtils';

interface AnalystRatingsProps {
  consensus: AnalystConsensus;
  currentPrice: number;
  symbol: string;
}

function RatingBar({ buyCount, holdCount, sellCount }: { buyCount: number; holdCount: number; sellCount: number }) {
  const total = buyCount + holdCount + sellCount;
  const buyPct = (buyCount / total) * 100;
  const holdPct = (holdCount / total) * 100;
  const sellPct = (sellCount / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex rounded-full overflow-hidden h-3">
        <div
          className="bg-green-500 transition-all duration-700"
          style={{ width: `${buyPct}%` }}
          title={`Buy: ${buyCount} analysts`}
        />
        <div
          className="bg-yellow-500 transition-all duration-700"
          style={{ width: `${holdPct}%` }}
          title={`Hold: ${holdCount} analysts`}
        />
        <div
          className="bg-red-500 transition-all duration-700"
          style={{ width: `${sellPct}%` }}
          title={`Sell: ${sellCount} analysts`}
        />
      </div>
      <div className="flex justify-between text-xs">
        <span className="flex items-center gap-1 text-green-600">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          Buy ({buyCount})
        </span>
        <span className="flex items-center gap-1 text-yellow-600">
          <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
          Hold ({holdCount})
        </span>
        <span className="flex items-center gap-1 text-red-600">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          Sell ({sellCount})
        </span>
      </div>
    </div>
  );
}

function getActionBadge(action: string) {
  const colors: Record<string, string> = {
    'Upgraded': 'bg-green-100 text-green-700 border-green-200',
    'Downgraded': 'bg-red-100 text-red-700 border-red-200',
    'Initiated': 'bg-blue-100 text-blue-700 border-blue-200',
    'Reiterated': 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return colors[action] || 'bg-muted text-muted-foreground';
}

export function AnalystRatings({ consensus, currentPrice, symbol }: AnalystRatingsProps) {
  const upside = ((consensus.averagePriceTarget - currentPrice) / currentPrice) * 100;
  const isUpside = upside >= 0;
  const totalAnalysts = consensus.buyCount + consensus.holdCount + consensus.sellCount;
  const consensusColors = getAnalystConsensusColor(consensus.consensus);

  return (
    <div className="space-y-6">
      {/* Source note */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-700">
        <Award className="h-4 w-4 mt-0.5 shrink-0" />
        <span>
          Analyst ratings aggregated from major Wall Street research firms including Goldman Sachs, Morgan Stanley,
          JP Morgan, Bank of America, Barclays, and others. Ratings reflect publicly available analyst research reports.
          <strong> For informational purposes only — not financial advice.</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Consensus Card */}
        <Card className="border-2 border-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              <InfoTooltip content={METRIC_TOOLTIPS.analystConsensus}>
                Wall Street Consensus
              </InfoTooltip>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-lg font-bold px-3 py-1 rounded-lg border ${consensusColors}`}>
                {consensus.consensus}
              </span>
              <span className="text-xs text-muted-foreground">{totalAnalysts} analysts</span>
            </div>
            <RatingBar
              buyCount={consensus.buyCount}
              holdCount={consensus.holdCount}
              sellCount={consensus.sellCount}
            />
          </CardContent>
        </Card>

        {/* Price Target Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              <InfoTooltip content={METRIC_TOOLTIPS.priceTarget}>
                12-Month Price Target
              </InfoTooltip>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-end gap-2">
              <div className="text-2xl font-bold">${consensus.averagePriceTarget}</div>
              <div className={`flex items-center gap-1 text-sm mb-0.5 ${isUpside ? 'text-green-600' : 'text-red-600'}`}>
                {isUpside ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {isUpside ? '+' : ''}{upside.toFixed(1)}% potential
              </div>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs">High Estimate</span>
                <span className="font-medium text-green-600">${consensus.highTarget}</span>
              </div>
              {/* Range bar */}
              <div className="relative h-2 bg-muted rounded-full my-2">
                <div className="absolute inset-y-0 bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 rounded-full" style={{ left: '0%', right: '0%' }} />
                {/* Current price marker */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-4 bg-primary rounded-sm shadow-md border border-background"
                  style={{
                    left: `${Math.max(0, Math.min(100, ((currentPrice - consensus.lowTarget) / (consensus.highTarget - consensus.lowTarget)) * 100))}%`,
                    transform: 'translateX(-50%) translateY(-50%)'
                  }}
                  title={`Current: $${currentPrice.toFixed(2)}`}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs">Low Estimate</span>
                <span className="font-medium text-red-500">${consensus.lowTarget}</span>
              </div>
              <div className="flex justify-between items-center border-t border-border pt-1.5 mt-1">
                <span className="text-muted-foreground text-xs">Current Price</span>
                <span className="font-medium">${currentPrice.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Ratings Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Award className="h-4 w-4" />
            Latest Analyst Ratings
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Individual ratings from major investment banks and research institutions
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-xs font-medium text-muted-foreground">Firm</th>
                  <th className="text-left py-2 pr-4 text-xs font-medium text-muted-foreground">Rating</th>
                  <th className="text-right py-2 pr-4 text-xs font-medium text-muted-foreground">Price Target</th>
                  <th className="text-right py-2 pr-4 text-xs font-medium text-muted-foreground hidden sm:table-cell">Action</th>
                  <th className="text-right py-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {consensus.ratings.map((rating, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-2.5 pr-4">
                      <span className="font-medium text-foreground">{rating.firm}</span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className={`font-medium ${getRatingColor(rating.rating)}`}>
                        {rating.rating}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-right">
                      <span className="font-medium">${rating.priceTarget}</span>
                      <span className={`ml-2 text-xs ${
                        rating.priceTarget > currentPrice ? 'text-green-600' : 'text-red-500'
                      }`}>
                        ({rating.priceTarget > currentPrice ? '+' : ''}
                        {(((rating.priceTarget - currentPrice) / currentPrice) * 100).toFixed(0)}%)
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-right hidden sm:table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getActionBadge(rating.action)}`}>
                        {rating.action}
                      </span>
                    </td>
                    <td className="py-2.5 text-right hidden sm:table-cell">
                      <span className="text-xs text-muted-foreground">{rating.date}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
            <ExternalLink className="h-3 w-3" />
            <span>
              Ratings are simulated based on publicly available consensus data patterns from Bloomberg, Reuters, and FactSet research aggregators.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
