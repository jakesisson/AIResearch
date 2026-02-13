import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Loader2, Lightbulb, Search, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutocompleteSuggestion {
  text: string;
  description: string;
  category: string;
  confidence: number;
  intent: string;
}

interface AutocompleteResult {
  suggestions: AutocompleteSuggestion[];
  predictedCommand: string;
  confidence: number;
}

interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Autocomplete({ 
  value, 
  onChange, 
  onSelect, 
  placeholder = "اكتب أمرك هنا...", 
  className,
  disabled = false 
}: AutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AutocompleteResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentCommands, setRecentCommands] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Fetch autocomplete suggestions
  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.trim().length < 2) {
      setSuggestions(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      });

      if (response.ok) {
        const result: AutocompleteResult = await response.json();
        setSuggestions(result);
      }
    } catch (error) {
      console.error('Autocomplete fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced input handler
  const handleInputChange = useCallback((newValue: string) => {
    onChange(newValue);
    setSelectedIndex(-1);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  }, [onChange, fetchSuggestions]);

  // Handle input focus
  const handleFocus = () => {
    setShowSuggestions(true);
    if (value.trim().length >= 2 && !suggestions) {
      fetchSuggestions(value);
    }
  };

  // Handle input blur (with delay to allow suggestion clicks)
  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 150);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!suggestions || suggestions.suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.suggestions.length - 1
        );
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          handleSuggestionSelect(suggestions.suggestions[selectedIndex].text);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      case 'Tab':
        if (selectedIndex >= 0) {
          e.preventDefault();
          handleSuggestionSelect(suggestions.suggestions[selectedIndex].text);
        } else if (suggestions.predictedCommand) {
          e.preventDefault();
          handleSuggestionSelect(suggestions.predictedCommand);
        }
        break;
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    onChange(suggestion);
    onSelect(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'اتصالات': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'بيانات': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'تقارير': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'جدولة': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'تسويق': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'تحليل': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'إدارة': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  // Get confidence indicator
  const getConfidenceIndicator = (confidence: number) => {
    if (confidence >= 0.8) return '🎯';
    if (confidence >= 0.6) return '👍';
    if (confidence >= 0.4) return '👌';
    return '🤔';
  };

  // Fetch recent commands on mount
  useEffect(() => {
    // In a real implementation, you would fetch recent commands from the backend
    // For now, we'll use a mock
    setRecentCommands([
      'أرسل واتساب لجميع العملاء',
      'اعرض إحصائيات النظام',
      'أنشئ تقرير المبيعات'
    ]);
  }, []);

  const hasSuggestions = suggestions && suggestions.suggestions.length > 0;
  const showPopup = showSuggestions && (hasSuggestions || value.trim().length < 2);

  return (
    <div className="relative w-full">
      {/* Input Field */}
      <div className="relative">
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full min-h-[60px] max-h-[120px] resize-none rounded-lg border border-border bg-background px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50",
            "text-right direction-rtl",
            className
          )}
          rows={2}
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute left-3 top-3">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Search icon when not loading */}
        {!isLoading && (
          <div className="absolute left-3 top-3">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Suggestions Popup */}
      {showPopup && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-2 max-h-96 overflow-y-auto border border-border bg-background shadow-lg">
          {/* No input or loading state */}
          {value.trim().length < 2 && !isLoading && (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
                <Lightbulb className="h-4 w-4" />
                أوامر شائعة
              </div>
              <div className="space-y-2">
                {recentCommands.map((command, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-right h-auto p-3"
                    onClick={() => handleSuggestionSelect(command)}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{command}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {hasSuggestions && (
            <div className="p-2">
              {/* Predicted command highlight */}
              {suggestions.predictedCommand && suggestions.confidence > 0.7 && (
                <div className="mb-2 p-2 bg-primary/10 rounded-md border-r-2 border-primary">
                  <div className="text-xs text-muted-foreground mb-1">الأمر المتوقع:</div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-right h-auto p-2 font-medium"
                    onClick={() => handleSuggestionSelect(suggestions.predictedCommand)}
                  >
                    {suggestions.predictedCommand}
                  </Button>
                </div>
              )}

              {/* Suggestions list */}
              <div className="space-y-1">
                {suggestions.suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-right h-auto p-3 transition-colors",
                      selectedIndex === index && "bg-accent"
                    )}
                    onClick={() => handleSuggestionSelect(suggestion.text)}
                  >
                    <div className="flex items-start justify-between w-full gap-3">
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs">
                          {getConfidenceIndicator(suggestion.confidence)}
                        </span>
                        <Badge 
                          variant="secondary" 
                          className={cn("text-xs", getCategoryColor(suggestion.category))}
                        >
                          {suggestion.category}
                        </Badge>
                      </div>
                      <div className="flex-1 text-right">
                        <div className="font-medium text-sm mb-1">{suggestion.text}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {suggestion.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* No suggestions found */}
          {!isLoading && value.trim().length >= 2 && !hasSuggestions && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              لم يتم العثور على اقتراحات. جرب كتابة أمر مختلف.
            </div>
          )}
        </Card>
      )}
    </div>
  );
}