'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BookOpen,
  PlayCircle,
  Search,
  Loader2,
  ChevronRight,
  Clock,
  Check,
  FolderOpen,
  User,
} from 'lucide-react';
import { sportsService, videoQuizService, customContentService } from '@/lib/database';
import { useAuth } from '@/lib/auth/context';
import { Sport, Skill, VideoQuiz, CustomContentLibrary } from '@/types';
import { toast } from 'sonner';

interface ContentItem {
  id: string;
  type: 'lesson' | 'quiz' | 'custom_lesson' | 'custom_quiz';
  title: string;
  description: string;
  sportId: string;
  sportName: string;
  difficulty: string;
  estimatedTime: number; // minutes
  hasVideo?: boolean;
  icon?: string;
  color?: string;
  isCustom?: boolean;
}

interface ContentBrowserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (content: ContentItem) => void;
  selectedSportId?: string;
  coachId?: string;
}

export function ContentBrowser({
  open,
  onOpenChange,
  onSelect,
  selectedSportId,
  coachId,
}: ContentBrowserProps) {
  const { user } = useAuth();
  const effectiveCoachId = coachId || user?.id;

  const [sports, setSports] = useState<Sport[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [quizzes, setQuizzes] = useState<VideoQuiz[]>([]);
  const [customContent, setCustomContent] = useState<CustomContentLibrary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState(selectedSportId || '');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [contentSource, setContentSource] = useState<'library' | 'custom'>('library');
  const [contentType, setContentType] = useState<'lesson' | 'quiz'>('lesson');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  // Load sports on mount
  useEffect(() => {
    if (open) {
      loadSports();
      if (effectiveCoachId) {
        loadCustomContent();
      }
    }
  }, [open, effectiveCoachId]);

  // Load content when sport or type changes
  useEffect(() => {
    if (selectedSport && contentSource === 'library') {
      loadContent();
    }
  }, [selectedSport, contentType, contentSource]);

  const loadSports = async () => {
    try {
      setLoading(true);
      const result = await sportsService.getAllSports();

      if (result.success && result.data) {
        // getAllSports returns PaginatedResponse<Sport>
        const activeSports = result.data.items.filter(s => s.isActive);
        setSports(activeSports);

        // Auto-select first sport if none selected
        if (!selectedSport && activeSports.length > 0) {
          setSelectedSport(activeSports[0].id);
        }
      } else {
        toast.error('Failed to load sports');
      }
    } catch (error) {
      console.error('Failed to load sports:', error);
      toast.error('Failed to load sports');
    } finally {
      setLoading(false);
    }
  };

  const loadContent = async () => {
    try {
      setLoading(true);

      if (contentType === 'lesson') {
        // Load skills for the selected sport
        const result = await sportsService.getSkillsBySport(selectedSport);

        if (result.success && result.data) {
          // getSkillsBySport returns PaginatedResponse<Skill>
          setSkills(result.data.items.filter(s => s.isActive));
        } else {
          toast.error('Failed to load lessons');
        }
      } else {
        // Load quizzes for the selected sport
        const result = await videoQuizService.getQuizzesBySport(selectedSport);

        if (result.success && result.data) {
          // getQuizzesBySport returns PaginatedResponse<VideoQuiz>
          setQuizzes(result.data.items.filter(q => q.isActive));
        } else {
          toast.error('Failed to load quizzes');
        }
      }
    } catch (error) {
      console.error('Failed to load content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomContent = async () => {
    if (!effectiveCoachId) return;

    try {
      const result = await customContentService.getCoachContent(effectiveCoachId);
      if (result.success && result.data) {
        setCustomContent(result.data);
      }
    } catch (error) {
      console.error('Failed to load custom content:', error);
    }
  };

  const getFilteredContent = (): ContentItem[] => {
    if (contentSource === 'custom') {
      // Filter custom content
      let items = customContent
        .filter(item => contentType === 'lesson' ? item.type === 'lesson' : item.type === 'quiz')
        .map(item => ({
          id: item.id,
          type: (item.type === 'lesson' ? 'custom_lesson' : 'custom_quiz') as ContentItem['type'],
          title: item.title,
          description: item.description,
          sportId: item.pillarId || 'custom',
          sportName: 'My Content',
          difficulty: 'custom',
          estimatedTime: item.estimatedTimeMinutes || 15,
          hasVideo: !!item.videoUrl,
          color: item.type === 'lesson' ? '#3B82F6' : '#22C55E',
          isCustom: true,
        }));

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        items = items.filter(
          item =>
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query)
        );
      }

      return items;
    }

    // Library content
    const sport = sports.find(s => s.id === selectedSport);
    if (!sport) return [];

    let items: ContentItem[] = [];

    if (contentType === 'lesson') {
      items = skills.map(skill => ({
        id: skill.id,
        type: 'lesson' as const,
        title: skill.name,
        description: skill.description,
        sportId: sport.id,
        sportName: sport.name,
        difficulty: skill.difficulty,
        estimatedTime: skill.estimatedTimeToComplete,
        hasVideo: skill.hasVideo,
        icon: sport.icon,
        color: sport.color,
      }));
    } else {
      items = quizzes.map(quiz => ({
        id: quiz.id,
        type: 'quiz' as const,
        title: quiz.title,
        description: quiz.description || '',
        sportId: sport.id,
        sportName: sport.name,
        difficulty: quiz.difficulty,
        estimatedTime: quiz.estimatedDuration || 30,
        icon: sport.icon,
        color: sport.color,
      }));
    }

    // Apply filters
    let filtered = items;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(item => item.difficulty === selectedDifficulty);
    }

    return filtered;
  };

  const handleSelect = () => {
    if (selectedItem) {
      onSelect(selectedItem);
      onOpenChange(false);
      // Reset state
      setSelectedItem(null);
      setSearchQuery('');
    }
  };

  const filteredContent = getFilteredContent();
  const customLessonCount = customContent.filter(c => c.type === 'lesson').length;
  const customQuizCount = customContent.filter(c => c.type === 'quiz').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Add Content to Curriculum</DialogTitle>
          <DialogDescription>
            Browse and select lessons or quizzes to add to the student's learning path
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Content Source Tabs */}
          <Tabs value={contentSource} onValueChange={(v) => {
            setContentSource(v as 'library' | 'custom');
            setSelectedItem(null);
          }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="library" className="gap-2">
                <FolderOpen className="h-4 w-4" />
                Content Library
              </TabsTrigger>
              <TabsTrigger value="custom" className="gap-2">
                <User className="h-4 w-4" />
                My Content
                {customContent.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {customContent.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Sport Selection (only for library) */}
          {contentSource === 'library' && (
            <div className="space-y-2">
              <Label>Sport / Pillar</Label>
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a sport..." />
                </SelectTrigger>
                <SelectContent>
                  {sports.map(sport => (
                    <SelectItem key={sport.id} value={sport.id}>
                      <div className="flex items-center gap-2">
                        <span>{sport.icon}</span>
                        <span>{sport.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {sport.skillsCount} skills
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Content Type Tabs */}
          <Tabs value={contentType} onValueChange={(v) => {
            setContentType(v as 'lesson' | 'quiz');
            setSelectedItem(null);
          }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="lesson">
                <BookOpen className="h-4 w-4 mr-2" />
                Lessons
                {contentSource === 'custom' && customLessonCount > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {customLessonCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="quiz">
                <PlayCircle className="h-4 w-4 mr-2" />
                Quizzes
                {contentSource === 'custom' && customQuizCount > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {customQuizCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={contentType} className="space-y-4">
              {/* Filters */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                {contentSource === 'library' && (
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="introduction">Introduction</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="refinement">Refinement</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Content List */}
              <ScrollArea className="h-[250px] border rounded-lg">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredContent.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    {contentSource === 'custom' ? (
                      <>
                        <User className="h-12 w-12 mb-4 opacity-50" />
                        <p className="text-sm">
                          {searchQuery
                            ? 'No content found matching your search'
                            : `You haven't created any custom ${contentType === 'lesson' ? 'lessons' : 'quizzes'} yet`}
                        </p>
                        <p className="text-xs mt-1">
                          Create content from the Content Library page
                        </p>
                      </>
                    ) : (
                      <>
                        <BookOpen className="h-12 w-12 mb-4 opacity-50" />
                        <p className="text-sm">
                          {searchQuery
                            ? 'No content found matching your search'
                            : `No ${contentType === 'lesson' ? 'lessons' : 'quizzes'} available for this sport`}
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {filteredContent.map(item => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`w-full text-left p-4 rounded-lg border transition-all hover:bg-accent/50 ${
                          selectedItem?.id === item.id
                            ? 'border-primary bg-accent shadow-sm'
                            : 'border-border'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                            style={{ backgroundColor: `${item.color}20` }}
                          >
                            {item.type === 'lesson' || item.type === 'custom_lesson' ? (
                              <BookOpen className="h-5 w-5" style={{ color: item.color }} />
                            ) : (
                              <PlayCircle className="h-5 w-5" style={{ color: item.color }} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium truncate">{item.title}</h4>
                              {item.isCustom && (
                                <Badge variant="outline" className="text-xs">
                                  Custom
                                </Badge>
                              )}
                              {selectedItem?.id === item.id && (
                                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {item.description}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {!item.isCustom && (
                                <Badge variant="outline" className="text-xs">
                                  {item.difficulty}
                                </Badge>
                              )}
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{item.estimatedTime} min</span>
                              </div>
                              {item.hasVideo && (
                                <Badge variant="secondary" className="text-xs">
                                  Video
                                </Badge>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Selection Summary */}
              {selectedItem && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${selectedItem.color}20` }}
                    >
                      {selectedItem.type === 'lesson' || selectedItem.type === 'custom_lesson' ? (
                        <BookOpen className="h-6 w-6" style={{ color: selectedItem.color }} />
                      ) : (
                        <PlayCircle className="h-6 w-6" style={{ color: selectedItem.color }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{selectedItem.title}</h4>
                        {selectedItem.isCustom && (
                          <Badge variant="outline" className="text-xs">
                            Custom
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {selectedItem.sportName} • {selectedItem.isCustom ? 'Custom Content' : selectedItem.difficulty} • {selectedItem.estimatedTime} min
                      </p>
                      <p className="text-sm">{selectedItem.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSelect} disabled={!selectedItem}>
            <Check className="h-4 w-4 mr-2" />
            Add to Curriculum
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
