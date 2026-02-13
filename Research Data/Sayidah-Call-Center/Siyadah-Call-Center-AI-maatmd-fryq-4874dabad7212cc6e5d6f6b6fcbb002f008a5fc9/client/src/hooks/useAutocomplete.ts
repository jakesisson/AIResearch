import { useState, useCallback, useRef } from 'react';

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

export function useAutocomplete() {
  const [suggestions, setSuggestions] = useState<AutocompleteResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSuggestions = useCallback(async (input: string, context?: any) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (input.trim().length < 2) {
      setSuggestions(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch('/api/ai/autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, context }),
        signal: abortController.signal
      });

      if (response.ok) {
        const result: AutocompleteResult = await response.json();
        setSuggestions(result);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'فشل في جلب الاقتراحات');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('خطأ في الاتصال بالخادم');
        console.error('Autocomplete fetch error:', err);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions(null);
    setError(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    fetchSuggestions,
    clearSuggestions
  };
}