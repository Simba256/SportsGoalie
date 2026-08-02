'use client';

import { useState, useEffect } from 'react';
import { Sport, DifficultyLevel, PILLARS } from '@/types';
import { SkeletonDarkPage } from '@/components/ui/skeletons';
import { AdminRoute } from '@/components/auth/protected-route';
import { sportsService } from '@/lib/database/services/sports.service';
import { storageService, STORAGE_CONFIGS } from '@/lib/firebase/storage.service';
import { MediaUpload } from '@/components/admin/media-upload';
import { getPillarSlugFromDocId } from '@/lib/utils/pillars';
import Link from 'next/link';
import {
  Edit, Eye, Save, X, Sparkles, BookOpen, ArrowRight,
  RefreshCw, Brain, Footprints, Shapes, Target, Grid3X3, Dumbbell, Heart,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const BLUE = '#37b5ff';
const RED = '#f87171';
const card = { background: 'rgba(2,18,44,0.85)', border: '1px solid rgba(55,181,255,0.14)', borderRadius: '16px' } as const;

const PILLAR_ICONS: Record<string, LucideIcon> = {
  Brain, Footprints, Shapes, Target, Grid3X3, Dumbbell, Heart,
};

const PILLAR_DESCRIPTIONS: Record<string, string> = {
  mindset: 'Build your mental fortress. Learn why your brain does what it does and how to redirect anxiety into performance energy.',
  skating: 'Build your goalie dream on skill skating, as a skill. Learn a vision to pair with skating reason project.',
  form: 'Build your goalie structure. Skating is creativity, form and as structure, repetition, structure, assignments.',
  positioning: 'Build your goalie mask for anxiety position paths and the scan team of the most positional systems.',
  seven_point: 'Build your mentalframes. Learn your positioning as strong unlock to form 6 Zone Grid below icing line.',
  training: 'Build your game/practice/off-ice, vision my different weighting off-ice.',
  lifestyle: 'Build your lifestyle habits to support confidence, focus, and consistent performance in and out of the crease.',
};

interface PillarFormData {
  name: string; description: string; color: string; category: string;
  difficulty: DifficultyLevel; imageUrl: string; tags: string[]; isActive: boolean; isFeatured: boolean; order: number;
}

const defaultFormData: PillarFormData = {
  name: '', description: '', color: '#3B82F6', category: '',
  difficulty: 'introduction', imageUrl: '', tags: [], isActive: true, isFeatured: false, order: 0,
};

function AdminPillarsContent() {
  const [pillars, setPillars] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PillarFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadPillars(); }, []);

  const loadPillars = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await sportsService.getAllSports({ limit: 100 });
      if (result.success && result.data) {
        setPillars(result.data.items.sort((a, b) => a.order - b.order));
      } else {
        setError(result.error?.message || 'Failed to load pillars');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pillar: Sport) => {
    setFormData({ name: pillar.name, description: pillar.description, color: pillar.color, category: pillar.category, difficulty: pillar.difficulty, imageUrl: pillar.imageUrl || '', tags: pillar.tags, isActive: pillar.isActive, isFeatured: pillar.isFeatured, order: pillar.order });
    setEditingId(pillar.id);
  };

  const handleCancel = () => { setFormData(defaultFormData); setUploadedFiles([]); setEditingId(null); };

  const handleSave = async () => {
    if (!formData.name.trim()) { setError('Pillar name is required'); return; }
    setSaving(true);
    try {
      let imageUrl = formData.imageUrl;
      if (uploadedFiles.length > 0) {
        setUploading(true);
        const uploadResult = await storageService.uploadFile(uploadedFiles[0], STORAGE_CONFIGS.SPORT_IMAGES);
        if (uploadResult.success && uploadResult.url) { imageUrl = uploadResult.url; }
        else { setError(uploadResult.error || 'Failed to upload image'); setUploading(false); setSaving(false); return; }
        setUploading(false);
      }
      if (editingId) {
        const result = await sportsService.updateSport(editingId, { ...formData, imageUrl, icon: formData.tags[0] || 'Target', estimatedTimeToComplete: 120, createdBy: 'admin' });
        if (result.success) { await loadPillars(); handleCancel(); }
        else { setError(result.error?.message || 'Failed to save pillar'); }
      }
    } catch {
      setError('An unexpected error occurred while saving');
    } finally { setSaving(false); setUploading(false); }
  };

  const getPillarDisplayInfo = (pillar: Sport) => {
    const slug = getPillarSlugFromDocId(pillar.id);
    if (slug) {
      const info = PILLARS.find(p => p.slug === slug);
      if (info) return { icon: info.icon, color: info.color, shortName: info.shortName, slug };
    }
    return { icon: pillar.icon, color: 'blue', shortName: pillar.name.split(' ')[0], slug: null };
  };

  if (loading) return <div style={{ padding: '48px' }}><SkeletonDarkPage /></div>;

  return (
    <>
      <style>{`
        .pl-card { transition: all 0.25s !important; }
        .pl-card:hover { transform: translateY(-2px) !important; box-shadow: 0 12px 40px rgba(0,0,0,0.3) !important; }
        .pl-edit:hover { background: rgba(55,181,255,0.12) !important; color: ${BLUE} !important; border-color: rgba(55,181,255,0.3) !important; }
        .pl-skills:hover { background: rgba(34,197,94,0.1) !important; color: #22c55e !important; border-color: rgba(34,197,94,0.3) !important; }
        .pl-btn { display: inline-flex; align-items: center; gap: 5px; padding: 7px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: rgba(255,255,255,0.5); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .pl-save { display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px; background: ${BLUE}; color: #000f28; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; opacity: 1; transition: opacity 0.2s; }
        .pl-save:disabled { opacity: 0.5 !important; cursor: not-allowed !important; }
        .pl-inp { background: rgba(2,18,44,0.6) !important; border: 1px solid rgba(55,181,255,0.18) !important; color: #fff !important; border-radius: 8px !important; padding: 9px 12px !important; width: 100% !important; font-size: 13px !important; outline: none !important; }
        .pl-inp:focus { border-color: rgba(55,181,255,0.45) !important; }
        .pl-ta { background: rgba(2,18,44,0.6) !important; border: 1px solid rgba(55,181,255,0.18) !important; color: #fff !important; border-radius: 8px !important; padding: 9px 12px !important; width: 100% !important; font-size: 13px !important; outline: none !important; resize: vertical !important; min-height: 80px !important; }
        .pl-ta:focus { border-color: rgba(55,181,255,0.45) !important; }
        .pl-sel { background: rgba(2,18,44,0.6) !important; border: 1px solid rgba(55,181,255,0.18) !important; color: rgba(255,255,255,0.7) !important; border-radius: 8px !important; padding: 9px 12px !important; width: 100% !important; font-size: 13px !important; outline: none !important; }
        @media (max-width: 768px) { .pl-grid { grid-template-columns: 1fr !important; } }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Hero Banner */}
        <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', minHeight: '180px', backgroundImage: "url('https://images.unsplash.com/photo-1514511719-9f5849dc16d0?w=1920&q=80&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,15,40,0.7) 0%, rgba(0,15,40,0.85) 100%)' }} />
          <div style={{ position: 'relative', zIndex: 1, padding: '40px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', marginBottom: '8px', lineHeight: 1.2 }}>
              The Architecture of a Complete Goalie
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', maxWidth: '600px', margin: '0 auto 16px', lineHeight: 1.6 }}>
              Every pillar connects to every other. Master all seven and you master the game — physically, mentally, and technically.
            </p>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(55,181,255,0.15)', border: '1px solid rgba(55,181,255,0.3)', color: BLUE, padding: '4px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 700 }}>
              {pillars.length} pillars
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <p style={{ color: RED, fontWeight: 600, fontSize: '15px' }}>Error: {error}</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="pl-btn" onClick={loadPillars} style={{ borderColor: 'rgba(248,113,113,0.3)', color: RED }}>
                <RefreshCw size={12} /> Try Again
              </button>
              <button className="pl-btn" onClick={() => setError(null)} style={{ borderColor: 'rgba(248,113,113,0.3)', color: 'rgba(248,113,113,0.6)' }}>Dismiss</button>
            </div>
          </div>
        )}

        {/* Edit Form */}
        {editingId && (
          <div style={{ position: 'relative', ...card, padding: '24px', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${BLUE}, transparent)` }} />
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>Edit Pillar</h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginBottom: '20px' }}>Update pillar information and settings</p>
            <div className="pl-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '5px' }}>NAME</label>
                <input className="pl-inp" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '5px' }}>CATEGORY</label>
                <input className="pl-inp" value={formData.category} disabled style={{ opacity: 0.5 }} />
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '5px' }}>DEFAULT DIFFICULTY</label>
                <select className="pl-sel" value={formData.difficulty} onChange={e => setFormData(p => ({ ...p, difficulty: e.target.value as DifficultyLevel }))}>
                  <option value="introduction">Introduction</option>
                  <option value="development">Development</option>
                  <option value="refinement">Refinement</option>
                </select>
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '5px' }}>DISPLAY ORDER</label>
                <input className="pl-inp" type="number" value={formData.order} disabled style={{ opacity: 0.5 }} />
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', marginTop: '4px' }}>Order is fixed for the 7 pillars</p>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '5px' }}>DESCRIPTION</label>
              <textarea className="pl-ta" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="pl-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '5px' }}>IMAGE URL</label>
                <input className="pl-inp" value={formData.imageUrl} onChange={e => setFormData(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://example.com/image.jpg" />
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '5px' }}>TAGS (COMMA-SEPARATED)</label>
                <input className="pl-inp" value={formData.tags.join(', ')} onChange={e => setFormData(p => ({ ...p, tags: e.target.value.split(', ').filter(Boolean) }))} />
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>UPLOAD PILLAR IMAGE</label>
              <MediaUpload onUpload={setUploadedFiles} acceptedTypes={['image/jpeg', 'image/png', 'image/webp']} maxFiles={1} maxSizePerFile={10} />
              {uploadedFiles.length > 0 && <p style={{ color: '#22c55e', fontSize: '13px', marginTop: '6px' }}>Image ready: {uploadedFiles[0].name}</p>}
            </div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              {[
                { label: 'Active', key: 'isActive' },
                { label: 'Featured', key: 'isFeatured' },
              ].map(({ label, key }) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={(formData as unknown as Record<string, unknown>)[key] as boolean} onChange={e => setFormData(p => ({ ...p, [key]: e.target.checked }))}
                    style={{ width: '15px', height: '15px', accentColor: BLUE }} />
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px' }}>{label}</span>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="pl-save" onClick={handleSave} disabled={saving || uploading}>
                <Save size={13} /> {uploading ? 'Uploading…' : saving ? 'Saving…' : 'Save'}
              </button>
              <button className="pl-btn" onClick={handleCancel} disabled={saving || uploading}>
                <X size={13} /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Pillars Grid */}
        {pillars.length === 0 ? (
          <div style={{ ...card, padding: '48px', textAlign: 'center' }}>
            <BookOpen size={44} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#fff', fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>No pillars found</p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '15px' }}>Run the migration script to create the 7 pillars.</p>
          </div>
        ) : (
          <div className="pl-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {pillars.map((pillar) => {
              const displayInfo = getPillarDisplayInfo(pillar);
              const IconComponent = PILLAR_ICONS[displayInfo.icon] || Target;
              const description = (displayInfo.slug && PILLAR_DESCRIPTIONS[displayInfo.slug]) || pillar.description;
              return (
                <div key={pillar.id} className="pl-card" style={{ position: 'relative', ...card, padding: '20px', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${BLUE}66, transparent)` }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `rgba(55,181,255,0.12)`, border: '1px solid rgba(55,181,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <IconComponent size={18} color={BLUE} />
                      </div>
                      <span style={{ background: `rgba(55,181,255,0.12)`, color: BLUE, border: '1px solid rgba(55,181,255,0.2)', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Pillar {String(pillar.order).padStart(2, '0')}
                      </span>
                    </div>
                    {!pillar.isActive && (
                      <span style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.2)', color: RED, padding: '2px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>Inactive</span>
                    )}
                  </div>
                  <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '20px', marginBottom: '6px' }}>{pillar.name}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: 1.6, marginBottom: '14px', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{description}</p>
                  <button
                    onClick={() => window.open(`/pillars/${pillar.id}`, '_blank')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: BLUE, fontSize: '15px', fontWeight: 700, cursor: 'pointer', marginBottom: '14px', padding: 0 }}>
                    Explore Pillar <ArrowRight size={13} />
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button className="pl-btn pl-edit" onClick={() => handleEdit(pillar)} style={{ flex: 1 }}>
                      <Edit size={12} /> Edit
                    </button>
                    <Link href={`/admin/pillars/${pillar.id}/skills`} style={{ flex: 1, textDecoration: 'none' }}>
                      <button className="pl-btn pl-skills" style={{ width: '100%' }}>
                        <BookOpen size={12} /> Skills
                      </button>
                    </Link>
                    <button className="pl-btn" onClick={() => window.open(`/pillars/${pillar.id}`, '_blank')} title="Preview">
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Card */}
        <div style={{ position: 'relative', background: 'linear-gradient(135deg, rgba(55,181,255,0.06) 0%, rgba(14,165,233,0.04) 100%)', border: '1px solid rgba(55,181,255,0.14)', borderRadius: '16px', padding: '20px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${BLUE}66, transparent)` }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `rgba(55,181,255,0.15)`, border: '1px solid rgba(55,181,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={20} color={BLUE} />
            </div>
            <div>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>About the 7 Pillars</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', lineHeight: 1.6 }}>
                These 7 pillars form the foundation of comprehensive goaltender development. Each pillar contains skills at 3 difficulty levels (Introduction, Development, Refinement). Skills are shown to goalies based on their assessed pacing level from onboarding.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdminPillarsPage() {
  return <AdminRoute><AdminPillarsContent /></AdminRoute>;
}
