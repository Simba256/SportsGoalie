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
import Link from 'next/link';
import {
  Edit,
  Eye,
  Save,
  X,
  Users,
  Sparkles,
  BookOpen,
  Brain,
  Footprints,
  Shapes,
  Target,
  Grid3X3,
  Dumbbell,
  Heart,
} from 'lucide-react';

const PILLAR_ICONS: Record<string, React.ElementType> = {
  Brain, Footprints, Shapes, Target, Grid3X3, Dumbbell, Heart,
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
  name: '', description: '', color: '#3B82F6', category: '',
  difficulty: 'introduction', imageUrl: '', tags: [],
  isActive: true, isFeatured: false, order: 0,
};

function AdminPillarsContent() {
  const [state, setState] = useState<AdminPillarsState>({
    pillars: [], loading: true, error: null, editingId: null,
  });
  const [formData, setFormData] = useState<PillarFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadPillars(); }, []);

  const loadPillars = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await sportsService.getAllSports({ limit: 100 });
      if (result.success && result.data) {
        setState(prev => ({ ...prev, pillars: result.data!.items.sort((a, b) => a.order - b.order), loading: false }));
      } else {
        setState(prev => ({ ...prev, error: result.error?.message || 'Failed to load pillars', loading: false }));
      }
    } catch {
      setState(prev => ({ ...prev, error: 'An unexpected error occurred', loading: false }));
    }
  };

  const handleEdit = (pillar: Sport) => {
    setFormData({
      name: pillar.name, description: pillar.description, color: pillar.color,
      category: pillar.category, difficulty: pillar.difficulty,
      imageUrl: pillar.imageUrl || '', tags: pillar.tags,
      isActive: pillar.isActive, isFeatured: pillar.isFeatured, order: pillar.order,
    });
    setState(prev => ({ ...prev, editingId: pillar.id }));
  };

  const handleCancel = () => {
    setFormData(defaultFormData);
    setUploadedFiles([]);
    setState(prev => ({ ...prev, editingId: null }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) { setState(prev => ({ ...prev, error: 'Pillar name is required' })); return; }
    setSaving(true);
    try {
      let imageUrl = formData.imageUrl;
      if (uploadedFiles.length > 0) {
        setUploading(true);
        const uploadResult = await storageService.uploadFile(uploadedFiles[0], STORAGE_CONFIGS.SPORT_IMAGES);
        if (uploadResult.success && uploadResult.url) { imageUrl = uploadResult.url; }
        else { setState(prev => ({ ...prev, error: uploadResult.error || 'Failed to upload image' })); setUploading(false); setSaving(false); return; }
        setUploading(false);
      }
      if (state.editingId) {
        const result = await sportsService.updateSport(state.editingId, {
          ...formData, imageUrl, icon: formData.tags[0] || 'Target', estimatedTimeToComplete: 120, createdBy: 'admin',
        });
        if (result.success) { await loadPillars(); handleCancel(); }
        else { setState(prev => ({ ...prev, error: result.error?.message || 'Failed to save pillar' })); }
      }
    } catch {
      setState(prev => ({ ...prev, error: 'An unexpected error occurred while saving' }));
    } finally { setSaving(false); setUploading(false); }
  };

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

  if (state.loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Loading pillars...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header — matches goalie side */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Pillar Management
              </h1>
              <Sparkles className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Manage the 7 Ice Hockey Goalie pillars, their content, and skills.
            </p>
          </div>
          <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
            {state.pillars.length} pillars
          </div>
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
            <Button variant="outline" size="sm" onClick={() => setState(prev => ({ ...prev, error: null }))} className="mt-2">Dismiss</Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      {state.editingId && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle>Edit Pillar</CardTitle>
            <CardDescription>Update pillar information and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={formData.category} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Default Difficulty</Label>
                <select id="difficulty" value={formData.difficulty} onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as DifficultyLevel }))} className="w-full border rounded px-3 py-2">
                  <option value="introduction">Introduction</option>
                  <option value="development">Development</option>
                  <option value="refinement">Refinement</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <Input id="order" type="number" value={formData.order} disabled />
                <p className="text-xs text-muted-foreground">Order is fixed for the 7 pillars</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} className="w-full border rounded px-3 py-2 min-h-[100px]" />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input id="imageUrl" value={formData.imageUrl} onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))} placeholder="https://example.com/image.jpg" />
              </div>
              <div className="space-y-2">
                <Label>Upload Pillar Image</Label>
                <MediaUpload onUpload={setUploadedFiles} acceptedTypes={['image/jpeg', 'image/png', 'image/webp']} maxFiles={1} maxSizePerFile={10} />
                {uploadedFiles.length > 0 && <p className="text-sm text-green-600">Image ready: {uploadedFiles[0].name}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input id="tags" value={formData.tags.join(', ')} onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value.split(', ').filter(Boolean) }))} />
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} className="rounded" />
                <span>Active</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))} className="rounded" />
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

      {/* Pillars Grid — same 3-col layout as goalie side */}
      {state.pillars.length === 0 ? (
        <Card className="p-8">
          <div className="text-center space-y-4">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-medium">No pillars found</h3>
            <p className="text-muted-foreground">Run the migration script to create the 7 pillars.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.pillars.map((pillar) => {
            const displayInfo = getPillarDisplayInfo(pillar);
            const colorClasses = getPillarColorClasses(displayInfo.color);
            const IconComponent = PILLAR_ICONS[displayInfo.icon] || Target;

            return (
              <Card key={pillar.id} className={`h-full hover:shadow-lg transition-all duration-300 group border-2 ${colorClasses.border} hover:scale-[1.02] overflow-hidden`}>
                {/* Gradient Header */}
                <div className={`h-24 bg-gradient-to-br ${colorClasses.gradient} rounded-t-lg flex items-center justify-center relative overflow-hidden`}>
                  <IconComponent className="w-12 h-12 text-white drop-shadow-lg" />
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {!pillar.isActive && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">Inactive</div>
                  )}
                  {pillar.isFeatured && (
                    <div className="absolute top-2 right-2 bg-white/90 text-xs px-2 py-1 rounded-full font-medium">Featured</div>
                  )}
                </div>

                <CardHeader className="space-y-2 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pillar.name}</CardTitle>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorClasses.bgLight} ${colorClasses.text}`}>
                      Pillar {pillar.order}
                    </span>
                  </div>
                  <CardDescription className="line-clamp-2">{pillar.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{pillar.skillsCount} skills</span>
                    </div>
                  </div>

                  {pillar.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {pillar.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">{tag}</span>
                      ))}
                    </div>
                  )}

                  {/* Admin Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => handleEdit(pillar)}>
                      <Edit className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                    <Link href={`/admin/pillars/${pillar.id}/skills`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        <BookOpen className="w-3.5 h-3.5 mr-1" />
                        Skills
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="px-2" onClick={() => window.open(`/pillars/${pillar.id}`, '_blank')} title="Preview">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info Card — same as goalie side */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">About the 7 Pillars</h3>
              <p className="text-muted-foreground">
                These 7 pillars form the foundation of comprehensive goaltender development.
                Each pillar contains skills at 3 difficulty levels (Introduction, Development, Refinement).
                Skills are shown to goalies based on their assessed pacing level from onboarding.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
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
