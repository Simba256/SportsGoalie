'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  className?: string;
}

interface ChatStats {
  documentsLoaded: number;
  contextSize: number;
  inputTokens?: number;
  outputTokens?: number;
}

export function ChatInterface({ className }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ChatStats | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Get Firebase auth token
      const { auth } = await import('@/lib/firebase/config');
      const user = auth.currentUser;

      if (!user) {
        throw new Error('Not authenticated');
      }

      const token = await user.getIdToken();

      // Call API
      const response = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          useFullContext: false, // Use smart context by default
        }),
      });

      if (!response.ok) {
        if (response.status === 529 || response.status >= 500) {
          // Redirect to Claude.ai project as backup
          const backupUrl = 'https://claude.ai/project/019c8cce-1b24-7678-b4dc-cbb835c1c84d';

          // Try to open backup in new tab
          try {
            window.open(backupUrl, '_blank');
          } catch (e) {
            console.error('Failed to open backup URL:', e);
          }

          // Add error message to chat with the user's question included
          const errorMessage: Message = {
            role: 'assistant',
            content: `Sorry, the assistant is temporarily unavailable due to high demand.

I've tried to open our backup assistant in a new tab. If it didn't open, [click here to open it](${backupUrl}).

**Your question was:** "${userMessage.content}"

Please copy your question above and paste it in the backup assistant.`,
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, errorMessage]);
          setLoading(false);
          inputRef.current?.focus();
          return;
        }
        const error = await response.json();
        throw new Error(error.message || 'Failed to get response');
      }

      const data = await response.json();

      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update stats
      if (data.contextStats || data.usage) {
        setStats({
          documentsLoaded: data.contextStats?.documentsLoaded || 0,
          contextSize: data.contextStats?.contextSize || 0,
          inputTokens: data.usage?.inputTokens,
          outputTokens: data.usage?.outputTokens,
        });
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    'What can I do as an admin?',
    'How is the project progressing?',
    'What pages are available for me?',
    'How do I manage students and coaches?',
    'What features are ready to use?',
  ];

  const askSuggestedQuestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Project Assistant</CardTitle>
              <CardDescription>
                Ask about features, progress, or how to use the platform
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chat Messages */}
        <ScrollArea ref={scrollAreaRef} className="h-[500px] pr-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Welcome to Project Assistant</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  I can help you understand what the platform can do, check on progress,
                  and guide you to the right pages. Ask me anything!
                </p>
              </div>
              <div className="space-y-2 w-full max-w-md">
                <p className="text-xs text-muted-foreground font-medium">SUGGESTED QUESTIONS:</p>
                {suggestedQuestions.map((question, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2 px-3"
                    onClick={() => askSuggestedQuestion(question)}
                  >
                    <span className="text-xs">{question}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <MessageBubble key={index} message={message} />
              ))}
              {loading && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10 mt-1">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-muted">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about the platform..."
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            size="icon"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="p-2 rounded-full bg-primary/10 mt-1">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}

      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div
          className={`inline-block text-left ${
            isUser
              ? 'bg-primary text-primary-foreground px-4 py-3 rounded-lg'
              : 'bg-muted px-4 py-3 rounded-lg'
          }`}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1 px-1">
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>

      {isUser && (
        <div className="p-2 rounded-full bg-primary/10 mt-1">
          <User className="h-4 w-4 text-primary" />
        </div>
      )}
    </div>
  );
}
