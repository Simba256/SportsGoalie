'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { db } from '@/lib/firebase/config';
import {
  collection, query, where, getDocs, doc,
  setDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import {
  TrainingLogEntry, TrainingItemLog, TrainingCategory, VMPRating, LIndexItem,
} from '@/types/charting';
import { VMPSelector } from '@/components/training/VMPSelector';
import { StarRating } from '@/components/charting/inputs/StarRating';
import { computeTrainingAnalytics } from '@/lib/training/analytics';
import { triggerMilestoneNotifications } from '@/lib/training/milestones';
import { ArrowLeft, Check, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { toast } from 'sonner';

const CYAN = '#00FFFF';
const MINT = '#00FF99';
const VIOLET = '#B388FF';
const CORAL = '#FF6B6B';

type TopCat = TrainingCategory;

const FIXED_ITEMS: { id: string; label: string; category: TopCat; color: string }[] = [
  { id: 'ice_session', label: 'Ice Session', category: 'ice', color: CYAN },
  { id: 'puck_machine_session', label: 'Puck Machine Session', category: 'puck_machine', color: MINT },
  { id: 'game_entry', label: 'Game / Scrimmage', category: 'games_tourneys', color: CORAL },
  { id: 'tournament_entry', label: 'Tournament', category: 'games_tourneys', color: CORAL },
];

const CATEGORY_META: Record<TopCat, { label: string; color: string }> = {
  ice: { label: 'Ice', color: CYAN },
  puck_machine: { label: 'Puck Machine', color: MINT },
  land_conditioning: { label: 'Land / Conditioning', color: VIOLET },
  lifestyle_foundations: { label: 'Lifestyle Foundations', color: '#FFD166' },
  games_tourneys: { label: 'Games / Tourneys', color: CORAL },
};

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

interface ItemRowProps {
  item: TrainingItemLog;
  label: string;
  color: string;
  onChange: (updated: TrainingItemLog) => void;
}

function ItemRow({ item, label, color, onChange }: ItemRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      borderRadius: '12px',
      background: item.done ? `${color}0a` : 'rgba(255,255,255,0.025)',
      border: `1px solid ${item.done ? `${color}30` : 'rgba(255,255,255,0.07)'}`,
      overflow: 'hidden',
      transition: 'all 0.2s',
    }}>
      {/* Row header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px' }}>
        {/* Done toggle */}
        <button
          type="button"
          onClick={() => onChange({ ...item, done: !item.done })}
          style={{
            width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
            border: item.done ? `2px solid ${color}` : '2px solid rgba(255,255,255,0.15)',
            background: item.done ? `${color}20` : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.18s',
          }}
        >
          {item.done && <Check style={{ width: '14px', height: '14px', color }} />}
        </button>

        <span style={{
          flex: 1, fontSize: '14px', fontWeight: 600,
          color: item.done ? '#fff' : 'rgba(255,255,255,0.6)',
          textDecoration: item.done ? 'none' : 'none',
        }}>
          {label}
        </span>

        {item.done && (
          <button
            type="button"
            onClick={() => setExpanded(e => !e)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', padding: '4px' }}
          >
            {expanded
              ? <ChevronUp style={{ width: '16px', height: '16px' }} />
              : <ChevronDown style={{ width: '16px', height: '16px' }} />
            }
          </button>
        )}
      </div>

      {/* Expanded rating section */}
      {item.done && expanded && (
        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Star rating */}
          <div style={{ paddingTop: '14px' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Consistency (Star Rating)
            </p>
            <StarRating
              value={item.consistencyRating ?? 0}
              onChange={v => onChange({ ...item, consistencyRating: v })}
            />
          </div>

          {/* VMP */}
          <VMPSelector
            value={item.vmpRating}
            onChange={v => onChange({ ...item, vmpRating: v as VMPRating })}
          />

          {/* Text note */}
          <div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Note (optional)
            </p>
            <textarea
              value={item.textNote ?? ''}
              onChange={e => onChange({ ...item, textNote: e.target.value })}
              placeholder="Any notes about this session…"
              rows={2}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '13px',
                resize: 'none', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrainingLogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const dateParam = searchParams.get('date');
  const categoryParam = searchParams.get('category') as TopCat | null;
  const targetDate = dateParam || todayStr();
  const isToday = targetDate === todayStr();

  const [lIndexItems, setLIndexItems] = useState<LIndexItem[]>([]);
  const [items, setItems] = useState<TrainingItemLog[]>([]);
  const [existingLogId, setExistingLogId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<TopCat>(categoryParam || 'ice');

  const getLabelForItem = useCallback((itemId: string): string => {
    const fixed = FIXED_ITEMS.find(f => f.id === itemId);
    if (fixed) return fixed.label;
    const li = lIndexItems.find(l => l.id === itemId);
    return li?.name ?? itemId;
  }, [lIndexItems]);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        // Load L-index items for this goalie's living index
        const liSnap = await getDocs(query(collection(db, 'l_index_items'), where('isActive', '==', true)));
        const allItems = liSnap.docs.map(d => ({ id: d.id, ...d.data() } as LIndexItem));

        // Filter to goalie's living index
        const livingIndex: string[] = (user as { livingIndex?: string[] }).livingIndex ?? [];
        const activeItems = livingIndex.length > 0
          ? allItems.filter(i => livingIndex.includes(i.id))
          : allItems;
        setLIndexItems(activeItems);

        // Load existing log entry for this date
        const logSnap = await getDocs(
          query(collection(db, 'training_logs'), where('goalieId', '==', user.id), where('date', '==', targetDate))
        );

        if (!logSnap.empty) {
          const logDoc = logSnap.docs[0];
          const logData = { id: logDoc.id, ...logDoc.data() } as TrainingLogEntry;
          setExistingLogId(logDoc.id);
          setItems(logData.items);
        } else {
          // Build default item list from fixed items + active L-index items
          const defaultItems: TrainingItemLog[] = [
            ...FIXED_ITEMS.map(f => ({
              itemId: f.id, category: f.category, done: false,
            })),
            ...activeItems.map(li => ({
              itemId: li.id,
              category: li.topLevelCategory as TopCat,
              done: false,
            })),
          ];
          setItems(defaultItems);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id, targetDate, user]);

  const updateItem = (itemId: string, updated: TrainingItemLog) => {
    setItems(prev => prev.map(i => i.itemId === itemId ? updated : i));
  };

  const handleSave = async () => {
    if (!user?.id || saving) return;
    setSaving(true);
    try {
      // Compute analytics before and after save for milestone detection
      const allLogsSnap = await getDocs(
        query(collection(db, 'training_logs'), where('goalieId', '==', user.id))
      );
      const prevLogs = allLogsSnap.docs.map(d => ({ id: d.id, ...d.data() } as TrainingLogEntry));
      const prevAnalytics = computeTrainingAnalytics(prevLogs);

      const payload = {
        goalieId: user.id,
        date: targetDate,
        items,
        updatedAt: serverTimestamp(),
      };
      if (existingLogId) {
        await updateDoc(doc(db, 'training_logs', existingLogId), payload);
      } else {
        const newRef = doc(collection(db, 'training_logs'));
        await setDoc(newRef, { ...payload, createdAt: serverTimestamp() });
        setExistingLogId(newRef.id);
      }
      toast.success('Training log saved');

      // Compute new analytics and check for milestones
      const updatedLog = {
        id: existingLogId ?? 'new',
        goalieId: user.id,
        date: targetDate,
        items,
      } as unknown as TrainingLogEntry;
      const nextLogs = [
        ...prevLogs.filter(l => l.date !== targetDate),
        updatedLog,
      ];
      const nextAnalytics = computeTrainingAnalytics(nextLogs);

      // Fire milestone notifications (non-blocking)
      triggerMilestoneNotifications({
        goalieId: user.id,
        goalieDisplayName: user.displayName ?? undefined,
        prevAnalytics,
        nextAnalytics,
      }).catch(() => { /* non-critical */ });

    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const categoryOrder: TopCat[] = ['ice', 'puck_machine', 'land_conditioning', 'lifestyle_foundations', 'games_tourneys'];

  const itemsForCategory = (cat: TopCat) => items.filter(i => i.category === cat);

  const getLabelColor = (itemId: string): string => {
    const fixed = FIXED_ITEMS.find(f => f.id === itemId);
    if (fixed) return CATEGORY_META[fixed.category].color;
    const li = lIndexItems.find(l => l.id === itemId);
    if (!li) return CYAN;
    return li.topLevelCategory === 'lifestyle_foundations' ? '#FFD166' : VIOLET;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <button
          type="button"
          onClick={() => router.push('/training')}
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '8px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
        >
          <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back
        </button>
        <div>
          <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '2px' }}>
            {isToday ? "Today's Log" : formatDate(targetDate)}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>
            {items.filter(i => i.done).length} of {items.length} items done
          </p>
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '20px' }}>
        {categoryOrder.map(cat => {
          const meta = CATEGORY_META[cat];
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              style={{
                whiteSpace: 'nowrap', padding: '7px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                border: active ? `2px solid ${meta.color}` : '1px solid rgba(255,255,255,0.1)',
                background: active ? `${meta.color}18` : 'rgba(255,255,255,0.04)',
                color: active ? meta.color : 'rgba(255,255,255,0.4)',
                cursor: 'pointer', transition: 'all 0.18s',
              }}
            >
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* Items for active category */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
        {itemsForCategory(activeCategory).length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>
            No items in your Living Index for this category.
            <br />
            <span style={{ fontSize: '12px', marginTop: '6px', display: 'block' }}>Ask your admin to activate items for you.</span>
          </div>
        ) : (
          itemsForCategory(activeCategory).map(item => (
            <ItemRow
              key={item.itemId}
              item={item}
              label={getLabelForItem(item.itemId)}
              color={getLabelColor(item.itemId)}
              onChange={updated => updateItem(item.itemId, updated)}
            />
          ))
        )}
      </div>

      {/* Save button */}
      {isToday && (
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', padding: '14px', borderRadius: '12px',
            background: `linear-gradient(135deg, ${CYAN} 0%, ${MINT} 100%)`,
            border: 'none', color: '#06050f', fontSize: '15px', fontWeight: 800,
            cursor: saving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            opacity: saving ? 0.7 : 1, transition: 'opacity 0.18s',
          }}
        >
          <Save style={{ width: '16px', height: '16px' }} />
          {saving ? 'Saving…' : 'Save Log'}
        </button>
      )}
    </div>
  );
}
