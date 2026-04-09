'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Search,
  BookOpen,
  PlayCircle,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Users,
  Clock,
  Calendar,
  FolderOpen,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { customContentService } from '@/lib/database';
import { CustomContentLibrary } from '@/types';
import { toast } from 'sonner';
import { ContentTypeSelector, ContentType } from '@/components/coach/content-type-selector';
import { LessonCreator } from '@/components/coach/lesson-creator';
import { SkeletonDarkPage } from '@/components/ui/skeletons';

export default function CoachContentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [content, setContent] = useState<CustomContentLibrary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [contentFilter, setContentFilter] = useState<'all' | 'lesson' | 'quiz'>('all');
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showLessonCreator, setShowLessonCreator] = useState(false);
  const [editingContent, setEditingContent] = useState<CustomContentLibrary | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<CustomContentLibrary | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadContent();
    }
  }, [user?.id]);

  const loadContent = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const result = await customContentService.getCoachContent(user.id);

      if (result.success && result.data) {
        setContent(result.data);
      } else {
        toast.error('Failed to load content library');
      }
    } catch (error) {
      console.error('Failed to load content:', error);
      toast.error('Failed to load content library');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeSelect = (type: ContentType) => {
    if (type === 'lesson') {
      setShowLessonCreator(true);
    } else {
      // Navigate to full-page quiz creator
      router.push('/coach/content/quiz/create');
    }
  };

  const handleContentSaved = (newContent: CustomContentLibrary) => {
    if (editingContent) {
      setContent((prev) =>
        prev.map((c) => (c.id === newContent.id ? newContent : c))
      );
      setEditingContent(null);
    } else {
      setContent((prev) => [newContent, ...prev]);
    }
  };

  const handleEdit = (item: CustomContentLibrary) => {
    if (item.type === 'lesson') {
      setEditingContent(item);
      setShowLessonCreator(true);
    } else {
      // Navigate to full-page quiz editor
      router.push(`/coach/content/quiz/${item.id}/edit`);
    }
  };

  const handleDuplicate = async (item: CustomContentLibrary) => {
    if (!user?.id) return;

    try {
      const result = await customContentService.cloneContent(item.id, user.id);
      if (result.success && result.data) {
        setContent((prev) => [result.data!, ...prev]);
        toast.success('Content duplicated successfully');
      } else {
        toast.error('Failed to duplicate content');
      }
    } catch (error) {
      console.error('Failed to duplicate content:', error);
      toast.error('Failed to duplicate content');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm || !user?.id) return;

    try {
      const result = await customContentService.deleteContent(deleteConfirm.id, user.id);
      if (result.success) {
        setContent((prev) => prev.filter((c) => c.id !== deleteConfirm.id));
        toast.success('Content deleted successfully');
      } else {
        toast.error('Failed to delete content');
      }
    } catch (error) {
      console.error('Failed to delete content:', error);
      toast.error('Failed to delete content');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredContent = content.filter((item) => {
    // Type filter
    if (contentFilter !== 'all' && item.type !== contentFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        (item.tags || []).some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return true;
  });

  const lessonCount = content.filter((c) => c.type === 'lesson').length;
  const quizCount = content.filter((c) => c.type === 'quiz').length;

  if (loading) {
    return <SkeletonDarkPage />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-red-400 text-sm font-semibold tracking-wide uppercase mb-1">Library</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Content Library</h1>
            <p className="text-white/60 text-sm mt-1">Create and manage your custom lessons and quizzes</p>
          </div>
          <Button
            onClick={() => setShowTypeSelector(true)}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Content
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Content', value: content.length, icon: <FolderOpen className="h-5 w-5" />, color: 'red' },
          { label: 'Lessons', value: lessonCount, icon: <BookOpen className="h-5 w-5" />, color: 'blue' },
          { label: 'Quizzes', value: quizCount, icon: <PlayCircle className="h-5 w-5" />, color: 'green' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`h-11 w-11 rounded-xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Tabs
              value={contentFilter}
              onValueChange={(v) => setContentFilter(v as typeof contentFilter)}
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="lesson">Lessons</TabsTrigger>
                <TabsTrigger value="quiz">Quizzes</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      {filteredContent.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
            {content.length === 0 ? (
              <>
                <h3 className="text-xl font-semibold mb-2">No Content Yet</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Start creating custom lessons and quizzes for your students. Your content will appear here.
                </p>
                <Button onClick={() => setShowTypeSelector(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Content
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-2">No Matching Content</h3>
                <p className="text-muted-foreground text-center">
                  No content matches your search criteria. Try adjusting your filters.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContent.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                        item.type === 'lesson'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-green-100 text-green-600'
                      }`}
                    >
                      {item.type === 'lesson' ? (
                        <BookOpen className="h-5 w-5" />
                      ) : (
                        <PlayCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{item.title}</CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">
                        {item.type === 'lesson' ? 'Lesson' : 'Quiz'}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(item)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteConfirm(item)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {item.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {(item.tags || []).slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {(item.tags || []).length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{item.tags!.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{item.usageCount || 0} uses</span>
                  </div>
                  {item.estimatedTimeMinutes && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{item.estimatedTimeMinutes} min</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>

                {item.isPublic && (
                  <Badge variant="outline" className="mt-3 text-xs text-green-600 border-green-200">
                    Public
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <ContentTypeSelector
        open={showTypeSelector}
        onOpenChange={setShowTypeSelector}
        onSelect={handleTypeSelect}
      />

      {user?.id && (
        <LessonCreator
          open={showLessonCreator}
          onOpenChange={(open) => {
            setShowLessonCreator(open);
            if (!open) setEditingContent(null);
          }}
          coachId={user.id}
          onSave={handleContentSaved}
          editContent={editingContent?.type === 'lesson' ? editingContent : undefined}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden border-0 bg-card shadow-2xl rounded-2xl">
          <AlertDialogHeader className="px-8 pt-8 pb-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
            <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 bg-blue-500/15 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 w-44 h-44 bg-red-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300 mb-2">Content Library</p>
              <AlertDialogTitle className="text-2xl font-bold tracking-tight text-white">Delete Content</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-300 mt-1.5 text-sm">
              Are you sure you want to delete "{deleteConfirm?.title}"? This action cannot be undone.
              {(deleteConfirm?.usageCount || 0) > 0 && (
                <span className="block mt-2 text-amber-600">
                  Warning: This content has been assigned to {deleteConfirm?.usageCount} student(s).
                  Deleting it may affect their curriculum.
                </span>
              )}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="px-8 pb-6 pt-4 border-t border-slate-200 bg-card">
            <AlertDialogCancel className="px-6 border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
