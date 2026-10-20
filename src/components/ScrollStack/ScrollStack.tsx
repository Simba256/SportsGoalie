'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import './ScrollStack.css';

export interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({ children, itemClassName = '' }) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
);

interface ScrollStackProps {
  className?: string;
  children: ReactNode;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  scaleDuration?: number;
  rotationAmount?: number;
  blurAmount?: number;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
}

/* Below this width the cards are single-column and their height varies with
   the copy, so the pin offset is measured per card (see syncStackedOffsets).
   At or above it the cards are a fixed 560px and CSS pins them. */
const STACKED_MAX_WIDTH = 1279;
/* Clearance under the fixed site header for a card that fits the viewport. */
const STACKED_PIN = 80;
/* Breathing room left below a card that is taller than the viewport. */
const STACKED_TAIL = 16;

const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = '',
  itemDistance = 100,
  stackPosition = '20%',
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const resolvedTop = typeof stackPosition === 'number' ? `${stackPosition}px` : stackPosition;
  const customProperties = {
    '--scroll-stack-gap': `${itemDistance}px`,
    '--scroll-stack-top': resolvedTop,
  } as CSSProperties;

  /* A card pinned at a fixed `top` can never scroll above that offset, so any
     card taller than the space below the pin has a permanently unreachable
     bottom — which is how the closing paragraph of every card came to be cut
     off on phones. CSS has no way to express "pin only once the card has
     scrolled through", because the offset depends on the card's own height.
     Measuring it gives each card the offset it needs: cards that fit keep the
     normal pin, and a taller card gets a negative one, so it scrolls fully
     into view — bottom included — before it parks and the next card slides up
     over it. Either way the stack behaves the same. */
  const syncStackedOffsets = useCallback(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const cards = root.querySelectorAll<HTMLElement>('.scroll-stack-card');
    const stacked = window.innerWidth <= STACKED_MAX_WIDTH;
    cards.forEach(card => {
      if (!stacked) {
        // Hand the pin back to the CSS rule for the fixed-height desktop card.
        card.style.removeProperty('top');
        return;
      }
      const overhang = window.innerHeight - card.offsetHeight - STACKED_TAIL;
      card.style.top = `${Math.min(STACKED_PIN, Math.round(overhang))}px`;
    });
  }, []);

  /* Phone cards differ in height, so when a shorter card parks over a taller
     one the taller card's lower edge is left showing beneath it — stray
     half-sentences under the stack. Once the next card has parked, the older
     one adds nothing, so it fades out until the next card lets go again. */
  const syncCoveredCards = useCallback(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>('.scroll-stack-card'));
    const stacked = window.innerWidth <= STACKED_MAX_WIDTH;
    cards.forEach((card, i) => {
      const next = cards[i + 1];
      let covered = false;
      if (stacked && next) {
        const parkedAt = parseFloat(next.style.top);
        const pin = Number.isNaN(parkedAt) ? STACKED_PIN : parkedAt;
        covered = next.getBoundingClientRect().top <= pin + 1;
      }
      card.classList.toggle('is-covered', covered);
    });
  }, []);

  useEffect(() => {
    const resync = () => {
      syncStackedOffsets();
      syncCoveredCards();
    };
    resync();

    const root = scrollerRef.current;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        syncCoveredCards();
      });
    };
    window.addEventListener('resize', resync);
    window.addEventListener('orientationchange', resync);
    window.addEventListener('scroll', onScroll, { passive: true });

    // Card heights move as fonts and images settle, and again whenever the
    // copy reflows, so re-measure instead of trusting the first pass.
    const observer = new ResizeObserver(resync);
    root?.querySelectorAll('.scroll-stack-card').forEach(card => observer.observe(card));

    return () => {
      window.removeEventListener('resize', resync);
      window.removeEventListener('orientationchange', resync);
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [syncStackedOffsets, syncCoveredCards]);

  return (
    <div ref={scrollerRef} className={`scroll-stack-scroller ${className}`.trim()} style={customProperties}>
      <div className="scroll-stack-inner">
        {children}
        <div className="scroll-stack-end" />
      </div>
    </div>
  );
};

export default ScrollStack;
