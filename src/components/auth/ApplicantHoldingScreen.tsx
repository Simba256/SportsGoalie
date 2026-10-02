'use client';

import { useEffect, useState } from 'react';
import { ClipboardCheck, Clock, LogOut, Mail, PauseCircle, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useAuth } from '@/lib/auth/context';
import { auth } from '@/lib/firebase/config';
import { APPLICATION_RECEIVED_SCREEN, PRE_CALL_GATE } from '@/data/applicant-flow-copy';
import { isUsableBookingUrl } from '@/types/platform-settings';
import type { ApplicationStatus } from '@/types/application';

const BLUE = '#37b5ff';
const BLUE2 = '#60cdff';
const MUTED = 'rgba(200,230,255,0.55)';
const BODY = 'rgba(200,230,255,0.84)';
const CARD_BG = 'linear-gradient(135deg, #041e3a 0%, #082d52 100%)';

/**
 * The content wall. Shown in place of the app to anyone who applied through
 * /apply and has not been approved yet.
 *
 * Michael's requirement was blunt: an applicant "sees nothing, not one video".
 * Rendered by ProtectedRoute, so it covers every guarded page at once and no
 * individual page has to know applicants exist — the same arrangement as the
 * pause switch it sits next to.
 *
 * The one door left open is the questionnaire itself, which lives at
 * /onboarding and is deliberately outside ProtectedRoute. That is the whole
 * point of the applicant state: they can do the baseline and nothing else.
 *
 * Two states read Michael's copy pack, from `src/data/applicant-flow-copy.ts`:
 * `submitted` is 3.2 (application received) and `awaiting_call` is 3.8 (in,
 * but the content opens after the call). The other states keep their own
 * wording until he sends some.
 */

interface Copy {
  icon: React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }>;
  heading: React.ReactNode;
  body?: string;
  sub?: string;
  cta?: { label: string; href: string };
}

function copyFor(status: ApplicationStatus, firstName: string | null): Copy {
  const you = firstName ? `${firstName}, ` : '';

  switch (status) {
    case 'applying':
      return {
        icon: ClipboardCheck,
        heading: <>Your questionnaire is <span style={{ color: BLUE2 }}>waiting</span>.</>,
        body: `${you}you have not finished the questionnaire yet. It is the whole application — there is no form after it, and nothing happens until it is in.`,
        sub: 'Set aside twenty minutes and answer it properly. Coach Mike reads what it tells him about you, and a rushed one tells him the wrong thing.',
        cta: { label: 'Finish the questionnaire', href: '/onboarding' },
      };

    // 3.2 — shown the moment the questionnaire is in.
    case 'submitted':
      return {
        icon: Clock,
        heading: APPLICATION_RECEIVED_SCREEN.heading,
        body: APPLICATION_RECEIVED_SCREEN.body,
      };

    // 3.8 — approved and invited; the content opens after the call. The
    // "Book your call" button is added by the screen once the link has loaded.
    case 'awaiting_call':
      return {
        icon: Phone,
        heading: PRE_CALL_GATE.heading,
      };

    case 'waitlisted':
      return {
        icon: Clock,
        heading: <>You are on the <span style={{ color: BLUE2 }}>waiting list</span>.</>,
        body: `${you}Coach Mike has read your application and put you on the list. That is not a no — it is a not yet.`,
        sub: 'Places open up as the founding group settles. Your questionnaire stays exactly as you left it, so nothing has to be done twice when it does.',
      };

    case 'declined':
      return {
        icon: PauseCircle,
        heading: <>This is not the <span style={{ color: BLUE2 }}>right fit</span> right now.</>,
        body: `${you}Coach Mike has read your application, and on this occasion he is not taking it forward.`,
        sub: 'That is a judgement about fit and timing, not about you as a goalie. If your situation changes, get in touch — the door is not bolted.',
      };

    // Not reachable in practice: an approved applicant is through the wall.
    // Here so the switch is total and a future status cannot fall through to
    // nothing.
    case 'approved':
    default:
      return {
        icon: ClipboardCheck,
        heading: <>Your account is <span style={{ color: BLUE2 }}>open</span>.</>,
        body: `${you}you are through.`,
        sub: 'If it has not opened up for you yet, sign out and back in.',
      };
  }
}

/**
 * The booking link for an applicant waiting on their call, or null until it
 * has loaded (and for good if there isn't one). It comes from the server
 * because the setting it lives in is admin-only; the route hands it only to an
 * applicant in `awaiting_call`. A failure just leaves the button off — the
 * link is also in their approval email, and Contact Us is always there.
 */
function useBookingLink(enabled: boolean): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;
        const res = await fetch('/api/applications/booking-link', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data = (await res.json()) as { bookingUrl?: string | null };
        if (!cancelled && data.bookingUrl && isUsableBookingUrl(data.bookingUrl)) setUrl(data.bookingUrl);
      } catch {
        // Left off; see above.
      }
    })();
    return () => { cancelled = true; };
  }, [enabled]);

  return enabled ? url : null;
}

export function ApplicantHoldingScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const status: ApplicationStatus = user?.applicationStatus ?? 'submitted';
  const firstName = user?.displayName?.split(' ')[0] ?? null;
  const { icon: Icon, heading, body, sub, cta } = copyFor(status, firstName);
  const bookingUrl = useBookingLink(status === 'awaiting_call');
  // Only one button gets the filled style; Contact Us steps back when there is another.
  const hasPrimary = !!cta || !!bookingUrl;

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#000f28',
        colorScheme: 'dark',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <style>{`
        .applicant-btn { transition: all .2s; }
        .applicant-btn:hover { opacity: 0.85; transform: translateY(-1px); }
      `}</style>
      <div
        style={{
          position: 'relative',
          background: CARD_BG,
          border: '1px solid rgba(55,181,255,0.22)',
          borderRadius: '18px',
          padding: 'clamp(32px, 6vw, 52px) clamp(20px, 5vw, 44px)',
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, transparent, ${BLUE}, ${BLUE2}88, transparent)` }} />

        <Icon size={48} color={BLUE} style={{ marginBottom: '18px' }} aria-hidden="true" />

        <h1 style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 900, letterSpacing: '-0.02em', color: '#fff', margin: '0 0 12px' }}>
          {heading}
        </h1>

        {body && (
          <p style={{ fontSize: 'clamp(14px, 1.8vw, 15px)', color: BODY, lineHeight: 1.75, margin: sub ? '0 0 10px' : '0 0 26px' }}>
            {body}
          </p>
        )}
        {sub && (
          <p style={{ fontSize: 'clamp(14px, 1.8vw, 15px)', color: MUTED, lineHeight: 1.75, margin: '0 0 26px' }}>
            {sub}
          </p>
        )}
        {!body && !sub && <div style={{ height: '14px' }} />}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {/* 3.8's button. A new tab, so the applicant keeps this screen; the
              link is the same one their approval email carries. */}
          {bookingUrl && (
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="applicant-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `linear-gradient(135deg, ${BLUE}, #0ea5e9)`, borderRadius: '10px', padding: '11px 22px', color: '#001426', fontSize: '13px', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', textDecoration: 'none', boxShadow: '0 6px 22px rgba(55,181,255,0.3)' }}
            >
              <Phone size={15} aria-hidden="true" /> {PRE_CALL_GATE.button}
            </a>
          )}
          {cta && (
            <Link
              href={cta.href}
              className="applicant-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `linear-gradient(135deg, ${BLUE}, #0ea5e9)`, borderRadius: '10px', padding: '11px 22px', color: '#001426', fontSize: '13px', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', textDecoration: 'none', boxShadow: '0 6px 22px rgba(55,181,255,0.3)' }}
            >
              <ClipboardCheck size={15} aria-hidden="true" /> {cta.label}
            </Link>
          )}
          {/* Same recipients as the contact form and the paused screen. */}
          <a
            href="mailto:info@smartergoalie.com,goaliesmarter@gmail.com"
            className="applicant-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: hasPrimary ? 'transparent' : `linear-gradient(135deg, ${BLUE}, #0ea5e9)`, border: hasPrimary ? '1px solid rgba(200,230,255,0.25)' : 'none', borderRadius: '10px', padding: '11px 22px', color: hasPrimary ? BODY : '#001426', fontSize: '13px', fontWeight: hasPrimary ? 700 : 800, letterSpacing: '.06em', textTransform: 'uppercase', textDecoration: 'none' }}
          >
            <Mail size={15} aria-hidden="true" /> Contact Us
          </a>
          <button
            onClick={handleLogout}
            className="applicant-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid rgba(200,230,255,0.25)', borderRadius: '10px', padding: '11px 22px', color: BODY, fontSize: '13px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}
          >
            <LogOut size={15} aria-hidden="true" /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
