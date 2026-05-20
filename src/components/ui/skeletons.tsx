import { cn } from '@/lib/utils';

const SKELETON_CHART_BAR_HEIGHTS = [
  66, 74, 58, 42, 81, 63, 36, 55, 47, 39,
  43, 34, 86, 61, 75, 38, 57, 60, 54, 62,
];

/* ── Base Skeleton Pulses ────────────────────────────────────────────────── */

/** Light bone — for student/goalie pages */
function Bone({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cn('animate-pulse rounded-lg bg-muted', className)} style={style} />;
}

/** Dark bone — for admin pages */
function DarkBone({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      className="animate-pulse"
      style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '8px', ...style }}
    />
  );
}

const darkCard: React.CSSProperties = {
  background: 'rgba(2,18,44,0.85)',
  border: '1px solid rgba(55,181,255,0.14)',
  borderRadius: '16px',
};

/* ── Page Banner Skeletons ───────────────────────────────────────────────── */

/** Light gradient banner — goalie/student pages */
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

/** Dark gradient banner — admin/coach pages */
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

/** Hero image banner — pillars page */
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

/* ── Light Stat Cards — student pages ────────────────────────────────────── */

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

/* ── Dark Stat Cards — admin pages ───────────────────────────────────────── */

function DarkStatCards({ count = 4 }: { count?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ ...darkCard, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <DarkBone style={{ height: '14px', width: '80px' }} />
              <DarkBone style={{ height: '32px', width: '56px' }} />
              <DarkBone style={{ height: '12px', width: '64px' }} />
            </div>
            <DarkBone style={{ height: '48px', width: '48px', borderRadius: '12px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Light Card Grid — student pages ─────────────────────────────────────── */

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

/* ── Dark Card Grid — admin pages ────────────────────────────────────────── */

function DarkCardGrid({ count = 6 }: { count?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ ...darkCard, padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <DarkBone style={{ height: '24px', width: '64px', borderRadius: '20px' }} />
            <DarkBone style={{ height: '32px', width: '32px', borderRadius: '50%' }} />
          </div>
          <DarkBone style={{ height: '20px', width: '75%' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <DarkBone style={{ height: '12px', width: '100%' }} />
            <DarkBone style={{ height: '12px', width: '83%' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <DarkBone style={{ height: '12px', width: '56px' }} />
            <DarkBone style={{ height: '12px', width: '16px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Light List — student pages ──────────────────────────────────────────── */

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Bone className="h-5 w-32" />
        <Bone className="h-4 w-16" />
      </div>
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

/* ── Light Chart — student pages ─────────────────────────────────────────── */

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
                style={{ height: `${SKELETON_CHART_BAR_HEIGHTS[i % SKELETON_CHART_BAR_HEIGHTS.length]}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Dark Chart — admin pages ────────────────────────────────────────────── */

function DarkChart() {
  return (
    <div style={{ ...darkCard, overflow: 'hidden' }}>
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <DarkBone style={{ height: '20px', width: '160px' }} />
        <DarkBone style={{ height: '14px', width: '256px' }} />
      </div>
      <div style={{ padding: '24px' }}>
        <div style={{ height: '280px', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingLeft: '32px', paddingRight: '32px' }}>
          {SKELETON_CHART_BAR_HEIGHTS.map((h, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <DarkBone style={{ width: '100%', height: `${h}%`, borderRadius: '4px 4px 0 0' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Light Card Content — student pages ──────────────────────────────────── */

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

/* ── Dark Card Content — admin pages ─────────────────────────────────────── */

function DarkCardContent() {
  return (
    <div style={{ ...darkCard, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <DarkBone style={{ height: '20px', width: '160px' }} />
        <DarkBone style={{ height: '14px', width: '224px' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <DarkBone style={{ height: '12px', width: '100%', borderRadius: '20px' }} />
        <DarkBone style={{ height: '12px', width: '100%', borderRadius: '20px' }} />
        <DarkBone style={{ height: '12px', width: '75%', borderRadius: '20px' }} />
      </div>
    </div>
  );
}

/* ── Light Tabs — student pages ──────────────────────────────────────────── */

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

/* ── Dark Tabs — admin analytics pages ───────────────────────────────────── */

function DarkTabs() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '4px' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <DarkBone key={i} style={{ height: '36px', borderRadius: '8px' }} />
        ))}
      </div>
      <DarkChart />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        <DarkCardContent />
        <DarkCardContent />
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

/** Analytics page — dark admin theme */
export function SkeletonAnalytics() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <SkeletonBannerDark />
      <DarkStatCards count={4} />
      <DarkTabs />
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

/** Admin page — dark banner + stats + card grid */
export function SkeletonDarkPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <SkeletonBannerDark />
      <DarkStatCards count={4} />
      <DarkCardGrid count={6} />
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

/** Message detail / single item page — dark admin theme */
export function SkeletonDetailPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <DarkBone style={{ height: '20px', width: '96px' }} />
      <div style={{ ...darkCard, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <DarkBone style={{ height: '40px', width: '40px', borderRadius: '50%' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <DarkBone style={{ height: '20px', width: '192px' }} />
            <DarkBone style={{ height: '12px', width: '128px' }} />
          </div>
          <DarkBone style={{ height: '24px', width: '80px', borderRadius: '20px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <DarkBone style={{ height: '16px', width: '100%' }} />
          <DarkBone style={{ height: '16px', width: '100%' }} />
          <DarkBone style={{ height: '16px', width: '75%' }} />
        </div>
      </div>
    </div>
  );
}
