'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  VideoTagFilter,
  TagFacetCounts,
  PillarTag,
  SystemTag,
  UserTypeTag,
  AngleMarkerTag,
  ArchLevelTag,
  SYSTEM_TAGS,
  USER_TYPE_TAGS,
  ANGLE_MARKER_TAGS,
  ARCH_LEVEL_TAGS,
  SYSTEM_TAG_METADATA,
  USER_TYPE_TAG_METADATA,
  ARCH_LEVEL_TAG_METADATA,
  ANGLE_MARKER_TAG_METADATA,
  countActiveFilters,
} from '@/types';
import { PILLARS } from '@/types/onboarding';
import {
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Target,
  Users,
  Compass,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoFilterPanelProps {
  /** Current filter state */
  filter: VideoTagFilter;
  /** Callback when filter changes */
  onFilterChange: (filter: VideoTagFilter) => void;
  /** Facet counts for showing available options */
  facets?: TagFacetCounts;
  /** Whether the panel is loading */
  loading?: boolean;
  /** Additional class name */
  className?: string;
  /** Start collapsed */
  defaultCollapsed?: boolean;
}

/**
 * Collapsible filter panel for video content by structured tags.
 * Shows filter sections for pillars, systems, user types, angle markers, and levels.
 */
export function VideoFilterPanel({
  filter,
  onFilterChange,
  facets,
  loading = false,
  className,
  defaultCollapsed = false,
}: VideoFilterPanelProps) {
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);

  const activeFilterCount = countActiveFilters(filter);

  const handlePillarToggle = (pillar: PillarTag) => {
    const newPillars = filter.pillars?.includes(pillar)
      ? filter.pillars.filter((p) => p !== pillar)
      : [...(filter.pillars || []), pillar];
    onFilterChange({ ...filter, pillars: newPillars.length ? newPillars : undefined });
  };

  const handleSystemToggle = (system: SystemTag) => {
    const newSystems = filter.systems?.includes(system)
      ? filter.systems.filter((s) => s !== system)
      : [...(filter.systems || []), system];
    onFilterChange({ ...filter, systems: newSystems.length ? newSystems : undefined });
  };

  const handleUserTypeToggle = (userType: UserTypeTag) => {
    const newUserTypes = filter.userTypes?.includes(userType)
      ? filter.userTypes.filter((u) => u !== userType)
      : [...(filter.userTypes || []), userType];
    onFilterChange({ ...filter, userTypes: newUserTypes.length ? newUserTypes : undefined });
  };

  const handleAngleMarkerToggle = (marker: AngleMarkerTag) => {
    const newMarkers = filter.angleMarkers?.includes(marker)
      ? filter.angleMarkers.filter((m) => m !== marker)
      : [...(filter.angleMarkers || []), marker];
    onFilterChange({ ...filter, angleMarkers: newMarkers.length ? newMarkers : undefined });
  };

  const handleArchLevelToggle = (level: ArchLevelTag) => {
    const newLevels = filter.archLevels?.includes(level)
      ? filter.archLevels.filter((l) => l !== level)
      : [...(filter.archLevels || []), level];
    onFilterChange({ ...filter, archLevels: newLevels.length ? newLevels : undefined });
  };

  const handleClearAll = () => {
    onFilterChange({});
  };

  const handleRemoveFilter = (type: string, value: string) => {
    switch (type) {
      case 'pillar':
        onFilterChange({
          ...filter,
          pillars: filter.pillars?.filter((p) => p !== value) || undefined,
        });
        break;
      case 'system':
        onFilterChange({
          ...filter,
          systems: filter.systems?.filter((s) => s !== value) || undefined,
        });
        break;
      case 'userType':
        onFilterChange({
          ...filter,
          userTypes: filter.userTypes?.filter((u) => u !== value) || undefined,
        });
        break;
      case 'angleMarker':
        onFilterChange({
          ...filter,
          angleMarkers: filter.angleMarkers?.filter((m) => m !== value) || undefined,
        });
        break;
      case 'archLevel':
        onFilterChange({
          ...filter,
          archLevels: filter.archLevels?.filter((l) => l !== value) || undefined,
        });
        break;
    }
  };

  // Color mapping for system tags
  const getSystemButtonClass = (system: SystemTag, selected: boolean) => {
    const colorMap: Record<string, string> = {
      blue: selected ? 'bg-blue-100 border-blue-400 text-blue-700' : 'hover:border-blue-300',
      green: selected ? 'bg-green-100 border-green-400 text-green-700' : 'hover:border-green-300',
      purple: selected ? 'bg-purple-100 border-purple-400 text-purple-700' : 'hover:border-purple-300',
      orange: selected ? 'bg-orange-100 border-orange-400 text-orange-700' : 'hover:border-orange-300',
      gray: selected ? 'bg-gray-200 border-gray-400 text-gray-700' : 'hover:border-gray-400',
    };
    return colorMap[SYSTEM_TAG_METADATA[system].color] || colorMap.gray;
  };

  return (
    <Card className={className}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent"
            >
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </CardTitle>
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-5 pt-0">
            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="pb-3 border-b">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Active Filters</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="h-auto py-1 px-2 text-xs text-gray-500 hover:text-red-600"
                  >
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {filter.pillars?.map((pillar) => (
                    <Badge
                      key={pillar}
                      variant="secondary"
                      className="pl-2 pr-1 cursor-pointer hover:bg-red-100"
                      onClick={() => handleRemoveFilter('pillar', pillar)}
                    >
                      {PILLARS.find((p) => p.slug === pillar)?.shortName || pillar}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                  {filter.systems?.map((system) => (
                    <Badge
                      key={system}
                      variant="secondary"
                      className="pl-2 pr-1 cursor-pointer hover:bg-red-100"
                      onClick={() => handleRemoveFilter('system', system)}
                    >
                      {system}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                  {filter.userTypes?.map((userType) => (
                    <Badge
                      key={userType}
                      variant="secondary"
                      className="pl-2 pr-1 cursor-pointer hover:bg-red-100 capitalize"
                      onClick={() => handleRemoveFilter('userType', userType)}
                    >
                      {userType}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                  {filter.angleMarkers?.map((marker) => (
                    <Badge
                      key={marker}
                      variant="secondary"
                      className="pl-2 pr-1 cursor-pointer hover:bg-red-100"
                      onClick={() => handleRemoveFilter('angleMarker', marker)}
                    >
                      {marker}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                  {filter.archLevels?.map((level) => (
                    <Badge
                      key={level}
                      variant="secondary"
                      className="pl-2 pr-1 cursor-pointer hover:bg-red-100"
                      onClick={() => handleRemoveFilter('archLevel', level)}
                    >
                      {level}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Pillars */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Target className="h-4 w-4 text-gray-500" />
                Pillars
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PILLARS.map((pillar) => {
                  const isSelected = filter.pillars?.includes(pillar.slug);
                  const count = facets?.pillars[pillar.slug] || 0;
                  return (
                    <button
                      key={pillar.slug}
                      type="button"
                      onClick={() => handlePillarToggle(pillar.slug)}
                      disabled={loading}
                      className={cn(
                        'px-2.5 py-1 text-xs rounded-full border transition-colors',
                        isSelected
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary/50',
                        loading && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {pillar.shortName}
                      {facets && <span className="ml-1 opacity-60">({count})</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Systems */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Layers className="h-4 w-4 text-gray-500" />
                Systems
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SYSTEM_TAGS.map((system) => {
                  const isSelected = filter.systems?.includes(system) ?? false;
                  const count = facets?.systems[system] || 0;
                  return (
                    <button
                      key={system}
                      type="button"
                      onClick={() => handleSystemToggle(system)}
                      disabled={loading}
                      className={cn(
                        'px-2.5 py-1 text-xs rounded-full border transition-colors',
                        getSystemButtonClass(system, isSelected),
                        !isSelected && 'bg-gray-50 text-gray-600 border-gray-200',
                        loading && 'opacity-50 cursor-not-allowed'
                      )}
                      title={SYSTEM_TAG_METADATA[system].description}
                    >
                      {system}
                      {facets && <span className="ml-1 opacity-60">({count})</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* User Types */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4 text-gray-500" />
                Audience
              </div>
              <div className="flex flex-wrap gap-1.5">
                {USER_TYPE_TAGS.map((userType) => {
                  const isSelected = filter.userTypes?.includes(userType);
                  const count = facets?.userTypes[userType] || 0;
                  const metadata = USER_TYPE_TAG_METADATA[userType];
                  return (
                    <button
                      key={userType}
                      type="button"
                      onClick={() => handleUserTypeToggle(userType)}
                      disabled={loading}
                      className={cn(
                        'px-2.5 py-1 text-xs rounded-full border transition-colors capitalize',
                        isSelected
                          ? 'bg-indigo-100 border-indigo-400 text-indigo-700'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300',
                        loading && 'opacity-50 cursor-not-allowed'
                      )}
                      title={metadata.description}
                    >
                      {metadata.name}
                      {facets && <span className="ml-1 opacity-60">({count})</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Angle Markers */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Compass className="h-4 w-4 text-gray-500" />
                Angle Markers
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ANGLE_MARKER_TAGS.map((marker) => {
                  const isSelected = filter.angleMarkers?.includes(marker);
                  const count = facets?.angleMarkers[marker] || 0;
                  const metadata = ANGLE_MARKER_TAG_METADATA[marker];
                  return (
                    <button
                      key={marker}
                      type="button"
                      onClick={() => handleAngleMarkerToggle(marker)}
                      disabled={loading}
                      className={cn(
                        'px-2.5 py-1 text-xs rounded-full border transition-colors',
                        isSelected
                          ? 'bg-cyan-100 border-cyan-400 text-cyan-700'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-cyan-300',
                        loading && 'opacity-50 cursor-not-allowed'
                      )}
                      title={`${metadata.position}: ${metadata.description}`}
                    >
                      {marker}
                      {facets && <span className="ml-1 opacity-60">({count})</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Architecture Levels */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Layers className="h-4 w-4 text-gray-500" />
                Content Level
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ARCH_LEVEL_TAGS.map((level) => {
                  const isSelected = filter.archLevels?.includes(level);
                  const count = facets?.archLevels[level] || 0;
                  const metadata = ARCH_LEVEL_TAG_METADATA[level];
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleArchLevelToggle(level)}
                      disabled={loading}
                      className={cn(
                        'px-2.5 py-1 text-xs rounded-full border transition-colors',
                        isSelected
                          ? 'bg-purple-100 border-purple-400 text-purple-700'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-purple-300',
                        loading && 'opacity-50 cursor-not-allowed'
                      )}
                      title={metadata.description}
                    >
                      {level}: {metadata.name}
                      {facets && <span className="ml-1 opacity-60">({count})</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default VideoFilterPanel;
