'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sport, Skill, DifficultyLevel, PILLARS, PacingLevel } from '@/types';
import { sportsService } from '@/lib/database/services/sports.service';
import { videoQuizService } from '@/lib/database/services/video-quiz.service';
import { onboardingService } from '@/lib/database';
import { useAuth } from '@/lib/auth/context';
import { getPillarColorClasses, getPillarSlugFromDocId } from '@/lib/utils/pillars';
import { LoadingState } from '@/components/ui/loading';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Play,
  CheckCircle,
  Loader2,
  ChevronRight,
  Zap,
  TrendingUp,
  Star,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const HERO_THEME: Record<
  string,
  {
    gradient: 'red' | 'lightBlue' | 'darkBlue' | 'gray' | 'dark';
    sectionBg: string;
    glowBg: string;
    secondaryGlowBg: string;
    accent: string;
    accentSoft: string;
  }
> = {
  purple: {
    gradient: 'dark',
    sectionBg: 'bg-gradient-to-r from-slate-950 via-[#1b1f3a] to-[#111827]',
    glowBg: 'bg-blue-500/30',
    secondaryGlowBg: 'bg-red-400/18',
    accent: 'text-blue-300',
    accentSoft: 'bg-blue-400/20',
  },
  blue: {
    gradient: 'darkBlue',
    sectionBg: 'bg-gradient-to-r from-slate-950 via-[#0f233f] to-[#102847]',
    glowBg: 'bg-blue-500/30',
    secondaryGlowBg: 'bg-red-400/16',
    accent: 'text-blue-300',
    accentSoft: 'bg-blue-400/20',
  },
  cyan: {
    gradient: 'darkBlue',
    sectionBg: 'bg-gradient-to-r from-slate-950 via-[#0d2a3a] to-[#0a3448]',
    glowBg: 'bg-sky-500/30',
    secondaryGlowBg: 'bg-red-400/14',
    accent: 'text-sky-300',
    accentSoft: 'bg-sky-400/20',
  },
  green: {
    gradient: 'lightBlue',
    sectionBg: 'bg-gradient-to-r from-slate-950 via-[#12314a] to-[#1b3f63]',
    glowBg: 'bg-blue-500/28',
    secondaryGlowBg: 'bg-red-400/16',
    accent: 'text-blue-300',
    accentSoft: 'bg-blue-400/20',
  },
  orange: {
    gradient: 'gray',
    sectionBg: 'bg-gradient-to-r from-slate-950 via-[#2a2633] to-[#1f2433]',
    glowBg: 'bg-red-500/24',
    secondaryGlowBg: 'bg-blue-400/15',
    accent: 'text-red-300',
    accentSoft: 'bg-red-400/20',
  },
  red: {
    gradient: 'red',
    sectionBg: 'bg-gradient-to-r from-slate-950 via-[#331a2b] to-[#3a1a26]',
    glowBg: 'bg-red-500/28',
    secondaryGlowBg: 'bg-blue-500/16',
    accent: 'text-red-300',
    accentSoft: 'bg-red-400/20',
  },
  pink: {
    gradient: 'red',
    sectionBg: 'bg-gradient-to-r from-slate-950 via-[#2d1b35] to-[#281d43]',
    glowBg: 'bg-red-500/24',
    secondaryGlowBg: 'bg-blue-500/18',
    accent: 'text-rose-300',
    accentSoft: 'bg-rose-400/20',
  },
};

const LEVEL_CONFIG: Record<PacingLevel, {
  label: string;
  color: string;
  bg: string;
  border: string;
  ring: string;
  bar: string;
  icon: React.ElementType;
  tagline: string;
  range: string;
}> = {
  introduction: {
    label: 'Introduction',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    ring: 'ring-blue-400',
    bar: 'bg-blue-500',
    icon: BookOpen,
    tagline: 'Building your foundation',
    range: '1.0 – 2.2',
  },
  development: {
    label: 'Development',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    ring: 'ring-red-400',
    bar: 'bg-red-500',
    icon: TrendingUp,
    tagline: 'Growing your skills',
    range: '2.2 – 3.1',
  },
  refinement: {
    label: 'Refinement',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    ring: 'ring-red-400',
    bar: 'bg-red-500',
    icon: Zap,
    tagline: 'Mastering your craft',
    range: '3.1 – 4.0',
  },
};

const DIFFICULTY_ORDER: DifficultyLevel[] = ['introduction', 'development', 'refinement'];

const PILLAR_CARD_ACCENT: Record<string, string> = {
  purple: '#2563eb',
  blue: '#2563eb',
  cyan: '#0ea5e9',
  green: '#2563eb',
  orange: '#dc2626',
  red: '#dc2626',
  pink: '#dc2626',
};


interface SkillProgress {
  [skillId: string]: { percentage: number; isCompleted: boolean } | null;
}

// ─── Score Bar ────────────────────────────────────────────────────────────────

function ScoreBar({ score, level }: { score: number; level: PacingLevel }) {
  const pct = Math.round(((score - 1.0) / 3.0) * 100);
  const cfg = LEVEL_CONFIG[level];
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-slate-200">
        <span>1.0</span>
        <span className="font-bold text-white">{score.toFixed(1)} / 4.0</span>
        <span>4.0</span>
      </div>
      <div className="h-2.5 w-full bg-zinc-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Skill Card ───────────────────────────────────────────────────────────────

function SkillCard({
  skill,
  pillarId,
  isUserLevel,
  progress,
  accentColor,
}: {
  skill: Skill;
  pillarId: string;
  isUserLevel: boolean;
  progress: { percentage: number; isCompleted: boolean } | null | undefined;
  accentColor: string;
}) {
  const hasAttempt = progress !== undefined && progress !== null;
  const isCompleted = hasAttempt && progress!.isCompleted;
  const isInProgress = hasAttempt && !isCompleted;

  const topBorderColor = isCompleted ? '#2563eb' : isInProgress ? '#dc2626' : accentColor;

  return (
    <Link href={`/pillars/${pillarId}/skills/${skill.id}`} className="block group h-full">
      <div className="relative h-full rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/60 overflow-hidden flex flex-col">
        {/* Colored top border accent */}
        <div className="h-1 w-full" style={{ backgroundColor: topBorderColor }} />

        <div className="p-5 flex flex-col flex-1">

          {/* Top row: status badge */}
          <div className="flex items-center justify-end mb-3">
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                <CheckCircle className="w-3 h-3" /> Completed
              </span>
            ) : isInProgress ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                <Play className="w-3 h-3" /> In Progress
              </span>
            ) : isUserLevel ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                Start
              </span>
            ) : null}
          </div>

          {/* Title */}
          <h4 className="font-bold text-base leading-snug text-foreground group-hover:text-blue-600 transition-colors">
            {skill.name}
          </h4>

          {/* Description */}
          {skill.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mt-2">
              {skill.description}
            </p>
          )}

          {/* Learning objectives */}
          {skill.learningObjectives.length > 0 && (
            <ul className="space-y-1.5 mt-3">
              {skill.learningObjectives.slice(0, 2).map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 bg-slate-300" />
                  <span className="line-clamp-1">{obj}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Spacer to push footer down */}
          <div className="flex-1" />

          {/* Progress bar (if attempted) */}
          {hasAttempt && (
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className={`font-bold ${isCompleted ? 'text-blue-600' : 'text-red-600'}`}>
                  {Math.round(progress!.percentage)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${isCompleted ? 'bg-blue-500' : 'bg-red-500'}`}
                  style={{ width: `${progress!.percentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {skill.estimatedTimeToComplete > 0 && (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                  {skill.estimatedTimeToComplete} min
                </span>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
          </div>

        </div>
      </div>
    </Link>
  );
}

// ─── Skills Group ─────────────────────────────────────────────────────────────

function SkillsGroup({
  difficulty,
  skills,
  pillarId,
  userLevel,
  skillProgress,
  pillarColor,
}: {
  difficulty: DifficultyLevel;
  skills: Skill[];
  pillarId: string;
  userLevel: PacingLevel | null;
  skillProgress: SkillProgress;
  pillarColor: string;
}) {
  const cfg = LEVEL_CONFIG[difficulty];
  const Icon = cfg.icon;
  const isUserLevel = userLevel === difficulty;
  const completedCount = skills.filter(s => skillProgress[s.id]?.isCompleted).length;
  const cardAccent = PILLAR_CARD_ACCENT[pillarColor] ?? '#2563eb';

  if (skills.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Section header bar */}
      <div className={`rounded-2xl border px-5 py-4 flex items-center justify-between ${
        isUserLevel ? `${cfg.bg} ${cfg.border}` : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            isUserLevel ? `bg-white/80 ${cfg.border} border` : 'bg-white border border-slate-200'
          }`}>
            <Icon className={`w-4 h-4 ${isUserLevel ? cfg.color : 'text-slate-400'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-bold text-sm ${isUserLevel ? cfg.color : 'text-foreground'}`}>
                {cfg.label}
              </h3>
              {isUserLevel && (
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/80 ${cfg.color} ${cfg.border} border`}>
                  Your Level
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{cfg.tagline}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-foreground">{skills.length} skills</p>
          {completedCount > 0 && (
            <p className="text-xs text-blue-600 font-medium">{completedCount} completed</p>
          )}
        </div>
      </div>

      {/* Skills grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            pillarId={pillarId}
            isUserLevel={isUserLevel}
            progress={skillProgress[skill.id]}
            accentColor={cardAccent}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PillarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pillarId = params.id as string;
  const { user } = useAuth();

  const [pillar, setPillar] = useState<Sport | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skillProgress, setSkillProgress] = useState<SkillProgress>({});
  const [userLevel, setUserLevel] = useState<PacingLevel | null>(null);
  const [userScore, setUserScore] = useState<number | null>(null);
  const [levelLoading, setLevelLoading] = useState(false);

  // ── Load pillar + skills ──────────────────────────────────────────────────
  useEffect(() => {
    if (!pillarId) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [pillarResult, skillsResult] = await Promise.all([
          sportsService.getSport(pillarId),
          sportsService.getSkillsBySport(pillarId),
        ]);
        if (!pillarResult.success || !pillarResult.data) {
          setError(pillarResult.error?.message || 'Pillar not found');
        } else {
          setPillar(pillarResult.data);
          setSkills(skillsResult.data?.items || []);
        }
      } catch {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [pillarId]);

  // ── Load user level from evaluation ──────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLevelLoading(true);
      try {
        const result = await onboardingService.getEvaluation(user.id);
        if (result.success && result.data?.intelligenceProfile) {
          setUserLevel(result.data.intelligenceProfile.pacingLevel);
          setUserScore(result.data.intelligenceProfile.overallScore);
        } else if (result.success && result.data?.pacingLevel) {
          setUserLevel(result.data.pacingLevel);
        }
      } catch {
        // non-blocking
      } finally {
        setLevelLoading(false);
      }
    };
    load();
  }, [user]);

  // ── Load skill progress ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !skills.length) return;
    const load = async () => {
      const map: SkillProgress = {};
      await Promise.all(
        skills.map(async (skill) => {
          try {
            const res = await videoQuizService.getUserVideoQuizAttempts(user.id, {
              skillId: skill.id,
              completed: true,
              limit: 1,
            });
            if (res.success && res.data?.items?.length) {
              const latest = res.data.items[0];
              map[skill.id] = { percentage: latest.percentage, isCompleted: latest.isCompleted };
            } else {
              map[skill.id] = null;
            }
          } catch {
            map[skill.id] = null;
          }
        })
      );
      setSkillProgress(map);
    };
    load();
  }, [user, skills]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const getDisplayInfo = (p: Sport) => {
    const slug = getPillarSlugFromDocId(p.id);
    if (slug) {
      const info = PILLARS.find(x => x.slug === slug);
      if (info) return { icon: info.icon, color: info.color };
    }
    return { icon: p.icon, color: 'blue' };
  };

  // Only show skills at the goalie's assessed level (or all if no level yet)
  const filteredSkills = userLevel
    ? skills.filter(s => s.difficulty === userLevel)
    : skills;

  const skillsByDifficulty: Record<DifficultyLevel, Skill[]> = {
    introduction: filteredSkills.filter(s => s.difficulty === 'introduction'),
    development: filteredSkills.filter(s => s.difficulty === 'development'),
    refinement: filteredSkills.filter(s => s.difficulty === 'refinement'),
  };

  const completedTotal = filteredSkills.filter(s => skillProgress[s.id]?.isCompleted).length;
  const progressPct = filteredSkills.length > 0 ? Math.round((completedTotal / filteredSkills.length) * 100) : 0;

  // ── States ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingState message="Loading pillar…" />
      </div>
    );
  }

  if (error || !pillar) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-md">
          <p className="text-red-700 font-medium mb-4">{error || 'Pillar not found'}</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-zinc-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const { color } = getDisplayInfo(pillar);
  const colorCls = getPillarColorClasses(color);
  const heroTheme = HERO_THEME[color] ?? HERO_THEME.blue;
  const levelCfg = userLevel ? LEVEL_CONFIG[userLevel] : null;

  // Show only the user's level section, or all if no level determined
  const orderedDifficulties = userLevel
    ? [userLevel] as DifficultyLevel[]
    : DIFFICULTY_ORDER;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="px-5 pt-4 md:px-6 md:pt-5">
        <div className={`relative overflow-hidden rounded-2xl border border-slate-700/70 ${heroTheme.sectionBg} px-6 py-5 md:px-8 md:py-6 shadow-2xl shadow-slate-900/40`}>
          <div className={`pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full blur-3xl ${heroTheme.glowBg}`} />
          <div className={`pointer-events-none absolute right-10 top-6 h-56 w-56 rounded-full blur-3xl ${heroTheme.secondaryGlowBg}`} />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,rgba(255,255,255,0.04)_0%,transparent_28%,transparent_70%,rgba(255,255,255,0.06)_100%)]" />
          <div className="pointer-events-none absolute right-[-5%] top-0 h-full w-[55%] opacity-35">
            <svg viewBox="0 0 700 320" className="h-full w-full" preserveAspectRatio="none">
              <g fill="none" stroke="rgba(226,232,240,0.65)" strokeWidth="1.6">
                <path d="M20 300 C160 230, 220 80, 360 110 C500 140, 560 10, 700 40" />
                <path d="M-10 270 C120 210, 210 60, 350 90 C500 120, 570 20, 710 55" />
                <path d="M10 240 C140 180, 220 55, 360 80 C510 105, 590 25, 730 65" />
                <path d="M20 210 C150 155, 230 45, 370 70 C520 95, 600 35, 740 80" />
                <path d="M30 180 C165 130, 245 40, 390 65 C535 90, 620 40, 760 95" />
              </g>
            </svg>
          </div>

          <button
            onClick={() => router.push('/pillars')}
            className="relative z-20 inline-flex items-center gap-1.5 text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> All Pillars
          </button>

          <div className="relative z-10 mt-4 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            {/* Left: pillar info */}
            <div className="flex-1 pb-1 md:pb-2">
              <h1 className="text-3xl md:text-5xl font-black leading-[1.05] mb-3 max-w-3xl text-white">
                {pillar.name}
              </h1>
              <p className="text-base md:text-lg leading-relaxed max-w-2xl text-slate-300">
                {pillar.description}
              </p>

              {/* Skill count + progress */}
              <div className="flex items-center gap-5 mt-4 text-sm">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <BookOpen className="w-4 h-4" />
                  <span>{skills.length} skills</span>
                </div>
                {user && completedTotal > 0 && (
                  <div className={`flex items-center gap-1.5 ${heroTheme.accent}`}>
                    <CheckCircle className="w-4 h-4" />
                    <span>{completedTotal} completed</span>
                  </div>
                )}
              </div>

              {/* Overall progress bar */}
              {user && skills.length > 0 && (
                <div className="mt-3 max-w-sm space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Your progress</span>
                    <span className="font-semibold text-slate-200">{progressPct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full overflow-hidden bg-slate-700/70">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${colorCls.bg}`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right: level panel */}
            {user && (
              <div className="lg:w-64 flex-shrink-0">
                {levelLoading ? (
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-5 flex items-center justify-center gap-2 text-slate-300 text-sm backdrop-blur-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading your level…
                  </div>
                ) : userLevel && levelCfg ? (
                  <div className="rounded-2xl border border-white/25 bg-white/12 p-5 space-y-3 backdrop-blur-md shadow-xl shadow-slate-900/40">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-100">
                        Your Level
                      </p>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                        <TrendingUp className="h-3.5 w-3.5" />
                        {levelCfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{levelCfg.tagline}</p>
                    {userScore !== null && (
                      <ScoreBar score={userScore} level={userLevel} />
                    )}
                    <p className="text-xs text-slate-300">
                      Score range: <span className="font-semibold text-white">{levelCfg.range}</span>
                    </p>
                    <div className="rounded-xl border border-white/20 bg-white/90 p-3 text-xs font-semibold text-slate-800">
                      {skillsByDifficulty[userLevel].length} skills at your level —&nbsp;
                      <span className="font-black">start here</span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-5 space-y-2 backdrop-blur-sm">
                    <p className="text-slate-200 text-xs font-semibold uppercase tracking-wider">Your Level</p>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Complete your onboarding assessment to see your recommended level for this pillar.
                    </p>
                    <Link
                      href="/onboarding"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 px-3 py-2 rounded-lg transition-colors mt-1"
                    >
                      Take Assessment <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Skills ────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            Skills <span className="text-muted-foreground font-normal text-base">({filteredSkills.length})</span>
          </h2>
          {userLevel && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Showing skills for your level: <span className="font-semibold text-foreground">{userLevel.charAt(0).toUpperCase() + userLevel.slice(1)}</span></span>
            </div>
          )}
        </div>

        {filteredSkills.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="font-semibold text-foreground">Skills coming soon</p>
            <p className="text-sm text-muted-foreground mt-1">Content for this pillar is being added.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {orderedDifficulties.map(difficulty => (
              <SkillsGroup
                key={difficulty}
                difficulty={difficulty}
                skills={skillsByDifficulty[difficulty]}
                pillarId={pillarId}
                userLevel={userLevel}
                skillProgress={skillProgress}
                pillarColor={color}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
