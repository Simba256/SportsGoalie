'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpen, PlayCircle, Search, Loader2, ChevronRight,
  Clock, Check, FolderOpen, User, X, Video,
} from 'lucide-react';
import { sportsService, videoQuizService, customContentService } from '@/lib/database';
import { useAuth } from '@/lib/auth/context';
import { Sport, Skill, VideoQuiz, CustomContentLibrary } from '@/types';
import { toast } from 'sonner';

const BLUE = '#37b5ff';
const PURPLE = '#a78bfa';

interface ContentItem {
  id: string;
  type: 'lesson' | 'quiz' | 'custom_lesson' | 'custom_quiz';
  title: string;
  description: string;
  sportId: string;
  sportName: string;
  difficulty: string;
  estimatedTime: number;
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
  preSelectedSportId?: string;
}

export function ContentBrowser({ open, onOpenChange, onSelect, selectedSportId, coachId, preSelectedSportId }: ContentBrowserProps) {
  const { user } = useAuth();
  const effectiveCoachId = coachId || user?.id;

  const [sports, setSports] = useState<Sport[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [quizzes, setQuizzes] = useState<VideoQuiz[]>([]);
  const [customContent, setCustomContent] = useState<CustomContentLibrary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState(selectedSportId || '');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [contentSource, setContentSource] = useState<'library' | 'custom'>('library');
  const [contentType, setContentType] = useState<'lesson' | 'quiz'>('lesson');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  useEffect(() => {
    if (open && preSelectedSportId) setSelectedSport(preSelectedSportId);
  }, [open, preSelectedSportId]);

  useEffect(() => {
    if (open) {
      loadSports();
      if (effectiveCoachId) loadCustomContent();
    }
  }, [open, effectiveCoachId]);

  useEffect(() => {
    if (selectedSport && contentSource === 'library') loadContent();
  }, [selectedSport, contentType, contentSource]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onOpenChange(false); };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  const loadSports = async () => {
    try {
      setLoading(true);
      const result = await sportsService.getAllSports();
      if (result.success && result.data) {
        const active = result.data.items.filter(s => s.isActive);
        setSports(active);
        if (!selectedSport && active.length > 0) setSelectedSport(active[0].id);
      } else { toast.error('Failed to load sports'); }
    } catch { toast.error('Failed to load sports'); }
    finally { setLoading(false); }
  };

  const loadContent = async () => {
    try {
      setLoading(true);
      if (contentType === 'lesson') {
        const result = await sportsService.getSkillsBySport(selectedSport);
        if (result.success && result.data) setSkills(result.data.items.filter(s => s.isActive));
        else toast.error('Failed to load lessons');
      } else {
        const result = await videoQuizService.getQuizzesBySport(selectedSport);
        if (result.success && result.data) setQuizzes(result.data.items.filter(q => q.isActive));
        else toast.error('Failed to load quizzes');
      }
    } catch { toast.error('Failed to load content'); }
    finally { setLoading(false); }
  };

  const loadCustomContent = async () => {
    if (!effectiveCoachId) return;
    try {
      const result = await customContentService.getCoachContent(effectiveCoachId);
      if (result.success && result.data) setCustomContent(result.data);
    } catch { /* silent */ }
  };

  const getFilteredContent = (): ContentItem[] => {
    if (contentSource === 'custom') {
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
          color: item.type === 'lesson' ? BLUE : PURPLE,
          isCustom: true,
        }));
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        items = items.filter(i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
      }
      return items;
    }

    const sport = sports.find(s => s.id === selectedSport);
    if (!sport) return [];

    let items: ContentItem[] = contentType === 'lesson'
      ? skills.map(skill => ({ id: skill.id, type: 'lesson' as const, title: skill.name, description: skill.description, sportId: sport.id, sportName: sport.name, difficulty: skill.difficulty, estimatedTime: skill.estimatedTimeToComplete, hasVideo: skill.hasVideo, icon: sport.icon, color: sport.color }))
      : quizzes.map(quiz => ({ id: quiz.id, type: 'quiz' as const, title: quiz.title, description: quiz.description || '', sportId: sport.id, sportName: sport.name, difficulty: quiz.difficulty, estimatedTime: quiz.estimatedDuration || 30, icon: sport.icon, color: sport.color }));

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    if (selectedDifficulty !== 'all') items = items.filter(i => i.difficulty === selectedDifficulty);
    return items;
  };

  const handleAdd = () => {
    if (selectedItem) {
      onSelect(selectedItem);
      onOpenChange(false);
      setSelectedItem(null);
      setSearchQuery('');
    }
  };

  if (!open) return null;

  const filteredContent = getFilteredContent();
  const customLessonCount = customContent.filter(c => c.type === 'lesson').length;
  const customQuizCount = customContent.filter(c => c.type === 'quiz').length;

  const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(55,181,255,0.18)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' };
  const selectStyle: React.CSSProperties = { padding: '9px 12px', background: 'rgba(2,14,36,0.95)', border: '1px solid rgba(55,181,255,0.18)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' };

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}
      onClick={e => { if (e.target === e.currentTarget) onOpenChange(false); }}
    >
      <style>{`
        .cb-tab-active { background: rgba(55,181,255,0.15) !important; border-color: rgba(55,181,255,0.4) !important; color: #37b5ff !important; }
        .cb-tab-type-active { background: rgba(55,181,255,0.12) !important; border-color: rgba(55,181,255,0.3) !important; color: #37b5ff !important; }
        .cb-item:hover { background: rgba(55,181,255,0.05) !important; border-color: rgba(55,181,255,0.25) !important; }
        .cb-item-selected { background: rgba(55,181,255,0.1) !important; border-color: rgba(55,181,255,0.4) !important; }
        .cb-input:focus { border-color: #37b5ff !important; box-shadow: 0 0 0 3px rgba(55,181,255,0.1) !important; }
        .cb-input::placeholder { color: rgba(255,255,255,0.25); }
        .cb-add:hover:not(:disabled) { opacity: 0.9 !important; transform: translateY(-1px) !important; }
        .cb-add:disabled { opacity: 0.4 !important; cursor: not-allowed !important; }
        .cb-cancel:hover { background: rgba(255,255,255,0.06) !important; }
        .cb-select option { background: #020e24; color: #fff; }
      `}</style>

      <div style={{ background: 'rgba(2,14,36,0.98)', border: '1px solid rgba(55,181,255,0.2)', borderRadius: '24px', width: '100%', maxWidth: '860px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>

        {/* Header */}
        <div style={{ position: 'relative', background: 'linear-gradient(135deg, #04213f 0%, #0b3460 60%, #0d1f40 100%)', padding: '24px 28px', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ position: 'absolute', top: '-50px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(55,181,255,0.12)', filter: 'blur(60px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg, transparent, ${BLUE}, transparent)` }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: BLUE, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '6px' }}>Curriculum</p>
              <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '4px' }}>Add Content to Curriculum</h2>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>Browse and select lessons or quizzes to add to the student's learning path</p>
            </div>
            <button onClick={() => onOpenChange(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px', borderRadius: '8px', display: 'flex' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: '16px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(55,181,255,0.2) transparent' }}>

          {/* Source tabs */}
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(55,181,255,0.12)', borderRadius: '12px', padding: '4px' }}>
            {([
              { key: 'library' as const, icon: <FolderOpen size={14} />, label: 'Content Library' },
              { key: 'custom' as const, icon: <User size={14} />, label: `My Content${customContent.length > 0 ? ` (${customContent.length})` : ''}` },
            ]).map(tab => (
              <button key={tab.key} onClick={() => { setContentSource(tab.key); setSelectedItem(null); }}
                className={contentSource === tab.key ? 'cb-tab-active' : ''}
                style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '9px 16px', borderRadius: '9px', border: '1px solid transparent', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Sport selector (library only) */}
          {contentSource === 'library' && (
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '7px' }}>Sport / Pillar</label>
              <div style={{ position: 'relative' }}>
                <select value={selectedSport} onChange={e => setSelectedSport(e.target.value)} className="cb-select" style={{ ...selectStyle, width: '100%' }}>
                  {sports.map(s => (
                    <option key={s.id} value={s.id}>{s.icon} {s.name} ({s.skillsCount} skills)</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Content type tabs + filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(55,181,255,0.1)', borderRadius: '10px', padding: '4px' }}>
              {([
                { key: 'lesson' as const, icon: <BookOpen size={13} />, label: `Lessons${contentSource === 'custom' && customLessonCount > 0 ? ` (${customLessonCount})` : ''}` },
                { key: 'quiz' as const, icon: <PlayCircle size={13} />, label: `Quizzes${contentSource === 'custom' && customQuizCount > 0 ? ` (${customQuizCount})` : ''}` },
              ]).map(tab => (
                <button key={tab.key} onClick={() => { setContentType(tab.key); setSelectedItem(null); }}
                  className={contentType === tab.key ? 'cb-tab-type-active' : ''}
                  style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '7px 14px', borderRadius: '7px', border: '1px solid transparent', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Search + difficulty */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={14} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input placeholder="Search content…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="cb-input" style={{ ...inputStyle, paddingLeft: '36px' }} />
              </div>
              {contentSource === 'library' && (
                <select value={selectedDifficulty} onChange={e => setSelectedDifficulty(e.target.value)} className="cb-select" style={{ ...selectStyle, minWidth: '150px' }}>
                  <option value="all">All Levels</option>
                  <option value="introduction">Introduction</option>
                  <option value="development">Development</option>
                  <option value="refinement">Refinement</option>
                </select>
              )}
            </div>
          </div>

          {/* Content list */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(55,181,255,0.1)', borderRadius: '14px', overflow: 'hidden', maxHeight: '280px', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'rgba(55,181,255,0.15) transparent' }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', gap: '10px' }}>
                <Loader2 size={20} color="rgba(255,255,255,0.3)" style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>Loading…</p>
                <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
              </div>
            ) : filteredContent.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                {contentSource === 'custom' ? <User size={36} color="rgba(255,255,255,0.15)" style={{ margin: '0 auto 12px' }} /> : <BookOpen size={36} color="rgba(255,255,255,0.15)" style={{ margin: '0 auto 12px' }} />}
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '4px' }}>
                  {searchQuery ? 'No content matches your search' : contentSource === 'custom' ? `No custom ${contentType === 'lesson' ? 'lessons' : 'quizzes'} created yet` : `No ${contentType === 'lesson' ? 'lessons' : 'quizzes'} for this pillar`}
                </p>
                {contentSource === 'custom' && !searchQuery && <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>Create content from the Content Library page</p>}
              </div>
            ) : (
              <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {filteredContent.map(item => {
                  const isLesson = item.type === 'lesson' || item.type === 'custom_lesson';
                  const accent = item.color || (isLesson ? BLUE : PURPLE);
                  const isSelected = selectedItem?.id === item.id;
                  return (
                    <button key={item.id} onClick={() => setSelectedItem(item)}
                      className={isSelected ? 'cb-item cb-item-selected' : 'cb-item'}
                      style={{ width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: '10px', background: 'transparent', border: '1px solid transparent', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${accent}18`, border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {isLesson ? <BookOpen size={17} color={accent} /> : <PlayCircle size={17} color={accent} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <p style={{ color: '#fff', fontSize: '13px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                          {item.isCustom && <span style={{ fontSize: '9px', fontWeight: 700, color: PURPLE, background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: '20px', padding: '1px 7px', flexShrink: 0 }}>Custom</span>}
                          {isSelected && <Check size={14} color={BLUE} style={{ flexShrink: 0 }} />}
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '5px' }}>{item.description}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                          {!item.isCustom && <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '1px 6px', textTransform: 'capitalize' }}>{item.difficulty}</span>}
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={10} /> {item.estimatedTime}m</span>
                          {item.hasVideo && <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: BLUE }}><Video size={10} /> Video</span>}
                        </div>
                      </div>
                      <ChevronRight size={14} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected item summary */}
          {selectedItem && (
            <div style={{ background: 'rgba(55,181,255,0.06)', border: '1px solid rgba(55,181,255,0.25)', borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${selectedItem.color || BLUE}18`, border: `1px solid ${selectedItem.color || BLUE}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {selectedItem.type === 'lesson' || selectedItem.type === 'custom_lesson'
                  ? <BookOpen size={20} color={selectedItem.color || BLUE} />
                  : <PlayCircle size={20} color={selectedItem.color || PURPLE} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                  <p style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>{selectedItem.title}</p>
                  {selectedItem.isCustom && <span style={{ fontSize: '9px', fontWeight: 700, color: PURPLE, background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: '20px', padding: '1px 7px' }}>Custom</span>}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                  {selectedItem.sportName} · {selectedItem.isCustom ? 'Custom Content' : selectedItem.difficulty} · {selectedItem.estimatedTime} min
                </p>
              </div>
              <Check size={18} color="#4ade80" style={{ flexShrink: 0 }} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 28px', borderTop: '1px solid rgba(55,181,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', flexShrink: 0, background: 'rgba(2,14,36,0.6)' }}>
          <button onClick={() => onOpenChange(false)} className="cb-cancel"
            style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
            Cancel
          </button>
          <button onClick={handleAdd} disabled={!selectedItem} className="cb-add"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', background: `linear-gradient(135deg, ${BLUE} 0%, #0ea5e9 100%)`, border: 'none', borderRadius: '10px', color: '#000f28', fontSize: '13px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', boxShadow: selectedItem ? `0 4px 16px rgba(55,181,255,0.35)` : 'none' }}>
            <Check size={15} /> Add to Curriculum
          </button>
        </div>
      </div>
    </div>
  , document.body);
}
