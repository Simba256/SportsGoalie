'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Plus, Lock, Unlock, CheckCircle2, Circle, Trash2, BookOpen, PlayCircle, Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { userService, sportsService, videoQuizService, customContentService, onboardingService } from '@/lib/database';
import { customCurriculumService } from '@/lib/database';
import { User, CustomCurriculum, CustomCurriculumItem, CustomContentLibrary, GapAnalysis } from '@/types';
import { toast } from 'sonner';
import { ContentBrowser } from '@/components/coach/content-browser';
import { SkeletonContentPage } from '@/components/ui/skeletons';
import { ContentTypeSelector, ContentType } from '@/components/coach/content-type-selector';
import { LessonCreator } from '@/components/coach/lesson-creator';
import { QuizCreator } from '@/components/coach/quiz-creator';
import { StudentIntelligenceSidebar } from '@/components/coach/StudentIntelligenceSidebar';
import { StudentChartingSummary } from '@/components/coach/StudentChartingSummary';
import { CurriculumTemplatePicker } from '@/components/coach/CurriculumTemplatePicker';
import { getApplicableTemplates, type CurriculumTemplate as CurrTemplate } from '@/lib/utils/curriculum-templates';
import type { PacingLevel } from '@/types/onboarding';

const BLUE  = '#37b5ff';
const GREEN = '#22c55e';
const GOLD  = '#D4A93B';
const cardBg = 'linear-gradient(135deg, #04213f 0%, #0a2d52 100%)';
const border = '1px solid rgba(55,181,255,0.22)';

export default function StudentCurriculumPage() {
  const params = useParams();
  const router = useRouter();
  const { user: coach } = useAuth();
  const studentId = params.studentId as string;

  const [student, setStudent] = useState<User | null>(null);
  const [curriculum, setCurriculum] = useState<CustomCurriculum | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContentBrowser, setShowContentBrowser] = useState(false);
  const [contentTitles, setContentTitles] = useState<Record<string, string>>({});
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showLessonCreator, setShowLessonCreator] = useState(false);
  const [showQuizCreator, setShowQuizCreator] = useState(false);
  const [preSelectedPillarId, setPreSelectedPillarId] = useState<string | undefined>();
  const [studentGaps, setStudentGaps] = useState<GapAnalysis[]>([]);
  const [pacingLevel, setPacingLevel] = useState<PacingLevel | undefined>();
  const [applicableTemplates, setApplicableTemplates] = useState<CurrTemplate[]>([]);

  useEffect(() => {
    if (studentId && coach?.id) loadData();
  }, [studentId, coach?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const studentResult = await userService.getUser(studentId);
      if (!studentResult.success || !studentResult.data) { toast.error('Student not found'); router.push('/coach/students'); return; }
      if (coach?.role !== 'admin' && studentResult.data.assignedCoachId !== coach?.id) { toast.error('Unauthorized: This student is not assigned to you'); router.push('/coach/students'); return; }
      setStudent(studentResult.data);

      const curriculumResult = await customCurriculumService.getStudentCurriculum(studentId);
      if (curriculumResult.success && curriculumResult.data) {
        setCurriculum(curriculumResult.data);
        const titles: Record<string, string> = {};
        for (const item of curriculumResult.data.items) {
          if (item.contentId) {
            try {
              if (item.type === 'lesson') {
                const r = await sportsService.getSkill(item.contentId);
                if (r.success && r.data) titles[item.contentId] = r.data.name;
              } else if (item.type === 'quiz') {
                const r = await videoQuizService.getVideoQuiz(item.contentId);
                if (r.success && r.data) titles[item.contentId] = r.data.title;
              } else if (item.type === 'custom_lesson' || item.type === 'custom_quiz') {
                const r = await customContentService.getContent(item.contentId);
                if (r.success && r.data) titles[item.contentId] = r.data.title;
              }
            } catch (error) { console.error('Failed to load content title:', error); }
          }
        }
        setContentTitles(titles);
      }

      try {
        const evalResult = await onboardingService.getEvaluation(studentId);
        if (evalResult.success && evalResult.data?.intelligenceProfile) {
          const profile = evalResult.data.intelligenceProfile;
          setStudentGaps(profile.identifiedGaps || []);
          setPacingLevel(profile.pacingLevel);
          const gapSlugs = (profile.identifiedGaps || []).map((g: GapAnalysis) => g.categorySlug);
          setApplicableTemplates(getApplicableTemplates(profile.pacingLevel, gapSlugs));
        }
      } catch { /* Non-blocking */ }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load curriculum data');
    } finally { setLoading(false); }
  };

  const createCurriculum = async () => {
    if (!coach?.id) return;
    try {
      const result = await customCurriculumService.createCurriculum({ studentId, coachId: coach.id, items: [] }, coach.id);
      if (result.success && result.data) { setCurriculum(result.data); toast.success('Curriculum created successfully'); }
      else toast.error('Failed to create curriculum');
    } catch (error) { console.error('Failed to create curriculum:', error); toast.error('Failed to create curriculum'); }
  };

  const handleContentSelect = async (content: { id: string; type: 'lesson' | 'quiz' | 'custom_lesson' | 'custom_quiz'; title: string; sportId: string; skillId?: string; isCustom?: boolean; }) => {
    if (!curriculum || !coach?.id) return;
    try {
      let itemType = content.type;
      if (content.isCustom && content.type === 'lesson') itemType = 'custom_lesson';
      else if (content.isCustom && content.type === 'quiz') itemType = 'custom_quiz';
      const result = await customCurriculumService.addItem(curriculum.id, { type: itemType, contentId: content.id, pillarId: content.sportId || 'custom', levelId: content.skillId || 'level-1', unlocked: false }, coach.id);
      if (result.success) {
        if (content.isCustom) await customContentService.markContentUsed(content.id);
        toast.success(`${content.title} added to curriculum`);
        await loadData();
      } else toast.error('Failed to add content');
    } catch (error) { console.error('Failed to add content:', error); toast.error('Failed to add content'); }
  };

  const handleTypeSelect = (type: ContentType) => {
    if (type === 'lesson') setShowLessonCreator(true);
    else setShowQuizCreator(true);
  };

  const handleContentCreated = async (content: CustomContentLibrary) => {
    await handleContentSelect({ id: content.id, type: content.type === 'lesson' ? 'custom_lesson' : 'custom_quiz', title: content.title, sportId: content.pillarId || 'custom', skillId: content.levelId, isCustom: true });
  };

  const toggleItemLock = async (itemId: string, currentlyLocked: boolean) => {
    if (!curriculum || !coach?.id) return;
    try {
      if (currentlyLocked) {
        const result = await customCurriculumService.unlockItem(curriculum.id, itemId, coach.id);
        if (result.success) { toast.success('Item unlocked'); await loadData(); }
        else toast.error('Failed to unlock item');
      } else toast.info('Locking items not implemented yet (items start locked by default)');
    } catch (error) { console.error('Failed to toggle lock:', error); toast.error('Failed to update item'); }
  };

  const unlockAllItems = async () => {
    if (!curriculum || !coach?.id) return;
    try {
      const result = await customCurriculumService.unlockAllItems(curriculum.id, coach.id);
      if (result.success) { toast.success('All items unlocked'); await loadData(); }
      else toast.error('Failed to unlock all items');
    } catch (error) { console.error('Failed to unlock all:', error); toast.error('Failed to unlock all items'); }
  };

  const removeItem = async (itemId: string) => {
    if (!curriculum || !coach?.id) return;
    try {
      const result = await customCurriculumService.removeItem(curriculum.id, itemId, coach.id);
      if (result.success) { toast.success('Item removed from curriculum'); await loadData(); }
      else toast.error('Failed to remove item');
    } catch (error) { console.error('Failed to remove item:', error); toast.error('Failed to remove item'); }
  };

  const handleSelectTemplate = async (template: CurrTemplate) => {
    if (!coach?.id) return;
    try {
      const result = await customCurriculumService.createCurriculum({ studentId, coachId: coach.id, items: [] }, coach.id);
      if (!result.success || !result.data) { toast.error('Failed to create curriculum'); return; }
      const newCurriculum = result.data;
      for (const item of template.items) {
        await customCurriculumService.addItem(newCurriculum.id, { type: 'lesson', pillarId: item.pillarId, levelId: pacingLevel || 'introduction', unlocked: false, notes: item.rationale }, coach.id);
      }
      toast.success(`Created curriculum from "${template.name}" with ${template.items.length} items`);
      await loadData();
    } catch (error) { console.error('Failed to apply template:', error); toast.error('Failed to create curriculum from template'); }
  };

  const handleAddContentForPillar = (pillarId: string, pillarName: string) => {
    setPreSelectedPillarId(pillarId);
    setShowContentBrowser(true);
    toast.info(`Showing content for: ${pillarName}`);
  };

  const getItemIcon = (item: CustomCurriculumItem) => {
    if (item.status === 'completed') return <CheckCircle2 size={16} color={GREEN} />;
    if (item.status === 'in_progress') return <PlayCircle size={16} color={BLUE} />;
    if (item.status === 'unlocked') return <Unlock size={16} color={BLUE} />;
    return <Lock size={16} color="rgba(255,255,255,0.3)" />;
  };

  const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
    completed: { bg: 'rgba(34,197,94,0.12)', color: GREEN },
    in_progress: { bg: `rgba(55,181,255,0.12)`, color: BLUE },
    unlocked: { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' },
    locked: { bg: 'rgba(248,113,113,0.12)', color: '#f87171' },
  };

  if (loading) return <SkeletonContentPage />;
  if (!student) return null;

  return (
    <>
      <style>{`
        .sc-action:hover { opacity: 0.85 !important; transform: translateY(-1px) !important; }
        .sc-action { transition: all 0.2s !important; }
        .sc-item:hover { background: rgba(55,181,255,0.04) !important; }
        .sc-remove:hover { color: #f87171 !important; background: rgba(248,113,113,0.1) !important; }
        .sc-unlock:hover { color: ${BLUE} !important; background: rgba(55,181,255,0.1) !important; }
      `}</style>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(20px,3vw,32px) clamp(14px,3vw,24px) 56px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Header */}
        <div style={{ position: 'relative', borderRadius: '16px', background: 'linear-gradient(135deg, #04213f 0%, #0b3460 50%, #0d1f40 100%)', border: '1px solid rgba(55,181,255,0.2)', boxShadow: '0 4px 32px rgba(0,0,0,0.5)', padding: '28px 28px 24px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-20px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,169,59,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, transparent, ${GOLD}, ${BLUE}44, transparent)` }} />
          <div style={{ position: 'relative' }}>
            <p style={{ color: GOLD, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Curriculum</p>
            <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '26px', marginBottom: '4px' }}>{student.displayName}&apos;s Development Path</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Manage personalized curriculum for {student.displayName}</p>
          </div>
        </div>

        {/* Main layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          <style>{`@media(min-width:1024px){.sc-grid{grid-template-columns:2fr 1fr!important;}}`}</style>
          <div className="sc-grid" style={{ display: 'grid', gap: '20px' }}>
            {/* Main column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {!curriculum ? (
                <div style={{ position: 'relative', background: cardBg, border, borderRadius: '16px', padding: '32px', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${BLUE}, transparent)` }} />
                  <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(55,181,255,0.08)', border: '1px solid rgba(55,181,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <BookOpen size={24} color={BLUE} />
                    </div>
                    <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '18px', marginBottom: '6px' }}>Create {student.displayName}&apos;s Curriculum</h3>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>
                      Start with a recommended template based on the student&apos;s assessment, or build from scratch.
                    </p>
                  </div>
                  <CurriculumTemplatePicker templates={applicableTemplates} onSelectTemplate={handleSelectTemplate} onStartFromScratch={createCurriculum} />
                </div>
              ) : (
                <>
                  {/* Actions */}
                  <div style={{ position: 'relative', background: cardBg, border, borderRadius: '14px', padding: '18px', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg, transparent, rgba(55,181,255,0.3), transparent)` }} />
                    <p style={{ color: GOLD, fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>Curriculum Actions</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      <button onClick={() => setShowContentBrowser(true)} className="sc-action"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: `linear-gradient(135deg, ${GOLD} 0%, #B8891E 100%)`, color: '#0c0800', padding: '10px 18px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: `0 4px 14px rgba(212,169,59,0.3)` }}>
                        <Plus size={15} /> Add Content
                      </button>
                      <button onClick={() => setShowTypeSelector(true)} className="sc-action"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', padding: '10px 18px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                        <Sparkles size={15} /> Create Custom
                      </button>
                      <button onClick={unlockAllItems} disabled={curriculum.items.length === 0} className="sc-action"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', padding: '10px 18px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', opacity: curriculum.items.length === 0 ? 0.4 : 1 }}>
                        <Unlock size={15} /> Unlock All
                      </button>
                    </div>
                  </div>

                  {/* Curriculum Items */}
                  <div style={{ position: 'relative', background: cardBg, border, borderRadius: '14px', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg, transparent, rgba(55,181,255,0.3), transparent)` }} />
                    <div style={{ padding: '16px 18px 14px', borderBottom: '1px solid rgba(55,181,255,0.1)' }}>
                      <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>Curriculum Modules ({curriculum.items.length})</h2>
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>Content assigned to {student.displayName}</p>
                    </div>

                    {curriculum.items.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                        <Circle size={44} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 16px' }} />
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '20px' }}>No content added yet.</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                          <button onClick={() => setShowContentBrowser(true)} className="sc-action"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(55,181,255,0.08)', border: '1px solid rgba(55,181,255,0.2)', color: BLUE, padding: '9px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                            <Plus size={14} /> Add Existing
                          </button>
                          <button onClick={() => setShowTypeSelector(true)} className="sc-action"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '9px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                            <Sparkles size={14} /> Create Custom
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '10px' }}>
                        {[...curriculum.items]
                          .sort((a, b) => {
                            const order: Record<string, number> = { completed: 0, in_progress: 1, unlocked: 2, locked: 3 };
                            const diff = (order[a.status] ?? 3) - (order[b.status] ?? 3);
                            return diff !== 0 ? diff : a.order - b.order;
                          })
                          .map((item, index) => {
                            const statusStyle = STATUS_STYLES[item.status] || STATUS_STYLES.locked;
                            const isCustom = item.type.startsWith('custom_');
                            const baseType = item.type.replace('custom_', '');
                            return (
                              <div key={item.id} className="sc-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', marginBottom: '4px', transition: 'background 0.2s', cursor: 'default' }}>
                                <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(212,169,59,0.1)', border: `1px solid rgba(212,169,59,0.28)`, color: GOLD, fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{index + 1}</span>
                                <div style={{ flexShrink: 0 }}>{getItemIcon(item)}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{ color: '#fff', fontWeight: 600, fontSize: '13px', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {item.contentId && contentTitles[item.contentId] ? contentTitles[item.contentId] : item.customContent?.title || 'Untitled Content'}
                                  </p>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    <span style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', padding: '1px 7px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{baseType === 'lesson' ? 'Lesson' : 'Knowledge Check'}</span>
                                    {isCustom && <span style={{ background: 'rgba(212,169,59,0.1)', color: GOLD, padding: '1px 7px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>Custom</span>}
                                    <span style={{ background: statusStyle.bg, color: statusStyle.color, padding: '1px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, textTransform: 'capitalize' }}>{item.status.replace('_', ' ')}</span>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                  {item.status === 'locked' && (
                                    <button onClick={() => toggleItemLock(item.id, true)} className="sc-unlock"
                                      style={{ padding: '6px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <Unlock size={14} />
                                    </button>
                                  )}
                                  <button onClick={() => removeItem(item.id)} className="sc-remove"
                                    style={{ padding: '6px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Intelligence Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <StudentIntelligenceSidebar studentId={studentId} onAddContentForPillar={handleAddContentForPillar} />
              <StudentChartingSummary studentId={studentId} />
            </div>
          </div>
        </div>
      </div>

      <ContentBrowser open={showContentBrowser} onOpenChange={(open) => { setShowContentBrowser(open); if (!open) setPreSelectedPillarId(undefined); }} onSelect={handleContentSelect} coachId={coach?.id} preSelectedSportId={preSelectedPillarId} />
      <ContentTypeSelector open={showTypeSelector} onOpenChange={setShowTypeSelector} onSelect={handleTypeSelect} />
      {coach?.id && <LessonCreator open={showLessonCreator} onOpenChange={setShowLessonCreator} coachId={coach.id} onSave={handleContentCreated} studentGaps={studentGaps.map(g => ({ categoryName: g.categoryName, categorySlug: g.categorySlug, priority: g.priority, suggestedContent: g.suggestedContent }))} />}
      {coach?.id && <QuizCreator open={showQuizCreator} onOpenChange={setShowQuizCreator} coachId={coach.id} onSave={handleContentCreated} />}
    </>
  );
}
