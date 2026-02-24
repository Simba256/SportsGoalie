import { Metadata } from 'next';
import { ChatInterface } from '@/components/admin/chat-interface';
import { SessionStatsPanel } from '@/components/admin/session-stats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bot, FileText, Zap, Shield, Info } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Project Assistant | Admin',
  description: 'AI-powered project assistant with full project knowledge',
};

export default function ProjectAssistantPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Project Assistant</h1>
        <p className="text-muted-foreground">
          AI-powered chatbot with comprehensive knowledge of the SportsGoalie project
        </p>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This assistant has access to all project documentation including features, routes,
          progress updates, technical details, and architectural decisions. Ask specific questions
          for the best results.
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
                Capabilities
              </CardTitle>
              <CardDescription>What the assistant knows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium">Project Documentation</p>
                  <p className="text-muted-foreground text-xs">
                    Features, routes, progress, tech stack
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium">Development History</p>
                  <p className="text-muted-foreground text-xs">
                    Phase summaries, decisions, sessions
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium">Technical Details</p>
                  <p className="text-muted-foreground text-xs">
                    Database schema, services, security
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium">Route Information</p>
                  <p className="text-muted-foreground text-xs">
                    All admin, coach, student, public routes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Tips for Best Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Ask specific questions about features or routes</p>
              <p>• Request file paths or code locations</p>
              <p>• Ask about progress or development status</p>
              <p>• Inquire about technical decisions made</p>
              <p>• Request explanations of how features work</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Admin Only
              </CardTitle>
              <CardDescription>Security & Privacy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                This assistant is only accessible to admin users. All conversations are private
                and not stored permanently.
              </p>
              <p className="text-xs pt-2">
                Powered by Claude Sonnet 4 with smart context loading for optimal performance.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm">Example Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-muted-foreground">
              <p className="italic">"What is the current project status?"</p>
              <p className="italic">"How does coach curriculum builder work?"</p>
              <p className="italic">"What admin routes are available?"</p>
              <p className="italic">"Show me the authentication flow"</p>
              <p className="italic">"What's the database schema?"</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
