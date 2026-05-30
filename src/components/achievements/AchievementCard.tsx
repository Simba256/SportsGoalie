'use client';

import { Trophy, Star, Clock, Target, Zap } from 'lucide-react';
import { Achievement, UserAchievement } from '@/types';

interface AchievementCardProps {
  achievement: Achievement;
  userAchievement?: UserAchievement;
  isLocked?: boolean;
}

const BLUE = '#37b5ff';

export function AchievementCard({ achievement, userAchievement, isLocked = false }: AchievementCardProps) {
  const getAchievementIcon = (type: string) => {
    const s = { width: '24px', height: '24px' };
    switch (type) {
      case 'progress': return <Target style={s} />;
      case 'quiz': return <Trophy style={s} />;
      case 'streak': return <Zap style={s} />;
      case 'time': return <Clock style={s} />;
      default: return <Star style={s} />;
    }
  };

  const getRarityStyle = (rarity: string): React.CSSProperties => {
    switch (rarity) {
      case 'uncommon':
        return { background: 'rgba(55,181,255,0.1)', color: BLUE, border: `1px solid rgba(55,181,255,0.25)` };
      case 'rare':
        return { background: 'rgba(96,165,250,0.12)', color: '#93c5fd', border: '1px solid rgba(96,165,250,0.3)' };
      case 'epic':
        return { background: 'rgba(168,85,247,0.12)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' };
      case 'legendary':
        return { background: 'rgba(234,179,8,0.12)', color: '#fbbf24', border: '1px solid rgba(234,179,8,0.3)' };
      default:
        return { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.12)' };
    }
  };

  const isCompleted = userAchievement?.isCompleted || false;
  const progress = userAchievement?.progress || 0;

  return (
    <div style={{
      background: isLocked ? 'rgba(2,18,44,0.5)' : 'rgba(2,18,44,0.85)',
      border: `1px solid ${isCompleted ? 'rgba(55,181,255,0.25)' : isLocked ? 'rgba(255,255,255,0.07)' : 'rgba(55,181,255,0.14)'}`,
      borderRadius: '14px',
      padding: '20px',
      opacity: isLocked ? 0.6 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        {/* Icon */}
        <div style={{
          width: '48px', height: '48px', borderRadius: '10px', flexShrink: 0,
          background: isCompleted
            ? 'rgba(55,181,255,0.15)'
            : isLocked
            ? 'rgba(255,255,255,0.06)'
            : 'rgba(55,181,255,0.12)',
          color: isCompleted ? BLUE : isLocked ? 'rgba(255,255,255,0.3)' : BLUE,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {getAchievementIcon(achievement.type)}
        </div>

        {/* Details */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', margin: 0 }}>
              {isLocked && achievement.isSecret ? '???' : achievement.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              {isCompleted && (
                <span style={{
                  fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px',
                  background: 'rgba(55,181,255,0.15)', color: BLUE, border: `1px solid rgba(55,181,255,0.3)`,
                }}>
                  Completed
                </span>
              )}
              <span style={{
                fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px',
                textTransform: 'capitalize', ...getRarityStyle(achievement.rarity),
              }}>
                {achievement.rarity}
              </span>
            </div>
          </div>

          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>
            {isLocked && achievement.isSecret ? 'Hidden achievement' : achievement.description}
          </p>

          {!isCompleted && progress > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '3px',
                  background: `linear-gradient(90deg, ${BLUE} 0%, #0ea5e9 100%)`,
                  width: `${progress}%`, transition: 'width 0.5s',
                }} />
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                {progress}% complete
              </p>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
              {achievement.points} points
            </span>
            {isCompleted && userAchievement?.unlockedAt && (
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                Unlocked {new Date(userAchievement.unlockedAt.toDate()).toLocaleDateString()}
              </span>
            )}
            {!isCompleted && !isLocked && (
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>In Progress</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
