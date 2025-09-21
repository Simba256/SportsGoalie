'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sport, Skill, DifficultyLevel } from '@/types';
import { sportsService } from '@/lib/database/services/sports.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MediaUpload } from '@/components/admin/media-upload';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Clock,
  BookOpen,
  Play,
  CheckCircle,
  Target,
} from 'lucide-react';

interface AdminSkillsState {
  sport: Sport | null;
  skills: Skill[];
  loading: boolean;
  error: string | null;
  editingId: string | null;
  showCreateForm: boolean;
}

interface SkillFormData {
  name: string;
  description: string;
  difficulty: DifficultyLevel;
  estimatedTimeToComplete: number;
  content: string;
  learningObjectives: string[];
  tags: string[];
  hasVideo: boolean;
  hasQuiz: boolean;
  isActive: boolean;
  order: number;
  prerequisites: string[];
}

const defaultFormData: SkillFormData = {
  name: '',
  description: '',
  difficulty: 'beginner',
  estimatedTimeToComplete: 30,
  content: '',
  learningObjectives: [],
  tags: [],
  hasVideo: false,
  hasQuiz: false,
  isActive: true,
  order: 0,
  prerequisites: [],
};

export default function AdminSkillsPage() {
  const params = useParams();
  const router = useRouter();
  const sportId = params.id as string;

  const [state, setState] = useState<AdminSkillsState>({
    sport: null,
    skills: [],
    loading: true,
    error: null,
    editingId: null,
    showCreateForm: false,
  });

  const [formData, setFormData] = useState<SkillFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!sportId) return;
    loadData();
  }, [sportId]);

  const loadData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [sportResult, skillsResult] = await Promise.all([
        sportsService.getSport(sportId),
        sportsService.getSkillsBySport(sportId),
      ]);

      if (!sportResult.success || !sportResult.data) {
        setState(prev => ({
          ...prev,
          error: 'Sport not found',
          loading: false,
        }));
        return;
      }

      if (!skillsResult.success) {
        setState(prev => ({
          ...prev,
          sport: sportResult.data,
          error: skillsResult.error?.message || 'Failed to load skills',
          loading: false,
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        sport: sportResult.data,
        skills: skillsResult.data?.items || [],
        loading: false,
      }));
    } catch {
      setState(prev => ({
        ...prev,
        error: 'An unexpected error occurred',
        loading: false,
      }));
    }
  };

  const handleEdit = (skill: Skill) => {
    setFormData({
      name: skill.name,
      description: skill.description,
      difficulty: skill.difficulty,
      estimatedTimeToComplete: skill.estimatedTimeToComplete,
      content: skill.content || '',
      learningObjectives: skill.learningObjectives,
      tags: skill.tags,
      hasVideo: skill.hasVideo,
      hasQuiz: skill.hasQuiz,
      isActive: skill.isActive,
      order: skill.order,
      prerequisites: skill.prerequisites,
    });
    setState(prev => ({ ...prev, editingId: skill.id, showCreateForm: false }));
  };

  const handleCreate = () => {
    setFormData(defaultFormData);
    setState(prev => ({ ...prev, showCreateForm: true, editingId: null }));
  };

  const handleCancel = () => {
    setFormData(defaultFormData);
    setUploadedFiles([]);
    setState(prev => ({ ...prev, editingId: null, showCreateForm: false }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      let result;
      const skillData = {
        ...formData,
        sportId,
        externalResources: [],
        media: uploadedFiles.length > 0 ? {
          text: formData.content,
          images: uploadedFiles
            .filter(file => file.type.startsWith('image/'))
            .map((file, index) => ({
              id: `img-${index}`,
              url: URL.createObjectURL(file), // In production, upload to storage first
              alt: file.name,
              caption: '',
              order: index,
            })),
          videos: uploadedFiles
            .filter(file => file.type.startsWith('video/'))
            .map((file, index) => ({
              id: `vid-${index}`,
              youtubeId: '', // Would be set after processing
              title: file.name,
              duration: 0, // Would be determined after upload
              thumbnail: '',
              order: index,
            })),
        } : undefined,
      };

      if (state.editingId) {
        result = await sportsService.updateSkill(state.editingId, skillData);
      } else {
        result = await sportsService.createSkill(skillData);
      }

      if (result.success) {
        await loadData();
        handleCancel();
      } else {
        setState(prev => ({
          ...prev,
          error: result.error?.message || 'Failed to save skill',
        }));
      }
    } catch {
      setState(prev => ({
        ...prev,
        error: 'An unexpected error occurred while saving',
      }));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (skillId: string) => {
    if (!confirm('Are you sure you want to delete this skill? This cannot be undone.')) {
      return;
    }

    try {
      const result = await sportsService.deleteSkill(skillId);
      if (result.success) {
        await loadData();
      } else {
        setState(prev => ({
          ...prev,
          error: result.error?.message || 'Failed to delete skill',
        }));
      }
    } catch {
      setState(prev => ({
        ...prev,
        error: 'An unexpected error occurred while deleting',
      }));
    }
  };

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-100';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-100';
      case 'advanced':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  if (state.loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading skills...</p>
          </div>
        </div>
      </div>
    );
  }

  if (state.error && !state.sport) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-red-600 text-4xl">⚠️</div>
              <h3 className="text-lg font-medium text-red-900">{state.error}</h3>
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sports Management
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {state.sport?.icon} {state.sport?.name} - Skills Management
            </h1>
            <p className="text-muted-foreground">
              Manage skills for this sport
            </p>
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Skill
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <span className="font-medium">Error:</span>
              <span>{state.error}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setState(prev => ({ ...prev, error: null }))}
              className="mt-2"
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Form */}
      {(state.showCreateForm || state.editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {state.editingId ? 'Edit Skill' : 'Create New Skill'}
            </CardTitle>
            <CardDescription>
              {state.editingId ? 'Update skill information' : 'Add a new skill to this sport'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Skill name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <select
                  id="difficulty"
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as DifficultyLevel }))}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
                <Input
                  id="estimatedTime"
                  type="number"
                  value={formData.estimatedTimeToComplete}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedTimeToComplete: parseInt(e.target.value) || 0 }))}
                  placeholder="30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Skill description..."
                className="w-full border rounded px-3 py-2 min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content (HTML)</Label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Detailed skill content in HTML format..."
                className="w-full border rounded px-3 py-2 min-h-[200px] font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objectives">Learning Objectives (one per line)</Label>
              <textarea
                id="objectives"
                value={formData.learningObjectives.join('\n')}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  learningObjectives: e.target.value.split('\n').filter(Boolean)
                }))}
                placeholder="Master basic dribbling technique&#10;Understand ball control fundamentals&#10;Practice coordination drills"
                className="w-full border rounded px-3 py-2 min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value.split(', ').filter(Boolean) }))}
                placeholder="fundamentals, technique, basics"
              />
            </div>

            {/* Media Upload */}
            <div className="space-y-2">
              <Label>Media Files</Label>
              <MediaUpload
                onUpload={setUploadedFiles}
                acceptedTypes={['image/*', 'video/*']}
                maxFiles={10}
                maxSizePerFile={50}
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasVideo}
                  onChange={(e) => setFormData(prev => ({ ...prev, hasVideo: e.target.checked }))}
                  className="rounded"
                />
                <span>Has Video Content</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasQuiz}
                  onChange={(e) => setFormData(prev => ({ ...prev, hasQuiz: e.target.checked }))}
                  className="rounded"
                />
                <span>Has Quiz</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded"
                />
                <span>Active</span>
              </label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Skills ({state.skills.length})</h2>

        {state.skills.length === 0 ? (
          <Card className="p-8">
            <div className="text-center space-y-4">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-medium">No skills yet</h3>
              <p className="text-muted-foreground">
                Start by creating the first skill for this sport.
              </p>
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Skill
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {state.skills.map((skill, index) => (
              <Card key={skill.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-muted px-2 py-1 rounded text-xs">
                            Skill {index + 1}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${getDifficultyColor(skill.difficulty)}`}
                          >
                            {skill.difficulty}
                          </span>
                          {!skill.isActive && (
                            <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs">
                              Inactive
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold">{skill.name}</h3>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {skill.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(skill.estimatedTimeToComplete)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          <span>{skill.learningObjectives.length} objectives</span>
                        </div>
                        {skill.hasVideo && (
                          <div className="flex items-center gap-1">
                            <Play className="w-4 h-4" />
                            <span>Video</span>
                          </div>
                        )}
                        {skill.hasQuiz && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            <span>Quiz</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(skill)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(skill.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}