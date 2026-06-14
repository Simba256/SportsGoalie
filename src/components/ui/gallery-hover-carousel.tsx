'use client';

import { type LucideIcon } from 'lucide-react';

export interface GalleryCarouselItem {
  id: string;
  label: string;
  title: string;
  quote: string;
  /** Accent hex used for label + watermark tint */
  accent: string;
  /** Full CSS background (gradient) for the card */
  bg: string;
  WatermarkIcon: LucideIcon;
}

interface GalleryHoverCarouselProps {
  eyebrow: string;
  heading: string;
  subheading: string;
  items: GalleryCarouselItem[];
  className?: string;
}

/**
 * Expanding hover gallery. On desktop the cards sit in a row and the hovered
 * card grows to reveal its quote; on mobile they stack and show everything.
 */
export function GalleryHoverCarousel({
  eyebrow,
  heading,
  subheading,
  items,
  className,
}: GalleryHoverCarouselProps) {
  return (
    <section
      className={className}
      style={{
        padding: 'clamp(48px,7vw,96px) clamp(16px,3vw,20px)',
        background: 'linear-gradient(180deg, #041530 0%, #02102a 100%)',
      }}
    >
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        <p
          style={{
            textAlign: 'center',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '3px',
            color: '#37b5ff',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          {eyebrow}
        </p>
        <h2
          style={{
            fontSize: 'clamp(28px,4.5vw,48px)',
            fontWeight: 900,
            color: '#fff',
            textAlign: 'center',
            marginBottom: '14px',
            lineHeight: 1.1,
          }}
        >
          {heading}
        </h2>
        <p
          style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '17px',
            maxWidth: '560px',
            margin: '0 auto 56px',
          }}
        >
          {subheading}
        </p>

        <div className="ghc-track">
          {items.map((item) => {
            const { WatermarkIcon } = item;
            return (
              <article
                key={item.id}
                className="ghc-card"
                style={{ background: item.bg }}
                tabIndex={0}
              >
                <WatermarkIcon
                  className="ghc-watermark"
                  aria-hidden="true"
                  style={{ color: item.accent }}
                />
                <div className="ghc-content">
                  <span className="ghc-label" style={{ color: item.accent }}>
                    {item.label}
                  </span>
                  <h3 className="ghc-title">{item.title}</h3>
                  <p className="ghc-quote">{item.quote}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <style>{`
        .ghc-track {
          display: flex;
          gap: 14px;
          align-items: stretch;
        }
        .ghc-card {
          position: relative;
          flex: 1 1 0;
          min-width: 0;
          overflow: hidden;
          border-radius: 18px;
          padding: 26px 24px;
          min-height: 420px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          color: #fff;
          cursor: default;
          outline: none;
          box-shadow: 0 18px 40px rgba(0,0,0,0.35);
          transition: flex-grow 0.45s cubic-bezier(0.4,0,0.2,1);
        }
        .ghc-card::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.12);
          pointer-events: none;
        }
        .ghc-watermark {
          position: absolute;
          top: 18px;
          right: 18px;
          width: 56px;
          height: 56px;
          opacity: 0.28;
        }
        .ghc-content {
          position: relative;
          z-index: 1;
        }
        .ghc-label {
          display: block;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .ghc-title {
          font-size: clamp(18px, 1.6vw, 22px);
          font-weight: 800;
          line-height: 1.2;
          margin: 0;
        }
        .ghc-quote {
          margin: 14px 0 0;
          font-size: 15px;
          line-height: 1.55;
          color: rgba(255,255,255,0.82);
          max-width: 460px;
          opacity: 0;
          max-height: 0;
          transform: translateY(8px);
          overflow: hidden;
          transition: opacity 0.4s ease, max-height 0.45s ease, transform 0.4s ease;
        }
        /* Reveal quote on the expanded card */
        .ghc-card:hover .ghc-quote,
        .ghc-card:focus .ghc-quote,
        .ghc-card:focus-within .ghc-quote {
          opacity: 1;
          max-height: 240px;
          transform: translateY(0);
        }
        @media (hover: hover) and (min-width: 768px) {
          .ghc-card:hover,
          .ghc-card:focus,
          .ghc-card:focus-within {
            flex-grow: 3.2;
          }
          /* Keep the first card open until the user interacts elsewhere */
          .ghc-track:not(:hover):not(:focus-within) .ghc-card:first-child {
            flex-grow: 3.2;
          }
          .ghc-track:not(:hover):not(:focus-within) .ghc-card:first-child .ghc-quote {
            opacity: 1;
            max-height: 240px;
            transform: translateY(0);
          }
        }
        @media (max-width: 767px) {
          .ghc-track {
            flex-direction: column;
          }
          .ghc-card {
            min-height: 0;
          }
          .ghc-quote {
            opacity: 1;
            max-height: 240px;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
