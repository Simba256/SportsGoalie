'use client';

import { GoalieCategorySlug, GOALIE_CATEGORIES } from '@/types';
import { ChevronRight, Heart, Brain, Clock, Target, MessageCircle, Dumbbell, BookOpen, CheckCircle } from 'lucide-react';

interface CategoryIntroProps {
  categorySlug: GoalieCategorySlug;
  categoryName: string;
  categoryDescription: string;
  questionCount: number;
  categoryIndex: number;
  totalCategories: number;
  onStart: () => void;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ style?: React.CSSProperties }>> = {
  feelings: Heart,
  knowledge: Brain,
  pre_game: Clock,
  in_game: Target,
  post_game: MessageCircle,
  training: Dumbbell,
  learning: BookOpen,
};

const CATEGORY_ACCENT: Record<string, string> = {
  feelings: '#a78bfa',
  knowledge: '#37b5ff',
  pre_game: '#2dd4bf',
  in_game: '#f87171',
  post_game: '#4ade80',
  training: '#fb923c',
  learning: '#818cf8',
};

const CATEGORY_TOOLTIPS: Record<string, string> = {
  feelings: "Goaltending starts in your head before it ever reaches your body. How you feel about the position, how you handle pressure, how you bounce back — this is where development begins.",
  knowledge: "No wrong answers here. This helps Smarter Goalie know where to start with your learning.",
  pre_game: "The game doesn't start when the puck drops — it starts long before that. How you prepare at home, in the car, in the dressing room, and during warm-up all set the stage for how you'll perform.",
  in_game: "Competing as a goalie isn't just about trying hard. It's about how you see the puck, how you read the play, and how your eyes, mind, and body work together.",
  post_game: "How you process your performance after a game can be just as important as the game itself.",
  training: "The best goalies develop habits and routines that help them improve even when they're not on the ice.",
  learning: "This helps us show you content in the way that works best for you.",
};

const GREEN = '#4ade80';

export function CategoryIntro({
  categorySlug,
  categoryName,
  categoryDescription,
  questionCount,
  categoryIndex,
  totalCategories,
  onStart,
}: CategoryIntroProps) {
  const Icon = CATEGORY_ICONS[categorySlug] || Target;
  const accent = CATEGORY_ACCENT[categorySlug] || '#37b5ff';
  const tooltip = CATEGORY_TOOLTIPS[categorySlug] || '';
  const categoryInfo = GOALIE_CATEGORIES.find(c => c.slug === categorySlug);
  const weight = categoryInfo?.weight || 0;

  return (
    <>
      <style>{`
        .ci-btn:hover { opacity: 0.88 !important; transform: scale(1.02) !important; }
        @keyframes fade-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .ci-fade { animation: fade-up 0.4s ease both; }
      `}</style>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 24px' }}>
        <div style={{ width: '100%', maxWidth: '580px' }}>

          {/* Category dots tracker */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '28px' }}>
            {Array.from({ length: totalCategories }).map((_, i) => {
              const isDone = i < categoryIndex;
              const isCurr = i === categoryIndex;
              const catAccent = CATEGORY_ACCENT[['feelings','knowledge','pre_game','in_game','post_game','training','learning'][i]] || accent;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isDone ? `${GREEN}20` : isCurr ? `${accent}20` : 'rgba(255,255,255,0.05)',
                    border: isDone ? `2px solid ${GREEN}60` : isCurr ? `2px solid ${accent}` : '1px solid rgba(255,255,255,0.1)',
                    fontSize: '10px', fontWeight: 800,
                    color: isDone ? GREEN : isCurr ? accent : 'rgba(255,255,255,0.25)',
                    boxShadow: isCurr ? `0 0 10px ${catAccent}40` : 'none',
                    transition: 'all 0.3s',
                  }}>
                    {isDone ? <CheckCircle style={{ width: '14px', height: '14px' }} /> : i + 1}
                  </div>
                  {i < totalCategories - 1 && (
                    <div style={{
                      width: '14px', height: '2px', borderRadius: '99px',
                      background: isDone ? `${GREEN}50` : 'rgba(255,255,255,0.08)',
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Main card */}
          <div className="ci-fade" style={{
            background: 'rgba(2,18,44,0.9)',
            border: `1px solid ${accent}25`,
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: `0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px ${accent}10`,
          }}>

            {/* Card header */}
            <div style={{
              position: 'relative',
              padding: '36px 32px 40px',
              textAlign: 'center',
              background: `radial-gradient(ellipse at 60% 0%, ${accent}22 0%, transparent 70%), linear-gradient(180deg, rgba(2,18,44,0.0) 0%, rgba(2,18,44,0.3) 100%)`,
              borderBottom: `1px solid ${accent}20`,
              overflow: 'hidden',
            }}>
              {/* Decorative grid */}
              <div style={{
                position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none',
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }} />

              {/* Glow blob */}
              <div style={{
                position: 'absolute', top: '-40px', right: '-20px',
                width: '160px', height: '160px', borderRadius: '50%',
                background: `${accent}15`, filter: 'blur(40px)', pointerEvents: 'none',
              }} />

              {/* Icon */}
              <div style={{
                position: 'relative', zIndex: 1,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '72px', height: '72px', borderRadius: '18px',
                background: `${accent}20`,
                border: `1px solid ${accent}40`,
                marginBottom: '16px',
                boxShadow: `0 8px 24px ${accent}20`,
              }}>
                <Icon style={{ width: '36px', height: '36px', color: accent }} />
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <span style={{
                  display: 'block', fontSize: '11px', fontWeight: 700,
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: `${accent}99`, marginBottom: '8px',
                }}>
                  Category {categoryIndex + 1} of {totalCategories}
                </span>
                <h1 style={{ fontSize: 'clamp(26px,5vw,36px)', fontWeight: 900, color: '#fff', marginBottom: '12px', lineHeight: 1.1 }}>
                  {categoryName}
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.6, maxWidth: '400px', margin: '0 auto' }}>
                  {categoryDescription}
                </p>
              </div>
            </div>

            {/* Card body */}
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Questions', value: String(questionCount) },
                  { label: 'Profile Weight', value: `${weight}%` },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    padding: '16px', borderRadius: '12px', textAlign: 'center',
                    background: `${accent}0d`, border: `1px solid ${accent}20`,
                  }}>
                    <p style={{ fontSize: '26px', fontWeight: 900, color: accent, lineHeight: 1 }}>{value}</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '4px' }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Insight box */}
              {tooltip && (
                <div style={{
                  display: 'flex', gap: '12px', padding: '14px 16px',
                  background: 'rgba(255,255,255,0.04)', borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <div style={{
                    width: '3px', flexShrink: 0, borderRadius: '99px',
                    background: `linear-gradient(180deg, ${accent} 0%, transparent 100%)`,
                    minHeight: '40px',
                  }} />
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
                    {tooltip}
                  </p>
                </div>
              )}

              {/* CTA */}
              <button
                className="ci-btn"
                onClick={onStart}
                style={{
                  width: '100%', padding: '14px',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`,
                  border: 'none', color: '#fff',
                  fontWeight: 800, fontSize: '16px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'opacity 0.2s, transform 0.2s',
                  boxShadow: `0 6px 20px ${accent}30`,
                }}
              >
                Start Category
                <ChevronRight style={{ width: '18px', height: '18px' }} />
              </button>

              <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>
                No right or wrong answers — answer honestly for the best results
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
