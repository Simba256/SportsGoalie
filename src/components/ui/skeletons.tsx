import { cn } from '@/lib/utils';

const SKELETON_CHART_BAR_HEIGHTS = [
  66, 74, 58, 42, 81, 63, 36, 55, 47, 39,
  43, 34, 86, 61, 75, 38, 57, 60, 54, 62,
];

/* ── Base Bone ────────────────────────────────────────────────────────────── */

function Bone({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn('animate-pulse', className)}
      style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '8px', ...style }}
    />
  );
}

const darkCard: React.CSSProperties = {
  background: 'rgba(2,18,44,0.85)',
  border: '1px solid rgba(55,181,255,0.14)',
  borderRadius: '16px',
};

/* ── Banner Skeletons ─────────────────────────────────────────────────────── */

export function SkeletonBannerLight() {
  return (
    <div style={{ ...darkCard, padding: '24px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Bone style={{ height: '40px', width: '40px', borderRadius: '12px', flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <Bone style={{ height: '24px', width: '192px' }} />
          <Bone style={{ height: '16px', width: '288px' }} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonBannerDark() {
  return (
    <div style={{ ...darkCard, padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Bone style={{ height: '16px', width: '128px' }} />
      <Bone style={{ height: '28px', width: '256px' }} />
      <Bone style={{ height: '16px', width: '320px' }} />
    </div>
  );
}

export function SkeletonBannerHero() {
  return (
    <div
      className="relative -mx-4 -mt-4 md:-mx-6 md:-mt-6 overflow-hidden animate-pulse"
      style={{ background: 'rgba(0,8,28,0.95)' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '64px 24px 96px', gap: '16px' }}>
        <Bone style={{ height: '40px', width: '384px', maxWidth: '100%' }} />
        <Bone style={{ height: '20px', width: '320px', maxWidth: '100%' }} />
        <Bone style={{ height: '4px', width: '64px', marginTop: '8px' }} />
      </div>
    </div>
  );
}

/* ── Stat Cards ───────────────────────────────────────────────────────────── */

export function SkeletonStatCards({ count = 4 }: { count?: number }) {
  const colClass =
    count === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' :
    count === 3 ? 'grid-cols-1 sm:grid-cols-3' :
    'grid-cols-1 sm:grid-cols-2';
  return (
    <div className={cn('grid gap-4', colClass)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ ...darkCard, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Bone style={{ height: '14px', width: '96px' }} />
              <Bone style={{ height: '32px', width: '64px' }} />
              <Bone style={{ height: '12px', width: '80px' }} />
            </div>
            <Bone style={{ height: '48px', width: '48px', borderRadius: '12px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Card Grid ────────────────────────────────────────────────────────────── */

export function SkeletonCardGrid({ count = 6, cols = 3 }: { count?: number; cols?: 2 | 3 }) {
  const colClass = cols === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2';
  return (
    <div className={cn('grid gap-4', colClass)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ ...darkCard, padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Bone style={{ height: '24px', width: '80px', borderRadius: '20px' }} />
            <Bone style={{ height: '32px', width: '32px', borderRadius: '50%' }} />
          </div>
          <Bone style={{ height: '20px', width: '75%' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Bone style={{ height: '12px', width: '100%' }} />
            <Bone style={{ height: '12px', width: '83%' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <Bone style={{ height: '12px', width: '56px' }} />
            <Bone style={{ height: '12px', width: '16px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── List ─────────────────────────────────────────────────────────────────── */

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div style={{ ...darkCard, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Bone style={{ height: '20px', width: '128px' }} />
        <Bone style={{ height: '16px', width: '64px' }} />
      </div>
      <div>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px', borderBottom: i < count - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <Bone style={{ height: '40px', width: '40px', borderRadius: '12px', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Bone style={{ height: '16px', width: '160px' }} />
              <Bone style={{ height: '12px', width: '96px' }} />
            </div>
            <Bone style={{ height: '6px', width: '96px', borderRadius: '20px' }} />
            <Bone style={{ height: '16px', width: '32px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Chart ────────────────────────────────────────────────────────────────── */

export function SkeletonChart() {
  return (
    <div style={{ ...darkCard, overflow: 'hidden' }}>
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Bone style={{ height: '20px', width: '160px' }} />
        <Bone style={{ height: '14px', width: '256px' }} />
      </div>
      <div style={{ padding: '24px' }}>
        <div style={{ height: '280px', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingLeft: '32px', paddingRight: '32px' }}>
          {SKELETON_CHART_BAR_HEIGHTS.map((h, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <Bone style={{ width: '100%', height: `${h}%`, borderRadius: '4px 4px 0 0' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Card Content ─────────────────────────────────────────────────────────── */

function SkeletonCardContent() {
  return (
    <div style={{ ...darkCard, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Bone style={{ height: '20px', width: '160px' }} />
        <Bone style={{ height: '14px', width: '224px' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Bone style={{ height: '12px', width: '100%', borderRadius: '20px' }} />
        <Bone style={{ height: '12px', width: '100%', borderRadius: '20px' }} />
        <Bone style={{ height: '12px', width: '75%', borderRadius: '20px' }} />
      </div>
    </div>
  );
}

/* ── Tabs ─────────────────────────────────────────────────────────────────── */

export function SkeletonTabs() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '4px' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Bone key={i} style={{ height: '36px', borderRadius: '8px' }} />
        ))}
      </div>
      <SkeletonChart />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        <SkeletonCardContent />
        <SkeletonCardContent />
      </div>
    </div>
  );
}

/* ── Form ─────────────────────────────────────────────────────────────────── */

export function SkeletonForm() {
  return (
    <div style={{ ...darkCard, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Bone style={{ height: '20px', width: '160px' }} />
        <Bone style={{ height: '14px', width: '256px' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Bone style={{ height: '14px', width: '96px' }} />
            <Bone style={{ height: '40px', width: '100%', borderRadius: '10px' }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Bone style={{ height: '40px', width: '128px', borderRadius: '10px' }} />
      </div>
    </div>
  );
}

/* ── Profile ──────────────────────────────────────────────────────────────── */

export function SkeletonProfile() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ ...darkCard, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Bone style={{ height: '80px', width: '80px', borderRadius: '50%' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <Bone style={{ height: '16px', width: '128px' }} />
            <Bone style={{ height: '40px', width: '100%', borderRadius: '10px' }} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[0, 1].map(i => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Bone style={{ height: '16px', width: '96px' }} />
              <Bone style={{ height: '40px', width: '100%', borderRadius: '10px' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Composite Page Skeletons ─────────────────────────────────────────────── */

export function SkeletonDashboard() {
  return (
    <div className="max-w-7xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <SkeletonBannerLight />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <SkeletonList count={4} />
          <SkeletonCardContent />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <SkeletonStatCards count={4} />
          <SkeletonList count={3} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonPillarsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <SkeletonBannerHero />
      <div className="max-w-7xl mx-auto px-1 w-full">
        <SkeletonCardGrid count={6} cols={3} />
      </div>
    </div>
  );
}

export function SkeletonPillarDetail() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <section style={{ padding: '16px 20px' }}>
        <div style={{ ...darkCard, padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Bone style={{ height: '16px', width: '96px' }} />
          <Bone style={{ height: '40px', width: '384px', maxWidth: '100%' }} />
          <Bone style={{ height: '20px', width: '320px', maxWidth: '100%' }} />
          <Bone style={{ height: '8px', width: '192px', marginTop: '8px', borderRadius: '20px' }} />
        </div>
      </section>
      <section className="max-w-6xl mx-auto" style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Bone style={{ height: '24px', width: '128px' }} />
          <Bone style={{ height: '16px', width: '224px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Bone style={{ height: '64px', width: '100%', borderRadius: '16px' }} />
          <SkeletonCardGrid count={3} cols={3} />
        </div>
      </section>
    </div>
  );
}

export function SkeletonAnalytics() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <SkeletonBannerDark />
      <SkeletonStatCards count={4} />
      <SkeletonTabs />
    </div>
  );
}

export function SkeletonListPage({ cols = 3, count = 6 }: { cols?: 2 | 3; count?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <SkeletonBannerLight />
      <SkeletonCardGrid count={count} cols={cols} />
    </div>
  );
}

export function SkeletonDarkPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <SkeletonBannerDark />
      <SkeletonStatCards count={4} />
      <SkeletonCardGrid count={6} cols={3} />
    </div>
  );
}

export function SkeletonContentPage() {
  return (
    <div className="max-w-7xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <SkeletonBannerLight />
      <SkeletonForm />
    </div>
  );
}

export function SkeletonDetailPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Bone style={{ height: '20px', width: '96px' }} />
      <div style={{ ...darkCard, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Bone style={{ height: '40px', width: '40px', borderRadius: '50%' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Bone style={{ height: '20px', width: '192px' }} />
            <Bone style={{ height: '12px', width: '128px' }} />
          </div>
          <Bone style={{ height: '24px', width: '80px', borderRadius: '20px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Bone style={{ height: '16px', width: '100%' }} />
          <Bone style={{ height: '16px', width: '100%' }} />
          <Bone style={{ height: '16px', width: '75%' }} />
        </div>
      </div>
    </div>
  );
}
