'use client';

import { useState, useEffect } from 'react';
import { Sport, DifficultyLevel, PILLARS } from '@/types';
import { SkeletonDarkPage } from '@/components/ui/skeletons';
import { AdminRoute } from '@/components/auth/protected-route';
import { sportsService } from '@/lib/database/services/sports.service';
import { storageService, STORAGE_CONFIGS } from '@/lib/firebase/storage.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MediaUpload } from '@/components/admin/media-upload';
import { getPillarSlugFromDocId } from '@/lib/utils/pillars';
import Link from 'next/link';
import {
  Edit,
  Eye,
  Save,
  X,
  Sparkles,
  BookOpen,
  ArrowRight,
  RefreshCw,
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

const PILLAR_THEME: Record<
  string,
  {
    badgeClass: string;
    iconBg: string;
    iconText: string;
    ctaClass: string;
    borderHover: string;
  }
> = {
  purple: {
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    ctaClass: 'text-blue-600 group-hover:text-blue-700',
    borderHover: 'hover:border-blue-300',
  },
  blue: {
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    ctaClass: 'text-blue-600 group-hover:text-blue-700',
    borderHover: 'hover:border-blue-300',
  },
  green: {
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    ctaClass: 'text-blue-600 group-hover:text-blue-700',
    borderHover: 'hover:border-blue-300',
  },
  orange: {
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    ctaClass: 'text-blue-600 group-hover:text-blue-700',
    borderHover: 'hover:border-blue-300',
  },
  red: {
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    ctaClass: 'text-blue-600 group-hover:text-blue-700',
    borderHover: 'hover:border-blue-300',
  },
  cyan: {
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    ctaClass: 'text-blue-600 group-hover:text-blue-700',
    borderHover: 'hover:border-blue-300',
  },
  pink: {
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    ctaClass: 'text-blue-600 group-hover:text-blue-700',
    borderHover: 'hover:border-blue-300',
  },
};

const PILLAR_DESCRIPTIONS: Record<string, string> = {
  mindset: 'Build your mental fortress. Learn why your brain does what it does and how to redirect anxiety into performance energy.',
  skating: 'Build your goalie dream on skill skating, as a skill. Learn a vision to pair with skating reason project.',
  form: 'Build your goalie structure. Skating is creativity, form and as structure, repetition, structure, assignments.',
  positioning: 'Build your goalie mask for anxiety position paths and the scan team of the most positional systems.',
  seven_point: 'Build your mentalframes. Learn your positioning as strong unlock to form 7 Point System below icing line.',
  training: 'Build your game/practice/off-ice, vision my different weighting off-ice.',
  lifestyle: 'Build your lifestyle habits to support confidence, focus, and consistent performance in and out of the crease.',
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
      if (info) return { icon: info.icon, color: info.color, shortName: info.shortName, slug };
    }
    return {
      icon: pillar.icon,
      color: 'blue',
      shortName: pillar.name.split(' ')[0],
      slug: null,
    };
  };

  if (state.loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SkeletonDarkPage />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <section
        className="relative -mx-4 -mt-4 md:-mx-6 md:-mt-6 rounded-b-none overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1514511719-9f5849dc16d0?w=1920&q=80&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/75 via-slate-900/65 to-slate-900/85" />
        <div className="relative z-10 px-6 py-10 md:px-8 md:py-14">
          <div className="max-w-3xl text-center mx-auto">
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight">
              The Architecture of
              <span className="block">a Complete Goalie</span>
            </h1>
            <p className="mt-3 text-sm md:text-base text-white/80 leading-relaxed">
              Every pillar connects to every other. Master all seven and you master the game - physically, mentally, and technically.
              Each one builds on the last.
            </p>
            <div className="mt-4 inline-flex items-center rounded-full border border-blue-300/50 bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-100">
              {state.pillars.length} pillars
            </div>
          </div>
        </div>
      </section>

      {/* Error Display */}
      {state.error && (
        <Card className="mx-auto max-w-2xl border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <span className="font-medium">Error:</span>
              <span>{state.error}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" onClick={loadPillars}>
                <RefreshCw className="w-4 h-4 mr-1" /> Try Again
              </Button>
              <Button variant="outline" size="sm" onClick={() => setState(prev => ({ ...prev, error: null }))}>Dismiss</Button>
            </div>
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
        <Card className="p-8 mx-auto max-w-2xl">
          <div className="text-center space-y-4">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-medium">No pillars found</h3>
            <p className="text-muted-foreground">Run the migration script to create the 7 pillars.</p>
          </div>
        </Card>
      ) : (
        <section className="max-w-5xl mx-auto px-4 md:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {state.pillars.map((pillar) => {
            const displayInfo = getPillarDisplayInfo(pillar);
            const theme = PILLAR_THEME[displayInfo.color] ?? PILLAR_THEME.blue;
            const IconComponent = PILLAR_ICONS[displayInfo.icon] || Target;
            const description =
              (displayInfo.slug && PILLAR_DESCRIPTIONS[displayInfo.slug]) || pillar.description;

            return (
              <Card key={pillar.id} className={`group rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${theme.borderHover}`}>
                <CardHeader className="space-y-2 pb-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${theme.iconBg}`}>
                        <IconComponent className={`h-5 w-5 ${theme.iconText}`} />
                      </div>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${theme.badgeClass}`}>
                        Pillar {String(pillar.order).padStart(2, '0')}
                      </span>
                    </div>
                    {!pillar.isActive && (
                      <span className="rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-semibold text-red-700">Inactive</span>
                    )}
                  </div>
                  <CardTitle className="text-xl leading-snug">{pillar.name}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed line-clamp-4">{description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <button
                    onClick={() => window.open(`/pillars/${pillar.id}`, '_blank')}
                    className={`inline-flex items-center gap-1 text-sm font-semibold transition-colors ${theme.ctaClass}`}
                  >
                    Explore Pillar
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </button>

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
        </section>
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
