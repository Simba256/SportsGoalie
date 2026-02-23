'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  ArrowLeft,
  Plus,
  Lock,
  Unlock,
  CheckCircle2,
  Circle,
  Trash2,
  BookOpen,
  PlayCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { userService, sportsService } from '@/lib/database';
import { customCurriculumService } from '@/lib/database';
import { User, CustomCurriculum, CustomCurriculumItem, Sport } from '@/types';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function StudentCurriculumPage() {
  const params = useParams();
  const router = useRouter();
  const { user: coach } = useAuth();
  const studentId = params.studentId as string;

  const [student, setStudent] = useState<User | null>(null);
  const [curriculum, setCurriculum] = useState<CustomCurriculum | null>(null);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedContent, setSelectedContent] = useState<{
    type: 'lesson' | 'quiz';
    id: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    if (studentId && coach?.id) {
      loadData();
    }
  }, [studentId, coach?.id]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load student
      const studentResult = await userService.getUser(studentId);
      if (!studentResult.success || !studentResult.data) {
        toast.error('Student not found');
        router.push('/coach/students');
        return;
      }

      // Verify student is assigned to this coach (admins can access all)
      if (coach?.role !== 'admin' && studentResult.data.assignedCoachId !== coach?.id) {
        toast.error('Unauthorized: This student is not assigned to you');
        router.push('/coach/students');
        return;
      }

      setStudent(studentResult.data);

      // Load curriculum
      const curriculumResult = await customCurriculumService.getStudentCurriculum(studentId);
      if (curriculumResult.success && curriculumResult.data) {
        setCurriculum(curriculumResult.data);
      }

      // Load sports for content selection
      const sportsResult = await sportsService.getAllSports();
      if (sportsResult.success && sportsResult.data) {
        setSports(sportsResult.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load curriculum data');
    } finally {
      setLoading(false);
    }
  };

  const createCurriculum = async () => {
    if (!coach?.id) return;

    try {
      const result = await customCurriculumService.createCurriculum(
        {
          studentId,
          coachId: coach.id,
          items: [],
        },
        coach.id
      );

      if (result.success && result.data) {
        setCurriculum(result.data);
        toast.success('Curriculum created successfully');
      } else {
        toast.error('Failed to create curriculum');
      }
    } catch (error) {
      console.error('Failed to create curriculum:', error);
      toast.error('Failed to create curriculum');
    }
  };

  const addContentToCurriculum = async () => {
    if (!curriculum || !coach?.id || !selectedSport || !selectedContent) return;

    try {
      const result = await customCurriculumService.addItem(
        curriculum.id,
        {
          type: selectedContent.type === 'lesson' ? 'lesson' : 'quiz',
          contentId: selectedContent.id,
          pillarId: selectedSport,
          levelId: 'level-1', // Default level for now
          unlocked: false, // Start locked
        },
        coach.id
      );

      if (result.success) {
        toast.success('Content added to curriculum');
        setShowAddDialog(false);
        setSelectedSport('');
        setSelectedSkill('');
        setSelectedContent(null);
        await loadData(); // Reload to see changes
      } else {
        toast.error('Failed to add content');
      }
    } catch (error) {
      console.error('Failed to add content:', error);
      toast.error('Failed to add content');
    }
  };

  const toggleItemLock = async (itemId: string, currentlyLocked: boolean) => {
    if (!curriculum || !coach?.id) return;

    try {
      if (currentlyLocked) {
        // Unlock the item
        const result = await customCurriculumService.unlockItem(curriculum.id, itemId, coach.id);
        if (result.success) {
          toast.success('Item unlocked');
          await loadData();
        } else {
          toast.error('Failed to unlock item');
        }
      } else {
        toast.info('Locking items not implemented yet (items start locked by default)');
      }
    } catch (error) {
      console.error('Failed to toggle lock:', error);
      toast.error('Failed to update item');
    }
  };

  const unlockAllItems = async () => {
    if (!curriculum || !coach?.id) return;

    try {
      const result = await customCurriculumService.unlockAllItems(curriculum.id, coach.id);
      if (result.success) {
        toast.success('All items unlocked');
        await loadData();
      } else {
        toast.error('Failed to unlock all items');
      }
    } catch (error) {
      console.error('Failed to unlock all:', error);
      toast.error('Failed to unlock all items');
    }
  };

  const removeItem = async (itemId: string) => {
    if (!curriculum || !coach?.id) return;

    try {
      const result = await customCurriculumService.removeItem(curriculum.id, itemId, coach.id);
      if (result.success) {
        toast.success('Item removed from curriculum');
        await loadData();
      } else {
        toast.error('Failed to remove item');
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Failed to remove item');
    }
  };

  const getItemIcon = (item: CustomCurriculumItem) => {
    if (item.status === 'completed') return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (item.status === 'in_progress') return <PlayCircle className="h-5 w-5 text-blue-500" />;
    if (item.status === 'unlocked') return <Unlock className="h-5 w-5 text-primary" />;
    return <Lock className="h-5 w-5 text-muted-foreground" />;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      completed: { variant: "default", label: "Completed" },
      in_progress: { variant: "secondary", label: "In Progress" },
      unlocked: { variant: "outline", label: "Unlocked" },
      locked: { variant: "destructive", label: "Locked" },
    };

    const config = variants[status] || variants.locked;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.push('/coach/students')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Students
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{student.displayName}'s Curriculum</h1>
            <p className="text-muted-foreground">
              Manage personalized learning path for {student.displayName}
            </p>
          </div>
        </div>
      </div>

      {/* Create curriculum if doesn't exist */}
      {!curriculum ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Curriculum Created</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Create a personalized curriculum for {student.displayName} to start assigning content and tracking progress.
            </p>
            <Button onClick={createCurriculum}>
              <Plus className="h-4 w-4 mr-2" />
              Create Curriculum
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Curriculum Actions</CardTitle>
              <CardDescription>Manage content and student access</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Content
              </Button>
              <Button variant="outline" onClick={unlockAllItems} disabled={curriculum.items.length === 0}>
                <Unlock className="h-4 w-4 mr-2" />
                Unlock All
              </Button>
            </CardContent>
          </Card>

          {/* Curriculum Items */}
          <Card>
            <CardHeader>
              <CardTitle>Curriculum Items ({curriculum.items.length})</CardTitle>
              <CardDescription>
                Content assigned to {student.displayName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {curriculum.items.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Circle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No content added yet. Click "Add Content" to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {curriculum.items
                    .sort((a, b) => a.order - b.order)
                    .map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-shrink-0">{getItemIcon(item)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {item.type === 'lesson' ? 'Lesson' : 'Quiz'}
                            </Badge>
                            {getStatusBadge(item.status)}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            Content ID: {item.contentId || 'Custom content'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.status === 'locked' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleItemLock(item.id, true)}
                            >
                              <Unlock className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Content Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Content to Curriculum</DialogTitle>
            <DialogDescription>
              Select content to add to {student.displayName}'s learning path
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Sport/Pillar</Label>
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a sport..." />
                </SelectTrigger>
                <SelectContent>
                  {sports.map((sport) => (
                    <SelectItem key={sport.id} value={sport.id}>
                      {sport.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedSport && (
              <div className="space-y-2">
                <Label>Content Type</Label>
                <div className="flex gap-2">
                  <Button
                    variant={selectedContent?.type === 'lesson' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() =>
                      setSelectedContent({
                        type: 'lesson',
                        id: 'lesson-placeholder',
                        title: 'Sample Lesson',
                      })
                    }
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Lesson
                  </Button>
                  <Button
                    variant={selectedContent?.type === 'quiz' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() =>
                      setSelectedContent({
                        type: 'quiz',
                        id: 'quiz-placeholder',
                        title: 'Sample Quiz',
                      })
                    }
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Quiz
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Note: Full content browser will be added in future update
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={addContentToCurriculum}
              disabled={!selectedSport || !selectedContent}
            >
              Add to Curriculum
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
