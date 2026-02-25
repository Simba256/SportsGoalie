import { Metadata } from 'next';
import { ChatInterface } from '@/components/admin/chat-interface';
import { SessionStatsPanel } from '@/components/admin/session-stats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bot, MessageCircle, Zap, Shield, Info } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Project Assistant | Admin',
  description: 'Your AI assistant for the SportsGoalie platform',
};

export default function ProjectAssistantPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Project Assistant</h1>
        <p className="text-muted-foreground">
          Your AI helper for understanding the platform and tracking progress
        </p>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Ask me anything about what the platform can do, how to use different features,
          or check on the project progress. I&apos;m here to help!
        </AlertDescription>
      </Alert>

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChatInterface />
        </div>

        {/* Sidebar - Sessions & Capabilities */}
        <div className="space-y-4">
          {/* Development Sessions */}
          <SessionStatsPanel />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5" />
                What I Can Help With
              </CardTitle>
              <CardDescription>Just ask!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MessageCircle className="h-4 w-4 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium">Platform Features</p>
                  <p className="text-muted-foreground text-xs">
                    What you can do and where to find things
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MessageCircle className="h-4 w-4 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium">Project Progress</p>
                  <p className="text-muted-foreground text-xs">
                    What&apos;s been built and what&apos;s coming next
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MessageCircle className="h-4 w-4 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium">Navigation Help</p>
                  <p className="text-muted-foreground text-xs">
                    Find the right page for what you need
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MessageCircle className="h-4 w-4 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium">How-To Guides</p>
                  <p className="text-muted-foreground text-xs">
                    Step-by-step help for common tasks
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Ask &quot;What can I do?&quot; for a quick overview</p>
              <p>• Ask &quot;Where do I...?&quot; to find pages</p>
              <p>• Ask &quot;How is progress?&quot; for updates</p>
              <p>• Be specific for better answers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Private & Secure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Only admins can access this assistant. Your conversations are private
                and not stored.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm">Try Asking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-muted-foreground">
              <p className="italic">&quot;What can I do as an admin?&quot;</p>
              <p className="italic">&quot;How do I invite a new coach?&quot;</p>
              <p className="italic">&quot;Where can I see student progress?&quot;</p>
              <p className="italic">&quot;What features are ready?&quot;</p>
              <p className="italic">&quot;How is the project going?&quot;</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
