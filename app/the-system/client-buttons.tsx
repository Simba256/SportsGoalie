'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

const BLUE = '#37b5ff';

export function BackToHomeButton() {
  const router = useRouter();
  return (
    <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
      <img src="/logo.png" alt="Smarter Goalie" style={{ height: '40px', objectFit: 'contain' }} />
    </button>
  );
}

export function StartJourneyButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push('/explain')}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '10px',
        background: `linear-gradient(135deg, ${BLUE}, #0ea5e9)`,
        border: 'none', borderRadius: '50px',
        padding: '16px 36px', color: '#fff',
        fontSize: '13px', fontWeight: 800, letterSpacing: '1.5px',
        cursor: 'pointer', boxShadow: `0 4px 24px rgba(55,181,255,0.35)`,
        textTransform: 'uppercase' as const,
      }}
    >
      START MY JOURNEY
      <ChevronRight size={16} />
    </button>
  );
}

export function BeginJourneyButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push('/offer')}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '12px',
        background: `linear-gradient(135deg, ${BLUE}, #0ea5e9)`,
        border: 'none', borderRadius: '60px',
        padding: '20px 48px', color: '#fff',
        fontSize: '14px', fontWeight: 800, letterSpacing: '2px',
        cursor: 'pointer',
        boxShadow: `0 6px 32px rgba(55,181,255,0.4), 0 2px 8px rgba(0,0,0,0.3)`,
        textTransform: 'uppercase' as const,
      }}
    >
      BEGIN MY JOURNEY
      <ChevronRight size={18} />
    </button>
  );
}
