'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import { CoachInvitation } from '@/types/auth';
import { coachInvitationService } from '@/lib/services/coach-invitation.service';
import { InvitationForm } from './components/InvitationForm';
import { InvitationList } from './components/InvitationList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

/**
 * Admin Coach Invitations Management Page
 *
 * Allows admins to:
 * - Invite new coaches via email
 * - View all invitations (pending, accepted, expired, revoked)
 * - Resend or revoke invitations
 */
export default function CoachInvitationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [invitations, setInvitations] = useState<CoachInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Protect admin route
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Load invitations
  useEffect(() => {
    if (user?.role === 'admin') {
      loadInvitations();
    }
  }, [user]);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const data = await coachInvitationService.getAllInvitations();
      setInvitations(data);
    } catch (error) {
      console.error('Failed to load invitations:', error);
      toast.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleInvitationCreated = (invitation: CoachInvitation) => {
    setInvitations(prev => [invitation, ...prev]);
    toast.success(`Invitation sent to ${invitation.email}`);
  };

  const handleResend = async (invitation: CoachInvitation) => {
    try {
      const updated = await coachInvitationService.resendInvitation(invitation.id);
      setInvitations(prev =>
        prev.map(inv => (inv.id === updated.id ? updated : inv))
      );
      toast.success(`Invitation resent to ${invitation.email}`);
    } catch (error) {
      console.error('Failed to resend invitation:', error);
      toast.error('Failed to resend invitation');
    }
  };

  const handleRevoke = async (invitation: CoachInvitation) => {
    if (!user) return;

    try {
      await coachInvitationService.revokeInvitation(invitation.id, user.id);
      setInvitations(prev =>
        prev.map(inv =>
          inv.id === invitation.id ? { ...inv, status: 'revoked', revokedAt: new Date(), revokedBy: user.id } : inv
        )
      );
      toast.success(`Invitation to ${invitation.email} has been revoked`);
    } catch (error) {
      console.error('Failed to revoke invitation:', error);
      toast.error('Failed to revoke invitation');
    }
  };

  // Filter invitations by status
  const filterInvitations = (status?: string) => {
    if (!status || status === 'all') return invitations;
    return invitations.filter(inv => inv.status === status);
  };

  const pendingCount = invitations.filter(inv => inv.status === 'pending').length;
  const acceptedCount = invitations.filter(inv => inv.status === 'accepted').length;
  const expiredCount = invitations.filter(inv => inv.status === 'expired').length;
  const revokedCount = invitations.filter(inv => inv.status === 'revoked').length;

  if (authLoading || (user?.role !== 'admin')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Coach Invitations</h1>
        <p className="text-muted-foreground">
          Invite coaches to join your platform and manage existing invitations
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Invitation Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Invite New Coach</CardTitle>
              <CardDescription>
                Send an invitation email to a new coach
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user && (
                <InvitationForm
                  invitedBy={user.id}
                  invitedByName={user.displayName}
                  onInvitationCreated={handleInvitationCreated}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Invitations List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Invitations</CardTitle>
              <CardDescription>
                View and manage all coach invitations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">
                    All ({invitations.length})
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    Pending ({pendingCount})
                  </TabsTrigger>
                  <TabsTrigger value="accepted">
                    Accepted ({acceptedCount})
                  </TabsTrigger>
                  <TabsTrigger value="expired">
                    Expired ({expiredCount})
                  </TabsTrigger>
                  <TabsTrigger value="revoked">
                    Revoked ({revokedCount})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                  <InvitationList
                    invitations={filterInvitations('all')}
                    loading={loading}
                    onResend={handleResend}
                    onRevoke={handleRevoke}
                  />
                </TabsContent>

                <TabsContent value="pending" className="mt-6">
                  <InvitationList
                    invitations={filterInvitations('pending')}
                    loading={loading}
                    onResend={handleResend}
                    onRevoke={handleRevoke}
                  />
                </TabsContent>

                <TabsContent value="accepted" className="mt-6">
                  <InvitationList
                    invitations={filterInvitations('accepted')}
                    loading={loading}
                    onResend={handleResend}
                    onRevoke={handleRevoke}
                  />
                </TabsContent>

                <TabsContent value="expired" className="mt-6">
                  <InvitationList
                    invitations={filterInvitations('expired')}
                    loading={loading}
                    onResend={handleResend}
                    onRevoke={handleRevoke}
                  />
                </TabsContent>

                <TabsContent value="revoked" className="mt-6">
                  <InvitationList
                    invitations={filterInvitations('revoked')}
                    loading={loading}
                    onResend={handleResend}
                    onRevoke={handleRevoke}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
