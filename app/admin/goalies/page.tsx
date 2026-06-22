'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import { SkeletonDarkPage } from '@/components/ui/skeletons';
import { UserPlus, CheckCircle, Clock, XCircle, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { invitationService } from '@/lib/services/invitation.service';
import { Invitation } from '@/types/invitation';
import { GoalieInviteForm } from './components/GoalieInviteForm';
import { GoalieInviteList } from './components/GoalieInviteList';

const BLUE = '#37b5ff';
const RED = '#f87171';
const card = { background: 'rgba(2,18,44,0.85)', border: '1px solid rgba(55,181,255,0.14)', borderRadius: '16px' } as const;

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'expired', label: 'Expired' },
  { id: 'revoked', label: 'Revoked' },
];

export default function GoalieInvitationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'admin') loadInvitations();
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

  const handleDelete = (deleted: Invitation) => {
    setInvitations(prev => prev.filter(i => i.id !== deleted.id));
  };

  const filterInvitations = (status: string) => {
    if (status === 'all') return invitations;
    return invitations.filter(i => i.status === status);
  };

  const pendingCount = invitations.filter(i => i.status === 'pending').length;
  const acceptedCount = invitations.filter(i => i.status === 'accepted').length;
  const expiredCount = invitations.filter(i => i.status === 'expired').length;
  const revokedCount = invitations.filter(i => i.status === 'revoked').length;

  if (authLoading || user?.role !== 'admin') {
    return <div style={{ padding: '48px' }}><SkeletonDarkPage /></div>;
  }

  return (
    <>
      <style>{`
        .gi-tab { transition: all 0.2s !important; }
        .gi-tab:hover { background: rgba(55,181,255,0.06) !important; }
        @media (max-width: 768px) { .gi-layout { grid-template-columns: 1fr !important; } .gi-stats { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Header */}
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '4px' }}>Goalie Invitations</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px' }}>Invite goalies to join your platform and assign them to a coach</p>
        </div>

        {/* Stat Cards */}
        <div className="gi-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[
            { label: 'Total', value: invitations.length, icon: Mail, color: BLUE },
            { label: 'Pending', value: pendingCount, icon: Clock, color: '#fbbf24' },
            { label: 'Accepted', value: acceptedCount, icon: CheckCircle, color: '#22c55e' },
            { label: 'Revoked', value: revokedCount, icon: XCircle, color: RED },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={{ position: 'relative', ...card, padding: '16px', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${color}66, transparent)` }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', fontWeight: 600 }}>{label}</p>
                <Icon size={14} color={`${color}88`} />
              </div>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: '26px', lineHeight: 1 }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Main Layout */}
        <div className="gi-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'start' }}>

          {/* Invite Form */}
          <div style={{ position: 'relative', ...card, padding: '20px', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${BLUE}, transparent)` }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <UserPlus size={16} color={RED} />
              <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>Invite New Goalie</h2>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginBottom: '18px' }}>Send an invitation email and assign a coach</p>
            {user && (
              <GoalieInviteForm
                invitedBy={user.id}
                invitedByName={user.displayName ?? 'Admin'}
                onInvitationCreated={handleInvitationCreated}
              />
            )}
          </div>

          {/* Invitations List */}
          <div style={{ position: 'relative', ...card, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${BLUE}, transparent)` }} />

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(55,181,255,0.1)', overflowX: 'auto' }}>
              {TABS.map(tab => {
                const active = activeTab === tab.id;
                const count = tab.id === 'all' ? invitations.length : tab.id === 'pending' ? pendingCount : tab.id === 'accepted' ? acceptedCount : tab.id === 'expired' ? expiredCount : revokedCount;
                return (
                  <button key={tab.id} className={!active ? 'gi-tab' : ''} onClick={() => setActiveTab(tab.id)}
                    style={{ flex: 1, minWidth: '80px', padding: '13px 6px', background: active ? 'rgba(55,181,255,0.08)' : 'transparent', border: 'none', borderBottom: active ? `2px solid ${BLUE}` : '2px solid transparent', color: active ? BLUE : 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {tab.label} ({count})
                  </button>
                );
              })}
            </div>

            <div style={{ padding: '20px' }}>
              <GoalieInviteList
                invitations={filterInvitations(activeTab)}
                loading={loading}
                onResend={handleResend}
                onRevoke={handleRevoke}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
