'use client';

import React from 'react';
import { CoachInvitation } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Mail,
  RefreshCw,
  XCircle,
  CheckCircle,
  Clock,
  Ban,
  Loader2,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface InvitationListProps {
  invitations: CoachInvitation[];
  loading: boolean;
  onResend: (invitation: CoachInvitation) => void;
  onRevoke: (invitation: CoachInvitation) => void;
}

export function InvitationList({
  invitations,
  loading,
  onResend,
  onRevoke,
}: InvitationListProps) {
  const getStatusBadge = (status: CoachInvitation['status']) => {
    const variants = {
      pending: { variant: 'default' as const, icon: Clock, label: 'Pending' },
      accepted: { variant: 'default' as const, icon: CheckCircle, label: 'Accepted', className: 'bg-green-500 hover:bg-green-600' },
      expired: { variant: 'secondary' as const, icon: XCircle, label: 'Expired' },
      revoked: { variant: 'destructive' as const, icon: Ban, label: 'Revoked' },
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const copyInvitationLink = (invitation: CoachInvitation) => {
    const baseUrl = window.location.origin;
    const inviteUrl = `${baseUrl}/auth/accept-invite?token=${invitation.token}`;

    navigator.clipboard.writeText(inviteUrl);
    toast.success('Invitation link copied to clipboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No invitations found</h3>
        <p className="text-muted-foreground">
          Send your first coach invitation to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invitations.map(invitation => (
        <div
          key={invitation.id}
          className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold">{invitation.email}</h4>
                {getStatusBadge(invitation.status)}
              </div>

              {/* Metadata */}
              {invitation.metadata && (
                <div className="space-y-1 text-sm text-muted-foreground mb-3">
                  {(invitation.metadata.firstName || invitation.metadata.lastName) && (
                    <p>
                      Name: {invitation.metadata.firstName} {invitation.metadata.lastName}
                    </p>
                  )}
                  {invitation.metadata.organizationName && (
                    <p>Organization: {invitation.metadata.organizationName}</p>
                  )}
                  {invitation.metadata.customMessage && (
                    <p className="italic">"{invitation.metadata.customMessage}"</p>
                  )}
                </div>
              )}

              {/* Details */}
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="font-medium">Invited by:</span> {invitation.invitedByName}
                </div>
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {formatDistanceToNow(invitation.createdAt, { addSuffix: true })}
                </div>
                <div>
                  <span className="font-medium">Expires:</span>{' '}
                  {formatDistanceToNow(invitation.expiresAt, { addSuffix: true })}
                </div>
                {invitation.acceptedAt && (
                  <div>
                    <span className="font-medium">Accepted:</span>{' '}
                    {formatDistanceToNow(invitation.acceptedAt, { addSuffix: true })}
                  </div>
                )}
                {invitation.revokedAt && (
                  <div>
                    <span className="font-medium">Revoked:</span>{' '}
                    {formatDistanceToNow(invitation.revokedAt, { addSuffix: true })}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 ml-4">
              {invitation.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyInvitationLink(invitation)}
                    title="Copy invitation link"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onResend(invitation)}
                    title="Resend invitation"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        title="Revoke invitation"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revoke Invitation</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to revoke the invitation to{' '}
                          <strong>{invitation.email}</strong>? This action cannot be
                          undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onRevoke(invitation)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Revoke
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}

              {(invitation.status === 'expired' || invitation.status === 'revoked') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onResend(invitation)}
                  title="Resend invitation"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resend
                </Button>
              )}

              {invitation.status === 'accepted' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyInvitationLink(invitation)}
                  disabled
                  title="Invitation already accepted"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
