import { cn } from '@/lib/utils';

/* ── Base Skeleton Pulse ─────────────────────────────────────────────────── */

function Bone({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cn('animate-pulse rounded-lg bg-muted', className)} style={style} />;
}

/* ── Page Banner Skeletons ───────────────────────────────────────────────── */

/** Light gradient banner used on goalie/student pages */
export function SkeletonBannerLight() {
  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-red-100/40 via-white to-blue-100/30 border border-red-200/30 p-6 md:p-8 overflow-hidden">
      <div className="flex items-center gap-3">
        <Bone className="h-10 w-10 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Bone className="h-6 w-48" />
          <Bone className="h-4 w-72" />
        </div>
      </div>
    </div>
  );
}

/** Dark gradient banner used on coach/parent pages */
export function SkeletonBannerDark() {
  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8 overflow-hidden">
      <div className="space-y-2">
        <div className="h-4 w-32 rounded bg-white/10 animate-pulse" />
        <div className="h-7 w-64 rounded bg-white/10 animate-pulse" />
        <div className="h-4 w-80 rounded bg-white/5 animate-pulse" />
      </div>
    </div>
  );
}

/** Hero image banner for the pillars page */
export function SkeletonBannerHero() {
  return (
    <div className="relative -mx-4 -mt-4 md:-mx-6 md:-mt-6 rounded-b-none overflow-hidden bg-slate-200 animate-pulse">
      <div className="flex flex-col items-center justify-center text-center px-6 py-16 md:py-24">
        <Bone className="h-10 w-96 max-w-full bg-slate-300" />
        <Bone className="h-5 w-80 max-w-full mt-4 bg-slate-300" />
        <Bone className="h-1 w-16 mt-6 bg-slate-300" />
      </div>
    </div>
  );
}

/* ── Stat Card Skeletons ─────────────────────────────────────────────────── */

export function SkeletonStatCards({ count = 4 }: { count?: number }) {
  return (
    <div className={cn('grid gap-4', count === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : count === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2')}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/60 bg-card p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Bone className="h-4 w-24" />
              <Bone className="h-8 w-16" />
              <Bone className="h-3 w-20" />
            </div>
            <Bone className="h-12 w-12 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Card Grid Skeletons ─────────────────────────────────────────────────── */

export function SkeletonCardGrid({ count = 6, cols = 3 }: { count?: number; cols?: 2 | 3 }) {
  const colClass = cols === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2';
  return (
    <div className={cn('grid gap-4', colClass)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <Bone className="h-6 w-20 rounded-full" />
            <Bone className="h-8 w-8 rounded-full" />
          </div>
          <Bone className="h-5 w-3/4" />
          <div className="space-y-2">
            <Bone className="h-3 w-full" />
            <Bone className="h-3 w-5/6" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <Bone className="h-3 w-16" />
            <Bone className="h-3 w-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── List Skeletons ──────────────────────────────────────────────────────── */

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Bone className="h-5 w-32" />
        <Bone className="h-4 w-16" />
      </div>
      {/* Rows */}
      <div className="divide-y divide-border/50">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4">
            <Bone className="h-10 w-10 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Bone className="h-4 w-40" />
              <Bone className="h-3 w-24" />
            </div>
            <Bone className="h-1.5 w-24 rounded-full" />
            <Bone className="h-4 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Chart Skeleton ──────────────────────────────────────────────────────── */

export function SkeletonChart() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <div className="p-6 space-y-2 border-b border-border/40">
        <Bone className="h-5 w-40" />
        <Bone className="h-4 w-64" />
      </div>
      <div className="p-6">
        <div className="h-[280px] flex items-end gap-2 px-8">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end">
              <Bone
                className="w-full rounded-t"
                style={{ height: `${30 + Math.random() * 60}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Tabs Skeleton ───────────────────────────────────────────────────────── */

export function SkeletonTabs() {
  return (
    <div className="space-y-6">
      <div className="grid w-full grid-cols-4 gap-1 rounded-lg bg-muted p-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Bone key={i} className="h-9 rounded-md" />
        ))}
      </div>
      <SkeletonChart />
      <div className="grid gap-6 md:grid-cols-2">
        <SkeletonCardContent />
        <SkeletonCardContent />
      </div>
    </div>
  );
}

function SkeletonCardContent() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
      <div className="space-y-2">
        <Bone className="h-5 w-40" />
        <Bone className="h-4 w-56" />
      </div>
      <div className="space-y-3">
        <Bone className="h-3 w-full rounded-full" />
        <Bone className="h-3 w-full rounded-full" />
        <Bone className="h-3 w-3/4 rounded-full" />
      </div>
    </div>
  );
}

/* ── Form Skeleton ───────────────────────────────────────────────────────── */

export function SkeletonForm() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-6">
      <div className="space-y-2">
        <Bone className="h-5 w-40" />
        <Bone className="h-4 w-64" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Bone className="h-4 w-24" />
            <Bone className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Bone className="h-10 w-32 rounded-xl" />
      </div>
    </div>
  );
}

/* ── Profile Skeleton ────────────────────────────────────────────────────── */

export function SkeletonProfile() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Bone className="h-20 w-20 rounded-full" />
          <div className="space-y-2 flex-1">
            <Bone className="h-4 w-32" />
            <Bone className="h-10 w-full rounded-xl" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Bone className="h-4 w-24" />
            <Bone className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Bone className="h-4 w-24" />
            <Bone className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Composite Page Skeletons ────────────────────────────────────────────── */

/** Dashboard: banner + stats + pillar list + sidebar */
export function SkeletonDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <SkeletonBannerLight />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SkeletonList count={4} />
          <SkeletonCardContent />
        </div>
        <div className="space-y-6">
          <SkeletonStatCards count={4} />
          <SkeletonList count={3} />
        </div>
      </div>
    </div>
  );
}

/** Pillar list page */
export function SkeletonPillarsPage() {
  return (
    <div className="space-y-8">
      <SkeletonBannerHero />
      <div className="max-w-7xl mx-auto px-1">
        <SkeletonCardGrid count={6} cols={3} />
      </div>
    </div>
  );
}

/** Pillar detail page with skills */
export function SkeletonPillarDetail() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="px-5 pt-4 md:px-6 md:pt-5">
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8 space-y-4">
          <Bone className="h-4 w-24 bg-white/10" />
          <Bone className="h-10 w-96 max-w-full bg-white/10" />
          <Bone className="h-5 w-80 max-w-full bg-white/5" />
          <Bone className="h-2 w-48 mt-4 rounded-full bg-white/10" />
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <Bone className="h-6 w-32" />
          <Bone className="h-4 w-56" />
        </div>
        <div className="space-y-4">
          <Bone className="h-16 w-full rounded-2xl" />
          <SkeletonCardGrid count={3} cols={3} />
        </div>
      </section>
    </div>
  );
}

/** Analytics page: banner + big stats + tabs */
export function SkeletonAnalytics() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <SkeletonBannerDark />
      <SkeletonStatCards count={4} />
      <SkeletonTabs />
    </div>
  );
}

/** Simple list page: banner + filters + card grid */
export function SkeletonListPage({ cols = 3, count = 6 }: { cols?: 2 | 3; count?: number }) {
  return (
    <div className="space-y-6">
      <SkeletonBannerLight />
      <SkeletonCardGrid count={count} cols={cols} />
    </div>
  );
}

/** Coach/parent page with dark banner + stats + content */
export function SkeletonDarkPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <SkeletonBannerDark />
      <SkeletonStatCards count={4} />
      <SkeletonCardGrid count={6} cols={3} />
    </div>
  );
}

/** Simple content page: banner + single card */
export function SkeletonContentPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <SkeletonBannerLight />
      <SkeletonForm />
    </div>
  );
}

/** Message detail / single item page */
export function SkeletonDetailPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Bone className="h-5 w-24" />
      <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Bone className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Bone className="h-5 w-48" />
            <Bone className="h-3 w-32" />
          </div>
          <Bone className="h-6 w-20 rounded-full" />
        </div>
        <div className="space-y-2 pt-4 border-t border-border/40">
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}
