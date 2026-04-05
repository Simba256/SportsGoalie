'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  PlayCircle,
  Lock,
  CheckCircle2,
  Trophy,
  Target,
  User as UserIcon,
  ArrowRight,
  Loader2,
  ChevronRight,
  MessageSquare,
  TrendingUp,
  Brain,
  Footprints,
  Shapes,
  Grid3X3,
  Dumbbell,
  Heart,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { userService, sportsService, videoQuizService, customContentService } from '@/lib/database';
import { customCurriculumService } from '@/lib/database';
import { onboardingService } from '@/lib/database';
import { User, Sport, SportProgress, CustomCurriculum, CustomCurriculumItem, IntelligenceProfile, getPacingLevelDisplayText, PILLARS } from '@/types';
import { enrollmentService } from '@/lib/database/services/enrollment.service';
import { getPillarColorClasses, getPillarSlugFromDocId } from '@/lib/utils/pillars';
import { toast } from 'sonner';

const PILLAR_ICONS: Record<string, React.ElementType> = {
  Brain, Footprints, Shapes, Target, Grid3X3, Dumbbell, Heart,
};

interface CustomCurriculumDashboardProps {
  user: User;
}

interface ContentInfo {
  title: string;
  description?: string;
  sportName?: string;
  sportIcon?: string;
  sportColor?: string;
  contentType?: 'lesson' | 'quiz';
}

export function CustomCurriculumDashboard({ user }: CustomCurriculumDashboardProps) {
  const [curriculum, setCurriculum] = useState<CustomCurriculum | null>(null);
  const [coach, setCoach] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentInfo, setContentInfo] = useState<Record<string, ContentInfo>>({});
  const [profile, setProfile] = useState<IntelligenceProfile | null>(null);
  const [enrolledSports, setEnrolledSports] = useState<Array<{ sport: Sport; progress: SportProgress }>>([]);

  useEffect(() => { loadData(); }, [user.id]);

  const loadContentDetails = async (items: CustomCurriculumItem[]) => {
    const sportCache = new Map<string, { name?: string; icon?: string; color?: string }>();

    const getSportCached = async (sportId: string) => {
      if (sportCache.has(sportId)) return sportCache.get(sportId)!;
      const result = await sportsService.getSport(sportId);
      const data = result.success && result.data
        ? { name: result.data.name, icon: result.data.icon, color: result.data.color }
        : {};
      sportCache.set(sportId, data);
      return data;
    };

    const infoEntries = await Promise.all(
      items.map(async (item): Promise<[string, ContentInfo] | null> => {
        if (item.contentId) {
          try {
            if (item.type === 'lesson') {
              const skillResult = await sportsService.getSkill(item.contentId);
              if (skillResult.success && skillResult.data) {
                const sport = await getSportCached(skillResult.data.sportId);
                return [item.contentId, { title: skillResult.data.name, description: skillResult.data.description, sportName: sport.name, sportIcon: sport.icon, sportColor: sport.color }];
              }
            } else if (item.type === 'quiz') {
              const quizResult = await videoQuizService.getVideoQuiz(item.contentId);
              if (quizResult.success && quizResult.data) {
                const sport = await getSportCached(quizResult.data.sportId);
                return [item.contentId, { title: quizResult.data.title, description: quizResult.data.description, sportName: sport.name, sportIcon: sport.icon, sportColor: sport.color }];
              }
            } else if (item.type === 'custom_lesson' || item.type === 'custom_quiz') {
              const contentResult = await customContentService.getContent(item.contentId);
              if (contentResult.success && contentResult.data) {
                return [item.contentId, { title: contentResult.data.title, description: contentResult.data.description, sportName: 'Custom Content', sportColor: '#8b5cf6', contentType: contentResult.data.type }];
              }
            }
          } catch { /* skip */ }
        } else if (item.customContent) {
          return [item.id, { title: item.customContent.title, description: item.customContent.description }];
        }
        return null;
      })
    );

    const info: Record<string, ContentInfo> = {};
    for (const entry of infoEntries) {
      if (entry) info[entry[0]] = entry[1];
    }
    setContentInfo(info);
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Phase 1: Fetch just curriculum, evaluation, and coach in parallel
      // This unblocks the UI render as fast as possible
      const [curriculumResult, evalResult, coachResult] = await Promise.all([
        customCurriculumService.getStudentCurriculum(user.id),
        onboardingService.getEvaluation(user.id).catch(() => null),
        user.assignedCoachId
          ? userService.getUser(user.assignedCoachId).catch(() => null)
          : Promise.resolve(null),
      ]);

      if (evalResult?.success && evalResult.data?.intelligenceProfile) {
        setProfile(evalResult.data.intelligenceProfile);
      }

      if (coachResult?.success && coachResult.data) {
        setCoach(coachResult.data);
      }

      if (curriculumResult.success && curriculumResult.data) {
        setCurriculum(curriculumResult.data);
      }
    } catch {
      toast.error('Failed to load your curriculum');
    } finally {
      // Unblock the UI immediately — content details load progressively below
      setLoading(false);
    }
  };

  // Phase 2: Load content details and enrollment AFTER the main UI has rendered
  useEffect(() => {
    if (curriculum?.items.length) {
      loadContentDetails(curriculum.items);
    }
  }, [curriculum]);

  useEffect(() => {
    if (!loading && user.id) {
      enrollmentService.getUserEnrolledSports(user.id).then((result) => {
        if (result.success && result.data) {
          setEnrolledSports(result.data);
        }
      }).catch(() => { /* non-blocking */ });
    }
  }, [loading, user.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const totalItems = curriculum?.items.length || 0;
  const completedItems = curriculum?.items.filter(i => i.status === 'completed').length || 0;
  const unlockedItems = curriculum?.items.filter(i => i.status === 'unlocked').length || 0;
  const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const nextItem = curriculum?.items
    .sort((a, b) => a.order - b.order)
    .find(item => item.status === 'unlocked');

  const getContentLink = (item: CustomCurriculumItem) => {
    if (item.status === 'locked') return null;
    const itemInfo = item.contentId ? contentInfo[item.contentId] : undefined;
    const derivedCustomType = itemInfo?.contentType;
    if (item.type === 'lesson' && item.contentId) return `/pillars/${item.pillarId}/skills/${item.contentId}`;
    if (item.type === 'quiz' && item.contentId) return `/quiz/video/${item.contentId}`;
    if (item.type === 'custom_lesson' && item.contentId) {
      return derivedCustomType === 'quiz'
        ? `/quiz/video/${item.contentId}`
        : `/learn/lesson/${item.contentId}`;
    }
    if (item.type === 'custom_quiz' && item.contentId) {
      return derivedCustomType === 'lesson'
        ? `/learn/lesson/${item.contentId}`
        : `/quiz/video/${item.contentId}`;
    }
    return null;
  };

  const firstName = user.displayName?.split(' ')[0] || user.email?.split('@')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── Welcome Banner ─────────────────────────────────────────── */}
      <div className="relative rounded-3xl border border-blue-200/70 bg-gradient-to-br from-blue-100 via-sky-50 to-red-100 p-6 md:p-8 overflow-hidden shadow-xl shadow-blue-200/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(59,130,246,0.25),transparent_45%),radial-gradient(circle_at_86%_14%,rgba(239,68,68,0.2),transparent_40%),radial-gradient(circle_at_62%_88%,rgba(14,165,233,0.15),transparent_42%)]" />
        <div className="absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_90%)]">
          <div className="h-full w-full bg-[linear-gradient(to_right,rgba(59,130,246,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(239,68,68,0.1)_1px,transparent_1px)] bg-[size:34px_34px]" />
        </div>
        <div className="absolute -top-14 -right-10 w-52 h-52 bg-blue-300/35 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-red-300/30 rounded-full blur-3xl" />

        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-blue-700 text-sm font-bold tracking-wide">{greeting}</p>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">Hello {firstName},</h1>
            <p className="text-slate-600 text-sm mt-2 max-w-lg leading-relaxed">
              {totalItems > 0
                ? `You've completed ${completedItems} of ${totalItems} items in your curriculum. ${unlockedItems > 0 ? `${unlockedItems} items ready to learn!` : 'Keep it up!'}`
                : 'Your coach will assign learning materials soon. Check back or message your coach.'}
            </p>
            {nextItem && getContentLink(nextItem) && (
              <Link href={getContentLink(nextItem)!}>
                <button className="mt-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/35">
                  Continue Learning
                </button>
              </Link>
            )}
          </div>

          {/* Progress ring */}
          <div className="hidden md:flex flex-col items-center">
            <ProgressRing percentage={progressPct} size={110} />
            <p className="text-blue-800/65 text-xs mt-2 font-medium">Curriculum Progress</p>
          </div>
        </div>

        {/* Coach chip */}
        {coach && (
          <div className="relative mt-4 flex items-center gap-3 bg-white/75 backdrop-blur-md rounded-xl border border-blue-200/70 px-4 py-2.5 w-fit shadow-sm shadow-blue-200/40">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold">
              {coach.displayName.charAt(0)}
            </div>
            <div>
              <p className="text-xs text-slate-500">Your Coach</p>
              <p className="text-sm font-semibold text-slate-900">{coach.displayName}</p>
            </div>
            <Link href="/messages" className="ml-3">
              <button className="text-xs text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> Message
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* ── Main Layout ────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* LEFT 2/3 */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Pillar Progress — table rows */}
          <div className="order-2">
            {enrolledSports.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h2 className="text-base font-bold text-gray-900">Your Pillars</h2>
                  <Link href="/pillars" className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
                    View all <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {enrolledSports.map(({ sport, progress }) => {
                    const slug = getPillarSlugFromDocId(sport.id);
                    const info = slug ? PILLARS.find(p => p.slug === slug) : null;
                    const colorClasses = getPillarColorClasses(info?.color || 'blue');
                    const Icon = PILLAR_ICONS[info?.icon || 'Target'] || Target;
                    const pct = Math.round(progress.progressPercentage);
                    return (
                      <Link key={sport.id} href={`/pillars/${sport.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/80 transition-colors group">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${colorClasses.gradient} flex-shrink-0`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{info?.shortName || sport.name}</p>
                          <p className="text-xs text-gray-400">{progress.completedSkills.length}/{progress.totalSkills} skills</p>
                        </div>
                        <div className="w-24 hidden sm:block">
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div className={`h-full rounded-full ${colorClasses.bg}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <span className={`text-sm font-bold w-12 text-right ${pct >= 80 ? 'text-green-600' : pct > 0 ? 'text-gray-900' : 'text-gray-300'}`}>{pct}%</span>
                        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Learning Path — curriculum items */}
          <div className="order-1">
            {curriculum && curriculum.items.length > 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900">Your Learning Path</h2>
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                  {totalItems} items
                </Badge>
              </div>

              {/* Continue Learning highlight */}
              {nextItem && (
                <div className="px-6 py-4 bg-gradient-to-r from-blue-50/80 to-white border-b border-blue-100">
                  <Link href={getContentLink(nextItem) || '#'} className="flex items-center gap-4 group">
                    <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                      {nextItem.type === 'lesson' || nextItem.type === 'custom_lesson'
                        ? <BookOpen className="h-6 w-6 text-blue-600" />
                        : <PlayCircle className="h-6 w-6 text-blue-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-blue-500 font-semibold mb-0.5">Continue Learning</p>
                      <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {contentInfo[nextItem.contentId || nextItem.id]?.title || 'Next Item'}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {contentInfo[nextItem.contentId || nextItem.id]?.description || ''}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </Link>
                </div>
              )}

              {/* Item list */}
              <div className="divide-y divide-gray-50">
                {[...curriculum.items]
                  .sort((a, b) => {
                    const order: Record<string, number> = { completed: 0, in_progress: 1, unlocked: 2, locked: 3 };
                    const diff = (order[a.status] ?? 3) - (order[b.status] ?? 3);
                    return diff !== 0 ? diff : a.order - b.order;
                  })
                  .map((item, index) => {
                    const info = contentInfo[item.contentId || item.id];
                    const link = getContentLink(item);
                    const isLocked = item.status === 'locked';
                    const isDone = item.status === 'completed';

                    return (
                      <div key={item.id} className={`flex items-center gap-4 px-6 py-3.5 ${isLocked ? 'opacity-50' : 'hover:bg-gray-50/80'} transition-colors`}>
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isDone ? 'bg-green-100 text-green-600' : isLocked ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {isDone ? <CheckCircle2 className="h-4 w-4" /> : isLocked ? <Lock className="h-3.5 w-3.5" /> : index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isDone ? 'text-green-700' : 'text-gray-900'}`}>
                            {info?.title || item.customContent?.title || 'Learning Item'}
                          </p>
                          {info?.sportName && (
                            <p className="text-[11px] text-gray-400">{info.sportName}</p>
                          )}
                        </div>
                        <Badge variant="outline" className={`text-[10px] ${
                          isDone ? 'bg-green-50 text-green-600 border-green-200' :
                          item.status === 'unlocked' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          item.status === 'in_progress' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                          'bg-gray-50 text-gray-400 border-gray-200'
                        }`}>
                          {isDone ? 'Done' : item.status === 'unlocked' ? 'Available' : item.status === 'in_progress' ? 'Active' : 'Locked'}
                        </Badge>
                        {link && !isLocked && (
                          <Link href={link}>
                            <button className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                              isDone ? 'text-gray-500 hover:bg-gray-100' : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                            }`}>
                              {isDone ? 'Review' : (item.type === 'lesson' || item.type === 'custom_lesson') ? 'Start' : 'Quiz'}
                            </button>
                          </Link>
                        )}
                      </div>
                    );
                  })}
              </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="h-14 w-14 mx-auto mb-3 rounded-2xl bg-blue-50 flex items-center justify-center">
                <BookOpen className="h-7 w-7 text-blue-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">No Curriculum Assigned Yet</h3>
              <p className="text-xs text-gray-400 mb-4 max-w-xs mx-auto">
                Your coach hasn&apos;t assigned any learning materials yet. Check back soon!
              </p>
              {coach && (
                <Link href="/messages">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25">
                    <UserIcon className="h-4 w-4 mr-2 inline" /> Message Coach
                  </button>
                </Link>
              )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT 1/3 */}
        <div className="space-y-6">

          {/* Mind Vault Entry */}
          <Link href="/mind-vault" className="group block">
            <div className="relative overflow-hidden rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-50 via-white to-red-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-200/35">
              <div className="pointer-events-none absolute -top-10 -right-8 h-28 w-28 rounded-full bg-blue-200/40 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-10 -left-8 h-24 w-24 rounded-full bg-red-200/30 blur-2xl" />
              <div className="relative flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
                  <Brain className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold tracking-[0.12em] uppercase text-blue-600">Mental Training</p>
                  <h3 className="text-lg font-black text-gray-900 mt-1">Open Mind Vault</h3>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    Capture your thoughts after practice or games so your mental patterns are tracked from day one.
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 group-hover:text-blue-800 transition-colors">
                    Enter Mind Vault
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Assessment Profile */}
          {profile && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">Assessment Profile</h3>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-black text-gray-900">{profile.overallScore.toFixed(1)}</span>
                    <span className="text-xs text-gray-400 ml-1">/ 4.0</span>
                  </div>
                  <Badge className={`text-xs ${
                    profile.pacingLevel === 'refinement' ? 'bg-green-500' :
                    profile.pacingLevel === 'development' ? 'bg-blue-500' : 'bg-amber-500'
                  }`}>
                    {getPacingLevelDisplayText(profile.pacingLevel)}
                  </Badge>
                </div>
                {/* Category mini bars */}
                <div className="space-y-1.5">
                  {profile.categoryScores.slice(0, 4).map((cat) => (
                    <div key={cat.categorySlug} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 w-14 truncate capitalize">{cat.categorySlug.replace('_', ' ')}</span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${cat.averageScore >= 3.0 ? 'bg-green-500' : cat.averageScore >= 2.0 ? 'bg-blue-500' : 'bg-red-400'}`} style={{ width: `${((cat.averageScore - 1) / 3) * 100}%` }} />
                      </div>
                      <span className="text-[10px] font-medium text-gray-500 w-5 text-right">{cat.averageScore.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
                {profile.identifiedGaps.length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 mb-1">Focus areas:</p>
                    <div className="flex flex-wrap gap-1">
                      {profile.identifiedGaps.map((gap) => (
                        <span key={gap.categorySlug} className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 capitalize">
                          {gap.categorySlug.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-1.5">
              <QuickAction href="/pillars" icon={<BookOpen className="h-4 w-4 text-blue-600" />} bg="bg-blue-50" label="Browse Pillars" />
              <QuickAction href="/progress" icon={<TrendingUp className="h-4 w-4 text-purple-600" />} bg="bg-purple-50" label="Analytics" />
              <QuickAction href="/achievements" icon={<Trophy className="h-4 w-4 text-green-600" />} bg="bg-green-50" label="Achievements" />
              {coach && <QuickAction href="/messages" icon={<MessageSquare className="h-4 w-4 text-red-600" />} bg="bg-red-50" label="Message Coach" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────── */

function ProgressRing({ percentage, size = 110 }: { percentage: number; size?: number }) {
  const sw = 8;
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percentage / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#cring)" strokeWidth={sw} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} className="transition-all duration-1000 ease-out" />
        <defs><linearGradient id="cring" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#ef4444" /></linearGradient></defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-gray-900">{percentage}</span>
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">%</span>
      </div>
    </div>
  );
}

function QuickAction({ href, icon, bg, label }: { href: string; icon: React.ReactNode; bg: string; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${bg}`}>{icon}</div>
      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
      <ChevronRight className="h-3.5 w-3.5 text-gray-300 ml-auto group-hover:text-gray-500 transition-colors" />
    </Link>
  );
}
