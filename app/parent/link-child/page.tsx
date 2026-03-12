'use client';

import { useAuth } from '@/lib/auth/context';
import { LinkChildForm } from '@/components/parent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, ChevronLeft, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { redirect, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function LinkChildPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    redirect('/auth/login');
  }

  if (user.role !== 'parent') {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            This page is only available for parent accounts.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleLinkSuccess = (childName: string) => {
    toast.success(`Successfully linked to ${childName}!`);
    router.push('/parent');
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" size="sm" asChild>
          <Link href="/parent" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold">Link to Your Goalie</h1>
          <p className="text-muted-foreground mt-1">
            Connect your account to your goalie to track their progress
          </p>
        </div>

        {/* Link Form */}
        <LinkChildForm parentId={user.id} onLinkSuccess={handleLinkSuccess} />

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HelpCircle className="h-4 w-4" />
              How to Get a Link Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <ol className="list-decimal list-inside space-y-2">
              <li>Ask your goalie to log into their Smarter Goalie account</li>
              <li>Have them go to <strong>Profile Settings</strong></li>
              <li>Look for the <strong>Family Links</strong> section</li>
              <li>Click <strong>Generate Link Code</strong></li>
              <li>Share the 8-character code (XXXX-XXXX) with you</li>
            </ol>
            <p className="pt-2 border-t">
              Link codes expire after 7 days for security. If the code has expired, your goalie
              can generate a new one.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
