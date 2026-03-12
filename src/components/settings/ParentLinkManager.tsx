'use client';

import { useState, useEffect } from 'react';
import { User, LinkedParentSummary } from '@/types';
import { parentLinkService } from '@/lib/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Users,
  Link2,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  UserMinus,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface ParentLinkManagerProps {
  user: User;
}

export function ParentLinkManager({ user }: ParentLinkManagerProps) {
  const [linkCode, setLinkCode] = useState<string | null>(user.parentLinkCode || null);
  const [linkCodeExpiry, setLinkCodeExpiry] = useState<Date | null>(
    user.parentLinkCodeExpiry ? user.parentLinkCodeExpiry.toDate() : null
  );
  const [linkedParents, setLinkedParents] = useState<LinkedParentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [revokingLink, setRevokingLink] = useState<string | null>(null);
  const [codeCopied, setCodyCopied] = useState(false);

  const loadLinkedParents = async () => {
    try {
      setLoading(true);
      const result = await parentLinkService.getLinkedParents(user.id);
      if (result.success && result.data) {
        setLinkedParents(result.data);
      }
    } catch (error) {
      console.error('Failed to load linked parents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLinkedParents();
  }, [user.id]);

  const handleGenerateCode = async () => {
    try {
      setGeneratingCode(true);
      const result = await parentLinkService.generateParentLinkCode(user.id);

      if (result.success && result.data) {
        setLinkCode(result.data.code);
        setLinkCodeExpiry(result.data.expiresAt);
        toast.success('Link code generated successfully');
      } else {
        toast.error(result.error?.message || 'Failed to generate link code');
      }
    } catch (error) {
      toast.error('Failed to generate link code');
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleRegenerateCode = async () => {
    try {
      setGeneratingCode(true);
      const result = await parentLinkService.regenerateParentLinkCode(user.id);

      if (result.success && result.data) {
        setLinkCode(result.data.code);
        setLinkCodeExpiry(result.data.expiresAt);
        toast.success('New link code generated');
      } else {
        toast.error(result.error?.message || 'Failed to regenerate link code');
      }
    } catch (error) {
      toast.error('Failed to regenerate link code');
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleCopyCode = async () => {
    if (!linkCode) return;

    try {
      await navigator.clipboard.writeText(linkCode);
      setCodyCopied(true);
      toast.success('Link code copied to clipboard');
      setTimeout(() => setCodyCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const handleRevokeLink = async (parentId: string) => {
    try {
      setRevokingLink(parentId);

      // Find the link to get its ID
      const linkResult = await parentLinkService.getLink(parentId, user.id);
      if (!linkResult.success || !linkResult.data) {
        toast.error('Link not found');
        return;
      }

      const result = await parentLinkService.revokeLink(linkResult.data.id, user.id);

      if (result.success) {
        toast.success('Parent access revoked');
        loadLinkedParents();
      } else {
        toast.error(result.error?.message || 'Failed to revoke access');
      }
    } catch (error) {
      toast.error('Failed to revoke access');
    } finally {
      setRevokingLink(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isCodeExpired = linkCodeExpiry && new Date() > linkCodeExpiry;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Family Links
        </CardTitle>
        <CardDescription>
          Share a link code with your parent or guardian to let them track your progress
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Link Code Section */}
        <div className="space-y-3">
          <h4 className="font-medium">Parent Link Code</h4>

          {!linkCode ? (
            <div className="flex items-center gap-3">
              <Button onClick={handleGenerateCode} disabled={generatingCode}>
                {generatingCode ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4 mr-2" />
                    Generate Link Code
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground">
                Create a code to share with your parent
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  value={linkCode}
                  readOnly
                  className={`font-mono text-lg tracking-wider ${
                    isCodeExpired ? 'text-muted-foreground line-through' : ''
                  }`}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyCode}
                  disabled={isCodeExpired || false}
                  title="Copy code"
                >
                  {codeCopied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRegenerateCode}
                  disabled={generatingCode}
                  title="Generate new code"
                >
                  {generatingCode ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Expiry info */}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                {isCodeExpired ? (
                  <span className="text-red-500">
                    Expired - generate a new code to share with parents
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Valid until{' '}
                    {linkCodeExpiry?.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Share this code with your parent. They'll enter it in their app to link accounts.
            Codes expire after 7 days for security.
          </p>
        </div>

        {/* Linked Parents Section */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium">Linked Parents</h4>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : linkedParents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No parents linked yet. Generate a code above and share it with your parent.
            </p>
          ) : (
            <div className="space-y-2">
              {linkedParents.map((parent) => (
                <div
                  key={parent.parentId}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={parent.profileImage} alt={parent.displayName} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(parent.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{parent.displayName}</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {parent.relationship}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{parent.email}</span>
                    </div>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={revokingLink === parent.parentId}
                      >
                        {revokingLink === parent.parentId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserMinus className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revoke Parent Access?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {parent.displayName} will no longer be able to view your progress. They
                          can be re-linked later with a new code.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRevokeLink(parent.parentId)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Revoke Access
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}

          {linkedParents.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Linked parents can view your progress, quiz scores, and assessment comparisons.
                They cannot see your personal notes or send messages through the platform.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
