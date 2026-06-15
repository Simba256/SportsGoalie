'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';

const FloatingPaths = dynamic(() => import('@/components/ui/background-paths').then(m => ({ default: m.FloatingPaths })), { ssr: false, loading: () => null });
const Boxes = dynamic(() => import('@/components/ui/background-boxes').then(m => ({ default: m.Boxes })), { ssr: false, loading: () => null });
const MeshGradientBg = dynamic(() => import('@/components/ui/mesh-gradient-bg').then(m => ({ default: m.MeshGradientBg })), { ssr: false, loading: () => null });

const BLUE = '#37b5ff';
const BLUE2 = '#60cdff';
const BLUE3 = '#0ea5e9';
const RED = '#C00000';

function VoiceButton({ label }: { label: string }) {
  const [playing, setPlaying] = useState(false);
  const [on, setOn] = useState(true);
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={() => on && setPlaying(p => !p)}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: on ? 'linear-gradient(135deg, rgba(55,181,255,0.14), rgba(96,205,255,0.07))' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${on ? 'rgba(96,205,255,0.32)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '50px', padding: '9px 18px 9px 10px',
          color: on ? BLUE2 : '#475569', fontSize: '11px', fontWeight: 700,
          letterSpacing: '1.2px', cursor: on ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
          boxShadow: on ? '0 2px 10px rgba(55,181,255,0.12)' : 'none',
        }}
      >
        <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: on ? `linear-gradient(135deg, ${BLUE}, ${BLUE3})` : '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {playing ? <Pause size={10} color="#fff" /> : <Play size={10} color="#fff" fill="#fff" />}
        </span>
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden">HEAR COACH MIKE</span>
      </button>
      <button
        onClick={() => { setOn(v => !v); if (on) setPlaying(false); }}
        style={{ fontSize: '10px', color: on ? BLUE2 : '#475569', letterSpacing: '1.5px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase' as const }}
      >
        VOICE {on ? 'ON' : 'OFF'}
      </button>
    </div>
  );
}

const PILLARS = [
  { num: '1', name: 'MIND-SET', subtitle: 'The Foundation', desc: 'The sub-conscious. V.M.P. Character and leadership built from day one.', accent: BLUE2 },
  { num: '2', name: 'SKATING TECH', subtitle: 'Movement Command', desc: 'M.E.T. Your skating style. Game Sync. Movement command before the play moves.', accent: '#a78bfa' },
  { num: '3', name: '7 ANGLE-MARK SYSTEM', subtitle: "The Goalie's GPS", desc: 'Seven markers. The Feel Factor. Positional certainty at all times.', accent: '#34d399' },
  { num: '4', name: '7 POINT SYSTEM', subtitle: 'Net Management', desc: 'Below the icing line. Wraparounds. Net management made complete.', accent: '#fb923c' },
  { num: '5', name: 'FORM TECH', subtitle: 'Technical Precision', desc: 'Your set crouch. Maximum coverage. Minimal movement. Technical precision.', accent: '#f472b6' },
  { num: '6', name: 'GAME & PRACTICE PERFORMANCE', subtitle: 'The Development Loop', desc: 'Reading the play. The Development Loop. Charting everything.', accent: BLUE },
  { num: '7', name: 'LIFESTYLE', subtitle: 'Off-Ice as Performance', desc: 'Off-ice as performance. Mental preparation. Balance. The Maintenance Program.', accent: '#fbbf24' },
];

export default function TheSystemPage() {
  const router = useRouter();

  const sec: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 'clamp(80px,10vw,130px) 0',
  };

  return (
    <div style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif', color: '#fff' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loop-pulse {
          0%, 100% { box-shadow: 0 0 14px rgba(55,181,255,0.25); }
          50%       { box-shadow: 0 0 32px rgba(55,181,255,0.5); }
        }
        @keyframes loop-pulse-green {
          0%, 100% { box-shadow: 0 0 14px rgba(52,211,153,0.25); }
          50%       { box-shadow: 0 0 32px rgba(52,211,153,0.5); }
        }
        @keyframes loop-pulse-purple {
          0%, 100% { box-shadow: 0 0 14px rgba(167,139,250,0.25); }
          50%       { box-shadow: 0 0 32px rgba(167,139,250,0.5); }
        }
        @keyframes connector-flow {
          0%   { opacity: 0.35; }
          50%  { opacity: 1; }
          100% { opacity: 0.35; }
        }
        @keyframes player-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes pillar-entrance {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}} />

      {/* ── NAV ── */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 h-16 flex items-center justify-between">
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <img src="/logo.png" alt="Smarter Goalie" className="h-10 sm:h-11 w-auto object-contain" />
          </button>
          <div className="hidden sm:flex gap-6 items-center">
            <button
              onClick={() => router.push('/who-we-are')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: BLUE, flexShrink: 0 }} />
              WHO WE ARE
            </button>
            {/* Active state — THE SYSTEM */}
            <button
              style={{ background: 'none', border: 'none', cursor: 'default', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', color: BLUE, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: BLUE, boxShadow: `0 0 0 3px rgba(55,181,255,0.22)`, flexShrink: 0 }} />
              THE SYSTEM
            </button>
            <button
              onClick={() => router.push('/contact')}
              style={{
                background: `linear-gradient(135deg, ${BLUE}, #0ea5e9)`,
                border: 'none', borderRadius: '50px',
                padding: '9px 20px', cursor: 'pointer',
                fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', color: '#fff',
                boxShadow: '0 2px 12px rgba(55,181,255,0.3)',
              }}
            >
              CONTACT US
            </button>
          </div>
          {/* Mobile contact button */}
          <button
            onClick={() => router.push('/contact')}
            className="sm:hidden"
            style={{
              background: `linear-gradient(135deg, ${BLUE}, #0ea5e9)`,
              border: 'none', borderRadius: '50px',
              padding: '8px 16px', cursor: 'pointer',
              fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', color: '#fff',
            }}
          >
            CONTACT
          </button>
        </div>
      </nav>

      {/* ── B: OPENING STATEMENT ── */}
      <section style={{ ...sec, background: '#060f28' }}>
        <MeshGradientBg
          colors={['#060f28', '#0f2847', '#1F3864', '#1850b4', '#37b5ff', '#0a2040']}
          distortion={0.9}
          swirl={0.7}
          speed={0.38}
          veilOpacity={0.48}
        />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px' }}>
            <div style={{ width: '48px', height: '2px', background: `linear-gradient(90deg, ${BLUE2}, rgba(96,205,255,0.2))`, flexShrink: 0 }} />
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '4px', color: BLUE2, margin: 0, textTransform: 'uppercase' as const }}>THE SMARTER GOALIE SYSTEM</p>
          </div>

          <h1 style={{ fontSize: 'clamp(30px, 5vw, 68px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.03em', margin: '0 0 28px', color: '#fff', maxWidth: '920px' }}>
            SEVEN PILLARS.<br />
            <span style={{ color: BLUE2 }}>ONE COMPLETE ARCHITECTURE.</span><br />
            <span style={{ color: RED }}>BUILT ON SIX DECADES.</span>
          </h1>

          <p style={{ fontSize: 'clamp(15px, 1.8vw, 20px)', color: 'rgba(255,255,255,0.68)', lineHeight: 1.85, maxWidth: '680px', margin: '0 0 44px', fontStyle: 'italic' }}>
            Every component shown on this page is connected to every other. Nothing operates in isolation. The goalie who engages with the full system develops faster, more completely, and more permanently than any program has ever produced.
          </p>

          <VoiceButton label="HEAR COACH MIKE: THE COMPLETE SYSTEM AND WHY EVERY COMPONENT MATTERS" />
        </div>
      </section>

      {/* ── C: 7 PILLARS OVERVIEW ── */}
      <section style={{ ...sec, background: 'linear-gradient(160deg, #060d1a 0%, #080f20 100%)', padding: 'clamp(80px,10vw,130px) 0' }}>
        {/* Subtle grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(96,205,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(96,205,255,0.028) 1px, transparent 1px)', backgroundSize: '72px 72px', pointerEvents: 'none' }} />
        {/* Giant ghost 7 */}
        <div style={{ position: 'absolute', right: '-2%', top: '50%', transform: 'translateY(-50%)', fontSize: 'clamp(320px, 52vw, 720px)', fontWeight: 900, color: 'rgba(55,181,255,0.028)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none', letterSpacing: '-20px' }}>7</div>

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>

          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '56px' }}>
            <div style={{ width: '6px', height: '80px', background: BLUE2, boxShadow: `0 0 15px ${BLUE2}`, borderRadius: '3px', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '3px', color: BLUE2, textTransform: 'uppercase' as const, margin: '0 0 8px' }}>The Architecture</p>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.05 }}>THE 7 PILLARS</h2>
              <p style={{ fontSize: 'clamp(13px, 1.5vw, 16px)', color: 'rgba(148,195,228,0.75)', margin: '12px 0 0', maxWidth: '480px', lineHeight: 1.65 }}>
                Each Pillar connects to the next. Nothing operates in isolation.
              </p>
            </div>
          </div>

          {/* ── PILLAR 1 — FOUNDATION (hero card) ── */}
          <div style={{
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(96,205,255,0.07) 0%, rgba(96,205,255,0.02) 100%)',
            border: '1px solid rgba(96,205,255,0.28)',
            borderRadius: '20px',
            padding: 'clamp(32px,4vw,52px)',
            overflow: 'hidden',
            marginBottom: '16px',
            boxShadow: '0 0 60px rgba(96,205,255,0.06), 0 8px 32px rgba(0,0,0,0.5)',
          }}>
            {/* Top glowing line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, transparent 0%, ${BLUE2} 30%, ${BLUE2} 70%, transparent 100%)`, boxShadow: `0 0 18px ${BLUE2}` }} />
            {/* Ghost 01 */}
            <div style={{ position: 'absolute', right: '-24px', bottom: '-24px', fontSize: 'clamp(140px, 22vw, 280px)', fontWeight: 900, color: 'rgba(96,205,255,0.04)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none', letterSpacing: '-8px' }}>01</div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Eyebrow */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' as const }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: BLUE2, letterSpacing: '4px', textTransform: 'uppercase' as const }}>PILLAR 01</span>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: BLUE2, flexShrink: 0, display: 'inline-block' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: BLUE2, letterSpacing: '2.5px', textTransform: 'uppercase' as const, background: 'rgba(96,205,255,0.1)', border: '1px solid rgba(96,205,255,0.28)', borderRadius: '20px', padding: '4px 14px' }}>THE FOUNDATION</span>
              </div>
              {/* Name */}
              <h3 style={{ fontSize: 'clamp(36px, 5.5vw, 72px)', fontWeight: 900, color: '#fff', textTransform: 'uppercase' as const, letterSpacing: '-0.03em', margin: '0 0 16px', lineHeight: 1.0 }}>MIND-SET</h3>
              {/* Description */}
              <p style={{ fontSize: 'clamp(14px, 1.7vw, 17px)', color: 'rgba(180,215,240,0.85)', lineHeight: 1.85, maxWidth: '640px', margin: 0 }}>
                The sub-conscious. V.M.P. Character and leadership built from day one. Every other Pillar is built on this foundation.
              </p>
            </div>
          </div>

          {/* ── CONNECTOR ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 0' }}>
            <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, transparent, rgba(96,205,255,0.35))` }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: BLUE2, boxShadow: `0 0 6px ${BLUE2}` }} />
              <svg width="14" height="14" viewBox="0 0 24 24" fill={BLUE2} style={{ opacity: 0.6, animation: 'connector-flow 1.6s ease-in-out infinite' }}>
                <path d="M11 4H13V16L18.5 10.5L19.92 11.92L12 19.84L4.08 11.92L5.5 10.5L11 16V4Z" />
              </svg>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: BLUE2, boxShadow: `0 0 6px ${BLUE2}` }} />
            </div>
            <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, rgba(96,205,255,0.35), transparent)` }} />
          </div>

          {/* ── PILLARS 2–7 (2-col grid) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ marginBottom: '52px' }}>
            {PILLARS.slice(1).map((p) => (
              <div key={p.num} style={{
                position: 'relative',
                background: 'rgba(8,14,28,0.92)',
                borderLeft: `4px solid ${p.accent}`,
                borderTop: `1px solid ${p.accent}20`,
                borderRight: `1px solid ${p.accent}20`,
                borderBottom: `1px solid ${p.accent}20`,
                borderRadius: '0 16px 16px 0',
                padding: 'clamp(22px,3vw,32px)',
                overflow: 'hidden',
                boxShadow: `inset 0 0 50px ${p.accent}06, 0 4px 28px rgba(0,0,0,0.45)`,
                transition: 'box-shadow 0.25s',
              }}>
                {/* Ghost number */}
                <div style={{ position: 'absolute', right: '-8px', bottom: '-12px', fontSize: 'clamp(80px, 13vw, 148px)', fontWeight: 900, color: `${p.accent}0b`, lineHeight: 1, userSelect: 'none', pointerEvents: 'none', letterSpacing: '-4px' }}>{`0${p.num}`}</div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', gap: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: p.accent, letterSpacing: '3.5px', textTransform: 'uppercase' as const, flexShrink: 0 }}>PILLAR 0{p.num}</span>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: `${p.accent}cc`, letterSpacing: '1.5px', textTransform: 'uppercase' as const, background: `${p.accent}14`, border: `1px solid ${p.accent}28`, borderRadius: '20px', padding: '3px 10px', whiteSpace: 'nowrap' as const }}>{p.subtitle}</span>
                  </div>
                  {/* Name */}
                  <h3 style={{ fontSize: 'clamp(17px, 2.2vw, 24px)', fontWeight: 900, color: '#fff', textTransform: 'uppercase' as const, letterSpacing: '-0.01em', margin: '0 0 10px', lineHeight: 1.05 }}>{p.name}</h3>
                  {/* Description */}
                  <p style={{ fontSize: '13px', color: 'rgba(148,200,232,0.72)', margin: 0, lineHeight: 1.75 }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <VoiceButton label="HEAR COACH MIKE: THE 7 PILLARS AS ONE CONNECTED SYSTEM AND HOW THEY BUILD ON EACH OTHER" />
        </div>
      </section>

      {/* ── D: CHARTING ARCHITECTURE ── */}
      <section style={{ ...sec, background: 'linear-gradient(140deg, #0e2040 0%, #142c50 65%, #0c1a30 100%)' }}>
        <div style={{ position: 'absolute', right: '-5%', top: '20%', width: '600px', height: '600px', background: 'radial-gradient(ellipse, rgba(55,181,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
            <div style={{ width: '6px', height: '80px', background: BLUE2, boxShadow: `0 0 15px ${BLUE2}`, borderRadius: '3px', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '3px', color: BLUE2, textTransform: 'uppercase' as const, margin: '0 0 8px' }}>Connected Architecture</p>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.05 }}>THE CHARTING ARCHITECTURE</h2>
            </div>
          </div>

          <div style={{ border: `1px solid ${RED}40`, background: `${RED}09`, borderRadius: '12px', padding: '18px 26px', marginBottom: '44px', maxWidth: '720px' }}>
            <p style={{ fontSize: 'clamp(15px, 1.8vw, 20px)', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '0.3px', lineHeight: 1.45 }}>
              NOTHING YOU CHART IS EVER LOST.{' '}
              <span style={{ color: RED }}>NOTHING YOU LEARN IS EVER LOST. EVER.</span>
            </p>
          </div>

          {/* 4 charting types */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: '52px' }}>
            {[
              {
                title: 'Game Charting',
                desc: 'Factor Ratios, good goal / bad goal, V.M.P. intensity, period by period',
                color: BLUE2,
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18"/><polyline points="7 12 11 8 15 12 19 8"/>
                  </svg>
                ),
              },
              {
                title: 'Practice Charting',
                desc: 'Designated training, one directive, what improved, what needs more',
                color: '#34d399',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
                  </svg>
                ),
              },
              {
                title: 'Self-Evaluation Charting',
                desc: 'Technical Eye and Feel Factor — the gap between what you think happened and what did',
                color: '#a78bfa',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                  </svg>
                ),
              },
              {
                title: 'Skill Charting',
                desc: 'Strong Side maintained, Weak Side developing, gap closing',
                color: '#fb923c',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div key={i} style={{
                background: `linear-gradient(135deg, ${item.color}10, ${item.color}04)`,
                border: `1px solid ${item.color}35`,
                borderRadius: '14px',
                padding: '22px 20px',
                boxShadow: `0 4px 24px rgba(0,0,0,0.2)`,
              }}>
                <div style={{ color: item.color, marginBottom: '14px' }}>{item.icon}</div>
                <p style={{ fontSize: '12px', fontWeight: 800, color: item.color, textTransform: 'uppercase' as const, letterSpacing: '1.5px', margin: '0 0 8px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: 'rgba(148,200,232,0.8)', margin: 0, lineHeight: 1.65 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Development Loop diagram */}
          <div style={{ background: 'rgba(0,0,0,0.28)', border: '1px solid rgba(96,205,255,0.18)', borderRadius: '20px', padding: 'clamp(28px,5vw,48px)', marginBottom: '44px' }}>
            <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '4px', color: BLUE2, textTransform: 'uppercase' as const, margin: '0 0 32px', textAlign: 'center' as const }}>THE DEVELOPMENT LOOP</p>

            {/* Loop nodes */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2" style={{ marginBottom: '24px' }}>
              {[
                { label: 'GAME\nCHART', color: BLUE2, anim: 'loop-pulse' },
                { label: 'PRACTICE\nINDEX', color: '#34d399', anim: 'loop-pulse-green' },
                { label: 'PRACTICE\nCHART', color: '#a78bfa', anim: 'loop-pulse-purple' },
                { label: 'NEXT GAME\nCHART', color: BLUE2, anim: 'loop-pulse' },
              ].map((node, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <div style={{
                    background: `linear-gradient(135deg, ${node.color}1c, ${node.color}08)`,
                    border: `2px solid ${node.color}55`,
                    borderRadius: '12px',
                    padding: '14px 18px',
                    textAlign: 'center' as const,
                    animation: `${node.anim} 2.2s ease-in-out infinite`,
                    animationDelay: `${i * 0.55}s`,
                    minWidth: '100px',
                  }}>
                    {node.label.split('\n').map((line, li) => (
                      <p key={li} style={{ fontSize: '9px', fontWeight: 800, color: node.color, letterSpacing: '1.5px', textTransform: 'uppercase' as const, margin: 0, whiteSpace: 'nowrap' as const }}>{line}</p>
                    ))}
                  </div>
                  {i < 3 && (
                    <ChevronRight size={18} color={BLUE2} style={{ opacity: 0.6, flexShrink: 0 }} />
                  )}
                </div>
              ))}
            </div>

            {/* Loop-back indicator */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '22px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(55,181,255,0.07)', border: '1px solid rgba(55,181,255,0.2)', borderRadius: '30px', padding: '8px 20px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={BLUE2}>
                  <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                </svg>
                <span style={{ fontSize: '10px', fontWeight: 700, color: BLUE2, letterSpacing: '2px', textTransform: 'uppercase' as const }}>THE LOOP NEVER BREAKS</span>
              </div>
            </div>

            <p style={{ fontSize: 'clamp(13px, 1.5vw, 16px)', color: 'rgba(148,200,232,0.8)', margin: 0, lineHeight: 1.85, textAlign: 'center' as const, fontStyle: 'italic', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
              Every game informs every practice. Every practice prepares for every game. The loop never breaks.
            </p>
          </div>

          <VoiceButton label="HEAR COACH MIKE: THE DEVELOPMENT LOOP AND WHY IT IS THE MOST POWERFUL DEVELOPMENT TOOL IN GOALTENDING" />
        </div>
      </section>

      {/* ── E: PERSONALIZED COMPANION SYSTEM ── */}
      <section style={{ ...sec, background: 'linear-gradient(145deg, #1e5ec4 0%, #1850b4 58%, #0f3d9e 100%)' }}>
        <FloatingPaths position={-1} color="rgba(96,205,255,0.7)" />
        <div style={{ position: 'absolute', top: '-10%', right: '-8%', width: '55vw', height: '55vw', maxWidth: '680px', maxHeight: '680px', background: 'radial-gradient(ellipse, rgba(96,205,255,0.13) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex flex-col lg:flex-row gap-14 lg:gap-20 items-center">
            <div style={{ flex: '1 1 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
                <div style={{ width: '48px', height: '2px', background: `linear-gradient(90deg, ${BLUE2}, rgba(96,205,255,0.2))`, flexShrink: 0 }} />
                <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '4px', color: BLUE2, margin: 0, textTransform: 'uppercase' as const }}>THE MOST DIFFERENTIATED FEATURE</p>
              </div>
              <h2 style={{ fontSize: 'clamp(30px, 4.5vw, 60px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.03em', margin: '0 0 16px', color: '#fff' }}>
                COACH MIKE<br />KNOWS YOUR NAME.
              </h2>
              <p style={{ fontSize: 'clamp(18px, 2.5vw, 30px)', fontWeight: 800, color: BLUE2, margin: '0 0 28px', letterSpacing: '-0.01em' }}>
                He speaks to you directly.
              </p>
              <p style={{ fontSize: 'clamp(14px, 1.6vw, 17px)', color: 'rgba(255,255,255,0.65)', lineHeight: 1.85, margin: '0 0 36px', maxWidth: '480px' }}>
                Not a generic message. Not automation pretending to be personal. Coach Mike&rsquo;s actual voice. Your actual name. Your actual milestone. Delivered the moment you earn it.
              </p>
              <VoiceButton label="HEAR COACH MIKE: THE PERSONALIZED COMPANION SYSTEM AND WHAT IT MEANS TO HEAR YOUR NAME" />
            </div>

            <div style={{ flex: '0 0 auto', maxWidth: '400px', width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', animation: 'player-float 6s ease-in-out infinite' }}>
                {[
                  { text: 'Every achievement triggers a personalized voice message from Coach Mike', icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                  )},
                  { text: 'Goalies, parents, and coaches each receive messages relevant to their role', icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  )},
                  { text: 'The system never sleeps. The recognition never stops.', icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                    </svg>
                  )},
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '16px',
                    background: 'rgba(255,255,255,0.07)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(96,205,255,0.25)',
                    borderRadius: '14px',
                    padding: '20px 22px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  }}>
                    <div style={{ flexShrink: 0, marginTop: '2px' }}>{item.icon}</div>
                    <p style={{ fontSize: '14px', color: 'rgba(220,235,248,0.9)', margin: 0, lineHeight: 1.75 }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── F: MOTIVATIONAL LIBRARY ── */}
      <section style={{ ...sec, background: 'radial-gradient(circle at 30% 30%, #0d1a2d 0%, #050b18 100%)' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.008) 0px, rgba(255,255,255,0.008) 1px, transparent 1px, transparent 10px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: '-5%', top: '50%', transform: 'translateY(-50%)', fontSize: 'clamp(100px, 20vw, 300px)', fontWeight: 900, color: 'rgba(255,255,255,0.016)', letterSpacing: '-0.05em', lineHeight: 1, userSelect: 'none', pointerEvents: 'none', textTransform: 'uppercase' as const }}>LIBRARY</div>

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '44px' }}>
            <div style={{ width: '6px', height: '80px', background: '#fbbf24', boxShadow: '0 0 15px #fbbf24', borderRadius: '3px', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '3px', color: '#fbbf24', textTransform: 'uppercase' as const, margin: '0 0 8px' }}>A Space Personal To Each Member</p>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.05 }}>THE MOTIVATIONAL LIBRARY</h2>
              <p style={{ fontSize: 'clamp(15px, 1.8vw, 20px)', fontWeight: 800, color: '#fbbf24', margin: '10px 0 0', fontStyle: 'italic' }}>
                YOUR HIGHLIGHTS. YOUR MILESTONES. YOUR LIBRARY.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" style={{ marginBottom: '44px' }}>
            {[
              { title: 'Personal Highlight Clips', desc: 'Saves, breakthrough moments, before and after comparisons. Your journey preserved.', color: BLUE2 },
              { title: 'Milestone Markers', desc: 'First AA game, first perfect chart, first self-correction identified. Every first remembered.', color: '#34d399' },
              { title: 'Member-Contributed Content', desc: 'Movie clips, music, quotes, poems — anything that motivates, all in one place.', color: '#a78bfa' },
              { title: 'Coach Mike Voice Messages', desc: 'Personalized voice messages triggered by every accolade. Your name. Your achievement.', color: '#fbbf24' },
              { title: 'Parent & Coach Achievement Wall', desc: 'Commitment, dedication, and results celebrated. The people who matter see the journey.', color: '#fb923c' },
              { title: 'Not Curriculum. Not Charting.', desc: 'A celebration of the journey. A dedicated space that grows with every goalie.', color: '#f472b6' },
            ].map((item, i) => (
              <div key={i} style={{
                background: `linear-gradient(135deg, ${item.color}0f, ${item.color}04)`,
                border: `1px solid ${item.color}2e`,
                borderRadius: '14px',
                padding: '22px 20px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, boxShadow: `0 0 8px ${item.color}`, marginBottom: '14px' }} />
                <p style={{ fontSize: '14px', fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '0.3px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: 'rgba(148,200,232,0.8)', margin: 0, lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <VoiceButton label="HEAR COACH MIKE: THE MOTIVATIONAL LIBRARY AND WHY CELEBRATING THE JOURNEY IS PART OF THE DEVELOPMENT" />
        </div>
      </section>

      {/* ── G: YOUR INDIVIDUAL PAGE ── */}
      <section style={{ ...sec, background: 'linear-gradient(155deg, #0d2848 0%, #133050 65%, #0b2242 100%)' }}>
        <Boxes />
        <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 25%, #0d2848 72%)' }} />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 2 }}>
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div style={{ flex: '1 1 0', maxWidth: '560px' }}>
              <h2 style={{ fontSize: 'clamp(36px, 5.5vw, 72px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.03em', margin: '0 0 28px', color: '#fff' }}>
                YOUR PAGE.<br />
                <span style={{ color: BLUE2 }}>YOUR JOURNEY.</span><br />
                <span style={{ color: RED }}>PERMANENT.</span><br />
                <span style={{ color: BLUE2 }}>IT GROWS WITH YOU.</span>
              </h2>
              <p style={{ fontSize: 'clamp(14px, 1.7vw, 18px)', color: 'rgba(255,255,255,0.68)', lineHeight: 1.9, margin: '0 0 36px' }}>
                Every goalie, parent, and coach has their own page within the system. Progress. Charts. Videos. GEMs earned. Development milestones. It does not disappear when the season ends. It is the permanent record of everything you have built.
              </p>
              <VoiceButton label="HEAR COACH MIKE: THE INDIVIDUAL CLIENT PAGE AND WHAT IT MEANS TO HAVE A PERMANENT RECORD" />
            </div>

            <div style={{ flex: '0 0 auto', maxWidth: '380px', width: '100%' }}>
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(96,205,255,0.22)',
                borderRadius: '20px',
                padding: '28px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: `linear-gradient(135deg, ${BLUE}, ${BLUE3})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>G</span>
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: 0 }}>Your Name</p>
                    <p style={{ fontSize: '9px', fontWeight: 700, color: BLUE2, letterSpacing: '2px', textTransform: 'uppercase' as const, margin: 0 }}>GOALIE — MEMBER SINCE 2026</p>
                  </div>
                </div>
                {[
                  { label: 'Pillars Completed', value: '4 / 7', color: BLUE2 },
                  { label: 'Charts Logged', value: '32', color: '#34d399' },
                  { label: 'GEMs Earned', value: '18', color: '#fbbf24' },
                  { label: 'Development Streak', value: '14 Days', color: '#f472b6' },
                  { label: 'Strong Side Maintained', value: '✓', color: '#34d399' },
                ].map((stat, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '11px 0' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(148,200,232,0.7)', fontWeight: 600 }}>{stat.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: stat.color }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── H: ACHIEVEMENT & ACCOLADE ENGINE ── */}
      <section style={{ ...sec, background: 'linear-gradient(135deg, #0a2040 0%, #0c2444 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(96,205,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(96,205,255,0.022) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: '-40px', top: '50%', transform: 'translateY(-50%)', fontSize: 'clamp(100px, 20vw, 300px)', fontWeight: 900, color: 'rgba(255,255,255,0.015)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none', textTransform: 'uppercase' as const, letterSpacing: '-5px' }}>ACHIEVE</div>

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '48px' }}>
            <div style={{ width: '6px', height: '80px', background: '#fbbf24', boxShadow: '0 0 15px #fbbf24', borderRadius: '3px', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '3px', color: '#fbbf24', textTransform: 'uppercase' as const, margin: '0 0 8px' }}>Built Into The Architecture</p>
              <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 48px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.05 }}>THE ACHIEVEMENT &amp; ACCOLADE ENGINE</h2>
              <p style={{ fontSize: 'clamp(13px, 1.5vw, 16px)', color: 'rgba(148,195,228,0.8)', margin: '12px 0 0', maxWidth: '600px', lineHeight: 1.65 }}>
                Not an add-on. Not a gamification gimmick. Real recognition for real development.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ maxWidth: '880px', marginBottom: '48px' }}>
            {[
              { type: 'Commitment', desc: 'Login streaks, consecutive charting streaks, consistent practice', color: BLUE2 },
              { type: 'Dedication', desc: 'Knowledge Acquisition Confirmation speed improving, Pillar completion', color: '#a78bfa' },
              { type: 'Results', desc: 'Factor Ratio improvement, Strong Side maintained, self-correction identified', color: '#34d399' },
              { type: 'Character', desc: 'Accountability, Resilience, Leadership, Self-awareness milestone', color: RED },
            ].map((item, i) => (
              <div key={i} style={{
                background: `linear-gradient(135deg, ${item.color}0f, ${item.color}04)`,
                border: `1px solid ${item.color}32`,
                borderRadius: '16px',
                padding: '24px 26px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, boxShadow: `0 0 6px ${item.color}`, flexShrink: 0 }} />
                  <span style={{ fontSize: '10px', fontWeight: 800, color: item.color, letterSpacing: '3px', textTransform: 'uppercase' as const }}>{item.type} ACCOLADES</span>
                </div>
                <p style={{ fontSize: '14px', color: 'rgba(148,200,232,0.85)', margin: 0, lineHeight: 1.75 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <VoiceButton label="HEAR COACH MIKE: THE ACHIEVEMENT ENGINE AND WHY CHARACTER ACCOLADES ARE THE MOST IMPORTANT ONES" />
        </div>
      </section>

      {/* ── I: THE COMMUNITY ── */}
      <section style={{ ...sec, background: 'linear-gradient(140deg, #1b3c7c 0%, #163272 100%)' }}>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '600px', height: '600px', background: 'radial-gradient(ellipse, rgba(96,205,255,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 60px, rgba(255,255,255,0.01) 60px, rgba(255,255,255,0.01) 61px)', pointerEvents: 'none' }} />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '44px' }}>
            <div style={{ width: '6px', height: '80px', background: BLUE2, boxShadow: `0 0 15px ${BLUE2}`, borderRadius: '3px', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '3px', color: BLUE2, textTransform: 'uppercase' as const, margin: '0 0 8px' }}>Hosted By Coach Mike</p>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.05 }}>THE COMMUNITY</h2>
            </div>
          </div>

          <div style={{ maxWidth: '820px', marginBottom: '44px' }}>
            <div style={{ border: `1px solid rgba(96,205,255,0.28)`, background: 'rgba(96,205,255,0.07)', borderRadius: '12px', padding: '18px 26px', marginBottom: '24px' }}>
              <p style={{ fontSize: 'clamp(14px, 1.7vw, 17px)', fontWeight: 700, color: '#fff', margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>
                WHAT&rsquo;S YOUR OPINION? DEEP THOUGHTS. DID YOU KNOW THIS. WE WELCOME CHALLENGE.
              </p>
            </div>
            <p style={{ fontSize: 'clamp(14px, 1.6vw, 18px)', color: 'rgba(184,212,232,0.9)', lineHeight: 1.9, margin: 0 }}>
              The Smarter Goalie community is not a forum. It is a conversation hosted by Coach Mike. Every question invites a response. Every response builds the community. The hockey world has been waiting for this conversation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" style={{ marginBottom: '44px' }}>
            {[
              { title: 'Role-Filtered Threads', desc: 'Goalies, Parents, Coaches, Goalie Coaches, Organizations — each conversation where it belongs', color: BLUE2 },
              { title: "Coach Mike's Voice", desc: "Every major question receives Coach Mike's voice. The conversation never goes unanswered.", color: '#34d399' },
              { title: 'Deep Thoughts & Did You Know', desc: 'GEMs and knowledge shared daily. The community that keeps growing.', color: '#a78bfa' },
              { title: 'We Welcome Challenge', desc: 'Constructive banter, pro analysis, agree or disagree. This is the conversation hockey needs.', color: '#fb923c' },
              { title: 'History of Goaltending', desc: 'Past, Present, Future — built by the community, hosted by the expert.', color: '#f472b6' },
              { title: 'Becomes The Most Valuable Part', desc: 'Over time the community becomes the most valuable part of the entire system.', color: '#fbbf24' },
            ].map((item, i) => (
              <div key={i} style={{
                background: `linear-gradient(135deg, ${item.color}0f, ${item.color}04)`,
                border: `1px solid ${item.color}2c`,
                borderRadius: '14px',
                padding: '22px 20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, boxShadow: `0 0 8px ${item.color}`, marginBottom: '14px' }} />
                <p style={{ fontSize: '14px', fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '0.3px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: 'rgba(148,200,232,0.8)', margin: 0, lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <VoiceButton label="HEAR COACH MIKE: THE COMMUNITY AND WHY IT BECOMES THE MOST VALUABLE PART OF THE SYSTEM OVER TIME" />
        </div>
      </section>

      {/* ── J: THE CLOSE ── */}
      <section style={{ ...sec, background: 'linear-gradient(160deg, #092038 0%, #0e2848 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(96,205,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(96,205,255,0.018) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: '-40px', top: '50%', transform: 'translateY(-50%)', fontSize: 'clamp(140px, 24vw, 380px)', fontWeight: 900, color: 'rgba(255,255,255,0.016)', letterSpacing: '-10px', lineHeight: 1, userSelect: 'none', pointerEvents: 'none', textTransform: 'uppercase' as const }}>SYSTEM</div>
        <div style={{ position: 'absolute', top: '-20%', left: '50%', width: '800px', height: '800px', background: 'radial-gradient(ellipse, rgba(55,181,255,0.06) 0%, transparent 70%)', pointerEvents: 'none', transform: 'translateX(-50%)' }} />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 text-center w-full" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(55,181,255,0.1)', border: '1px solid rgba(96,205,255,0.26)', borderRadius: '50px', padding: '8px 20px', marginBottom: '36px', boxShadow: '0 2px 12px rgba(55,181,255,0.1)' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: RED, boxShadow: '0 0 0 3px rgba(192,0,0,0.2)', flexShrink: 0 }} />
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3px', color: BLUE2, margin: 0, textTransform: 'uppercase' as const }}>A System. Not A Program.</p>
          </div>

          <h2 style={{ fontSize: 'clamp(28px, 5vw, 64px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.025em', marginBottom: '28px' }}>
            THIS IS NOT A PROGRAM.<br />
            <span style={{ color: BLUE2 }}>IT IS A SYSTEM.</span><br />
            <span style={{ color: RED }}>THERE IS A DIFFERENCE.</span>
          </h2>

          <p style={{ fontSize: 'clamp(14px, 1.8vw, 19px)', color: 'rgba(175,215,238,0.9)', lineHeight: 1.9, maxWidth: '680px', margin: '0 auto 18px' }}>
            A program ends. A system grows. Every goalie who joins Smarter Goalie adds to the knowledge that serves every goalie who comes after them. The system learns. The community builds. The development never stops.
          </p>

          <p style={{ fontSize: 'clamp(13px, 1.5vw, 17px)', color: 'rgba(148,192,222,0.8)', lineHeight: 1.9, maxWidth: '620px', margin: '0 auto 44px', fontStyle: 'italic' }}>
            This is what six decades produced. This is what continues to be built. Every day.
          </p>

          <div style={{ marginBottom: '36px' }}>
            <VoiceButton label="HEAR COACH MIKE: THE DIFFERENCE BETWEEN A PROGRAM AND A SYSTEM" />
          </div>

          {/* CTA to Page 6 */}
          <div style={{ marginTop: '52px' }}>
            <button
              onClick={() => router.push('/offer')}
              style={{
                background: RED, color: '#fff', border: 'none',
                padding: 'clamp(16px,2vw,22px) clamp(32px,4vw,56px)',
                borderRadius: '12px', fontSize: 'clamp(13px,1.5vw,16px)',
                fontWeight: 900, letterSpacing: '2px', cursor: 'pointer',
                textTransform: 'uppercase' as const, boxShadow: '0 8px 32px rgba(192,0,0,0.35)',
                transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '10px',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 14px 44px rgba(192,0,0,0.5)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(192,0,0,0.35)'; }}
            >
              NEXT: THE OFFER
              <ChevronRight size={18} />
            </button>
            <p style={{ fontSize: '10px', color: 'rgba(148,192,222,0.45)', letterSpacing: '3px', textTransform: 'uppercase' as const, margin: '14px 0 0' }}>PAGE 6 OF 6</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div style={{ background: '#061530', padding: '28px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '3px', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>
          &copy; 2026 SMARTER GOALIE INC. | THE INTELLIGENT ATHLETIC GOALTENDER
        </p>
      </div>
    </div>
  );
}
