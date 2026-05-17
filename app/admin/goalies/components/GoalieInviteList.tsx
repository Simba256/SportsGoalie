'use client';

import { useState } from 'react';
import { Loader2, RefreshCw, XCircle, CheckCircle, Clock, Ban, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { invitationService } from '@/lib/services/invitation.service';
import { Invitation } from '@/types/invitation';

const BLUE = '#37b5ff';
const BLUE2 = '#60cdff';

interface Props {
  invitations: Invitation[];
  loading: boolean;
  onResend: (inv: Invitation) => void;
  onRevoke: (inv: Invitation) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: any }> = {
  pending: {
    label: 'Pending',
    color: BLUE2,
    bg: 'rgba(55,181,255,0.12)',
    Icon: Clock,
  },
  accepted: {
    label: 'Accepted',
    color: '#4ade80',
    bg: 'rgba(74,222,128,0.12)',
    Icon: CheckCircle,
  },
  expired: {
    label: 'Expired',
    color: 'rgba(255,255,255,0.35)',
    bg: 'rgba(255,255,255,0.06)',
    Icon: XCircle,
  },
  revoked: {
    label: 'Revoked',
    color: '#f87171',
    bg: 'rgba(248,113,113,0.12)',
    Icon: Ban,
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.expired;
  const { label, color, bg, Icon } = cfg;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        background: bg,
        color,
        border: `1px solid ${color}33`,
        borderRadius: '20px',
        padding: '3px 10px',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.8px',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      <Icon size={11} />
      {label}
    </span>
  );
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function GoalieInviteList({ invitations, loading, onResend, onRevoke }: Props) {
  const [actionId, setActionId] = useState<string | null>(null);

  const handleResend = async (inv: Invitation) => {
    setActionId(inv.id);
    try {
      const updated = await invitationService.resendInvitation(inv.id);

      try {
        const res = await fetch('/api/invitations/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invitation: updated }),
        });
        if (!res.ok) throw new Error('Email API returned error');
        toast.success(`Invite resent to ${updated.email}`);
      } catch {
        toast.success(`Invitation refreshed for ${updated.email}`, {
          description: 'Email delivery failed — copy the invite link manually.',
        });
      }

      onResend(updated);
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend invitation');
    } finally {
      setActionId(null);
    }
  };

  const handleRevoke = async (inv: Invitation) => {
    if (!confirm(`Revoke invitation for ${inv.email}?`)) return;
    setActionId(inv.id);
    try {
      await invitationService.revokeInvitation(inv.id, 'admin');
      toast.success(`Invitation revoked for ${inv.email}`);
      onRevoke(inv);
    } catch (error: any) {
      toast.error(error.message || 'Failed to revoke invitation');
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          padding: '48px 0',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '14px',
        }}
      >
        <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
        Loading invitations...
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '48px 0',
          color: 'rgba(255,255,255,0.3)',
          fontSize: '14px',
        }}
      >
        No goalie invitations yet. Use the form above to send your first invite.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {invitations.map(inv => {
        const busy = actionId === inv.id;
        const canResend = inv.status === 'pending' || inv.status === 'expired';
        const canRevoke = inv.status === 'pending';

        return (
          <div
            key={inv.id}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(96,205,255,0.12)',
              borderRadius: '10px',
              padding: '14px 16px',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '12px',
              alignItems: 'center',
            }}
          >
            {/* Left: info */}
            <div style={{ minWidth: 0 }}>
              {/* Name + email row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginBottom: '6px',
                }}
              >
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>
                  {inv.metadata.firstName || inv.metadata.lastName
                    ? `${inv.metadata.firstName ?? ''} ${inv.metadata.lastName ?? ''}`.trim()
                    : inv.email}
                </span>
                <StatusBadge status={inv.status} />
                {inv.metadata.tier && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      color: inv.metadata.tier === 'custom' ? '#fbbf24' : 'rgba(255,255,255,0.35)',
                      background:
                        inv.metadata.tier === 'custom'
                          ? 'rgba(251,191,36,0.12)'
                          : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${inv.metadata.tier === 'custom' ? '#fbbf2433' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: '20px',
                      padding: '2px 8px',
                    }}
                  >
                    {inv.metadata.tier}
                  </span>
                )}
              </div>

              {/* Secondary info row */}
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  flexWrap: 'wrap',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.45)',
                }}
              >
                {(inv.metadata.firstName || inv.metadata.lastName) && (
                  <span>{inv.email}</span>
                )}
                {inv.metadata.assignedCoachName && (
                  <span>
                    <ChevronRight size={10} style={{ display: 'inline', opacity: 0.5 }} />
                    {inv.metadata.assignedCoachName}
                  </span>
                )}
                {inv.status === 'accepted' && inv.acceptedAt ? (
                  <span style={{ color: '#4ade8088' }}>Accepted {formatDate(inv.acceptedAt)}</span>
                ) : inv.status === 'pending' ? (
                  <span>Expires {formatDate(inv.expiresAt)}</span>
                ) : inv.status === 'revoked' && inv.revokedAt ? (
                  <span style={{ color: '#f8717188' }}>Revoked {formatDate(inv.revokedAt)}</span>
                ) : (
                  <span>Sent {formatDate(inv.createdAt)}</span>
                )}
              </div>
            </div>

            {/* Right: actions */}
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              {canResend && (
                <button
                  onClick={() => handleResend(inv)}
                  disabled={busy}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${BLUE}44`,
                    background: 'rgba(55,181,255,0.1)',
                    color: BLUE,
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.8px',
                    cursor: busy ? 'not-allowed' : 'pointer',
                    opacity: busy ? 0.5 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  {busy ? (
                    <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <RefreshCw size={11} />
                  )}
                  Resend
                </button>
              )}
              {canRevoke && (
                <button
                  onClick={() => handleRevoke(inv)}
                  disabled={busy}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(248,113,113,0.25)',
                    background: 'rgba(248,113,113,0.08)',
                    color: '#f87171',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.8px',
                    cursor: busy ? 'not-allowed' : 'pointer',
                    opacity: busy ? 0.5 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  {busy ? (
                    <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <XCircle size={11} />
                  )}
                  Revoke
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
