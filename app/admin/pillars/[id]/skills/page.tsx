'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SkeletonDarkPage } from '@/components/ui/skeletons';
import { Sport, Skill, DifficultyLevel } from '@/types';
import { AdminRoute } from '@/components/auth/protected-route';
import { sportsService } from '@/lib/database/services/sports.service';
import { storageService, STORAGE_CONFIGS } from '@/lib/firebase/storage.service';
import { MediaUpload } from '@/components/admin/media-upload';
import { useDeleteConfirmation } from '@/components/ui/confirmation-dialog';
import { HTMLEditorWithAI } from '@/components/ui/html-editor-with-ai';
import {
  ArrowLeft, Plus, Edit, Trash2, Save, X, Clock, BookOpen, Play, Target,
  Brain, Footprints, Shapes, Grid3X3, Dumbbell,
} from 'lucide-react';
import { PILLARS } from '@/types';
import { getPillarSlugFromDocId } from '@/lib/utils/pillars';

const BLUE  = '#37b5ff';
const RED   = '#f87171';
const GREEN = '#22c55e';

const card = {
  background: 'rgba(2,18,44,0.85)',
  border: '1px solid rgba(55,181,255,0.14)',
  borderRadius: '16px',
} as const;

const PILLAR_GRADIENTS: Record<string, string> = {
  blue:   'linear-gradient(135deg, #1e3a8a, #3730a3)',
  green:  'linear-gradient(135deg, #14532d, #065f46)',
  red:    'linear-gradient(135deg, #7f1d1d, #991b1b)',
  purple: 'linear-gradient(135deg, #4c1d95, #6b21a8)',
  orange: 'linear-gradient(135deg, #7c2d12, #9a3412)',
  yellow: 'linear-gradient(135deg, #713f12, #92400e)',
  teal:   'linear-gradient(135deg, #134e4a, #0f766e)',
};

const DIFF_STYLES: Record<string, { bg: string; color: string }> = {
  introduction: { bg: 'rgba(34,197,94,0.12)',   color: GREEN },
  development:  { bg: `rgba(55,181,255,0.12)`,  color: BLUE  },
  refinement:   { bg: 'rgba(248,113,113,0.15)', color: RED   },
};

const PILLAR_ICONS: Record<string, React.ElementType> = {
  Brain, Footprints, Shapes, Target, Grid3X3, Dumbbell,
};

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
  isActive: boolean;
  order: number;
  prerequisites: string[];
}

const defaultFormData: SkillFormData = {
  name: '', description: '', difficulty: 'introduction', estimatedTimeToComplete: 30,
  content: '', learningObjectives: [], tags: [], isActive: true, order: 0, prerequisites: [],
};

function AdminSkillsContent() {
  const params = useParams();
  const router = useRouter();
  const sportId = params.id as string;

  const [state, setState] = useState<AdminSkillsState>({ sport: null, skills: [], loading: true, error: null, editingId: null, showCreateForm: false });
  const [formData, setFormData] = useState<SkillFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  const { dialog, showDeleteConfirmation, setLoading } = useDeleteConfirmation();

  useEffect(() => { if (sportId) loadData(); }, [sportId]);

  const loadData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const [sportResult, skillsResult] = await Promise.all([
        sportsService.getSport(sportId),
        sportsService.getSkillsBySport(sportId),
      ]);
      if (!sportResult.success || !sportResult.data) {
        setState(prev => ({ ...prev, sport: null, error: 'Sport not found', loading: false }));
        return;
      }
      if (!skillsResult.success) {
        setState(prev => ({ ...prev, sport: sportResult.data || null, error: skillsResult.error?.message || 'Failed to load skills', loading: false }));
        return;
      }
      setState(prev => ({ ...prev, sport: sportResult.data || null, skills: skillsResult.data?.items || [], loading: false }));
    } catch {
      setState(prev => ({ ...prev, error: 'An unexpected error occurred', loading: false }));
    }
  };

  const handleEdit = (skill: Skill) => {
    setFormData({ name: skill.name, description: skill.description, difficulty: skill.difficulty, estimatedTimeToComplete: skill.estimatedTimeToComplete, content: skill.content || '', learningObjectives: skill.learningObjectives, tags: skill.tags, isActive: skill.isActive, order: skill.order, prerequisites: skill.prerequisites });
    setEditingSkill(skill);
    setState(prev => ({ ...prev, editingId: skill.id, showCreateForm: false }));
  };

  const handleCreate = () => {
    setFormData(defaultFormData);
    setEditingSkill(null);
    setState(prev => ({ ...prev, showCreateForm: true, editingId: null }));
  };

  const handleCancel = () => {
    setFormData(defaultFormData);
    setUploadedFiles([]);
    setEditingSkill(null);
    setState(prev => ({ ...prev, editingId: null, showCreateForm: false }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) { setState(prev => ({ ...prev, error: 'Skill name is required' })); return; }
    if (!formData.description.trim()) { setState(prev => ({ ...prev, error: 'Skill description is required' })); return; }
    if (formData.learningObjectives.length === 0) { setState(prev => ({ ...prev, error: 'At least one learning objective is required' })); return; }
    setSaving(true);
    try {
      let mediaUrls: string[] = [];
      if (uploadedFiles.length > 0) {
        setUploading(true);
        const uploadResults = await storageService.uploadFiles(uploadedFiles, STORAGE_CONFIGS.SKILL_MEDIA);
        mediaUrls = uploadResults.filter(r => r.success && r.url).map(r => r.url!);
        if (mediaUrls.length !== uploadedFiles.length) {
          setState(prev => ({ ...prev, error: 'Some media files failed to upload' }));
          setUploading(false); setSaving(false); return;
        }
        setUploading(false);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const skillData: any = { ...formData, sportId, createdBy: 'admin', externalResources: [], hasVideo: false };

      if (uploadedFiles.length > 0) {
        const videoFiles = uploadedFiles.filter(f => f.type.startsWith('video/'));
        const imageFiles = uploadedFiles.filter(f => f.type.startsWith('image/'));
        skillData.media = {
          text: formData.content,
          images: imageFiles.map((f, i) => ({ id: `img-${Date.now()}-${i}`, url: mediaUrls[uploadedFiles.indexOf(f)], alt: f.name, caption: f.name, order: i })),
          videos: videoFiles.map((f, i) => ({ id: `vid-${Date.now()}-${i}`, url: mediaUrls[uploadedFiles.indexOf(f)], youtubeId: '', title: f.name, duration: 0, thumbnail: '', order: i })),
        };
        skillData.hasVideo = videoFiles.length > 0;
      } else if (state.editingId && editingSkill?.media) {
        skillData.media = editingSkill.media;
        skillData.hasVideo = editingSkill.media.videos && editingSkill.media.videos.length > 0;
      }

      const result = state.editingId
        ? await sportsService.updateSkill(state.editingId, skillData)
        : await sportsService.createSkill(skillData);

      if (result.success) { await loadData(); handleCancel(); }
      else setState(prev => ({ ...prev, error: result.error?.message || 'Failed to save skill' }));
    } catch (error) {
      console.error('Skill creation error:', error);
      setState(prev => ({ ...prev, error: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}` }));
    } finally {
      setSaving(false); setUploading(false);
    }
  };

  const handleDelete = (skillId: string, skillName: string) => {
    showDeleteConfirmation({
      title: 'Delete Skill',
      description: `Are you sure you want to delete "${skillName}"? This action cannot be undone.`,
      itemName: 'skill',
      onConfirm: async () => {
        setLoading(true);
        try {
          const result = await sportsService.deleteSkill(skillId);
          if (result.success) await loadData();
          else setState(prev => ({ ...prev, error: result.error?.message || 'Failed to delete skill' }));
        } catch {
          setState(prev => ({ ...prev, error: 'An unexpected error occurred while deleting' }));
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  };

  if (state.loading) return <div className="container mx-auto px-4 py-8"><SkeletonDarkPage /></div>;

  if (state.error && !state.sport) {
    return (
      <div style={{ maxWidth: '800px', margin: '32px auto', padding: '0 24px' }}>
        <div style={{ ...card, padding: '40px', textAlign: 'center', border: '1px solid rgba(248,113,113,0.3)' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ color: RED, fontSize: '18px', marginBottom: '16px' }}>{state.error}</h3>
          <button onClick={() => router.back()} style={{ padding: '10px 20px', borderRadius: '10px', border: `1px solid rgba(55,181,255,0.25)`, background: `rgba(55,181,255,0.1)`, color: BLUE, cursor: 'pointer', fontWeight: 600 }}>
            <ArrowLeft size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Go Back
          </button>
        </div>
      </div>
    );
  }

  const getPillarDisplayInfo = () => {
    if (!state.sport) return null;
    const slug = getPillarSlugFromDocId(state.sport.id);
    if (slug) {
      const info = PILLARS.find(p => p.slug === slug);
      if (info) return { icon: info.icon, color: info.color, shortName: info.shortName };
    }
    return { icon: state.sport.icon, color: 'blue', shortName: state.sport.name.split(' ')[0] };
  };

  const displayInfo = getPillarDisplayInfo();
  const IconComponent = displayInfo ? (PILLAR_ICONS[displayInfo.icon] || Target) : Target;
  const pillarGradient = displayInfo ? (PILLAR_GRADIENTS[displayInfo.color] || PILLAR_GRADIENTS.blue) : PILLAR_GRADIENTS.blue;

  return (
    <>
      <style>{`
        .sk-input { color: #fff; background: rgba(255,255,255,0.05); border: 1px solid rgba(55,181,255,0.18); border-radius: 10px; padding: 10px 12px; width: 100%; outline: none; font-family: inherit; font-size: 15px; }
        .sk-input::placeholder { color: rgba(255,255,255,0.3); }
        .sk-input:focus { border-color: rgba(55,181,255,0.45); }
        .sk-ta { color: #fff; background: rgba(255,255,255,0.05); border: 1px solid rgba(55,181,255,0.18); border-radius: 10px; padding: 10px 12px; width: 100%; outline: none; resize: vertical; font-family: inherit; font-size: 15px; }
        .sk-ta::placeholder { color: rgba(255,255,255,0.3); }
        .sk-ta:focus { border-color: rgba(55,181,255,0.45); }
        .sk-sel { color: #fff; background: rgba(255,255,255,0.05); border: 1px solid rgba(55,181,255,0.18); border-radius: 10px; padding: 10px 12px; width: 100%; outline: none; font-size: 15px; }
        .sk-sel:focus { border-color: rgba(55,181,255,0.45); }
        .sk-sel option { background: #0a1628; color: #fff; }
        .sk-save-btn:hover { filter: brightness(1.1); }
        .sk-cancel-btn:hover { background: rgba(255,255,255,0.08) !important; }
        .sk-skill-card:hover { border-color: rgba(55,181,255,0.25) !important; }
        .sk-edit-btn:hover { background: rgba(55,181,255,0.12) !important; }
        .sk-del-btn:hover { background: rgba(248,113,113,0.12) !important; }
        .sk-add-btn:hover { filter: brightness(1.1); }
        .sk-back-btn:hover { background: rgba(255,255,255,0.1) !important; }
      `}</style>

      <div style={{ minHeight: '100vh', padding: '32px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          {/* Back Button */}
          <button className="sk-back-btn" onClick={() => router.push('/admin/pillars')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 500, fontSize: '15px', marginBottom: '20px', transition: 'all 0.2s' }}>
            <ArrowLeft size={14} /> Back to Pillar Management
          </button>

          {/* Pillar Header */}
          {state.sport && (
            <div style={{ background: pillarGradient, borderRadius: '16px', padding: '24px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', borderRadius: '16px' }} />
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconComponent size={28} color="#fff" />
                  </div>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0 0 4px' }}>Pillar {state.sport.order}</p>
                    <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, margin: '0 0 4px' }}>{state.sport.name} — Skills</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', margin: 0 }}>Manage skills for this pillar</p>
                  </div>
                </div>
                <button className="sk-add-btn" onClick={handleCreate} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700, fontSize: '15px', cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.2s' }}>
                  <Plus size={16} /> Add Skill
                </button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {state.error && (
            <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: RED, fontWeight: 600 }}>Error:</span>
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '15px' }}>{state.error}</span>
              </div>
              <button onClick={() => setState(prev => ({ ...prev, error: null }))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>×</button>
            </div>
          )}

          {/* Create/Edit Form */}
          {(state.showCreateForm || state.editingId) && (
            <div style={{ ...card, padding: '28px', marginBottom: '24px' }}>
              <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, margin: '0 0 6px' }}>{state.editingId ? 'Edit Skill' : 'Create New Skill'}</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', margin: '0 0 24px' }}>{state.editingId ? 'Update skill information' : 'Add a new skill to this sport'}</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '16px', marginBottom: '16px' }}>
                {[
                  { lbl: 'Name', id: 'name', type: 'text', val: formData.name, onChange: (v: string) => setFormData(p => ({ ...p, name: v })), ph: 'Skill name' },
                  { lbl: 'Estimated Time (min)', id: 'time', type: 'number', val: String(formData.estimatedTimeToComplete), onChange: (v: string) => setFormData(p => ({ ...p, estimatedTimeToComplete: parseInt(v) || 0 })), ph: '30' },
                  { lbl: 'Display Order', id: 'order', type: 'number', val: String(formData.order), onChange: (v: string) => setFormData(p => ({ ...p, order: parseInt(v) || 0 })), ph: '0' },
                ].map(f => (
                  <div key={f.id}>
                    <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.lbl}</label>
                    <input className="sk-input" type={f.type} value={f.val} onChange={e => f.onChange(e.target.value)} placeholder={f.ph} />
                  </div>
                ))}
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Difficulty</label>
                  <select className="sk-sel" value={formData.difficulty} onChange={e => setFormData(p => ({ ...p, difficulty: e.target.value as DifficultyLevel }))}>
                    <option value="introduction">Introduction</option>
                    <option value="development">Development</option>
                    <option value="refinement">Refinement</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
                <textarea className="sk-ta" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Skill description..." rows={3} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Learning Objectives (one per line)</label>
                <textarea
                  className="sk-ta"
                  value={formData.learningObjectives.join('\n')}
                  onChange={e => { const objectives = e.target.value.split('\n').filter(l => l.trim() !== ''); setFormData(p => ({ ...p, learningObjectives: objectives })); }}
                  placeholder={"Master basic dribbling technique\nUnderstand ball control fundamentals"}
                  rows={4}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <HTMLEditorWithAI
                  label="Content (HTML)"
                  value={formData.content}
                  onChange={content => setFormData(p => ({ ...p, content }))}
                  placeholder="Enter detailed skill content in HTML format, or use AI to generate professional content..."
                  skillName={formData.name}
                  description={formData.description}
                  difficulty={formData.difficulty}
                  objectives={formData.learningObjectives}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tags (comma-separated)</label>
                <input className="sk-input" value={formData.tags.join(', ')} onChange={e => setFormData(p => ({ ...p, tags: e.target.value.split(', ').filter(Boolean) }))} placeholder="fundamentals, technique, basics" />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Media Files</label>
                <MediaUpload onUpload={setUploadedFiles} acceptedTypes={['image/*', 'video/*']} maxFiles={10} maxSizePerFile={100} />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '16px' }}>
                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData(p => ({ ...p, isActive: e.target.checked }))} style={{ width: '16px', height: '16px', accentColor: BLUE }} />
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>Active</span>
              </label>

              <div style={{ background: `rgba(55,181,255,0.07)`, border: `1px solid rgba(55,181,255,0.18)`, borderRadius: '10px', padding: '12px 16px', marginBottom: '20px' }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0 }}>
                  <strong style={{ color: BLUE }}>Note:</strong> Quizzes are managed separately through the Quiz Management section.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="sk-save-btn" onClick={handleSave} disabled={saving || uploading} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 20px', borderRadius: '10px', border: 'none', background: BLUE, color: '#fff', fontWeight: 700, fontSize: '15px', cursor: saving || uploading ? 'not-allowed' : 'pointer', opacity: saving || uploading ? 0.7 : 1, transition: 'all 0.2s' }}>
                  <Save size={14} />{uploading ? 'Uploading...' : saving ? 'Saving...' : 'Save'}
                </button>
                <button className="sk-cancel-btn" onClick={handleCancel} disabled={saving || uploading} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          )}

          {/* Skills List */}
          <div>
            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
              Skills <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400, fontSize: '15px' }}>({state.skills.length})</span>
            </h2>

            {state.skills.length === 0 ? (
              <div style={{ ...card, padding: '64px', textAlign: 'center' }}>
                <BookOpen size={48} style={{ color: 'rgba(255,255,255,0.15)', margin: '0 auto 16px' }} />
                <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>No skills yet</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', marginBottom: '20px' }}>Start by creating the first skill for this sport.</p>
                <button onClick={handleCreate} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '12px 24px', borderRadius: '10px', border: 'none', background: BLUE, color: '#fff', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>
                  <Plus size={16} /> Add First Skill
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
                {state.skills.map((skill, index) => {
                  const diff = DIFF_STYLES[skill.difficulty] ?? { bg: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' };
                  return (
                    <div key={skill.id} className="sk-skill-card" style={{ ...card, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                      {(skill.media?.images?.[0] || skill.media?.videos?.[0]) && (
                        <div style={{ aspectRatio: '16/9', position: 'relative', overflow: 'hidden', background: '#000' }}>
                          {skill.media?.videos?.[0] ? (
                            <>
                              <video src={skill.media.videos[0].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Play size={48} color="rgba(255,255,255,0.9)" />
                              </div>
                              <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '12px', padding: '3px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Play size={10} /> Video
                              </div>
                            </>
                          ) : skill.media?.images?.[0] ? (
                            <img src={skill.media.images[0].url} alt={skill.media.images[0].title || skill.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : null}
                          {!skill.isActive && (
                            <div style={{ position: 'absolute', top: '10px', right: '10px', background: RED, color: '#fff', fontSize: '12px', padding: '3px 10px', borderRadius: '20px', fontWeight: 700 }}>Inactive</div>
                          )}
                        </div>
                      )}

                      <div style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px', alignItems: 'center' }}>
                              <span style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', borderRadius: '6px', padding: '2px 8px', fontSize: '12px' }}>Skill {index + 1}</span>
                              <span style={{ background: diff.bg, color: diff.color, borderRadius: '6px', padding: '2px 8px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>{skill.difficulty}</span>
                              {!skill.media?.images?.[0] && !skill.media?.videos?.[0] && !skill.isActive && (
                                <span style={{ background: 'rgba(248,113,113,0.1)', color: RED, borderRadius: '6px', padding: '2px 8px', fontSize: '12px' }}>Inactive</span>
                              )}
                            </div>
                            <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{skill.name}</h3>
                            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{skill.description}</p>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                                <Clock size={12} />{formatDuration(skill.estimatedTimeToComplete)}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                                <Target size={12} />{skill.learningObjectives.length} objectives
                              </div>
                              {skill.hasVideo && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                                  <Play size={12} /> Has Video
                                </div>
                              )}
                            </div>
                            {((skill.media?.images?.length ?? 0) > 0 || (skill.media?.videos?.length ?? 0) > 0) && (
                              <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                                {(skill.media?.images?.length ?? 0) > 0 && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>{skill.media?.images?.length} image{(skill.media?.images?.length ?? 0) > 1 ? 's' : ''}</span>}
                                {(skill.media?.videos?.length ?? 0) > 0 && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>{skill.media?.videos?.length} video{(skill.media?.videos?.length ?? 0) > 1 ? 's' : ''}</span>}
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '4px', marginLeft: '12px' }}>
                            <button className="sk-edit-btn" onClick={() => handleEdit(skill)} title="Edit Skill" style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'rgba(55,181,255,0.08)', color: BLUE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                              <Edit size={14} />
                            </button>
                            <button className="sk-del-btn" onClick={() => handleDelete(skill.id, skill.name)} title="Delete Skill" style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'rgba(248,113,113,0.08)', color: RED, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {dialog}
        </div>
      </div>
    </>
  );
}

export default function AdminSkillsPage() {
  return (
    <AdminRoute>
      <AdminSkillsContent />
    </AdminRoute>
  );
}
