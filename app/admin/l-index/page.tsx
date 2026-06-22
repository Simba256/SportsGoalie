'use client';

import { useState, useEffect } from 'react';
import { AdminRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/lib/auth/context';
import { db } from '@/lib/firebase/config';
import {
  collection, getDocs, doc, setDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { LIndexItem, LIndexCategory, LIndexSuggestion } from '@/types/charting';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, X, Check } from 'lucide-react';

const BLUE  = '#37b5ff';
const GOLD  = '#FFD166';   // lifestyle_foundations accent only
const RED   = '#f87171';

const card: React.CSSProperties = {
  background: 'rgba(2,18,44,0.85)',
  border: '1px solid rgba(55,181,255,0.14)',
  borderRadius: '16px',
};

// Level colours — blue shades for admin pages
const LEVEL_COLOR: Record<string, string> = {
  introduction: 'rgba(55,181,255,0.7)',
  development:  BLUE,
  refinement:   '#7dd3fc',
};

const L_INDEX_CATEGORIES: { id: LIndexCategory; name: string; topLevel: 'land_conditioning' | 'lifestyle_foundations' }[] = [
  { id: 'L1',  name: 'Upper Strength & Power',        topLevel: 'land_conditioning' },
  { id: 'L2',  name: 'Lower Strength & Power',         topLevel: 'land_conditioning' },
  { id: 'L3',  name: 'Speed / Agility / Quickness',    topLevel: 'land_conditioning' },
  { id: 'L4',  name: 'Mobility / Flexibility / Balance',topLevel: 'land_conditioning' },
  { id: 'L5',  name: 'Conditioning / Endurance',       topLevel: 'land_conditioning' },
  { id: 'L6',  name: 'Hand-Eye / Reaction / Vision',   topLevel: 'land_conditioning' },
  { id: 'L7',  name: 'Recovery / Sleep',               topLevel: 'lifestyle_foundations' },
  { id: 'L8',  name: 'Nutrition / Hydration',          topLevel: 'lifestyle_foundations' },
  { id: 'L9',  name: 'Mind / Habits',                  topLevel: 'lifestyle_foundations' },
  { id: 'L10', name: 'Mirror Training',                topLevel: 'land_conditioning' },
  { id: 'L11', name: 'Time Charting',                  topLevel: 'land_conditioning' },
];

interface ItemForm {
  lIndex: LIndexCategory;
  topLevelCategory: 'land_conditioning' | 'lifestyle_foundations';
  name: string;
  definition: string;
  purpose: string;
  howTo: string;
  videoUrl: string;
  levelTag: 'introduction' | 'development' | 'refinement';
  isActive: boolean;
}

const EMPTY_FORM: ItemForm = {
  lIndex: 'L1',
  topLevelCategory: 'land_conditioning',
  name: '',
  definition: '',
  purpose: '',
  howTo: '',
  videoUrl: '',
  levelTag: 'introduction',
  isActive: true,
};

function ItemCard({
  item,
  onEdit,
  onDelete,
}: {
  item: LIndexItem;
  onEdit: (item: LIndexItem) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  // Land conditioning → BLUE, Lifestyle foundations → GOLD
  const catColor = item.topLevelCategory === 'lifestyle_foundations' ? GOLD : BLUE;
  const levelColor = LEVEL_COLOR[item.levelTag] ?? BLUE;

  return (
    <div style={{
      ...card,
      borderRadius: '14px',
      border: item.isActive
        ? '1px solid rgba(55,181,255,0.35)'
        : '1px solid rgba(55,181,255,0.14)',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px' }}>
        {/* L-index badge */}
        <span style={{
          fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '8px',
          background: `${catColor}18`, color: catColor, flexShrink: 0,
        }}>
          {item.lIndex}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '3px' }}>{item.name}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: levelColor, background: `${levelColor}15`, border: `1px solid ${levelColor}30`, borderRadius: '20px', padding: '1px 7px', textTransform: 'capitalize' }}>
              {item.levelTag}
            </span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: item.isActive ? BLUE : 'rgba(255,255,255,0.2)', background: item.isActive ? 'rgba(55,181,255,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${item.isActive ? 'rgba(55,181,255,0.25)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '20px', padding: '1px 7px' }}>
              {item.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onEdit(item)}
          style={{ background: 'rgba(55,181,255,0.08)', border: '1px solid rgba(55,181,255,0.2)', color: BLUE, padding: '6px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
        >
          <Edit2 style={{ width: '12px', height: '12px' }} /> Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: RED, padding: '6px 8px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', flexShrink: 0 }}
        >
          <Trash2 style={{ width: '12px', height: '12px' }} />
        </button>
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
        >
          {expanded
            ? <ChevronUp style={{ width: '15px', height: '15px' }} />
            : <ChevronDown style={{ width: '15px', height: '15px' }} />}
        </button>
      </div>

      {expanded && (
        <div style={{ padding: '14px 16px 16px', borderTop: '1px solid rgba(55,181,255,0.08)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { label: 'Definition', value: item.definition },
            { label: 'Purpose',    value: item.purpose },
            { label: 'How-To',     value: item.howTo },
            { label: 'Video URL',  value: item.videoUrl },
          ].map(({ label, value }) => value ? (
            <div key={label}>
              <p style={{ color: 'rgba(55,181,255,0.6)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{label}</p>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', lineHeight: 1.6 }}>{value}</p>
            </div>
          ) : null)}
        </div>
      )}
    </div>
  );
}

function ItemFormModal({
  initial,
  prefill,
  onSave,
  onClose,
}: {
  initial?: LIndexItem;
  prefill?: Partial<ItemForm>;
  onSave: (form: ItemForm) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ItemForm>(
    initial
      ? {
          lIndex: initial.lIndex,
          topLevelCategory: initial.topLevelCategory,
          name: initial.name,
          definition: initial.definition,
          purpose: initial.purpose,
          howTo: initial.howTo,
          videoUrl: initial.videoUrl ?? '',
          levelTag: initial.levelTag,
          isActive: initial.isActive,
        }
      : { ...EMPTY_FORM, ...prefill }
  );
  const [saving, setSaving] = useState(false);

  const set = (k: keyof ItemForm, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleLIndexChange = (lIdx: LIndexCategory) => {
    const cat = L_INDEX_CATEGORIES.find(c => c.id === lIdx);
    setForm(f => ({ ...f, lIndex: lIdx, topLevelCategory: cat?.topLevel ?? 'land_conditioning' }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.definition.trim()) {
      toast.error('Name and definition are required');
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  // Solid dark background for inputs so they look consistent on the dark card
  const inp: React.CSSProperties = {
    background: 'rgba(55,181,255,0.04)',
    border: '1px solid rgba(55,181,255,0.18)',
    borderRadius: '8px',
    padding: '10px 12px',
    color: '#fff',
    fontSize: '13px',
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box',
  };
  // Selects need solid bg so the OS dropdown popup renders dark
  const sel: React.CSSProperties = {
    ...inp,
    background: '#02122c',
    border: '1px solid rgba(55,181,255,0.25)',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
  };
  const lbl: React.CSSProperties = {
    color: 'rgba(55,181,255,0.7)',
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '6px',
    display: 'block',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <style>{`
        .li-modal select option { background: #02122c; color: #fff; }
        .li-modal select:focus  { border-color: ${BLUE} !important; box-shadow: 0 0 0 3px rgba(55,181,255,0.12); }
        .li-modal input:focus,
        .li-modal textarea:focus { border-color: ${BLUE} !important; box-shadow: 0 0 0 3px rgba(55,181,255,0.12); }
        .li-modal input::placeholder,
        .li-modal textarea::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>

      <div className="li-modal" style={{ ...card, border: '1px solid rgba(55,181,255,0.3)', padding: '24px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Modal header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 800, marginBottom: '2px' }}>
              {initial ? 'Edit L-Index Item' : 'New L-Index Item'}
            </h2>
            <p style={{ color: 'rgba(55,181,255,0.6)', fontSize: '12px' }}>
              {initial ? `Editing: ${initial.name}` : 'Define a new training item for the L-Index catalogue'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', borderRadius: '8px', padding: '6px', display: 'flex', alignItems: 'center' }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Category + Level row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={lbl}>L-Index Category</label>
              <select value={form.lIndex} onChange={e => handleLIndexChange(e.target.value as LIndexCategory)} style={sel}>
                {L_INDEX_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id} style={{ background: '#02122c', color: '#fff' }}>
                    {c.id} — {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>Level Tag</label>
              <select value={form.levelTag} onChange={e => set('levelTag', e.target.value)} style={sel}>
                <option value="introduction" style={{ background: '#02122c', color: '#fff' }}>Introduction</option>
                <option value="development"  style={{ background: '#02122c', color: '#fff' }}>Development</option>
                <option value="refinement"   style={{ background: '#02122c', color: '#fff' }}>Refinement</option>
              </select>
            </div>
          </div>

          <div>
            <label style={lbl}>Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Box Jumps" style={inp} />
          </div>
          <div>
            <label style={lbl}>Definition *</label>
            <textarea value={form.definition} onChange={e => set('definition', e.target.value)} placeholder="What this exercise/habit is…" rows={2} style={{ ...inp, resize: 'none' }} />
          </div>
          <div>
            <label style={lbl}>Purpose</label>
            <textarea value={form.purpose} onChange={e => set('purpose', e.target.value)} placeholder="Why goalies do this…" rows={2} style={{ ...inp, resize: 'none' }} />
          </div>
          <div>
            <label style={lbl}>How-To</label>
            <textarea value={form.howTo} onChange={e => set('howTo', e.target.value)} placeholder="Step-by-step instructions…" rows={3} style={{ ...inp, resize: 'none' }} />
          </div>
          <div>
            <label style={lbl}>Video URL (optional)</label>
            <input value={form.videoUrl} onChange={e => set('videoUrl', e.target.value)} placeholder="https://youtube.com/…" style={inp} />
          </div>

          {/* Active toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '10px', background: form.isActive ? 'rgba(55,181,255,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${form.isActive ? 'rgba(55,181,255,0.2)' : 'rgba(255,255,255,0.08)'}`, transition: 'all 0.18s' }}>
            <button
              type="button"
              onClick={() => set('isActive', !form.isActive)}
              style={{
                width: '40px', height: '22px', borderRadius: '11px',
                background: form.isActive ? BLUE : 'rgba(255,255,255,0.12)',
                border: 'none', cursor: 'pointer', position: 'relative',
                transition: 'background 0.2s', flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute', top: '3px',
                left: form.isActive ? '21px' : '3px',
                width: '16px', height: '16px', borderRadius: '50%',
                background: '#fff', transition: 'left 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {form.isActive && <Check style={{ width: '9px', height: '9px', color: BLUE }} />}
              </div>
            </button>
            <div>
              <p style={{ color: form.isActive ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: 600 }}>
                Active
              </p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
                Visible in goalie daily training logs
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            style={{ flex: 2, padding: '12px', borderRadius: '10px', background: `linear-gradient(135deg, ${BLUE} 0%, #0ea5e9 100%)`, border: 'none', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1, boxShadow: '0 4px 14px rgba(55,181,255,0.25)' }}
          >
            {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Item'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Suggestion Card ─────────────────────────────────────────────────────────

const CAT_LABEL: Record<string, string> = {
  ice: 'Ice', puck_machine: 'Puck Machine', land_conditioning: 'Land / Conditioning',
  lifestyle_foundations: 'Lifestyle Foundations', games_tourneys: 'Games / Tourneys',
};

function SuggestionCard({
  suggestion,
  onPromote,
  onDismiss,
}: {
  suggestion: LIndexSuggestion;
  onPromote: () => void;
  onDismiss: () => void;
}) {
  const isPending = suggestion.status === 'pending';
  const ts = suggestion.createdAt as unknown as { toDate?: () => Date; seconds?: number };
  const dateStr = ts?.toDate
    ? ts.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : ts?.seconds
    ? new Date(ts.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';
  const statusColor = suggestion.status === 'pending' ? BLUE : suggestion.status === 'approved' ? '#22c55e' : RED;

  return (
    <div style={{ ...card, borderRadius: '14px', padding: '16px 18px', border: isPending ? '1px solid rgba(55,181,255,0.25)' : '1px solid rgba(55,181,255,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>{suggestion.suggestedName}</span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: statusColor, background: `${statusColor}18`, border: `1px solid ${statusColor}30`, borderRadius: '20px', padding: '1px 7px', textTransform: 'capitalize' }}>
              {suggestion.status}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {suggestion.goalieDisplayName && (
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>by {suggestion.goalieDisplayName}</span>
            )}
            {suggestion.suggestedCategory && (
              <span style={{ color: 'rgba(55,181,255,0.55)', fontSize: '11px', fontWeight: 600 }}>
                {CAT_LABEL[suggestion.suggestedCategory] ?? suggestion.suggestedCategory}
              </span>
            )}
            {dateStr && <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: '11px' }}>{dateStr}</span>}
          </div>
        </div>

        {isPending && (
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
            <button
              type="button"
              onClick={onPromote}
              style={{ padding: '7px 14px', borderRadius: '8px', background: 'rgba(55,181,255,0.1)', border: `1px solid rgba(55,181,255,0.25)`, color: BLUE, fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Promote →
            </button>
            <button
              type="button"
              onClick={onDismiss}
              style={{ padding: '7px 8px', borderRadius: '8px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.18)', color: RED, fontSize: '12px', cursor: 'pointer', display: 'flex' }}
              title="Dismiss suggestion"
            >
              <X style={{ width: '12px', height: '12px' }} />
            </button>
          </div>
        )}
      </div>

      {suggestion.description && (
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: 1.5, marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {suggestion.description}
        </p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LIndexAdminPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<LIndexItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<LIndexItem | undefined>(undefined);
  const [filterCat, setFilterCat] = useState<LIndexCategory | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'catalogue' | 'suggestions'>('catalogue');
  const [suggestions, setSuggestions] = useState<LIndexSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [prefillForm, setPrefillForm] = useState<Partial<ItemForm> | undefined>(undefined);

  useEffect(() => { loadItems(); loadSuggestions(); }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'l_index_items'), orderBy('lIndex')));
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as LIndexItem)));
    } catch {
      toast.error('Failed to load L-index items');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (form: ItemForm) => {
    if (!user?.id) return;
    try {
      if (editingItem) {
        await updateDoc(doc(db, 'l_index_items', editingItem.id), {
          ...form,
          videoUrl: form.videoUrl || null,
          updatedAt: serverTimestamp(),
        });
        toast.success('Item updated');
      } else {
        const ref = doc(collection(db, 'l_index_items'));
        await setDoc(ref, {
          ...form,
          id: ref.id,
          videoUrl: form.videoUrl || null,
          createdBy: user.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success('Item created');
      }
      setShowModal(false);
      setEditingItem(undefined);
      await loadItems();
    } catch (err) {
      console.error('[l-index] save error:', err);
      toast.error('Failed to save item');
      throw err;
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Delete this L-index item? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'l_index_items', itemId));
      setItems(prev => prev.filter(i => i.id !== itemId));
      toast.success('Item deleted');
    } catch {
      toast.error('Failed to delete item');
    }
  };

  const loadSuggestions = async () => {
    setSuggestionsLoading(true);
    try {
      const snap = await getDocs(
        query(collection(db, 'l_index_suggestions'), orderBy('createdAt', 'desc'))
      );
      setSuggestions(snap.docs.map(d => ({ id: d.id, ...d.data() } as LIndexSuggestion)));
    } catch {
      toast.error('Failed to load suggestions');
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handlePromote = async (suggestion: LIndexSuggestion) => {
    if (!user?.id) return;
    try {
      await updateDoc(doc(db, 'l_index_suggestions', suggestion.id), {
        status: 'approved',
        reviewedAt: serverTimestamp(),
        reviewedBy: user.id,
      });
      setSuggestions(prev => prev.map(s => s.id === suggestion.id ? { ...s, status: 'approved' } : s));
      setPrefillForm({ name: suggestion.suggestedName });
      setEditingItem(undefined);
      setShowModal(true);
      toast.success('Opening L-Index form pre-filled with the suggestion');
    } catch {
      toast.error('Failed to approve suggestion');
    }
  };

  const handleDismiss = async (suggestion: LIndexSuggestion) => {
    if (!user?.id) return;
    try {
      await updateDoc(doc(db, 'l_index_suggestions', suggestion.id), {
        status: 'rejected',
        reviewedAt: serverTimestamp(),
        reviewedBy: user.id,
      });
      setSuggestions(prev => prev.map(s => s.id === suggestion.id ? { ...s, status: 'rejected' } : s));
      toast.success('Suggestion dismissed');
    } catch {
      toast.error('Failed to dismiss suggestion');
    }
  };

  const filtered = filterCat === 'all' ? items : items.filter(i => i.lIndex === filterCat);
  const activeCount = items.filter(i => i.isActive).length;

  const pendingCount = suggestions.filter(s => s.status === 'pending').length;

  return (
    <AdminRoute>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, letterSpacing: '-0.01em', marginBottom: '4px' }}>
              L-Index Catalogue
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
              Manage training item definitions — L1 through L11.&nbsp;
              <span style={{ color: BLUE, fontWeight: 600 }}>{activeCount} active</span> of {items.length} total.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setPrefillForm(undefined); setEditingItem(undefined); setShowModal(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', background: `linear-gradient(135deg, ${BLUE} 0%, #0ea5e9 100%)`, border: 'none', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(55,181,255,0.25)', whiteSpace: 'nowrap' }}
          >
            <Plus style={{ width: '16px', height: '16px' }} /> New Item
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '12px', background: 'rgba(55,181,255,0.05)', border: '1px solid rgba(55,181,255,0.1)', alignSelf: 'flex-start' }}>
          {(['catalogue', 'suggestions'] as const).map(tab => {
            const isActive = activeTab === tab;
            const label = tab === 'catalogue'
              ? 'Catalogue'
              : `Suggestions${pendingCount > 0 ? ` (${pendingCount})` : ''}`;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{ padding: '8px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.18s', background: isActive ? 'rgba(55,181,255,0.15)' : 'transparent', color: isActive ? BLUE : 'rgba(255,255,255,0.4)' }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {activeTab === 'catalogue' ? (
          <>
            {/* Filter tabs — All uses BLUE; L1-L6, L10, L11 (land) use BLUE; L7-L9 (lifestyle) use GOLD */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
              <button
                type="button"
                onClick={() => setFilterCat('all')}
                style={{
                  whiteSpace: 'nowrap', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                  border: filterCat === 'all' ? `2px solid ${BLUE}` : '1px solid rgba(55,181,255,0.15)',
                  background: filterCat === 'all' ? 'rgba(55,181,255,0.12)' : 'rgba(55,181,255,0.04)',
                  color: filterCat === 'all' ? BLUE : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                }}
              >
                All ({items.length})
              </button>
              {L_INDEX_CATEGORIES.map(c => {
                const count  = items.filter(i => i.lIndex === c.id).length;
                const active = filterCat === c.id;
                const color  = c.topLevel === 'lifestyle_foundations' ? GOLD : BLUE;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setFilterCat(c.id)}
                    style={{
                      whiteSpace: 'nowrap', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                      border: active ? `2px solid ${color}` : '1px solid rgba(55,181,255,0.12)',
                      background: active ? `${color}18` : 'rgba(55,181,255,0.03)',
                      color: active ? color : 'rgba(255,255,255,0.4)',
                      cursor: 'pointer',
                    }}
                  >
                    {c.id} ({count})
                  </button>
                );
              })}
            </div>

            {/* Items list */}
            {loading ? (
              <div style={{ ...card, padding: '48px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
                Loading…
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ ...card, padding: '48px', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', marginBottom: '4px' }}>No items yet.</p>
                <p style={{ color: 'rgba(55,181,255,0.5)', fontSize: '12px' }}>Click &ldquo;New Item&rdquo; to add your first L-index entry.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filtered.map(item => (
                  <ItemCard key={item.id} item={item} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </>
        ) : (
          /* Suggestions tab */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {suggestionsLoading ? (
              <div style={{ ...card, padding: '48px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Loading…</div>
            ) : suggestions.length === 0 ? (
              <div style={{ ...card, padding: '48px', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', marginBottom: '4px' }}>No suggestions yet.</p>
                <p style={{ color: 'rgba(55,181,255,0.4)', fontSize: '12px' }}>Goalies can suggest new items from their training log.</p>
              </div>
            ) : (
              <>
                {suggestions.filter(s => s.status === 'pending').length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ color: 'rgba(55,181,255,0.7)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Pending Review ({suggestions.filter(s => s.status === 'pending').length})
                    </p>
                    {suggestions.filter(s => s.status === 'pending').map(s => (
                      <SuggestionCard key={s.id} suggestion={s} onPromote={() => handlePromote(s)} onDismiss={() => handleDismiss(s)} />
                    ))}
                  </div>
                )}
                {suggestions.filter(s => s.status !== 'pending').length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: suggestions.filter(s => s.status === 'pending').length > 0 ? '12px' : '0' }}>
                    <p style={{ color: 'rgba(255,255,255,0.22)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Reviewed
                    </p>
                    {suggestions.filter(s => s.status !== 'pending').map(s => (
                      <SuggestionCard key={s.id} suggestion={s} onPromote={() => handlePromote(s)} onDismiss={() => handleDismiss(s)} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <ItemFormModal
          initial={editingItem}
          prefill={prefillForm}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingItem(undefined); setPrefillForm(undefined); }}
        />
      )}
    </AdminRoute>
  );

  function handleEdit(item: LIndexItem) {
    setEditingItem(item);
    setShowModal(true);
  }
}
