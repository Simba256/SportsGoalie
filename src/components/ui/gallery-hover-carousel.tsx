'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface GalleryCarouselItem {
  id: string;
  label: string;
  title: string;
  quote: string;
  accent: string;
  bg: string;
  WatermarkIcon?: LucideIcon;
}

interface Props {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  items: GalleryCarouselItem[];
}

export function GalleryHoverCarousel({ eyebrow, heading, subheading, items }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const updateState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateState();
    el.addEventListener('scroll', updateState, { passive: true });
    window.addEventListener('resize', updateState);
    return () => {
      el.removeEventListener('scroll', updateState);
      window.removeEventListener('resize', updateState);
    };
  }, [updateState]);

  const scroll = (dir: 'prev' | 'next') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'next' ? 380 : -380, behavior: 'smooth' });
  };

  return (
    <section
      style={{
        padding: 'clamp(64px,8vw,100px) 0',
        background: 'linear-gradient(180deg, #041530 0%, #000f28 100%)',
        overflow: 'hidden',
        borderTop: '1px solid rgba(55,181,255,0.08)',
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(24px,5vw,80px)', marginBottom: '40px' }}>
        {eyebrow && (
          <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '99px', background: 'rgba(55,181,255,0.1)', border: '1px solid rgba(55,181,255,0.25)', color: '#37b5ff', fontSize: '10px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '14px' }}>{eyebrow}</span>
        )}
        {heading && (
          <h2 style={{ fontSize: 'clamp(28px,3.5vw,48px)', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>{heading}</h2>
        )}
        {subheading && (
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: '8px 0 0', lineHeight: 1.6, maxWidth: '480px' }}>{subheading}</p>
        )}
      </div>

      {/* Track + flanking arrows */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '0 clamp(16px,3vw,40px)' }}>

        {/* Left arrow */}
        <button
          onClick={() => scroll('prev')}
          disabled={!canPrev}
          style={{
            flexShrink: 0, width: '44px', height: '44px', borderRadius: '50%',
            background: canPrev ? 'rgba(55,181,255,0.15)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${canPrev ? 'rgba(55,181,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
            color: canPrev ? '#37b5ff' : 'rgba(255,255,255,0.18)',
            cursor: canPrev ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
            boxShadow: canPrev ? '0 4px 20px rgba(55,181,255,0.2)' : 'none',
          }}
        >
          <ChevronLeft size={18} />
        </button>

        {/* Scrollable track */}
        <div
          ref={scrollRef}
          style={{
            flex: 1, minWidth: 0, display: 'flex', gap: '18px',
            overflowX: 'auto', scrollSnapType: 'x mandatory',
            paddingTop: '12px', paddingBottom: '16px', scrollbarWidth: 'none',
          }}
          className="[&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => {
            const hovered = hoveredId === item.id;
            const WIcon = item.WatermarkIcon;
            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  flexShrink: 0,
                  width: 'clamp(270px, 28vw, 340px)',
                  height: '400px',
                  borderRadius: '22px',
                  overflow: 'hidden',
                  position: 'relative',
                  scrollSnapAlign: 'start',
                  cursor: 'pointer',
                  background: item.bg,
                  border: `1px solid ${hovered ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.1)'}`,
                  transition: 'transform 0.35s ease, box-shadow 0.35s ease',
                  transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
                  boxShadow: hovered
                    ? '0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.12)'
                    : '0 6px 24px rgba(0,0,0,0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '28px 26px 30px',
                }}
              >
                {/* Watermark icon — large, low opacity, top-right */}
                {WIcon && (
                  <div style={{
                    position: 'absolute', top: '14%', right: '-8%',
                    opacity: 0.13, pointerEvents: 'none',
                    transition: 'opacity 0.35s',
                    ...(hovered ? { opacity: 0.18 } : {}),
                  }}>
                    <WIcon size={180} color="#fff" strokeWidth={0.7} />
                  </div>
                )}

                {/* Large quote mark */}
                <div style={{
                  position: 'absolute', top: '18px', left: '22px',
                  fontSize: '88px', fontWeight: 900, lineHeight: 0.85,
                  color: 'rgba(255,255,255,0.22)',
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  userSelect: 'none', pointerEvents: 'none',
                }}>
                  &#8220;
                </div>

                {/* Label */}
                <p style={{
                  fontSize: '10px', fontWeight: 800, letterSpacing: '3.5px',
                  color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase',
                  margin: '0 0 14px',
                }}>
                  {item.label}
                </p>

                {/* Title — always visible */}
                <p style={{
                  fontSize: 'clamp(16px,1.7vw,20px)',
                  color: '#fff', lineHeight: 1.6, fontStyle: 'italic',
                  margin: 0, fontWeight: 500,
                  transition: 'opacity 0.3s',
                  opacity: hovered ? 0.3 : 1,
                }}>
                  {item.title}
                </p>

                {/* Hover reveal — full quote slides up from bottom */}
                <div style={{
                  position: 'absolute',
                  bottom: 0, left: 0, right: 0,
                  background: 'rgba(0,0,0,0.72)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderTop: '1px solid rgba(255,255,255,0.12)',
                  padding: '22px 26px 28px',
                  transform: hovered ? 'translateY(0)' : 'translateY(100%)',
                  opacity: hovered ? 1 : 0,
                  transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease',
                }}>
                  <p style={{
                    fontSize: '10px', fontWeight: 800, letterSpacing: '3px',
                    color: item.accent, textTransform: 'uppercase',
                    margin: '0 0 12px',
                  }}>
                    {item.label}
                  </p>
                  <p style={{
                    fontSize: '14px', color: 'rgba(255,255,255,0.88)',
                    lineHeight: 1.7, margin: 0, fontStyle: 'italic',
                  }}>
                    {item.quote}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll('next')}
          disabled={!canNext}
          style={{
            flexShrink: 0, width: '44px', height: '44px', borderRadius: '50%',
            background: canNext ? 'rgba(55,181,255,0.15)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${canNext ? 'rgba(55,181,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
            color: canNext ? '#37b5ff' : 'rgba(255,255,255,0.18)',
            cursor: canNext ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
            boxShadow: canNext ? '0 4px 20px rgba(55,181,255,0.2)' : 'none',
          }}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
