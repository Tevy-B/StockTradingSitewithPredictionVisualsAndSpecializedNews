import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface StockSearchProps {
  onSearch: (query: string) => void;
  suggestions?: Array<{
    symbol: string;
    name: string;
  }>;
}

export function StockSearch({ onSearch, suggestions = [] }: StockSearchProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.length > 0);
    onSearch(value);
  };

  const handleSuggestionClick = (suggestion: { symbol: string; name: string }) => {
    setQuery(suggestion.symbol);
    setShowSuggestions(false);
    onSearch(suggestion.symbol);
  };

  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    onSearch('');
  };

  const filteredSuggestions = suggestions.filter(
    item => 
      item.symbol.toLowerCase().includes(query.toLowerCase()) ||
      item.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search stocks by symbol or name..."
          value={query}
          onChange={handleInputChange}
          className="pl-9 pr-10"
          onFocus={() => setShowSuggestions(query.length > 0)}
        />
        {query && (
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

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 border-border">
          <CardContent className="p-2">
            {filteredSuggestions.map((suggestion) => (
              <div
                key={suggestion.symbol}
                className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div>
                  <div className="font-medium">{suggestion.symbol}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {suggestion.name}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}