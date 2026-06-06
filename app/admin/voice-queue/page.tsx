'use client';

import { useState, useEffect, useCallback } from 'react';
import { SkeletonDarkPage } from '@/components/ui/skeletons';
import {
  Inbox, User, Calendar, ChevronDown, ChevronUp,
  MessageSquare, AlertTriangle, HelpCircle, Star,
  CheckCircle, Clock, Archive, ArrowUp, Send,
} from 'lucide-react';
import { AdminRoute } from '@/components/auth/protected-route';
import {
  collection, getDocs, doc, updateDoc, query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/auth/context';
import { toast } from 'sonner';

/* ─── Constants ─────────────────────────────────────────────────────────────── */

const BLUE  = '#37b5ff';
const GREEN = '#22c55e';
const RED   = '#f87171';
const AMBER = '#fbbf24';
const ORANGE = '#fb923c';

const card = {
  background: 'rgba(2,18,44,0.82)',
  border: '1px solid rgba(55,181,255,0.14)',
  borderRadius: '16px',
} as const;

/* ─── Types ──────────────────────────────────────────────────────────────────── */

type VoiceCategory = 'COMPLIMENT' | 'CONCERN' | 'QUESTION';
type VoiceStatus   = 'NEW' | 'IN_PROGRESS' | 'ANSWERED' | 'ARCHIVED' | 'ESCALATED';

interface VoiceSubmission {
  id: string;
  parentId: string;
  parentName: string;
  goalieId?: string;
  goalieName?: string;
  category: VoiceCategory;
  status: VoiceStatus;
  subject: string;
  body: string;
  createdAt: { toDate: () => Date } | Date | null;
  adminReply?: string;
  adminReplyBy?: string;
  adminReplyAt?: { toDate: () => Date } | Date | null;
}

/* ─── Badge maps ─────────────────────────────────────────────────────────────── */

const CATEGORY_STYLE: Record<VoiceCategory, { bg: string; color: string; icon: React.ReactNode }> = {
  COMPLIMENT: { bg: 'rgba(34,197,94,0.12)',   color: GREEN,  icon: <Star size={11} /> },
  CONCERN:    { bg: 'rgba(248,113,113,0.15)', color: RED,    icon: <AlertTriangle size={11} /> },
  QUESTION:   { bg: `rgba(55,181,255,0.12)`, color: BLUE,   icon: <HelpCircle size={11} /> },
};

const STATUS_STYLE: Record<VoiceStatus, { bg: string; color: string; label: string }> = {
  NEW:         { bg: 'rgba(251,191,36,0.13)',  color: AMBER,  label: 'New' },
  IN_PROGRESS: { bg: `rgba(55,181,255,0.12)`, color: BLUE,   label: 'In Progress' },
  ANSWERED:    { bg: 'rgba(34,197,94,0.12)',   color: GREEN,  label: 'Answered' },
  ARCHIVED:    { bg: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)', label: 'Archived' },
  ESCALATED:   { bg: 'rgba(251,146,60,0.13)', color: ORANGE, label: 'Escalated' },
};

/* ─── Filter config ──────────────────────────────────────────────────────────── */

type StatusFilter   = 'all' | VoiceStatus;
type CategoryFilter = 'all' | VoiceCategory;

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: 'all',         label: 'All' },
  { id: 'NEW',         label: 'New' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'ANSWERED',    label: 'Answered' },
  { id: 'ARCHIVED',    label: 'Archived' },
];

const CATEGORY_FILTERS: { id: CategoryFilter; label: string }[] = [
  { id: 'all',        label: 'All' },
  { id: 'COMPLIMENT', label: 'Compliment' },
  { id: 'CONCERN',    label: 'Concern' },
  { id: 'QUESTION',   label: 'Question' },
];

/* ─── Page export ────────────────────────────────────────────────────────────── */

export default function AdminVoiceQueuePage() {
  return <AdminRoute><VoiceQueueContent /></AdminRoute>;
}

/* ─── Main content ───────────────────────────────────────────────────────────── */

function VoiceQueueContent() {
  const { user: currentUser } = useAuth();

  const [submissions, setSubmissions]       = useState<VoiceSubmission[]>([]);
  const [loading, setLoading]               = useState(true);
  const [statusFilter, setStatusFilter]     = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [expandedIds, setExpandedIds]       = useState<Set<string>>(new Set());
  const [replyOpenIds, setReplyOpenIds]     = useState<Set<string>>(new Set());
  const [replyTexts, setReplyTexts]         = useState<Record<string, string>>({});
  const [submitting, setSubmitting]         = useState<Record<string, boolean>>({});

  /* fetch */
  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'parent_voice_submissions'),
        orderBy('createdAt', 'desc'),
      );
      const snap = await getDocs(q);
      const items: VoiceSubmission[] = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<VoiceSubmission, 'id'>),
      }));
      setSubmissions(items);
    } catch (err) {
      console.error('Error loading voice queue:', err);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  /* helpers */
  const toggleExpand = (id: string) =>
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleReply = (id: string) =>
    setReplyOpenIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const updateStatus = async (id: string, status: VoiceStatus) => {
    try {
      await updateDoc(doc(db, 'parent_voice_submissions', id), {
        status,
        updatedAt: serverTimestamp(),
      });
      setSubmissions(prev =>
        prev.map(s => s.id === id ? { ...s, status } : s)
      );
      toast.success(`Marked as ${STATUS_STYLE[status].label}`);
    } catch (err) {
      console.error(err);
      toast.error('Update failed');
    }
  };

  const sendReply = async (id: string) => {
    const text = replyTexts[id]?.trim();
    if (!text) { toast.error('Reply cannot be empty'); return; }
    if (!currentUser) return;
    setSubmitting(prev => ({ ...prev, [id]: true }));
    try {
      await updateDoc(doc(db, 'parent_voice_submissions', id), {
        adminReply:    text,
        adminReplyBy:  currentUser.id,
        adminReplyAt:  serverTimestamp(),
        status:        'ANSWERED' as VoiceStatus,
        updatedAt:     serverTimestamp(),
      });
      // Update local state with plain-JS values (no FieldValue in state)
      setSubmissions(prev =>
        prev.map(s =>
          s.id === id
            ? { ...s, adminReply: text, adminReplyBy: currentUser.id, status: 'ANSWERED' as VoiceStatus }
            : s
        )
      );
      setReplyTexts(prev => ({ ...prev, [id]: '' }));
      setReplyOpenIds(prev => { const n = new Set(prev); n.delete(id); return n; });
      toast.success('Reply sent');
    } catch (err) {
      console.error(err);
      toast.error('Failed to send reply');
    } finally {
      setSubmitting(prev => ({ ...prev, [id]: false }));
    }
  };

  /* filter */
  const filtered = submissions.filter(s => {
    if (statusFilter   !== 'all' && s.status   !== statusFilter)   return false;
    if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;
    return true;
  });

  /* stats */
  const stats = {
    total:      submissions.length,
    newCount:   submissions.filter(s => s.status === 'NEW').length,
    answered:   submissions.filter(s => s.status === 'ANSWERED').length,
    escalated:  submissions.filter(s => s.status === 'ESCALATED').length,
  };

  const fmtDate = (val: VoiceSubmission['createdAt']) => {
    if (!val) return '—';
    const d = typeof (val as { toDate?: () => Date }).toDate === 'function'
      ? (val as { toDate: () => Date }).toDate()
      : val as Date;
    return d.toLocaleString();
  };

  if (loading) return <div style={{ padding: '48px' }}><SkeletonDarkPage /></div>;

  return (
    <>
      <style>{`
        .vq-tab { cursor: pointer; border: none; background: transparent; transition: all 0.18s; }
        .vq-tab:hover { color: ${BLUE} !important; }
        .vq-cat { cursor: pointer; border: none; transition: all 0.18s; }
        .vq-cat:hover { border-color: rgba(55,181,255,0.35) !important; }
        .vq-action { cursor: pointer; border: 1px solid rgba(55,181,255,0.16); border-radius: 8px; background: transparent; transition: all 0.18s; padding: 6px 12px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 5px; }
        .vq-action:hover { background: rgba(55,181,255,0.1) !important; border-color: rgba(55,181,255,0.35) !important; color: ${BLUE} !important; }
        .vq-action-green:hover  { background: rgba(34,197,94,0.1) !important; border-color: rgba(34,197,94,0.35) !important; color: #22c55e !important; }
        .vq-action-red:hover    { background: rgba(248,113,113,0.1) !important; border-color: rgba(248,113,113,0.35) !important; color: #f87171 !important; }
        .vq-action-orange:hover { background: rgba(251,146,60,0.1) !important; border-color: rgba(251,146,60,0.35) !important; color: #fb923c !important; }
        .vq-action-gray:hover   { background: rgba(255,255,255,0.06) !important; border-color: rgba(255,255,255,0.2) !important; color: rgba(255,255,255,0.55) !important; }
        .vq-expand:hover { color: ${BLUE} !important; }
        .vq-ta { background: rgba(2,18,44,0.7) !important; border: 1px solid rgba(55,181,255,0.18) !important; color: #fff !important; border-radius: 10px !important; padding: 10px 12px !important; width: 100% !important; font-size: 13px !important; outline: none !important; resize: vertical; min-height: 80px; font-family: inherit; }
        .vq-ta:focus { border-color: rgba(55,181,255,0.45) !important; }
        .vq-ta::placeholder { color: rgba(255,255,255,0.25) !important; }
        .vq-send { cursor: pointer; border: none; background: linear-gradient(135deg, ${BLUE} 0%, #1e9ae0 100%); color: #fff; padding: 8px 18px; border-radius: 9px; font-size: 13px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; transition: opacity 0.18s; }
        .vq-send:hover:not(:disabled) { opacity: 0.88; }
        .vq-send:disabled { opacity: 0.45; cursor: not-allowed; }
        .vq-cancel { cursor: pointer; border: 1px solid rgba(255,255,255,0.12); background: transparent; color: rgba(255,255,255,0.45); padding: 8px 14px; border-radius: 9px; font-size: 13px; font-weight: 600; transition: all 0.18s; }
        .vq-cancel:hover { border-color: rgba(255,255,255,0.25) !important; color: rgba(255,255,255,0.7) !important; }
        @media (max-width: 680px) { .vq-stats { grid-template-columns: repeat(2,1fr) !important; } }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `rgba(55,181,255,0.12)`, border: `1px solid rgba(55,181,255,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Inbox size={20} color={BLUE} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '4px' }}>Parent Voice Queue</h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>Review and respond to parent voice submissions</p>
          </div>
        </div>

        {/* Stats */}
        <div className="vq-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
          {[
            { label: 'Total',     value: stats.total,     color: BLUE,  icon: <Inbox size={14} color={`${BLUE}88`} /> },
            { label: 'New',       value: stats.newCount,  color: AMBER, icon: <Clock size={14} color={`${AMBER}88`} /> },
            { label: 'Answered',  value: stats.answered,  color: GREEN, icon: <CheckCircle size={14} color={`${GREEN}88`} /> },
            { label: 'Escalated', value: stats.escalated, color: ORANGE, icon: <ArrowUp size={14} color={`${ORANGE}88`} /> },
          ].map(({ label, value, color, icon }) => (
            <div key={label} style={{ position: 'relative', ...card, padding: '16px', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,transparent,${color}66,transparent)` }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', fontWeight: 600 }}>{label}</p>
                {icon}
              </div>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: '26px', lineHeight: 1 }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Status tabs */}
        <div style={{ ...card, padding: '6px', display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
          {STATUS_TABS.map(tab => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                className="vq-tab"
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                  color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                  background: active ? BLUE : 'transparent',
                  boxShadow: active ? `0 2px 12px ${BLUE}44` : 'none',
                }}
              >
                {tab.label}
                {tab.id === 'NEW' && stats.newCount > 0 && (
                  <span style={{ marginLeft: '6px', background: active ? 'rgba(255,255,255,0.25)' : `rgba(55,181,255,0.2)`, color: active ? '#fff' : BLUE, borderRadius: '20px', padding: '0 7px', fontSize: '11px', fontWeight: 800 }}>
                    {stats.newCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {CATEGORY_FILTERS.map(f => {
            const active = categoryFilter === f.id;
            return (
              <button
                key={f.id}
                className="vq-cat"
                onClick={() => setCategoryFilter(f.id)}
                style={{
                  padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                  border: `1px solid ${active ? BLUE : 'rgba(55,181,255,0.16)'}`,
                  background: active ? `rgba(55,181,255,0.14)` : 'transparent',
                  color: active ? BLUE : 'rgba(255,255,255,0.5)',
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Submissions list */}
        <div style={{ position: 'relative', ...card, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,transparent,${BLUE},transparent)` }} />

          {/* List header */}
          <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid rgba(55,181,255,0.08)' }}>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>
              Submissions ({filtered.length})
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginTop: '2px' }}>
              {statusFilter !== 'all'   ? STATUS_STYLE[statusFilter as VoiceStatus]?.label : 'All statuses'}
              {categoryFilter !== 'all' ? ` · ${categoryFilter.charAt(0) + categoryFilter.slice(1).toLowerCase()}s` : ''}
            </p>
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div style={{ padding: '56px 24px', textAlign: 'center' }}>
              <Inbox size={44} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 14px' }} />
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>No submissions found</p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>
                {statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No parent voice submissions yet'}
              </p>
            </div>
          )}

          {/* Cards */}
          {filtered.map((sub, i) => {
            const catStyle = CATEGORY_STYLE[sub.category] ?? CATEGORY_STYLE.QUESTION;
            const stStyle  = STATUS_STYLE[sub.status]     ?? STATUS_STYLE.NEW;
            const isExpanded  = expandedIds.has(sub.id);
            const isReplying  = replyOpenIds.has(sub.id);
            const isLast      = i === filtered.length - 1;

            return (
              <div
                key={sub.id}
                style={{
                  padding: '18px 20px',
                  borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
                  background: sub.status === 'NEW' ? 'rgba(55,181,255,0.025)' : 'transparent',
                }}
              >
                {/* Row 1 — meta */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {/* Category badge */}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: catStyle.bg, color: catStyle.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.04em' }}>
                      {catStyle.icon}
                      {sub.category}
                    </span>
                    {/* Status badge */}
                    <span style={{ display: 'inline-flex', alignItems: 'center', background: stStyle.bg, color: stStyle.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                      {stStyle.label}
                    </span>
                  </div>
                  {/* Timestamp */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.25)', fontSize: '12px', flexShrink: 0 }}>
                    <Calendar size={11} />
                    {fmtDate(sub.createdAt)}
                  </div>
                </div>

                {/* Row 2 — parent + goalie */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.55)', fontSize: '13px' }}>
                    <User size={13} color={BLUE} />
                    <span style={{ fontWeight: 600, color: '#fff' }}>{sub.parentName || 'Unknown Parent'}</span>
                  </div>
                  {sub.goalieName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
                      <span>Goalie:</span>
                      <span style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>{sub.goalieName}</span>
                    </div>
                  )}
                </div>

                {/* Row 3 — subject + body */}
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>{sub.subject}</p>
                  <p style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '13px',
                    lineHeight: 1.6,
                    display: '-webkit-box',
                    WebkitLineClamp: isExpanded ? undefined : 2,
                    WebkitBoxOrient: 'vertical' as const,
                    overflow: isExpanded ? 'visible' : 'hidden',
                  }}>
                    {sub.body}
                  </p>
                  {sub.body && sub.body.length > 120 && (
                    <button
                      className="vq-expand"
                      onClick={() => toggleExpand(sub.id)}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', marginTop: '4px', padding: 0, display: 'flex', alignItems: 'center', gap: '3px', transition: 'color 0.15s' }}
                    >
                      {isExpanded ? <><ChevronUp size={13} /> Show less</> : <><ChevronDown size={13} /> Show more</>}
                    </button>
                  )}
                </div>

                {/* Previous admin reply */}
                {sub.adminReply && (
                  <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '10px', padding: '10px 14px', marginBottom: '12px' }}>
                    <p style={{ color: 'rgba(34,197,94,0.7)', fontSize: '11px', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MessageSquare size={11} /> Admin Reply
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: 1.5 }}>{sub.adminReply}</p>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    className="vq-action"
                    onClick={() => toggleReply(sub.id)}
                    style={{ color: BLUE }}
                  >
                    <MessageSquare size={12} /> Reply
                  </button>

                  {sub.status !== 'IN_PROGRESS' && sub.status !== 'ANSWERED' && sub.status !== 'ARCHIVED' && (
                    <button
                      className="vq-action"
                      onClick={() => updateStatus(sub.id, 'IN_PROGRESS')}
                      style={{ color: BLUE }}
                    >
                      <Clock size={12} /> Mark In Progress
                    </button>
                  )}

                  {sub.status !== 'ANSWERED' && (
                    <button
                      className="vq-action vq-action-green"
                      onClick={() => updateStatus(sub.id, 'ANSWERED')}
                      style={{ color: GREEN }}
                    >
                      <CheckCircle size={12} /> Mark Resolved
                    </button>
                  )}

                  {sub.status !== 'ARCHIVED' && (
                    <button
                      className="vq-action vq-action-gray"
                      onClick={() => updateStatus(sub.id, 'ARCHIVED')}
                      style={{ color: 'rgba(255,255,255,0.4)' }}
                    >
                      <Archive size={12} /> Archive
                    </button>
                  )}

                  {sub.status !== 'ESCALATED' && (
                    <button
                      className="vq-action vq-action-orange"
                      onClick={() => updateStatus(sub.id, 'ESCALATED')}
                      style={{ color: ORANGE }}
                    >
                      <ArrowUp size={12} /> Escalate
                    </button>
                  )}
                </div>

                {/* Inline reply panel */}
                {isReplying && (
                  <div style={{ marginTop: '14px', padding: '14px', background: 'rgba(55,181,255,0.04)', border: '1px solid rgba(55,181,255,0.14)', borderRadius: '12px' }}>
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Send size={12} color={BLUE} /> Write a reply
                    </p>
                    <textarea
                      className="vq-ta"
                      placeholder="Type your reply to the parent…"
                      value={replyTexts[sub.id] ?? ''}
                      onChange={e => setReplyTexts(prev => ({ ...prev, [sub.id]: e.target.value }))}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button
                        className="vq-send"
                        disabled={submitting[sub.id] || !replyTexts[sub.id]?.trim()}
                        onClick={() => sendReply(sub.id)}
                      >
                        <Send size={13} />
                        {submitting[sub.id] ? 'Sending…' : 'Send Reply'}
                      </button>
                      <button
                        className="vq-cancel"
                        onClick={() => toggleReply(sub.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
