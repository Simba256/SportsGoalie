'use client';

import { useState, useEffect } from 'react';
import { Sport, DifficultyLevel } from '@/types';
import { AdminRoute } from '@/components/auth/protected-route';
import { sportsService } from '@/lib/database/services/sports.service';
import { storageService, STORAGE_CONFIGS } from '@/lib/firebase/storage.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MediaUpload } from '@/components/admin/media-upload';
import { useDeleteConfirmation } from '@/components/ui/confirmation-dialog';
import { IconPicker } from '@/components/ui/icon-picker';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  Search,
  Clock,
  Users,
  Star,
} from 'lucide-react';

interface AdminSportsState {
  sports: Sport[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  editingId: string | null;
  showCreateForm: boolean;
}

interface SportFormData {
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  difficulty: DifficultyLevel;
  estimatedTimeToComplete: number;
  imageUrl: string;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  order: number;
}

const defaultFormData: SportFormData = {
  name: '',
  description: '',
  icon: '',
  color: '#3B82F6',
  category: '',
  difficulty: 'beginner',
  estimatedTimeToComplete: 120,
  imageUrl: '',
  tags: [],
  isActive: true,
  isFeatured: false,
  order: 0,
};

function AdminSportsContent() {
  const [state, setState] = useState<AdminSportsState>({
    sports: [],
    loading: true,
    error: null,
    searchQuery: '',
    editingId: null,
    showCreateForm: false,
  });

  const [formData, setFormData] = useState<SportFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // Custom confirmation dialog for delete operations
  const { dialog, showDeleteConfirmation, setLoading } = useDeleteConfirmation();

  useEffect(() => {
    loadSports();
  }, []);

  const loadSports = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await sportsService.getAllSports({ limit: 100 });
      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          sports: result.data!.items,
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

  const handleEdit = (sport: Sport) => {
    setFormData({
      name: sport.name,
      description: sport.description,
      icon: sport.icon,
      color: sport.color,
      category: sport.category,
      difficulty: sport.difficulty,
      estimatedTimeToComplete: sport.estimatedTimeToComplete,
      imageUrl: sport.imageUrl || '',
      tags: sport.tags,
      isActive: sport.isActive,
      isFeatured: sport.isFeatured,
      order: sport.order,
    });
    setState(prev => ({ ...prev, editingId: sport.id, showCreateForm: false }));
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
    // Validate required fields
    if (!formData.name.trim()) {
      setState(prev => ({ ...prev, error: 'Course name is required' }));
      return;
    }

    if (!formData.icon.trim()) {
      setState(prev => ({ ...prev, error: 'Please select an icon for the course' }));
      return;
    }

    setSaving(true);

    try {
      // Upload image if a new file was selected
      let imageUrl = formData.imageUrl;
      if (uploadedFiles.length > 0) {
        setUploading(true);
        const uploadResult = await storageService.uploadFile(
          uploadedFiles[0],
          STORAGE_CONFIGS.SPORT_IMAGES
        );

        if (uploadResult.success && uploadResult.url) {
          imageUrl = uploadResult.url;
        } else {
          setState(prev => ({
            ...prev,
            error: uploadResult.error || 'Failed to upload image',
          }));
          setUploading(false);
          setSaving(false);
          return;
        }
        setUploading(false);
      }

      // Update form data with uploaded image URL
      const finalFormData = {
        ...formData,
        imageUrl,
        createdBy: 'admin', // Add required createdBy field
      };

      let result;
      if (state.editingId) {
        // Update existing sport
        result = await sportsService.updateSport(state.editingId, finalFormData);
      } else {
        // Create new sport
        result = await sportsService.createSport(finalFormData);
      }

      if (result.success) {
        await loadSports();
        handleCancel();
      } else {
        setState(prev => ({
          ...prev,
          error: result.error?.message || 'Failed to save course',
        }));
      }
    } catch {
      setState(prev => ({
        ...prev,
        error: 'An unexpected error occurred while saving',
      }));
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleDelete = (sportId: string, sportName: string) => {
    showDeleteConfirmation({
      title: 'Delete Course',
      description: `Are you sure you want to delete "${sportName}"? This action cannot be undone and will remove all associated skills and data.`,
      itemName: 'course',
      onConfirm: async () => {
        setLoading(true);
        try {
          const result = await sportsService.deleteSport(sportId);
          if (result.success) {
            await loadSports();
          } else {
            setState(prev => ({
              ...prev,
              error: result.error?.message || 'Failed to delete course',
            }));
          }
        } catch {
          setState(prev => ({
            ...prev,
            error: 'An unexpected error occurred while deleting',
          }));
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const filteredSports = state.sports.filter(sport =>
    sport.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
    sport.description.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
    sport.category.toLowerCase().includes(state.searchQuery.toLowerCase())
  );

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

  if (state.loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
          <p className="text-muted-foreground">
            Manage course content and settings
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Course
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder="Search courses..."
          value={state.searchQuery}
          onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
          className="pl-10"
        />
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
              {state.editingId ? 'Edit Course' : 'Create New Course'}
            </CardTitle>
            <CardDescription>
              {state.editingId ? 'Update course information' : 'Add a new course to the catalog'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Course name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., team-sports, individual-sports"
                />
              </div>

              <div className="space-y-2">
                <IconPicker
                  label="Course Icon"
                  value={formData.icon}
                  onChange={(icon) => setFormData(prev => ({ ...prev, icon }))}
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
                <Label htmlFor="estimatedTime">Estimated Time (hours)</Label>
                <Input
                  id="estimatedTime"
                  type="number"
                  value={formData.estimatedTimeToComplete}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedTimeToComplete: parseInt(e.target.value) || 0 }))}
                  placeholder="120"
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
                placeholder="Course description..."
                className="w-full border rounded px-3 py-2 min-h-[100px]"
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  You can enter a URL directly or upload an image below
                </p>
              </div>

              <div className="space-y-2">
                <Label>Upload Course Image</Label>
                <MediaUpload
                  onUpload={setUploadedFiles}
                  acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                  maxFiles={1}
                  maxSizePerFile={10}
                />
                {uploadedFiles.length > 0 && (
                  <p className="text-sm text-green-600">
                    ✓ Image ready for upload: {uploadedFiles[0].name}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value.split(', ').filter(Boolean) }))}
                placeholder="team, indoor, ball-game"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded"
                />
                <span>Active</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  className="rounded"
                />
                <span>Featured</span>
              </label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving || uploading} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {uploading ? 'Uploading...' : saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={saving || uploading} className="flex items-center gap-2">
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sports List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Courses ({filteredSports.length})</h2>

        {filteredSports.length === 0 ? (
          <Card className="p-8">
            <div className="text-center space-y-4">
              <div className="text-6xl">🔍</div>
              <h3 className="text-lg font-medium">No courses found</h3>
              <p className="text-muted-foreground">
                {state.searchQuery ? 'Try adjusting your search terms.' : 'Start by creating your first course.'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredSports.map((sport) => (
              <Card key={sport.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{sport.icon}</span>
                        <div>
                          <h3 className="font-semibold">{sport.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="bg-muted px-2 py-1 rounded text-xs">
                              {sport.category}
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs ${getDifficultyColor(sport.difficulty)}`}
                            >
                              {sport.difficulty}
                            </span>
                            {sport.isFeatured && (
                              <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                                Featured
                              </span>
                            )}
                            {!sport.isActive && (
                              <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs">
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {sport.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{sport.estimatedTimeToComplete}h</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{sport.skillsCount} skills</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          <span>{sport.metadata.averageRating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/sports/${sport.id}`, '_blank')}
                        className="h-8 w-8 p-0"
                        title="View Public Page"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/admin/sports/${sport.id}/skills`, '_blank')}
                        className="h-8 w-8 p-0"
                        title="Manage Skills"
                      >
                        <Users className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(sport)}
                        className="h-8 w-8 p-0"
                        title="Edit Course"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(sport.id, sport.name)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        title="Delete Course"
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

      {/* Custom confirmation dialog */}
      {dialog}
    </div>
  );
}

export default function AdminSportsPage() {
  return (
    <AdminRoute>
      <AdminSportsContent />
    </AdminRoute>
  );
}