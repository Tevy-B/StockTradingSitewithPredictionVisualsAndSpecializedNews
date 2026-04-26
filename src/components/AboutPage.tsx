import React from 'react';
import { Badge } from './ui/badge';
import { Globe2, Landmark, Rocket, Shield } from 'lucide-react';

export function AboutPage() {
  return (
    <section className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm space-y-4">
      <Badge className="w-fit"><Landmark className="h-3 w-3 mr-1" /> About StockPredict</Badge>
      <h2 className="text-2xl sm:text-3xl font-bold">A luxurious, transparent financial intelligence workspace.</h2>
      <p className="text-muted-foreground">
        StockPredict combines live market feeds, explainable prediction logic, and trusted source references into one premium interface.
        Designed for usability on desktop and mobile, it helps you monitor, compare, and investigate stocks with confidence.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <div className="rounded-xl border p-4"><p className="font-semibold mb-1 flex items-center gap-1"><Rocket className="h-4 w-4" /> Performance</p><p className="text-muted-foreground">Fast cached endpoints and weekend snapshots reduce delays and API stress.</p></div>
        <div className="rounded-xl border p-4"><p className="font-semibold mb-1 flex items-center gap-1"><Shield className="h-4 w-4" /> Trust</p><p className="text-muted-foreground">Server-side keys, source transparency, and external verification links.</p></div>
        <div className="rounded-xl border p-4"><p className="font-semibold mb-1 flex items-center gap-1"><Globe2 className="h-4 w-4" /> Coverage</p><p className="text-muted-foreground">Works across many tickers with fallback market data support.</p></div>
      </div>
    </section>
  );
}
