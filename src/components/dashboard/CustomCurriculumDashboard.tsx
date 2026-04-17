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

  const orderedItems = curriculum
    ? [...curriculum.items].sort((a, b) => a.order - b.order)
    : [];

  return (
    <div className="bg-gray-50">
      <section
        className="relative -mx-4 -mt-4 md:-mx-6 md:-mt-6 h-[340px] md:h-[390px] flex flex-col items-center justify-center px-4 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/goalie-dashboard.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1748]/78 via-[#102a5d]/62 to-[#5f2033]/52" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent via-gray-100/55 to-gray-50" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-white/5 backdrop-blur-[1px]" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-white/10 backdrop-blur-[3px]" />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-white/15 backdrop-blur-[6px]" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <h1 className="text-white text-3xl md:text-5xl font-bold bg-white/10 border border-white/25 backdrop-blur-sm px-6 py-2 rounded-xl inline-block shadow-lg mb-2">
            {greeting}, {firstName}
          </h1>
          <p className="text-white text-sm md:text-base font-medium drop-shadow-md max-w-2xl px-4">
            {totalItems > 0
              ? `You have completed ${completedItems} of ${totalItems} items, with ${unlockedItems} ready to learn.`
              : 'Your coach will assign learning materials soon. Check back or message your coach.'}
          </p>

          <div className="mt-4 w-full max-w-lg rounded-full bg-white/35 h-2.5 overflow-hidden">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${progressPct}%` }} />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 px-2">
            <div className="flex items-center gap-3 rounded-full border border-white/30 bg-white/20 px-4 py-2 backdrop-blur-md shadow-sm">
              <ProgressRing percentage={progressPct} size={48} />
              <div className="text-left">
                <p className="text-[11px] font-medium text-white/80">Curriculum Progress</p>
                <p className="text-sm font-bold text-white">{progressPct}%</p>
              </div>
            </div>

            {coach && (
              <div className="flex items-center gap-3 rounded-full border border-white/35 bg-white/25 px-4 py-2 backdrop-blur-md shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-xs font-bold text-white">
                  {coach.displayName.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium text-white/75">Your Coach</p>
                  <p className="text-sm font-semibold text-white">{coach.displayName}</p>
                </div>
                <Link href="/messages" className="ml-1">
                  <button className="flex items-center gap-1 rounded-full border border-white/35 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-white">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Message
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {curriculum && curriculum.items.length > 0 ? (
            <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 p-6">
                <h2 className="text-xl font-bold text-slate-800">Learning Path</h2>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">{totalItems} items</span>
              </div>

              {nextItem && (
                <div className="border-b border-slate-100 p-4">
                  <Link href={getContentLink(nextItem) || '#'} className="flex items-center gap-4 rounded-2xl border border-blue-100 bg-slate-50 p-4 transition hover:bg-slate-100">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                      {nextItem.type === 'lesson' || nextItem.type === 'custom_lesson'
                        ? <BookOpen className="h-6 w-6" />
                        : <PlayCircle className="h-6 w-6" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-bold text-slate-800">
                        {contentInfo[nextItem.contentId || nextItem.id]?.title || 'Next Item'}
                      </h3>
                      <p className="truncate text-xs text-slate-500">
                        {contentInfo[nextItem.contentId || nextItem.id]?.description || 'Ready to continue your goalie development.'}
                      </p>
                    </div>
                    <div className="text-slate-400">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </Link>
                </div>
              )}

              <div className="p-4 space-y-2">
                {orderedItems.map((item, index) => {
                  const info = contentInfo[item.contentId || item.id];
                  const link = getContentLink(item);
                  const isLocked = item.status === 'locked';
                  const isDone = item.status === 'completed';

                  return (
                    <div key={item.id} className="flex items-center justify-between rounded-xl border border-transparent p-3 pb-4 transition hover:bg-slate-50 hover:border-slate-100">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                          isDone ? 'bg-green-500 text-white' : isLocked ? 'bg-slate-200 text-slate-500' : 'bg-blue-500 text-white'
                        }`}>
                          {isDone ? <CheckCircle2 className="h-4 w-4" /> : isLocked ? <Lock className="h-3.5 w-3.5" /> : <span className="text-[10px] font-semibold">{index + 1}</span>}
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate font-semibold text-slate-800">{info?.title || item.customContent?.title || 'Learning Item'}</h4>
                          <p className="text-xs text-slate-500">{info?.sportName || 'Custom Content'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${
                          isDone
                            ? 'border-green-200 bg-green-100 text-green-700'
                            : item.status === 'unlocked'
                              ? 'border-blue-200 bg-blue-100 text-blue-700'
                              : item.status === 'in_progress'
                                ? 'border-amber-200 bg-amber-100 text-amber-700'
                                : 'border-slate-200 bg-slate-100 text-slate-500'
                        }`}>
                          {isDone ? 'Done' : item.status === 'unlocked' ? 'Available' : item.status === 'in_progress' ? 'Active' : 'Locked'}
                        </span>
                        {link && !isLocked && (
                          <Link href={link}>
                            <button className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                              {isDone ? 'Review' : (item.type === 'lesson' || item.type === 'custom_lesson') ? 'Start' : 'Quiz'}
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : (
            <section className="rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                <BookOpen className="h-7 w-7 text-blue-400" />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-slate-900">No Curriculum Assigned Yet</h3>
              <p className="mx-auto mb-4 max-w-xs text-xs text-slate-500">
                Your coach has not assigned any learning materials yet. Check back soon.
              </p>
              {coach && (
                <Link href="/messages">
                  <button className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
                    <UserIcon className="mr-2 inline h-4 w-4" /> Message Coach
                  </button>
                </Link>
              )}
            </section>
          )}

          {enrolledSports.length > 0 && (
            <section className="overflow-hidden rounded-3xl border border-blue-100/80 bg-gradient-to-br from-blue-50/70 via-white to-red-50/60 shadow-sm">
              <div className="flex items-center justify-between border-b border-blue-100/80 p-6">
                <h2 className="text-xl font-bold text-slate-800">Your Pillars</h2>
                <Link href="/pillars" className="flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-red-600 transition-colors">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-2 p-4">
                {enrolledSports.map(({ sport, progress }) => {
                  const slug = getPillarSlugFromDocId(sport.id);
                  const info = slug ? PILLARS.find(p => p.slug === slug) : null;
                  const colorClasses = getPillarColorClasses(info?.color || 'blue');
                  const Icon = PILLAR_ICONS[info?.icon || 'Target'] || Target;
                  const pct = Math.round(progress.progressPercentage);

                  return (
                    <Link key={sport.id} href={`/pillars/${sport.id}`} className="flex items-center justify-between rounded-2xl border border-transparent p-3 transition hover:border-blue-100 hover:bg-gradient-to-r hover:from-blue-50/70 hover:to-red-50/40">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm ring-1 ring-blue-200">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800">{info?.shortName || sport.name}</h4>
                          <p className="text-xs text-slate-500">{progress.completedSkills.length}/{progress.totalSkills} skills</p>
                        </div>
                      </div>
                      <div className="flex w-1/3 items-center gap-4">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200/80">
                          <div className={`h-full ${colorClasses.bg}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm font-medium text-slate-600">{pct}%</span>
                        <ChevronRight className="h-5 w-5 text-blue-400" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
            <div className="absolute right-0 top-0 p-4 opacity-10">
              <Brain className="h-32 w-32 text-blue-600" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white shadow-md">
                  <Brain className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Mental Training</p>
                  <h3 className="text-lg font-bold text-slate-800">Open Mind Vault</h3>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                Capture your thoughts after practice or games so your mental patterns are tracked from day one.
              </p>
              <Link href="/mind-vault" className="inline-flex items-center font-semibold text-blue-700 transition hover:text-blue-800">
                Enter Mind Vault
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </section>

          {profile && (
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-6 border-b border-slate-100 pb-4 text-lg font-bold text-slate-800">Assessment Profile</h2>
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <span className="text-4xl font-bold text-slate-800">{profile.overallScore.toFixed(1)}</span>
                  <span className="text-sm font-medium text-slate-500"> / 4.0</span>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${
                  profile.pacingLevel === 'refinement' ? 'bg-green-500' :
                  profile.pacingLevel === 'development' ? 'bg-blue-500' : 'bg-red-500'
                }`}>
                  {getPacingLevelDisplayText(profile.pacingLevel)}
                </span>
              </div>
              <div className="space-y-4">
                {profile.categoryScores.slice(0, 4).map((cat) => (
                  <div key={cat.categorySlug} className="flex items-center text-sm">
                    <span className="w-24 capitalize text-slate-600">{cat.categorySlug.replace('_', ' ')}</span>
                    <div className="mx-3 h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full bg-blue-500" style={{ width: `${((cat.averageScore - 1) / 3) * 100}%` }} />
                    </div>
                    <span className="w-8 text-right font-semibold text-slate-700">{cat.averageScore.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">Quick Actions</h2>
            <div className="space-y-2">
              <QuickAction href="/pillars" icon={<BookOpen className="h-5 w-5 text-blue-600" />} bg="bg-blue-50" label="Browse Pillars" />
              <QuickAction href="/progress" icon={<TrendingUp className="h-5 w-5 text-red-600" />} bg="bg-red-50" label="Analytics" />
              <QuickAction href="/achievements" icon={<Trophy className="h-5 w-5 text-blue-600" />} bg="bg-blue-50" label="Achievements" />
              {coach && <QuickAction href="/messages" icon={<MessageSquare className="h-5 w-5 text-red-600" />} bg="bg-red-50" label="Message Coach" />}
            </div>
          </section>
        </div>
      </div>
      </main>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────── */

function ProgressRing({ percentage, size = 110 }: { percentage: number; size?: number }) {
  const clamped = Math.max(0, Math.min(100, percentage));
  const compact = size < 72;
  const ringStyle = {
    background: `conic-gradient(#2563eb ${clamped}%, #e2e8f0 0)`,
  };

  return (
    <div className="relative flex items-center justify-center rounded-full shadow-inner" style={{ width: size, height: size, ...ringStyle }}>
      <div className="absolute flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md" style={{ width: size - 16, height: size - 16 }}>
        <span className={`${compact ? 'text-xs' : 'text-2xl'} font-bold text-slate-800`}>{clamped}%</span>
      </div>
    </div>
  );
}

function QuickAction({ href, icon, bg, label }: { href: string; icon: React.ReactNode; bg: string; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:border-blue-100 hover:bg-white/80 transition-colors group">
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${bg} border border-blue-100/60`}>{icon}</div>
      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
      <ChevronRight className="h-3.5 w-3.5 text-blue-400 ml-auto group-hover:text-red-500 transition-colors" />
    </Link>
  );
}
