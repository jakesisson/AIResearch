import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  X, 
  User, 
  FileText, 
  DollarSign, 
  Activity,
  Clock,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';

interface SearchResult {
  opportunities: Array<{
    _id: string;
    name: string;
    email: string;
    value: number;
    stage: string;
    contactPerson: string;
  }>;
  users: Array<{
    _id: string;
    username: string;
    email: string;
    fullName: string;
    role: string;
  }>;
  invoices: Array<{
    _id: string;
    invoiceNumber: string;
    customerName: string;
    totalAmount: number;
    status: string;
  }>;
  activities: Array<{
    _id: string;
    title: string;
    description: string;
    type: string;
  }>;
}

interface SearchSystemProps {
  onNavigate?: (path: string, data?: any) => void;
  className?: string;
}

export default function SearchSystem({ onNavigate, className }: SearchSystemProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Available search filters
  const availableFilters = [
    { id: 'opportunities', label: 'العملاء والفرص', icon: User },
    { id: 'invoices', label: 'الفواتير', icon: FileText },
    { id: 'users', label: 'المستخدمين', icon: User },
    { id: 'activities', label: 'الأنشطة', icon: Activity }
  ];

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (searchQuery: string) => {
      const params = new URLSearchParams({ q: searchQuery });
      if (selectedFilters.length > 0) {
        selectedFilters.forEach(filter => params.append('filters', filter));
      }
      
      const response = await fetch(`/api/financial/search?${params}`);
      if (!response.ok) throw new Error('فشل في البحث');
      return response.json();
    },
    onMutate: () => setIsSearching(true),
    onSuccess: (data) => {
      setResults(data);
      setShowResults(true);
      setIsSearching(false);
      
      // Add to recent searches
      if (query.trim() && !recentSearches.includes(query.trim())) {
        const newRecentSearches = [query.trim(), ...recentSearches.slice(0, 4)];
        setRecentSearches(newRecentSearches);
        localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
      }
    },
    onError: () => setIsSearching(false)
  });

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Handle search
  const handleSearch = (searchQuery?: string) => {
    const queryToSearch = searchQuery || query;
    if (queryToSearch.trim().length < 2) return;
    
    searchMutation.mutate(queryToSearch);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowResults(false);
      setQuery('');
    }
  };

  // Handle filter toggle
  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get result icon
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'opportunities': return User;
      case 'invoices': return FileText;
      case 'users': return User;
      case 'activities': return Activity;
      default: return Search;
    }
  };

  // Get result count
  const getTotalResults = () => {
    if (!results) return 0;
    return (results.opportunities?.length || 0) + 
           (results.invoices?.length || 0) + 
           (results.users?.length || 0) + 
           (results.activities?.length || 0);
  };

  // Handle result click
  const handleResultClick = (type: string, item: any) => {
    setShowResults(false);
    
    if (onNavigate) {
      switch (type) {
        case 'opportunities':
          onNavigate('/sales', { selectedOpportunity: item });
          break;
        case 'invoices':
          onNavigate('/financial', { selectedInvoice: item });
          break;
        case 'users':
          onNavigate('/users', { selectedUser: item });
          break;
        case 'activities':
          onNavigate('/dashboard', { selectedActivity: item });
          break;
      }
    }
  };

  return (
    <div ref={searchRef} className={cn("relative w-full max-w-2xl", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="ابحث في العملاء، الفواتير، المستخدمين..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          className="pl-10 pr-4 h-12 text-lg border-2 focus:border-primary"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              setResults(null);
              setShowResults(false);
            }}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Search Filters */}
      <div className="flex flex-wrap gap-2 mt-3">
        {availableFilters.map((filter) => {
          const IconComponent = filter.icon;
          return (
            <Button
              key={filter.id}
              variant={selectedFilters.includes(filter.id) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilter(filter.id)}
              className="text-xs"
            >
              <IconComponent className="w-3 h-3 ml-1" />
              {filter.label}
            </Button>
          );
        })}
        {selectedFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedFilters([])}
            className="text-xs text-muted-foreground"
          >
            <X className="w-3 h-3 ml-1" />
            مسح الفلاتر
          </Button>
        )}
      </div>

      {/* Search Results */}
      {showResults && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-2 max-h-96 overflow-hidden border-2 border-border shadow-lg">
          <CardContent className="p-0">
            {isSearching ? (
              <div className="p-6 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">جاري البحث...</p>
              </div>
            ) : results && getTotalResults() > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {/* Search Summary */}
                <div className="p-3 border-b bg-muted/30">
                  <p className="text-sm text-muted-foreground">
                    تم العثور على {getTotalResults()} نتيجة للبحث "{query}"
                  </p>
                </div>

                {/* Opportunities Results */}
                {results.opportunities && results.opportunities.length > 0 && (
                  <div className="p-3 border-b">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      العملاء والفرص ({results.opportunities.length})
                    </h4>
                    <div className="space-y-2">
                      {results.opportunities.map((opportunity) => (
                        <div
                          key={opportunity._id}
                          onClick={() => handleResultClick('opportunities', opportunity)}
                          className="p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{opportunity.name}</p>
                              <p className="text-xs text-muted-foreground">{opportunity.contactPerson}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{opportunity.value.toLocaleString()} ريال</p>
                              <Badge variant="secondary" className="text-xs">
                                {opportunity.stage}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Invoices Results */}
                {results.invoices && results.invoices.length > 0 && (
                  <div className="p-3 border-b">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      الفواتير ({results.invoices.length})
                    </h4>
                    <div className="space-y-2">
                      {results.invoices.map((invoice) => (
                        <div
                          key={invoice._id}
                          onClick={() => handleResultClick('invoices', invoice)}
                          className="p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{invoice.invoiceNumber}</p>
                              <p className="text-xs text-muted-foreground">{invoice.customerName}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{invoice.totalAmount.toLocaleString()} ريال</p>
                              <Badge variant="secondary" className="text-xs">
                                {invoice.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Users Results */}
                {results.users && results.users.length > 0 && (
                  <div className="p-3 border-b">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      المستخدمين ({results.users.length})
                    </h4>
                    <div className="space-y-2">
                      {results.users.map((user) => (
                        <div
                          key={user._id}
                          onClick={() => handleResultClick('users', user)}
                          className="p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{user.fullName}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {user.role}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Activities Results */}
                {results.activities && results.activities.length > 0 && (
                  <div className="p-3">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      الأنشطة ({results.activities.length})
                    </h4>
                    <div className="space-y-2">
                      {results.activities.map((activity) => (
                        <div
                          key={activity._id}
                          onClick={() => handleResultClick('activities', activity)}
                          className="p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <p className="font-medium text-sm">{activity.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {activity.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : query.length >= 2 ? (
              <div className="p-6 text-center">
                <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">لم يتم العثور على نتائج</p>
                <p className="text-xs text-muted-foreground mt-1">جرب كلمات مختلفة أو تغيير الفلاتر</p>
              </div>
            ) : (
              <div className="p-4">
                {recentSearches.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      عمليات البحث الأخيرة
                    </h4>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setQuery(search);
                            handleSearch(search);
                          }}
                          className="w-full justify-start text-sm h-auto p-2"
                        >
                          <Search className="w-3 h-3 ml-2" />
                          {search}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    اقتراحات البحث
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['العملاء', 'الفواتير المتأخرة', 'المدفوعات اليوم', 'أنشطة الأسبوع'].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setQuery(suggestion);
                          handleSearch(suggestion);
                        }}
                        className="text-xs"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}