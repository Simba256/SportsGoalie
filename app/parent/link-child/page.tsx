'use client';

import { useAuth } from '@/lib/auth/context';
import { LinkChildForm } from '@/components/parent';
import { AlertCircle, ChevronLeft, HelpCircle } from 'lucide-react';
import { SkeletonContentPage } from '@/components/ui/skeletons';
import Link from 'next/link';
import { redirect, useRouter } from 'next/navigation';
import { toast } from 'sonner';

const BLUE = '#37b5ff';
const pageBg = 'linear-gradient(145deg, #000f28 0%, #062344 46%, #0a3159 100%)';
const cardBg = 'rgba(2,18,44,0.82)';
const border = '1px solid rgba(55,181,255,0.18)';

export default function LinkChildPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return <SkeletonContentPage />;
  if (!user) { redirect('/auth/login'); }

  if (user.role !== 'parent') {
    return (
      <div style={{ minHeight: '100vh', background: pageBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '16px', padding: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start', maxWidth: '480px', width: '100%' }}>
          <AlertCircle size={20} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ color: '#f87171', fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>Access Denied</p>
            <p style={{ color: 'rgba(248,113,113,0.7)', fontSize: '13px' }}>This page is only available for parent accounts.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleLinkSuccess = (childName: string) => {
    toast.success(`Successfully linked to ${childName}!`);
    router.push('/parent');
  };

  return (
    <>
      <style>{`
        .lc-back:hover { color: ${BLUE} !important; background: rgba(55,181,255,0.08) !important; }
        .lc-help-step { transition: background 0.2s; }
        .lc-help-step:hover { background: rgba(55,181,255,0.06) !important; }
      `}</style>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Back */}
        <Link href="/parent" className="lc-back" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, borderRadius: '8px', padding: '6px 10px', transition: 'all 0.2s', width: 'fit-content' }}>
          <ChevronLeft size={16} /> Back to Dashboard
        </Link>

        {/* Page Header */}
        <div style={{ position: 'relative', background: cardBg, border, borderRadius: '20px', padding: '28px 28px 24px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${BLUE}, transparent)` }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `linear-gradient(135deg, ${BLUE}22 0%, rgba(14,165,233,0.15) 100%)`, border: `1px solid rgba(55,181,255,0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <HelpCircle size={24} color={BLUE} />
            </div>
            <div>
              <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '22px', marginBottom: '4px' }}>Link to Your Goalie</h1>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>Connect your account to track your goalie's progress</p>
            </div>
          </div>
        </div>

        {/* Link Form */}
        <div style={{ background: cardBg, border, borderRadius: '16px', overflow: 'hidden' }}>
          <LinkChildForm parentId={user.id} onLinkSuccess={handleLinkSuccess} />
        </div>

        {/* Help Section */}
        <div style={{ position: 'relative', background: cardBg, border, borderRadius: '16px', padding: '20px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg, transparent, rgba(55,181,255,0.3), transparent)` }} />
          <p style={{ color: BLUE, fontWeight: 700, fontSize: '13px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={15} /> How to Get a Link Code
          </p>
          <ol style={{ display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              'Ask your goalie to log into their Smarter Goalie account',
              <>Have them go to <strong style={{ color: '#fff' }}>Profile Settings</strong></>,
              <>Look for the <strong style={{ color: '#fff' }}>Family Links</strong> section</>,
              <>Click <strong style={{ color: '#fff' }}>Generate Link Code</strong></>,
              'Share the 8-character code (XXXX-XXXX) with you',
            ].map((step, i) => (
              <li key={i} className="lc-help-step" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 12px', borderRadius: '8px', cursor: 'default' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: `rgba(55,181,255,0.15)`, border: `1px solid rgba(55,181,255,0.25)`, color: BLUE, fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>{i + 1}</span>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: 1.5 }}>{step}</span>
              </li>
            ))}
          </ol>
          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(55,181,255,0.1)' }}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', lineHeight: 1.6 }}>
              Link codes expire after 7 days for security. If the code has expired, your goalie can generate a new one.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
