'use client';

import { useState, useEffect } from 'react';
import { Sport, SearchFilters, DifficultyLevel } from '@/types';
import { sportsService } from '@/lib/database/services/sports.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { LoadingState, LoadingCard } from '@/components/ui/loading';
import Link from 'next/link';
import { Search, Filter, Users, Sparkles } from 'lucide-react';

interface SportsPageState {
  sports: Sport[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filters: SearchFilters;
  totalCount: number;
}

export default function SportsPage() {
  const [state, setState] = useState<SportsPageState>({
    sports: [],
    loading: true,
    error: null,
    searchQuery: '',
    filters: {},
    totalCount: 0,
  });

  const [showFilters, setShowFilters] = useState(false);

  const loadSports = async (searchQuery?: string, filters?: SearchFilters) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let result;
      if (searchQuery && searchQuery.trim()) {
        result = await sportsService.searchSports(searchQuery, filters);
      } else {
        result = await sportsService.getAllSports({ ...filters, limit: 50 });
      }

      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          sports: result.data!.items,
          totalCount: result.data!.total,
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: result.error?.message || 'Failed to load courses',
          loading: false,
        }));
      }
    } catch {
      setState(prev => ({
        ...prev,
        error: 'An unexpected error occurred',
        loading: false,
      }));
    }
  };

  useEffect(() => {
    loadSports();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadSports(state.searchQuery, state.filters);
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...state.filters, ...newFilters };
    setState(prev => ({ ...prev, filters: updatedFilters }));
    loadSports(state.searchQuery, updatedFilters);
  };

  const clearFilters = () => {
    setState(prev => ({ ...prev, filters: {}, searchQuery: '' }));
    loadSports('', {});
  };

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'introduction':
        return 'text-emerald-700 bg-emerald-100 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-900 dark:border-emerald-800';
      case 'development':
        return 'text-amber-700 bg-amber-100 border-amber-200 dark:text-amber-300 dark:bg-amber-900 dark:border-amber-800';
      case 'refinement':
        return 'text-rose-700 bg-rose-100 border-rose-200 dark:text-rose-300 dark:bg-rose-900 dark:border-rose-800';
      default:
        return 'text-slate-700 bg-slate-100 border-slate-200 dark:text-slate-300 dark:bg-slate-900 dark:border-slate-800';
    }
  };


  if (state.loading && state.sports.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={[{ label: 'Courses', current: true }]} className="mb-6" />
        <LoadingState message="Loading courses catalog..." />
        <LoadingCard count={6} className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Courses', current: true }]} />

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Courses Catalog
              </h1>
              <Sparkles className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-muted-foreground">
              Discover and master new skills with our comprehensive learning platform
            </p>
          </div>
          <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
            {state.totalCount} course{state.totalCount !== 1 ? 's' : ''} available
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex gap-4 items-center">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search courses by name, description, or tags..."
                value={state.searchQuery}
                onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={state.loading}>
              Search
            </Button>
          </form>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>

          {(state.searchQuery || Object.keys(state.filters).length > 0) && (
            <Button variant="secondary" onClick={clearFilters}>
              Clear All
            </Button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Difficulty Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty Level</label>
                <div className="space-y-2">
                  {(['introduction', 'development', 'refinement'] as DifficultyLevel[]).map((level) => (
                    <label key={level} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={state.filters.difficulty?.includes(level) || false}
                        onChange={(e) => {
                          const currentDifficulty = state.filters.difficulty || [];
                          const newDifficulty = e.target.checked
                            ? [...currentDifficulty, level]
                            : currentDifficulty.filter(d => d !== level);
                          handleFilterChange({ difficulty: newDifficulty });
                        }}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Duration Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (hours)</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={state.filters.duration?.min || ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      handleFilterChange({
                        duration: { ...state.filters.duration, min: value }
                      });
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={state.filters.duration?.max || ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      handleFilterChange({
                        duration: { ...state.filters.duration, max: value }
                      });
                    }}
                  />
                </div>
              </div>

              {/* Additional Filters */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Features</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={state.filters.hasVideo || false}
                      onChange={(e) => handleFilterChange({ hasVideo: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Has Video Content</span>
                  </label>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Error State */}
      {state.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <span className="font-medium">Error:</span>
              <span>{state.error}</span>
            </div>
            <Button
              variant="warning"
              size="sm"
              onClick={() => loadSports(state.searchQuery, state.filters)}
              className="mt-2"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Courses Grid */}
      {state.sports.length === 0 && !state.loading ? (
        <Card className="p-8">
          <div className="text-center space-y-4">
            <div className="text-6xl">🔍</div>
            <h3 className="text-lg font-medium">No courses found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <Button variant="secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.sports.map((sport) => (
            <Link key={sport.id} href={`/sports/${sport.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                {sport.imageUrl && (
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <img
                      src={sport.imageUrl}
                      alt={sport.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {sport.isFeatured && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                        Featured
                      </div>
                    )}
                  </div>
                )}

                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {sport.name}
                    </CardTitle>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(sport.difficulty)}`}
                    >
                      {sport.difficulty}
                    </span>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {sport.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{sport.skillsCount} skills</span>
                    </div>
                  </div>

                  {sport.metadata.averageRating > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span>{sport.metadata.averageRating.toFixed(1)}</span>
                        <span className="text-muted-foreground">
                          ({sport.metadata.totalRatings} reviews)
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        {sport.metadata.totalEnrollments} enrolled
                      </div>
                    </div>
                  )}

                  {sport.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {sport.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {sport.tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{sport.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Loading State for Pagination */}
      {state.loading && state.sports.length > 0 && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary/20 border-t-primary"></div>
            <span className="text-sm">Loading more courses...</span>
          </div>
        </div>
      )}
    </div>
  );
}