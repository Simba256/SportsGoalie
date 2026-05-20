'use client';

import { useState } from 'react';
import { CoachInvitation } from '@/types/auth';
import { Mail, RefreshCw, XCircle, CheckCircle, Clock, Ban, Loader2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const BLUE = '#37b5ff';
const GREEN = '#22c55e';
const RED = '#f87171';
const AMBER = '#fbbf24';

const STATUS_CONFIG: Record<CoachInvitation['status'], { bg: string; color: string; label: string; Icon: React.ElementType }> = {
  pending:  { bg: 'rgba(55,181,255,0.12)',   color: BLUE,  label: 'Pending',  Icon: Clock },
  accepted: { bg: 'rgba(34,197,94,0.12)',    color: GREEN, label: 'Accepted', Icon: CheckCircle },
  expired:  { bg: 'rgba(255,255,255,0.08)',  color: 'rgba(255,255,255,0.4)', label: 'Expired', Icon: XCircle },
  revoked:  { bg: 'rgba(248,113,113,0.12)', color: RED,   label: 'Revoked',  Icon: Ban },
};

interface InvitationListProps {
  invitations: CoachInvitation[];
  loading: boolean;
  onResend: (invitation: CoachInvitation) => void;
  onRevoke: (invitation: CoachInvitation) => void;
}

export function InvitationList({ invitations, loading, onResend, onRevoke }: InvitationListProps) {
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);

  const copyInvitationLink = (invitation: CoachInvitation) => {
    const baseUrl = window.location.origin;
    const inviteUrl = `${baseUrl}/auth/accept-invite?token=${invitation.token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success('Invitation link copied to clipboard');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
        <Loader2 size={32} color={BLUE} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <Mail size={44} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 12px' }} />
        <p style={{ color: '#fff', fontWeight: 600, fontSize: '17px', marginBottom: '6px' }}>No invitations found</p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px' }}>Send your first coach invitation to get started</p>
      </div>
    );
  }

  const btnStyle = (color: string): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 12px',
    borderRadius: '8px', border: `1px solid ${color}33`, background: `${color}12`,
    color, fontSize: '13px', fontWeight: 600, cursor: 'pointer',
  });

  return (
    <>
      <style>{`.il-item:hover { background: rgba(55,181,255,0.04) !important; }`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {invitations.map(invitation => {
          const cfg = STATUS_CONFIG[invitation.status];
          const Icon = cfg.Icon;
          return (
            <div key={invitation.id} className="il-item" style={{ padding: '16px', border: '1px solid rgba(55,181,255,0.1)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', transition: 'background 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>{invitation.email}</p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: cfg.bg, color: cfg.color, padding: '2px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 700 }}>
                      <Icon size={11} /> {cfg.label}
                    </span>
                  </div>

                  {invitation.metadata && (
                    <div style={{ marginBottom: '8px' }}>
                      {(invitation.metadata.firstName || invitation.metadata.lastName) && (
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Name: {invitation.metadata.firstName} {invitation.metadata.lastName}</p>
                      )}
                      {invitation.metadata.organizationName && (
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Organization: {invitation.metadata.organizationName}</p>
                      )}
                      {invitation.metadata.customMessage && (
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', fontStyle: 'italic' }}>"{invitation.metadata.customMessage}"</p>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                    {[
                      { label: 'Invited by', value: invitation.invitedByName },
                      { label: 'Created', value: formatDistanceToNow(invitation.createdAt, { addSuffix: true }) },
                      { label: 'Expires', value: formatDistanceToNow(invitation.expiresAt, { addSuffix: true }) },
                      invitation.acceptedAt && { label: 'Accepted', value: formatDistanceToNow(invitation.acceptedAt, { addSuffix: true }) },
                      invitation.revokedAt && { label: 'Revoked', value: formatDistanceToNow(invitation.revokedAt, { addSuffix: true }) },
                    ].filter(Boolean).map((item) => item && (
                      <p key={item.label} style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{item.label}:</span> {item.value}
                      </p>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  {invitation.status === 'pending' && (
                    <>
                      <button onClick={() => copyInvitationLink(invitation)} style={btnStyle(BLUE)} title="Copy invitation link">
                        <Copy size={13} />
                      </button>
                      <button onClick={() => onResend(invitation)} style={btnStyle(AMBER)} title="Resend invitation">
                        <RefreshCw size={13} />
                      </button>
                      <button onClick={() => setConfirmRevokeId(invitation.id)} style={btnStyle(RED)} title="Revoke invitation">
                        <XCircle size={13} />
                      </button>
                    </>
                  )}
                  {(invitation.status === 'expired' || invitation.status === 'revoked') && (
                    <button onClick={() => onResend(invitation)} style={btnStyle(BLUE)}>
                      <RefreshCw size={13} /> Resend
                    </button>
                  )}
                  {invitation.status === 'accepted' && (
                    <button disabled style={{ ...btnStyle(GREEN), opacity: 0.5, cursor: 'not-allowed' }}>
                      <CheckCircle size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Inline revoke confirm */}
              {confirmRevokeId === invitation.id && (
                <div style={{ marginTop: '12px', padding: '12px 16px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                    Revoke invitation to <strong style={{ color: '#fff' }}>{invitation.email}</strong>? This cannot be undone.
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setConfirmRevokeId(null)} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={() => { onRevoke(invitation); setConfirmRevokeId(null); }} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: RED, color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Revoke</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
