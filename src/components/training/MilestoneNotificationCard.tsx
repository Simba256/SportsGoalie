'use client';

import { NotificationRecord } from '@/types/charting';
import { Trophy, Star, X } from 'lucide-react';

const MINT = '#00FF99';
const CYAN = '#00FFFF';
const GOLD = '#FFD700';

const TYPE_META: Record<NotificationRecord['type'], { icon: typeof Trophy; color: string; badge: string }> = {
  milestone: { icon: Trophy, color: GOLD, badge: 'Milestone' },
  mastery_increment: { icon: Star, color: MINT, badge: 'Mastery' },
  kac_complete: { icon: Trophy, color: CYAN, badge: 'KAC Complete' },
  level_advance: { icon: Trophy, color: '#B388FF', badge: 'Level Up' },
};

interface Props {
  notification: NotificationRecord;
  goalieDisplayName?: string;
  onDismiss: (id: string) => void;
}

export function MilestoneNotificationCard({ notification, goalieDisplayName, onDismiss }: Props) {
  const meta = TYPE_META[notification.type] ?? TYPE_META.milestone;
  const Icon = meta.icon;

  return (
    <div style={{
      borderRadius: '14px',
      background: `${meta.color}08`,
      border: `1px solid ${meta.color}30`,
      padding: '16px',
      display: 'flex', gap: '14px', alignItems: 'flex-start',
    }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
        background: `${meta.color}18`,
        border: `1px solid ${meta.color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon style={{ width: '18px', height: '18px', color: meta.color }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{
            fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px',
            background: `${meta.color}18`, color: meta.color, textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            {meta.badge}
          </span>
          {notification.masteryPercent !== undefined && (
            <span style={{ color: meta.color, fontSize: '13px', fontWeight: 800 }}>
              {notification.masteryPercent}%
            </span>
          )}
        </div>
        <p style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '3px' }}>
          {notification.label}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
          {goalieDisplayName ? `${goalieDisplayName}: ` : ''}{notification.description}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(notification.id)}
        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', padding: '2px', flexShrink: 0 }}
      >
        <X style={{ width: '15px', height: '15px' }} />
      </button>
    </div>
  );
}
