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
import { BorderRotate } from '@/components/ui/animated-gradient-border';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Play,
  CheckCircle,
  Loader2,
  Brain,
  Footprints,
  Shapes,
  Target,
  Grid3X3,
  Dumbbell,
  ChevronRight,
  Zap,
  TrendingUp,
  Star,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const PILLAR_ICONS: Record<string, React.ElementType> = {
  Brain, Footprints, Shapes, Target, Grid3X3, Dumbbell,
};

const HERO_THEME: Record<
  string,
  {
    gradient: 'red' | 'lightBlue' | 'darkBlue' | 'gray' | 'dark';
    sectionBg: string;
    glowBg: string;
  }
> = {
  purple: {
    gradient: 'dark',
    sectionBg: 'bg-gradient-to-b from-zinc-950 to-zinc-900',
    glowBg: 'bg-blue-400/30',
  },
  blue: {
    gradient: 'darkBlue',
    sectionBg: 'bg-gradient-to-b from-slate-700 via-slate-800 to-blue-950',
    glowBg: 'bg-blue-500/30',
  },
  cyan: {
    gradient: 'darkBlue',
    sectionBg: 'bg-gradient-to-b from-slate-700 via-slate-800 to-blue-950',
    glowBg: 'bg-sky-500/30',
  },
  green: {
    gradient: 'lightBlue',
    sectionBg: 'bg-gradient-to-b from-sky-100 to-blue-200/70',
    glowBg: 'bg-sky-300/50',
  },
  orange: {
    gradient: 'gray',
    sectionBg: 'bg-gradient-to-b from-slate-100 to-slate-200/70',
    glowBg: 'bg-slate-300/50',
  },
  red: {
    gradient: 'red',
    sectionBg: 'bg-gradient-to-b from-red-100 to-rose-200/70',
    glowBg: 'bg-red-300/45',
  },
  pink: {
    gradient: 'red',
    sectionBg: 'bg-gradient-to-b from-red-100 to-rose-200/70',
    glowBg: 'bg-rose-300/45',
  },
};

const PILLAR_BADGE_COLORS: Record<string, string> = {
  purple: '#BFDBFE',
  blue: '#93C5FD',
  green: '#7DD3FC',
  orange: '#9CA3AF',
  red: '#F87171',
  cyan: '#60A5FA',
  pink: '#FB7185',
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
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    ring: 'ring-emerald-400',
    bar: 'bg-emerald-500',
    icon: BookOpen,
    tagline: 'Building your foundation',
    range: '1.0 – 2.2',
  },
  development: {
    label: 'Development',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    ring: 'ring-amber-400',
    bar: 'bg-amber-500',
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

const PILLAR_GRADIENT: Record<string, { primary: string; secondary: string; accent: string; bg: string }> = {
  purple: { primary: '#3b0764', secondary: '#7c3aed', accent: '#c4b5fd', bg: '#faf5ff' },
  blue:   { primary: '#1e3a5f', secondary: '#2563eb', accent: '#93c5fd', bg: '#eff6ff' },
  green:  { primary: '#064e3b', secondary: '#059669', accent: '#6ee7b7', bg: '#f0fdf4' },
  orange: { primary: '#7c2d12', secondary: '#ea580c', accent: '#fed7aa', bg: '#fff7ed' },
  red:    { primary: '#7f1d1d', secondary: '#dc2626', accent: '#fca5a5', bg: '#fef2f2' },
  cyan:   { primary: '#164e63', secondary: '#0891b2', accent: '#a5f3fc', bg: '#ecfeff' },
  pink:   { primary: '#831843', secondary: '#db2777', accent: '#f9a8d4', bg: '#fdf2f8' },
};


interface SkillProgress {
  [skillId: string]: { percentage: number; isCompleted: boolean } | null;
}

// ─── Level Badge ──────────────────────────────────────────────────────────────

function LevelBadge({ level }: { level: PacingLevel }) {
  const cfg = LEVEL_CONFIG[level];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${cfg.bg} ${cfg.color} ${cfg.border} border`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

// ─── Score Bar ────────────────────────────────────────────────────────────────

function ScoreBar({ score, level }: { score: number; level: PacingLevel }) {
  const pct = Math.round(((score - 1.0) / 3.0) * 100);
  const cfg = LEVEL_CONFIG[level];
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>1.0</span>
        <span className="font-bold text-zinc-800">{score.toFixed(1)} / 4.0</span>
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
  index,
  pillarId,
  isUserLevel,
  progress,
  pillarColor,
}: {
  skill: Skill;
  index: number;
  pillarId: string;
  isUserLevel: boolean;
  progress: { percentage: number; isCompleted: boolean } | null | undefined;
  pillarColor: string;
}) {
  const hasAttempt = progress !== undefined && progress !== null;
  const isCompleted = hasAttempt && progress!.isCompleted;
  const isInProgress = hasAttempt && !isCompleted;
  const colorCls = getPillarColorClasses(pillarColor);
  const gradient = PILLAR_GRADIENT[pillarColor] ?? PILLAR_GRADIENT.blue;

  const borderGradient = isCompleted
    ? { primary: '#064e3b', secondary: '#059669', accent: '#6ee7b7' }
    : { primary: gradient.primary, secondary: gradient.secondary, accent: gradient.accent };

  return (
    <Link href={`/pillars/${pillarId}/skills/${skill.id}`} className="block group h-full">
      <BorderRotate
        animationMode={isUserLevel || isCompleted ? 'rotate-on-hover' : 'rotate-on-hover'}
        animationSpeed={3}
        gradientColors={borderGradient}
        backgroundColor={isCompleted ? '#f0fdf4' : gradient.bg}
        borderWidth={isUserLevel || isCompleted ? 2 : 1.5}
        borderRadius={16}
        className="h-full flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
      >

        <div className="p-5 flex flex-col gap-3 flex-1">

          {/* Header row: skill number + status badge */}
          <div className="flex items-center justify-between gap-2">
            <span className={`
              inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider
              ${isCompleted
                ? 'bg-emerald-100 text-emerald-700'
                : isUserLevel
                ? `${colorCls.bgLight} ${colorCls.text}`
                : 'bg-zinc-100 text-zinc-500'
              }
            `}>
              {String(index + 1).padStart(2, '0')}
            </span>

            {isCompleted ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <CheckCircle className="w-3 h-3" /> Done
              </span>
            ) : isInProgress ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                <Play className="w-3 h-3" /> In Progress
              </span>
            ) : isUserLevel ? (
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${colorCls.text} ${colorCls.bgLight} ${colorCls.border} border px-2 py-0.5 rounded-full`}>
                Start
              </span>
            ) : null}
          </div>

          {/* Title */}
          <h4 className={`font-extrabold text-base leading-snug ${
            isCompleted ? 'text-emerald-800' : 'text-zinc-900'
          } group-hover:text-zinc-700 transition-colors`}>
            {skill.name}
          </h4>

          {/* Description */}
          {skill.description && (
            <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 flex-1">
              {skill.description}
            </p>
          )}

          {/* Learning objectives */}
          {skill.learningObjectives.length > 0 && (
            <ul className="space-y-1 mt-auto">
              {skill.learningObjectives.slice(0, 2).map((obj, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-500">
                  <span className={`mt-0.5 w-1 h-1 rounded-full flex-shrink-0 ${
                    isCompleted ? 'bg-emerald-400' : isUserLevel ? colorCls.bg : 'bg-zinc-300'
                  }`} />
                  <span className="line-clamp-1">{obj}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-zinc-100 mt-auto">
            {hasAttempt ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                    {skill.hasVideo && <span className="flex items-center gap-1"><Play className="w-3 h-3" /> Video</span>}
                    {skill.estimatedTimeToComplete > 0 && <span>{skill.estimatedTimeToComplete} min</span>}
                  </div>
                  <span className={`text-xs font-black ${isCompleted ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {Math.round(progress!.percentage)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${isCompleted ? 'bg-emerald-500' : 'bg-amber-400'}`}
                    style={{ width: `${progress!.percentage}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <div className="flex items-center gap-2">
                  {skill.hasVideo && <span className="flex items-center gap-1"><Play className="w-3 h-3" /> Video</span>}
                  {skill.estimatedTimeToComplete > 0 && <span>{skill.estimatedTimeToComplete} min</span>}
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            )}
          </div>

        </div>
      </BorderRotate>
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

  if (skills.length === 0) return null;

  return (
    <div className={`rounded-2xl border-2 overflow-hidden ${
      isUserLevel ? `${cfg.border} ring-2 ${cfg.ring}/20` : 'border-zinc-100'
    }`}>
      {/* Section header */}
      <div className={`px-5 py-4 flex items-center justify-between ${
        isUserLevel ? cfg.bg : 'bg-zinc-50'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isUserLevel ? `${cfg.bg} ${cfg.border} border` : 'bg-zinc-100'
          }`}>
            <Icon className={`w-4 h-4 ${isUserLevel ? cfg.color : 'text-zinc-400'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-bold text-sm ${isUserLevel ? cfg.color : 'text-zinc-700'}`}>
                {cfg.label}
              </h3>
              {isUserLevel && (
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} ${cfg.border} border`}>
                  Your Level
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{cfg.tagline}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-zinc-500">{skills.length} skills</p>
          {completedCount > 0 && (
            <p className="text-xs text-emerald-600 font-medium">{completedCount} done</p>
          )}
        </div>
      </div>

      {/* Skills grid */}
      <div className="p-4 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {skills.map((skill, i) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              index={i}
              pillarId={pillarId}
              isUserLevel={isUserLevel}
              progress={skillProgress[skill.id]}
              pillarColor={pillarColor}
            />
          ))}
        </div>
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

  const skillsByDifficulty: Record<DifficultyLevel, Skill[]> = {
    introduction: skills.filter(s => s.difficulty === 'introduction'),
    development: skills.filter(s => s.difficulty === 'development'),
    refinement: skills.filter(s => s.difficulty === 'refinement'),
  };

  const completedTotal = skills.filter(s => skillProgress[s.id]?.isCompleted).length;
  const progressPct = skills.length > 0 ? Math.round((completedTotal / skills.length) * 100) : 0;

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

  const { icon, color } = getDisplayInfo(pillar);
  const colorCls = getPillarColorClasses(color);
  const heroTheme = HERO_THEME[color] ?? HERO_THEME.blue;
  const pillarBadgeColor = PILLAR_BADGE_COLORS[color] ?? PILLAR_BADGE_COLORS.blue;
  const isDarkHero = heroTheme.gradient === 'dark' || heroTheme.gradient === 'darkBlue';
  const IconComponent = PILLAR_ICONS[icon] || Target;
  const levelCfg = userLevel ? LEVEL_CONFIG[userLevel] : null;

  // Sort sections: user's level first, then others in order
  const orderedDifficulties = userLevel
    ? [userLevel, ...DIFFICULTY_ORDER.filter(d => d !== userLevel)] as DifficultyLevel[]
    : DIFFICULTY_ORDER;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className={`relative ${heroTheme.sectionBg} pt-20 pb-16 px-6 overflow-hidden`}>
        {/* Pillar-colour ambient glow */}
        <div className={`absolute -left-20 top-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full blur-[110px] pointer-events-none ${heroTheme.glowBg}`} />
        <div className="absolute -right-16 top-8 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        {/* Subtle texture so the hero has depth without icon silhouettes */}
        <div className="absolute inset-0 pointer-events-none opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_85%)]">
          <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:44px_44px]" />
        </div>

        <button
          onClick={() => router.push('/pillars')}
          className={`absolute top-5 left-6 z-20 inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
            isDarkHero ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> All Pillars
        </button>

        <div className="max-w-6xl mx-auto relative z-10 pt-3 md:pl-8 lg:pl-12">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            {/* Left: pillar info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="inline-flex items-center text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full text-zinc-900"
                  style={{ backgroundColor: pillarBadgeColor }}
                >
                  Pillar {String(pillar.order).padStart(2, '0')}
                </span>
              </div>

              <h1 className={`text-3xl md:text-5xl font-black leading-[1.05] mb-4 max-w-2xl ${isDarkHero ? 'text-white' : 'text-zinc-900'}`}>
                {pillar.name}
              </h1>
              <p className={`text-base md:text-lg leading-relaxed max-w-2xl ${isDarkHero ? 'text-zinc-300' : 'text-zinc-600'}`}>
                {pillar.description}
              </p>

              {/* Skill count + progress */}
              <div className="flex items-center gap-5 mt-6 text-sm">
                <div className={`flex items-center gap-1.5 ${isDarkHero ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  <BookOpen className="w-4 h-4" />
                  <span>{skills.length} skills</span>
                </div>
                {user && completedTotal > 0 && (
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>{completedTotal} completed</span>
                  </div>
                )}
              </div>

              {/* Overall progress bar */}
              {user && skills.length > 0 && (
                <div className="mt-4 max-w-sm space-y-1.5">
                  <div className={`flex justify-between text-xs ${isDarkHero ? 'text-zinc-500' : 'text-zinc-600'}`}>
                    <span>Your progress</span>
                    <span className={`font-semibold ${isDarkHero ? 'text-zinc-300' : 'text-zinc-800'}`}>{progressPct}%</span>
                  </div>
                  <div className={`h-2 w-full rounded-full overflow-hidden ${isDarkHero ? 'bg-zinc-800' : 'bg-zinc-300'}`}>
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
              <div className="md:w-64 flex-shrink-0">
                {levelLoading ? (
                  <div className="bg-zinc-800/60 rounded-2xl border border-zinc-700 p-5 flex items-center justify-center gap-2 text-zinc-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading your level…
                  </div>
                ) : userLevel && levelCfg ? (
                  <div className={`rounded-2xl border p-5 space-y-3 ${levelCfg.bg} ${levelCfg.border}`}>
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-bold uppercase tracking-wider ${levelCfg.color}`}>
                        Your Level
                      </p>
                      <LevelBadge level={userLevel} />
                    </div>
                    <p className={`text-xs ${levelCfg.color} opacity-80`}>{levelCfg.tagline}</p>
                    {userScore !== null && (
                      <ScoreBar score={userScore} level={userLevel} />
                    )}
                    <p className="text-xs text-zinc-500">
                      Score range: <span className="font-semibold text-zinc-700">{levelCfg.range}</span>
                    </p>
                    <div className={`rounded-xl p-3 ${levelCfg.border} border text-xs ${levelCfg.color} bg-white/60 font-medium`}>
                      {skillsByDifficulty[userLevel].length} skills at your level —&nbsp;
                      <span className="font-black">start here</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-800/60 rounded-2xl border border-zinc-700 p-5 space-y-2">
                    <p className="text-zinc-300 text-xs font-semibold uppercase tracking-wider">Your Level</p>
                    <p className="text-zinc-400 text-xs leading-relaxed">
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
      <section className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-zinc-900">
            Skills <span className="text-zinc-400 font-normal text-base">({skills.length})</span>
          </h2>
          {userLevel && (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Your level section is shown first</span>
            </div>
          )}
        </div>

        {skills.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center">
            <BookOpen className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <p className="font-semibold text-zinc-700">Skills coming soon</p>
            <p className="text-sm text-zinc-400 mt-1">Content for this pillar is being added.</p>
          </div>
        ) : (
          <div className="space-y-5">
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
