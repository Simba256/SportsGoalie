'use client';

import { useState, useEffect } from 'react';
import { Sport, DifficultyLevel, PILLARS } from '@/types';
import { AdminRoute } from '@/components/auth/protected-route';
import { sportsService } from '@/lib/database/services/sports.service';
import { storageService, STORAGE_CONFIGS } from '@/lib/firebase/storage.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MediaUpload } from '@/components/admin/media-upload';
import { getPillarColorClasses, getPillarSlugFromDocId } from '@/lib/utils/pillars';
import {
  Edit,
  Eye,
  Save,
  X,
  Users,
  Star,
  Brain,
  Footprints,
  Shapes,
  Target,
  Grid3X3,
  Dumbbell,
  Heart,
  Info,
} from 'lucide-react';

// Icon map for pillar icons
const PILLAR_ICONS: Record<string, React.ElementType> = {
  Brain,
  Footprints,
  Shapes,
  Target,
  Grid3X3,
  Dumbbell,
  Heart,
};

interface AdminPillarsState {
  pillars: Sport[];
  loading: boolean;
  error: string | null;
  editingId: string | null;
}

interface PillarFormData {
  name: string;
  description: string;
  color: string;
  category: string;
  difficulty: DifficultyLevel;
  imageUrl: string;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  order: number;
}

const defaultFormData: PillarFormData = {
  name: '',
  description: '',
  color: '#3B82F6',
  category: '',
  difficulty: 'introduction',
  imageUrl: '',
  tags: [],
  isActive: true,
  isFeatured: false,
  order: 0,
};

function AdminPillarsContent() {
  const [state, setState] = useState<AdminPillarsState>({
    pillars: [],
    loading: true,
    error: null,
    editingId: null,
  });

  const [formData, setFormData] = useState<PillarFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadPillars();
  }, []);

  const loadPillars = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await sportsService.getAllSports({ limit: 100 });
      if (result.success && result.data) {
        // Sort by order
        const sortedPillars = result.data.items.sort((a, b) => a.order - b.order);
        setState(prev => ({
          ...prev,
          pillars: sortedPillars,
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: result.error?.message || 'Failed to load pillars',
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

  const handleEdit = (pillar: Sport) => {
    setFormData({
      name: pillar.name,
      description: pillar.description,
      color: pillar.color,
      category: pillar.category,
      difficulty: pillar.difficulty,
      imageUrl: pillar.imageUrl || '',
      tags: pillar.tags,
      isActive: pillar.isActive,
      isFeatured: pillar.isFeatured,
      order: pillar.order,
    });
    setState(prev => ({ ...prev, editingId: pillar.id }));
  };

  const handleCancel = () => {
    setFormData(defaultFormData);
    setUploadedFiles([]);
    setState(prev => ({ ...prev, editingId: null }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setState(prev => ({ ...prev, error: 'Pillar name is required' }));
      return;
    }

    setSaving(true);

    try {
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

      const finalFormData = {
        ...formData,
        imageUrl,
        icon: formData.tags[0] || 'Target', // Keep icon synced
        estimatedTimeToComplete: 120,
        createdBy: 'admin',
      };

      if (state.editingId) {
        const result = await sportsService.updateSport(state.editingId, finalFormData);

        if (result.success) {
          await loadPillars();
          handleCancel();
        } else {
          setState(prev => ({
            ...prev,
            error: result.error?.message || 'Failed to save pillar',
          }));
        }
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

  // Get pillar display info
  const getPillarDisplayInfo = (pillar: Sport) => {
    const slug = getPillarSlugFromDocId(pillar.id);
    if (slug) {
      const info = PILLARS.find(p => p.slug === slug);
      if (info) {
        return {
          icon: info.icon,
          color: info.color,
          shortName: info.shortName,
        };
      }
    }
    return {
      icon: pillar.icon,
      color: 'blue',
      shortName: pillar.name.split(' ')[0],
    };
  };

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'introduction':
        return 'text-green-600 bg-green-100';
      case 'development':
        return 'text-yellow-600 bg-yellow-100';
      case 'refinement':
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
            <p className="text-muted-foreground">Loading pillars...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Pillar Management</h1>
          <p className="text-muted-foreground">
            Manage the 7 Ice Hockey Goalie pillars and their content
          </p>
        </div>
      </div>

      {/* Info Card - Pillars are fixed */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Fixed 7-Pillar Structure
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                The platform uses 7 fixed pillars that align with the Ice Hockey Goalie training system.
                You can edit pillar details and manage skills within each pillar, but cannot add or remove pillars.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Edit Form */}
      {state.editingId && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Pillar</CardTitle>
            <CardDescription>
              Update pillar information and settings
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
                  placeholder="Pillar name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Ice Hockey Goalie"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Default Difficulty</Label>
                <select
                  id="difficulty"
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as DifficultyLevel }))}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="introduction">Introduction</option>
                  <option value="development">Development</option>
                  <option value="refinement">Refinement</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  placeholder="1-6"
                  disabled
                />
                <p className="text-xs text-muted-foreground">Order is fixed for the 7 pillars</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Pillar description..."
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
                <Label>Upload Pillar Image</Label>
                <MediaUpload
                  onUpload={setUploadedFiles}
                  acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                  maxFiles={1}
                  maxSizePerFile={10}
                />
                {uploadedFiles.length > 0 && (
                  <p className="text-sm text-green-600">
                    Image ready for upload: {uploadedFiles[0].name}
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
                placeholder="ice-hockey, goalie, mindset"
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

      {/* Pillars List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">The 7 Pillars ({state.pillars.length})</h2>

        {state.pillars.length === 0 ? (
          <Card className="p-8">
            <div className="text-center space-y-4">
              <div className="text-6xl">!</div>
              <h3 className="text-lg font-medium">No pillars found</h3>
              <p className="text-muted-foreground">
                Run the migration script to create the 7 pillars.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {state.pillars.map((pillar) => {
              const displayInfo = getPillarDisplayInfo(pillar);
              const colorClasses = getPillarColorClasses(displayInfo.color);
              const IconComponent = PILLAR_ICONS[displayInfo.icon] || Target;

              return (
                <Card key={pillar.id} className={`hover:shadow-md transition-shadow overflow-hidden border-2 ${colorClasses.border}`}>
                  {/* Colored Header */}
                  <div className={`h-16 bg-gradient-to-r ${colorClasses.gradient} flex items-center px-6`}>
                    <div className="flex items-center gap-3 text-white">
                      <IconComponent className="w-8 h-8" />
                      <div>
                        <span className="text-sm opacity-80">Pillar {pillar.order}</span>
                        <h3 className="font-semibold text-lg -mt-1">{pillar.name}</h3>
                      </div>
                    </div>
                  </div>

                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="bg-muted px-2 py-1 rounded text-xs">
                            {pillar.category}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${getDifficultyColor(pillar.difficulty)}`}
                          >
                            {pillar.difficulty}
                          </span>
                          {!pillar.isActive && (
                            <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs">
                              Inactive
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {pillar.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{pillar.skillsCount} skills</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            <span>{pillar.metadata.averageRating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/pillars/${pillar.id}`, '_blank')}
                          className="h-8 w-8 p-0"
                          title="View Public Page"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/admin/pillars/${pillar.id}/skills`, '_blank')}
                          className="h-8 w-8 p-0"
                          title="Manage Skills"
                        >
                          <Users className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(pillar)}
                          className="h-8 w-8 p-0"
                          title="Edit Pillar"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPillarsPage() {
  return (
    <AdminRoute>
      <AdminPillarsContent />
    </AdminRoute>
  );
}
