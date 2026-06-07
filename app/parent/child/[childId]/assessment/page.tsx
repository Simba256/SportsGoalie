'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { parentLinkService } from '@/lib/database';
import { AlertCircle, ChevronLeft, ClipboardCheck, CheckCircle2 } from 'lucide-react';
import { SkeletonContentPage } from '@/components/ui/skeletons';
import Link from 'next/link';
import { redirect, useParams } from 'next/navigation';

const BLUE = '#37b5ff';
const cardBg = 'rgba(2,18,44,0.82)';
const border = '1px solid rgba(55,181,255,0.18)';

export default function ParentAssessmentPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const childId = params.childId as string;

  const [childName, setChildName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!user || !childId) return;
    const checkAuthorization = async () => {
      try {
        setLoading(true);
        setError(null);
        const isLinked = await parentLinkService.isLinked(user.id, childId);
        if (!isLinked) { setError('You are not linked to this goalie'); return; }
        setIsAuthorized(true);
        const childrenResult = await parentLinkService.getLinkedChildren(user.id);
        if (childrenResult.success && childrenResult.data) {
          const child = childrenResult.data.find(c => c.childId === childId);
          if (child) setChildName(child.displayName);
        }
      } catch (err) {
        console.error('Failed to check authorization:', err);
        setError('Failed to verify access');
      } finally {
        setLoading(false);
      }
    };
    checkAuthorization();
  }, [user, childId]);

  if (authLoading || loading) return <SkeletonContentPage />;
  if (!user) { redirect('/auth/login'); }

  const ErrorState = ({ msg }: { msg: string }) => (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Link href="/parent" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, padding: '6px 10px', borderRadius: '8px' }}>
        <ChevronLeft size={16} /> Back to Dashboard
      </Link>
      <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '16px', padding: '20px', display: 'flex', gap: '12px' }}>
        <AlertCircle size={20} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <p style={{ color: '#f87171', fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>Error</p>
          <p style={{ color: 'rgba(248,113,113,0.7)', fontSize: '13px' }}>{msg}</p>
        </div>
      </div>
    </div>
  );

  if (user.role !== 'parent') return <ErrorState msg="This page is only available for parent accounts." />;
  if (error || !isAuthorized) return <ErrorState msg={error || 'You are not authorized to view this page'} />;

  if (user.parentOnboardingComplete) {
    return (
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Link href={`/parent/child/${childId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, padding: '6px 10px', borderRadius: '8px' }}>
          <ChevronLeft size={16} /> Back to {childName}&apos;s Profile
        </Link>
        <div style={{ position: 'relative', background: cardBg, border, borderRadius: '20px', padding: '48px 28px', textAlign: 'center', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${BLUE}, transparent)` }} />
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle2 size={30} color="#22c55e" />
          </div>
          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '22px', marginBottom: '8px' }}>Assessment Complete</h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', lineHeight: 1.7, maxWidth: '340px', margin: '0 auto 28px' }}>
            You&apos;ve already completed your parent assessment. View the perception comparison to see how your views align with {childName}&apos;s self-assessment.
          </p>
          <Link href={`/parent/child/${childId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `linear-gradient(135deg, ${BLUE} 0%, #0ea5e9 100%)`, color: '#000f28', padding: '12px 24px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
            View Perception Comparison
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .pa-start:hover { opacity: 0.9 !important; transform: translateY(-1px) !important; box-shadow: 0 8px 24px rgba(55,181,255,0.25) !important; }
        .pa-start { transition: all 0.2s !important; }
      `}</style>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Link href={`/parent/child/${childId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, padding: '6px 10px', borderRadius: '8px' }}>
          <ChevronLeft size={16} /> Back to {childName}&apos;s Profile
        </Link>

        <div style={{ position: 'relative', background: cardBg, border, borderRadius: '20px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${BLUE}, transparent)` }} />

          {/* Header */}
          <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid rgba(55,181,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `rgba(55,181,255,0.12)`, border: `1px solid rgba(55,181,255,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ClipboardCheck size={20} color={BLUE} />
              </div>
              <div>
                <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '18px', marginBottom: '2px' }}>Parent Assessment</h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Share your perspective on {childName}&apos;s goaltending journey</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '20px 24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: 1.7 }}>
              This assessment helps us understand your perspective on your goalie&apos;s skills, confidence, and development. Your answers will be compared with {childName}&apos;s self-assessment to identify areas of alignment and opportunities for better support.
            </p>

            {/* What to expect */}
            <div style={{ background: 'rgba(55,181,255,0.05)', border: '1px solid rgba(55,181,255,0.12)', borderRadius: '12px', padding: '16px' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: '13px', marginBottom: '10px' }}>What to expect:</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  '28 questions across 7 categories',
                  'Estimated completion: 10–15 minutes',
                  'No right or wrong answers — just your honest perspective',
                  "Results compared with your goalie's self-assessment",
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: BLUE, flexShrink: 0, marginTop: '5px' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Notice */}
            <div style={{ background: 'rgba(55,181,255,0.06)', border: '1px solid rgba(55,181,255,0.15)', borderRadius: '10px', padding: '12px 14px', display: 'flex', gap: '10px' }}>
              <AlertCircle size={16} color={BLUE} style={{ flexShrink: 0, marginTop: '1px' }} />
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', lineHeight: 1.6 }}>
                For the most accurate comparison, complete this assessment based on your current observations of {childName}, not how you hope they&apos;ll develop.
              </p>
            </div>

            <Link href="/onboarding?role=parent" className="pa-start" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${BLUE} 0%, #0ea5e9 100%)`, color: '#000f28', padding: '13px', borderRadius: '12px', textDecoration: 'none', fontWeight: 800, fontSize: '14px' }}>
              Start Assessment
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
