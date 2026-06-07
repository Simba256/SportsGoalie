'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import {
  AlertCircle, ClipboardCheck, CheckCircle2, ArrowRight, Users, Clock,
} from 'lucide-react';
import { SkeletonContentPage } from '@/components/ui/skeletons';
import Link from 'next/link';

const BLUE = '#37b5ff';
const cardBg = 'rgba(2,18,44,0.82)';
const border = '1px solid rgba(55,181,255,0.18)';

const CATEGORIES = [
  "Your Goalie's Current State",
  'Position Understanding',
  'Pre-Game Observations',
  'The Car Ride Home',
  'Your Role in Development',
  'Expectations & Goals',
  'Communication Preferences',
];

export default function ParentOnboardingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading) return <SkeletonContentPage />;

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  if (user.role !== 'parent') {
    return (
      <div style={{ maxWidth: '560px', margin: '40px auto', padding: '0 16px' }}>
        <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '16px', padding: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <AlertCircle size={20} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ color: '#f87171', fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>Access Denied</p>
            <p style={{ color: 'rgba(248,113,113,0.7)', fontSize: '13px' }}>This page is only available for parent accounts.</p>
          </div>
        </div>
      </div>
    );
  }

  if (user.parentOnboardingComplete) {
    return (
      <div style={{ maxWidth: '560px', margin: '40px auto', padding: '0 16px' }}>
        <div style={{ position: 'relative', background: cardBg, border, borderRadius: '20px', padding: '48px 32px', textAlign: 'center', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${BLUE}, transparent)` }} />
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle2 size={30} color="#22c55e" />
          </div>
          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '22px', marginBottom: '8px' }}>Assessment Complete!</h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', lineHeight: 1.7, maxWidth: '360px', margin: '0 auto 28px' }}>
            You've already completed your parent assessment. View your linked goalies to see how your perceptions compare with their self-assessments.
          </p>
          <Link href="/parent" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `linear-gradient(135deg, ${BLUE} 0%, #0ea5e9 100%)`, color: '#000f28', padding: '12px 28px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
            Go to Dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .po-begin:hover { opacity: 0.9 !important; transform: translateY(-1px) !important; box-shadow: 0 8px 24px rgba(55,181,255,0.3) !important; }
        .po-begin { transition: all 0.2s !important; }
        .po-cat:hover { background: rgba(55,181,255,0.08) !important; }
      `}</style>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ position: 'relative', background: cardBg, border, borderRadius: '20px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${BLUE}, transparent)` }} />

          {/* Header Banner */}
          <div style={{ background: 'linear-gradient(135deg, #000f28 0%, #051e3e 60%, #062344 100%)', padding: '36px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: `radial-gradient(circle, rgba(55,181,255,0.15) 0%, transparent 70%)` }} />
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Users size={26} color="#fff" />
            </div>
            <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '22px', marginBottom: '6px' }}>Welcome, Parent!</h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', maxWidth: '320px', margin: '0 auto' }}>
              Help us understand your perspective on your goalie&apos;s development
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: '28px 28px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', lineHeight: 1.7, textAlign: 'center' }}>
              This questionnaire helps us understand how you perceive your goalie&apos;s skills, confidence, and development needs. Your responses will be cross-referenced with their self-assessment to provide valuable insights.
            </p>

            {/* Categories */}
            <div style={{ background: 'rgba(55,181,255,0.04)', border: '1px solid rgba(55,181,255,0.1)', borderRadius: '12px', padding: '16px' }}>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>7 Assessment Categories</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {CATEGORIES.map((cat) => (
                  <div key={cat} className="po-cat" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '8px', transition: 'background 0.2s' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: BLUE, flexShrink: 0 }} />
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{cat}</span>
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
            <div style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '12px', padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <ClipboardCheck size={18} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ color: '#fbbf24', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>Honest Perspectives Help Most</p>
                <p style={{ color: 'rgba(251,191,36,0.65)', fontSize: '12px', lineHeight: 1.6 }}>
                  There are no right or wrong answers. Answer based on your current observations, not what you hope will happen. This helps identify genuine areas for support.
                </p>
              </div>
            </div>

            {/* CTA */}
            <Link href="/onboarding?role=parent" className="po-begin" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: `linear-gradient(135deg, ${BLUE} 0%, #0ea5e9 100%)`, color: '#000f28', padding: '14px', borderRadius: '12px', textDecoration: 'none', fontWeight: 800, fontSize: '15px' }}>
              Begin Assessment <ArrowRight size={18} />
            </Link>

            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', textAlign: 'center' }}>
              You can complete this assessment later from your dashboard.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
