'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  Mail,
  User,
  Calendar,
  Filter,
  Search,
  Eye,
  FileText,
  Image as ImageIcon,
  Video,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminRoute } from '@/components/auth/protected-route';
import { messageService } from '@/lib/database/services/message.service';
import { userService } from '@/lib/database/services/user.service';
import { useAuth } from '@/lib/auth/context';
import { Message, MessageType } from '@/types/message';
import { User as UserType } from '@/types';
import { toast } from 'sonner';

export default function AdminMessagesPage() {
  return (
    <AdminRoute>
      <MessagesContent />
    </AdminRoute>
  );
}

function MessagesContent() {
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<Record<string, UserType>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<MessageType | 'all'>('all');
  const [filterRead, setFilterRead] = useState<'all' | 'read' | 'unread'>('all');

  const fetchMessages = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // Fetch messages sent by admin
      const result = await messageService.getAdminSentMessages(currentUser.id, { limit: 100 });

      if (result.success && result.data) {
        setMessages(result.data.items);

        // Fetch user details for all recipients
        const userIds = [...new Set(result.data.items.map(m => m.toUserId))];
        const userPromises = userIds.map(id => userService.getUser(id));
        const userResults = await Promise.all(userPromises);

        const usersMap: Record<string, UserType> = {};
        userResults.forEach((res, idx) => {
          if (res.success && res.data) {
            usersMap[userIds[idx]] = res.data;
          }
        });

        setUsers(usersMap);
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
  }, [currentUser]);

  // Filter messages based on search and filters
  const filteredMessages = messages.filter(message => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSubject = message.subject.toLowerCase().includes(query);
      const matchesMessage = message.message.toLowerCase().includes(query);
      const matchesRecipient = users[message.toUserId]?.displayName?.toLowerCase().includes(query);

      if (!matchesSubject && !matchesMessage && !matchesRecipient) {
        return false;
      }
    }

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
    read: messages.filter(m => m.isRead).length,
    general: messages.filter(m => m.type === 'general').length,
    instruction: messages.filter(m => m.type === 'instruction').length,
    feedback: messages.filter(m => m.type === 'feedback').length,
    videoReview: messages.filter(m => m.type === 'video_review').length,
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
          <h1 className="text-3xl font-bold">Sent Messages</h1>
          <p className="text-muted-foreground">
            View and manage messages sent to students
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
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
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.unread / stats.total) * 100) : 0}% of total
              </p>
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
              <CardTitle className="text-sm font-medium">General Messages</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.general}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

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
            <CardTitle>Messages ({filteredMessages.length})</CardTitle>
            <CardDescription>
              {filterType !== 'all' && `Showing ${filterType} messages`}
              {filterRead !== 'all' && ` • ${filterRead}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredMessages.length > 0 ? (
              <div className="space-y-4">
                {filteredMessages.map((message) => {
                  const recipient = users[message.toUserId];

                  return (
                    <div
                      key={message.id}
                      className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                        !message.isRead ? 'border-primary/50 bg-primary/5' : ''
                      }`}
                      onClick={() => router.push(`/admin/users/${message.toUserId}?tab=messages`)}
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
                                Unread
                              </Badge>
                            )}
                          </div>

                          {/* Recipient */}
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>
                              To: {recipient?.displayName || 'Unknown User'}
                            </span>
                          </div>

                          {/* Message Preview */}
                          <p className="text-sm text-muted-foreground">
                            {message.message.length > 200
                              ? message.message.substring(0, 200) + '...'
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
                            <Calendar className="h-3 w-3" />
                            <span>Sent {new Date(message.createdAt).toLocaleString()}</span>
                            {message.readAt && (
                              <span>• Read {new Date(message.readAt).toLocaleString()}</span>
                            )}
                          </div>
                        </div>

                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No messages found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || filterType !== 'all' || filterRead !== 'all'
                    ? 'Try adjusting your filters'
                    : 'You haven\'t sent any messages yet'}
                </p>
                {!searchQuery && filterType === 'all' && filterRead === 'all' && (
                  <Link href="/admin/users">
                    <Button>
                      <User className="mr-2 h-4 w-4" />
                      Go to Users
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
