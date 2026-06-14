'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { ClipboardCheck, CheckCircle2, ArrowRight, Shield, Clock } from 'lucide-react';
import { SkeletonContentPage } from '@/components/ui/skeletons';

const BLUE = '#37b5ff';
const GREEN = '#4ade80';
const cardBg = 'rgba(2,18,44,0.82)';
const border = '1px solid rgba(55,181,255,0.18)';

const CATEGORIES = [
  { label: 'How You Feel About Being a Goalie', weight: '15%' },
  { label: 'Your Position Knowledge',            weight: '25%' },
  { label: 'Before the Game',                    weight: '10%' },
  { label: 'During the Game',                    weight: '25%' },
  { label: 'After the Game',                     weight: '10%' },
  { label: 'Your Training & Development',        weight: '10%' },
  { label: 'How You Want to Learn',              weight: '5%' },
];

export default function GoalieOnboardingStartPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading) return <SkeletonContentPage />;

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  if (user.onboardingCompleted) {
    return (
      <div style={{ maxWidth: '560px', margin: '40px auto', padding: '0 16px' }}>
        <div style={{ position: 'relative', background: cardBg, border, borderRadius: '20px', padding: '48px 32px', textAlign: 'center', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${BLUE}, transparent)` }} />
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle2 size={30} color={GREEN} />
          </div>
          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '22px', marginBottom: '8px' }}>Assessment Complete!</h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', lineHeight: 1.7, maxWidth: '360px', margin: '0 auto 28px' }}>
            You've already completed your assessment. Your intelligence profile is being used to personalise your learning path.
          </p>
          <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `linear-gradient(135deg, ${BLUE} 0%, #0ea5e9 100%)`, color: '#000f28', padding: '12px 28px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
            Go to Dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .go-begin:hover { opacity: 0.9 !important; transform: translateY(-1px) !important; box-shadow: 0 8px 24px rgba(55,181,255,0.3) !important; }
        .go-begin { transition: all 0.2s !important; }
        .go-cat:hover { background: rgba(55,181,255,0.08) !important; }
      `}</style>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ position: 'relative', background: cardBg, border, borderRadius: '20px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${BLUE}, transparent)` }} />

          {/* Header Banner */}
          <div style={{ background: 'linear-gradient(135deg, #000f28 0%, #051e3e 60%, #062344 100%)', padding: '36px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: `radial-gradient(circle, rgba(55,181,255,0.15) 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-40px', left: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: `radial-gradient(circle, rgba(74,222,128,0.06) 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg, transparent, ${BLUE}, transparent)` }} />
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(55,181,255,0.1)', border: '1px solid rgba(55,181,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Shield size={28} color={BLUE} />
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(55,181,255,0.12)', border: '1px solid rgba(55,181,255,0.25)', borderRadius: '20px', padding: '4px 14px', marginBottom: '12px' }}>
              <span style={{ color: BLUE, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Goalie Intelligence Assessment</span>
            </div>
            <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '22px', marginBottom: '6px' }}>
              Welcome, {user.displayName?.split(' ')[0] || 'Goalie'}!
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', maxWidth: '340px', margin: '0 auto' }}>
              Tell us about yourself so we can build your personal Goalie Intelligence Profile
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: '28px 28px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', lineHeight: 1.7, textAlign: 'center' }}>
              This assessment maps your mental game, positional knowledge, and development habits across 7 categories. Your profile determines your personalised learning path and lets us identify exactly where to focus your training.
            </p>

            {/* Categories */}
            <div style={{ background: 'rgba(55,181,255,0.04)', border: '1px solid rgba(55,181,255,0.1)', borderRadius: '12px', padding: '16px' }}>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>7 Assessment Categories</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {CATEGORIES.map((cat) => (
                  <div key={cat.label} className="go-cat" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '8px', transition: 'background 0.2s' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: BLUE, flexShrink: 0 }} />
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', flex: 1 }}>{cat.label}</span>
                    <span style={{ color: 'rgba(55,181,255,0.5)', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>{cat.weight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Time */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>
              <Clock size={15} />
              <span>28 questions · Approximately 10–15 minutes</span>
            </div>

            {/* Notice */}
            <div style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.18)', borderRadius: '12px', padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <ClipboardCheck size={18} color={GREEN} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ color: GREEN, fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>Be Honest — It Helps You Most</p>
                <p style={{ color: 'rgba(74,222,128,0.65)', fontSize: '12px', lineHeight: 1.6 }}>
                  There are no right or wrong answers. Answer based on how things actually are right now, not how you want them to be. The more honest you are, the more accurate your profile will be.
                </p>
              </div>
            </div>

            {/* CTA */}
            <Link href="/onboarding" className="go-begin" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: `linear-gradient(135deg, ${BLUE} 0%, #0ea5e9 100%)`, color: '#000f28', padding: '14px', borderRadius: '12px', textDecoration: 'none', fontWeight: 800, fontSize: '15px' }}>
              Begin Assessment <ArrowRight size={18} />
            </Link>

            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', textAlign: 'center' }}>
              Takes about 10–15 minutes. You can pause and return from your dashboard.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
