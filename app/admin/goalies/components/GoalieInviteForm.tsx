'use client';

import { useState, useEffect } from 'react';
import { Loader2, Send, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { invitationService } from '@/lib/services/invitation.service';
import { userService } from '@/lib/database';
import { Invitation } from '@/types/invitation';

const BLUE = '#37b5ff';
const BLUE2 = '#60cdff';
const BLUE3 = '#0ea5e9';

interface Coach {
  id: string;
  displayName: string;
  email: string;
}

interface Props {
  invitedBy: string;
  invitedByName: string;
  onInvitationCreated: (inv: Invitation) => void;
}

export function GoalieInviteForm({ invitedBy, invitedByName, onInvitationCreated }: Props) {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loadingCoaches, setLoadingCoaches] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    assignedCoachId: '',
    tier: 'automated' as 'automated' | 'custom',
    customMessage: '',
  });

  useEffect(() => {
    loadCoaches();
  }, []);

  const loadCoaches = async () => {
    try {
      const result = await userService.getAllUsers({ role: 'coach', limit: 100 });
      if (result.success && result.data) {
        setCoaches(
          result.data.items.map(u => ({
            id: u.id,
            displayName: u.displayName,
            email: u.email,
          }))
        );
      }
    } catch {
      toast.error('Failed to load coaches');
    } finally {
      setLoadingCoaches(false);
    }
  };

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email.trim()) { toast.error('Email is required'); return; }
    if (form.tier === 'custom' && !form.assignedCoachId) { toast.error('Please assign a coach for the Custom tier'); return; }

    const selectedCoach = coaches.find(c => c.id === form.assignedCoachId);

    try {
      setSubmitting(true);
      const invitation = await invitationService.createInvitation({
        email: form.email.trim().toLowerCase(),
        role: 'student',
        invitedBy,
        invitedByName,
        expiresInDays: 7,
        metadata: {
          firstName: form.firstName.trim() || undefined,
          lastName: form.lastName.trim() || undefined,
          assignedCoachId: form.assignedCoachId,
          assignedCoachName: selectedCoach?.displayName,
          tier: form.tier,
          customMessage: form.customMessage.trim() || undefined,
        },
      });

      // Send the invite email via the server-side API route
      try {
        const res = await fetch('/api/invitations/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invitation }),
        });
        if (!res.ok) throw new Error('Email API error');
        toast.success(`Invite sent to ${invitation.email}`);
      } catch {
        // Invitation created in Firestore — email failed, warn but don't block
        toast.success(`Invitation created for ${invitation.email}`, {
          description: 'Email delivery failed — copy the invite link manually from the list below.',
        });
      }

      onInvitationCreated(invitation);
      setForm({ firstName: '', lastName: '', email: '', assignedCoachId: '', tier: 'automated', customMessage: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitation');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(96,205,255,0.25)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#fff',
    fontSize: '13px',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1.5px',
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
    marginBottom: '6px',
    display: 'block',
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <style>{`@media (max-width: 480px) { .gif-name { grid-template-columns: 1fr !important; } }`}</style>
      {/* Name row */}
      <div className="gif-name" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={labelStyle}>First Name</label>
          <input
            type="text"
            placeholder="Alex"
            value={form.firstName}
            onChange={e => set('firstName', e.target.value)}
            style={inputStyle}
            disabled={submitting}
          />
        </div>
        <div>
          <label style={labelStyle}>Last Name</label>
          <input
            type="text"
            placeholder="Smith"
            value={form.lastName}
            onChange={e => set('lastName', e.target.value)}
            style={inputStyle}
            disabled={submitting}
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label style={labelStyle}>Email Address <span style={{ color: BLUE }}>*</span></label>
        <input
          type="email"
          placeholder="goalie@email.com"
          value={form.email}
          onChange={e => set('email', e.target.value)}
          style={inputStyle}
          required
          disabled={submitting}
        />
      </div>

      {/* Tier */}
      <div>
        <label style={labelStyle}>Program Tier</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          {(['automated', 'custom'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => {
                set('tier', t);
                if (t === 'automated') set('assignedCoachId', '');
              }}
              style={{
                flex: 1,
                padding: '9px 0',
                borderRadius: '8px',
                border: form.tier === t ? `1px solid ${BLUE}` : '1px solid rgba(255,255,255,0.1)',
                background: form.tier === t ? `rgba(55,181,255,0.15)` : 'rgba(255,255,255,0.04)',
                color: form.tier === t ? BLUE2 : 'rgba(255,255,255,0.4)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t === 'automated' ? 'Automated' : 'Custom'}
            </button>
          ))}
        </div>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '6px' }}>
          {form.tier === 'custom'
            ? 'Custom: high-touch tier with video analysis and direct staff contact.'
            : 'Automated: standard self-paced curriculum. Can be upgraded to Custom later.'}
        </p>
      </div>

      {/* Coach Assignment — only shown for Custom tier */}
      {form.tier === 'custom' && (
        <div>
          <label style={labelStyle}>Assign Coach <span style={{ color: BLUE }}>*</span></label>
          {loadingCoaches ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Loading coaches...
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <select
                value={form.assignedCoachId}
                onChange={e => set('assignedCoachId', e.target.value)}
                style={{ ...inputStyle, appearance: 'none', paddingRight: '36px', cursor: 'pointer' }}
                required
                disabled={submitting}
              >
                <option value="" style={{ background: '#0d1b3a' }}>Select a coach...</option>
                {coaches.map(c => (
                  <option key={c.id} value={c.id} style={{ background: '#0d1b3a' }}>
                    {c.displayName} — {c.email}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                color="rgba(255,255,255,0.4)"
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
            </div>
          )}
        </div>
      )}

      {/* Custom message */}
      <div>
        <label style={labelStyle}>Personal Message <span style={{ color: 'rgba(255,255,255,0.3)' }}>(optional)</span></label>
        <textarea
          placeholder="Add a personal note to include in the invite email..."
          value={form.customMessage}
          onChange={e => set('customMessage', e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
          disabled={submitting}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || loadingCoaches}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          background: submitting ? 'rgba(55,181,255,0.25)' : `linear-gradient(135deg, ${BLUE} 0%, ${BLUE3} 100%)`,
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 0',
          fontSize: '12px',
          fontWeight: 800,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          cursor: submitting ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          boxShadow: submitting ? 'none' : '0 4px 20px rgba(55,181,255,0.35)',
        }}
      >
        {submitting ? (
          <>
            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
            Sending Invite...
          </>
        ) : (
          <>
            <Send size={14} />
            Send Invite Link
          </>
        )}
      </button>
    </form>
  );
}
