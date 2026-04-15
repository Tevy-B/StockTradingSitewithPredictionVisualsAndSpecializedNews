import React, { useMemo, useState } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export interface StockSuggestion {
  symbol: string;
  name: string;
  exchange?: string;
  type?: string;
}

interface StockSearchProps {
  value: string;
  onQueryChange: (query: string) => void;
  onSelectSuggestion: (suggestion: StockSuggestion) => void;
  onAddTicker: () => void;
  suggestions?: StockSuggestion[];
  isLoading?: boolean;
}

export function StockSearch({
  value,
  onQueryChange,
  onSelectSuggestion,
  onAddTicker,
  suggestions = [],
  isLoading = false,
}: StockSearchProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = useMemo(() => {
    return suggestions.slice(0, 8);
  }, [suggestions]);

  const clearSearch = () => {
    setShowSuggestions(false);
    onQueryChange('');
  };

  return (
    <div className="relative w-full">
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search any ticker or company (e.g. Eli Lilly, LLY, Sony)..."
            value={value}
            onChange={(e) => {
              const nextValue = e.target.value;
              onQueryChange(nextValue);
              setShowSuggestions(nextValue.trim().length > 0);
            }}
            className="pl-9 pr-10"
            onFocus={() => setShowSuggestions(value.trim().length > 0)}
          />
          {value && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-8 w-8 p-0"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button onClick={onAddTicker} className="gap-2">
          <Plus className="h-4 w-4" />
          Add ticker
        </Button>
      </div>

      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 border-border shadow-lg">
          <CardContent className="p-2">
            {isLoading && <div className="text-sm text-muted-foreground p-2">Searching Finnhub…</div>}
            {!isLoading && filteredSuggestions.length === 0 && (
              <div className="text-sm text-muted-foreground p-2">No ticker matches found.</div>
            )}
            {!isLoading && filteredSuggestions.map((suggestion) => (
              <button
                key={`${suggestion.symbol}-${suggestion.exchange || ''}`}
                className="w-full text-left flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                onClick={() => {
                  onQueryChange(suggestion.symbol);
                  onSelectSuggestion(suggestion);
                  setShowSuggestions(false);
                }}
              >
                <div>
                  <div className="font-medium">{suggestion.symbol} — {suggestion.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {suggestion.exchange || 'Unknown exchange'}{suggestion.type ? ` • ${suggestion.type}` : ''}
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
