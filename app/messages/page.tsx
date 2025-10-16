'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  Mail,
  Clock,
  Video,
  FileText,
  Image as ImageIcon,
  Eye,
  Filter,
  Inbox,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/lib/auth/context';
import { messageService } from '@/lib/database/services/message.service';
import { Message, MessageType } from '@/types/message';
import { toast } from 'sonner';

export default function MessagesPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<MessageType | 'all'>('all');
  const [filterRead, setFilterRead] = useState<'all' | 'read' | 'unread'>('all');

  const fetchMessages = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const result = await messageService.getUserMessages(user.id, { limit: 50 });

      if (result.success && result.data) {
        // Sort by date, newest first, with unread messages at the top
        const sorted = result.data.items.sort((a, b) => {
          // Unread messages first
          if (!a.isRead && b.isRead) return -1;
          if (a.isRead && !b.isRead) return 1;

          // Then by date
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        setMessages(sorted);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [user]);

  // Filter messages
  const filteredMessages = messages.filter(message => {
    // Type filter
    if (filterType !== 'all' && message.type !== filterType) {
      return false;
    }

    // Read/unread filter
    if (filterRead === 'read' && !message.isRead) {
      return false;
    }
    if (filterRead === 'unread' && message.isRead) {
      return false;
    }

    return true;
  });

  // Calculate statistics
  const stats = {
    total: messages.length,
    unread: messages.filter(m => !m.isRead).length,
    videoReview: messages.filter(m => m.type === 'video_review').length,
    instruction: messages.filter(m => m.type === 'instruction').length,
  };

  const getTypeIcon = (type: MessageType) => {
    switch (type) {
      case 'general':
        return <MessageSquare className="h-4 w-4" />;
      case 'instruction':
        return <FileText className="h-4 w-4" />;
      case 'feedback':
        return <Mail className="h-4 w-4" />;
      case 'video_review':
        return <Video className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeBadgeVariant = (type: MessageType) => {
    switch (type) {
      case 'general':
        return 'default';
      case 'instruction':
        return 'secondary';
      case 'feedback':
        return 'outline';
      case 'video_review':
        return 'destructive';
      default:
        return 'default';
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please log in to view your messages</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading messages...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Messages and feedback from your coaches
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <Inbox className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unread}</div>
              {stats.unread > 0 && (
                <p className="text-xs text-destructive font-medium mt-1">
                  You have unread messages
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Video Reviews</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.videoReview}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Instructions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.instruction}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Message Type</label>
                <Select
                  value={filterType}
                  onValueChange={(value) => setFilterType(value as MessageType | 'all')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="instruction">Instruction</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="video_review">Video Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Read Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Read Status</label>
                <Select
                  value={filterRead}
                  onValueChange={(value) => setFilterRead(value as 'all' | 'read' | 'unread')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Messages</SelectItem>
                    <SelectItem value="unread">Unread Only</SelectItem>
                    <SelectItem value="read">Read Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messages List */}
        <Card>
          <CardHeader>
            <CardTitle>Inbox ({filteredMessages.length})</CardTitle>
            <CardDescription>
              {filterType !== 'all' && `Showing ${filterType} messages`}
              {filterRead !== 'all' && ` • ${filterRead}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredMessages.length > 0 ? (
              <div className="space-y-3">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                      !message.isRead ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => router.push(`/messages/${message.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        {/* Header */}
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(message.type)}
                            <h4 className="font-medium">{message.subject}</h4>
                          </div>
                          <Badge variant={getTypeBadgeVariant(message.type)} className="text-xs">
                            {message.type.replace('_', ' ')}
                          </Badge>
                          {!message.isRead && (
                            <Badge variant="default" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>

                        {/* Message Preview */}
                        <p className="text-sm text-muted-foreground">
                          {message.message.length > 150
                            ? message.message.substring(0, 150) + '...'
                            : message.message}
                        </p>

                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                            {message.attachments.some(a => a.type === 'image') && (
                              <div className="flex items-center space-x-1">
                                <ImageIcon className="h-3 w-3" />
                                <span>{message.attachments.filter(a => a.type === 'image').length} image(s)</span>
                              </div>
                            )}
                            {message.attachments.some(a => a.type === 'video') && (
                              <div className="flex items-center space-x-1">
                                <Video className="h-3 w-3" />
                                <span>{message.attachments.filter(a => a.type === 'video').length} video(s)</span>
                              </div>
                            )}
                            {message.attachments.some(a => a.type === 'document') && (
                              <div className="flex items-center space-x-1">
                                <FileText className="h-3 w-3" />
                                <span>{message.attachments.filter(a => a.type === 'document').length} document(s)</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Date */}
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(message.createdAt).toLocaleString()}</span>
                        </div>
                      </div>

                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Inbox className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No messages found</h3>
                <p className="text-muted-foreground">
                  {filterType !== 'all' || filterRead !== 'all'
                    ? 'Try adjusting your filters'
                    : 'You don\'t have any messages yet'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
