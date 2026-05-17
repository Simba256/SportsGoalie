'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import { Loader2, Users, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { invitationService } from '@/lib/services/invitation.service';
import { Invitation } from '@/types/invitation';
import { GoalieInviteForm } from './components/GoalieInviteForm';
import { GoalieInviteList } from './components/GoalieInviteList';

const BLUE = '#37b5ff';
const BLUE3 = '#0ea5e9';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'expired', label: 'Expired' },
  { key: 'revoked', label: 'Revoked' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function GoalieInvitationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadInvitations();
    }
  }, [user]);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const data = await invitationService.getAllInvitations('student');
      setInvitations(data);
    } catch {
      toast.error('Failed to load goalie invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleInvitationCreated = (inv: Invitation) => {
    setInvitations(prev => [inv, ...prev]);
  };

  const handleResend = (updated: Invitation) => {
    setInvitations(prev => prev.map(i => (i.id === updated.id ? updated : i)));
  };

  const handleRevoke = (revoked: Invitation) => {
    setInvitations(prev =>
      prev.map(i => (i.id === revoked.id ? { ...i, status: 'revoked' as const } : i))
    );
  };

  const filtered = activeTab === 'all'
    ? invitations
    : invitations.filter(i => i.status === activeTab);

  const counts = {
    all: invitations.length,
    pending: invitations.filter(i => i.status === 'pending').length,
    accepted: invitations.filter(i => i.status === 'accepted').length,
    expired: invitations.filter(i => i.status === 'expired').length,
    revoked: invitations.filter(i => i.status === 'revoked').length,
  };

  if (!mounted || authLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #050d1a 0%, #0a1628 50%, #0d1b3a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.4)',
          gap: '10px',
        }}
      >
        <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #050d1a 0%, #0a1628 50%, #0d1b3a 100%)',
        padding: '32px 24px',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE3} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={20} color="#fff" />
            </div>
            <div>
              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#fff',
                  margin: 0,
                  letterSpacing: '-0.5px',
                }}
              >
                Goalie Invitations
              </h1>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
                Invite goalies and assign them to a coach
              </p>
            </div>
          </div>
        </div>

        {/* Invite form card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(96,205,255,0.15)',
            borderRadius: '14px',
            padding: '24px',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
            }}
          >
            <Mail size={15} color={BLUE} />
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: BLUE,
              }}
            >
              Send Invite Link
            </span>
          </div>
          {user && (
            <GoalieInviteForm
              invitedBy={user.id}
              invitedByName={user.displayName ?? 'Admin'}
              onInvitationCreated={handleInvitationCreated}
            />
          )}
        </div>

        {/* Invitations list card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(96,205,255,0.15)',
            borderRadius: '14px',
            padding: '24px',
          }}
        >
          {/* List header + tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              Sent Invitations
            </span>

            {/* Tabs */}
            <div
              style={{
                display: 'flex',
                gap: '4px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '8px',
                padding: '4px',
              }}
            >
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: activeTab === tab.key ? `rgba(55,181,255,0.2)` : 'transparent',
                    color: activeTab === tab.key ? BLUE : 'rgba(255,255,255,0.4)',
                    fontSize: '12px',
                    fontWeight: activeTab === tab.key ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  {tab.label}
                  {counts[tab.key] > 0 && (
                    <span
                      style={{
                        background:
                          activeTab === tab.key
                            ? `rgba(55,181,255,0.3)`
                            : 'rgba(255,255,255,0.1)',
                        color: activeTab === tab.key ? BLUE : 'rgba(255,255,255,0.5)',
                        borderRadius: '10px',
                        padding: '1px 6px',
                        fontSize: '10px',
                        fontWeight: 700,
                      }}
                    >
                      {counts[tab.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <GoalieInviteList
            invitations={filtered}
            loading={loading}
            onResend={handleResend}
            onRevoke={handleRevoke}
          />
        </div>
      </div>
    </div>
  );
}
