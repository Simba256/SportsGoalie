'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MessageSquare,
  Calendar,
  Video,
  FileText,
  Image as ImageIcon,
  Download,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth/context';
import { messageService } from '@/lib/database/services/message.service';
import { Message, MessageType } from '@/types/message';
import { toast } from 'sonner';

export default function MessageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const messageId = params.id as string;

  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchMessage = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const result = await messageService.getMessage(messageId);

      if (result.success && result.data) {
        setMessage(result.data);

        // Mark as read if not already read
        if (!result.data.isRead) {
          await messageService.markAsRead(messageId);
        }
      } else {
        toast.error('Message not found');
        router.push('/messages');
      }
    } catch (error) {
      console.error('Error fetching message:', error);
      toast.error('Failed to load message');
      router.push('/messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessage();
  }, [messageId, user]);

  const getTypeIcon = (type: MessageType) => {
    switch (type) {
      case 'general':
        return <MessageSquare className="h-5 w-5" />;
      case 'instruction':
        return <FileText className="h-5 w-5" />;
      case 'feedback':
        return <MessageSquare className="h-5 w-5" />;
      case 'video_review':
        return <Video className="h-5 w-5" />;
      default:
        return <MessageSquare className="h-5 w-5" />;
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please log in to view this message</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading message...</div>
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Message not found</h3>
          <Link href="/messages">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Messages
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/messages">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Messages
            </Button>
          </Link>
        </div>

        {/* Message Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3 mb-4">
              {getTypeIcon(message.type)}
              <div className="flex-1">
                <CardTitle className="text-2xl">{message.subject}</CardTitle>
              </div>
              <Badge variant={getTypeBadgeVariant(message.type)}>
                {message.type.replace('_', ' ')}
              </Badge>
            </div>
            <CardDescription>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Received {new Date(message.createdAt).toLocaleString()}</span>
                </div>
                {message.readAt && (
                  <span className="text-muted-foreground">
                    • Read {new Date(message.readAt).toLocaleString()}
                  </span>
                )}
              </div>
            </CardDescription>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6">
            {/* Message Content */}
            <div className="prose prose-sm max-w-none mb-6">
              <p className="whitespace-pre-wrap text-base leading-relaxed">
                {message.message}
              </p>
            </div>

            {/* Related Video (for video_review type) */}
            {message.type === 'video_review' && message.relatedVideoUrl && (
              <>
                <Separator className="my-6" />
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Video className="h-5 w-5" />
                    <span>Your Video Submission</span>
                  </h3>
                  <div className="bg-black rounded-lg overflow-hidden">
                    <video
                      src={message.relatedVideoUrl}
                      controls
                      className="w-full max-h-96"
                      preload="metadata"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <>
                <Separator className="my-6" />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Attachments ({message.attachments.length})
                  </h3>

                  {/* Images */}
                  {message.attachments.filter(a => a.type === 'image').length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium flex items-center space-x-2">
                        <ImageIcon className="h-4 w-4" />
                        <span>Images</span>
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {message.attachments
                          .filter(a => a.type === 'image')
                          .map((attachment, idx) => (
                            <div
                              key={idx}
                              className="relative group cursor-pointer rounded-lg overflow-hidden border"
                              onClick={() => setSelectedImage(attachment.url)}
                            >
                              <img
                                src={attachment.url}
                                alt={attachment.fileName}
                                className="w-full h-48 object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <ExternalLink className="h-6 w-6 text-white" />
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent p-2">
                                <p className="text-xs text-white truncate">
                                  {attachment.fileName}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Videos */}
                  {message.attachments.filter(a => a.type === 'video').length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium flex items-center space-x-2">
                        <Video className="h-4 w-4" />
                        <span>Videos</span>
                      </h4>
                      <div className="space-y-3">
                        {message.attachments
                          .filter(a => a.type === 'video')
                          .map((attachment, idx) => (
                            <div key={idx} className="space-y-2">
                              <p className="text-sm font-medium">{attachment.fileName}</p>
                              <div className="bg-black rounded-lg overflow-hidden">
                                <video
                                  src={attachment.url}
                                  controls
                                  className="w-full max-h-96"
                                  preload="metadata"
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Documents */}
                  {message.attachments.filter(a => a.type === 'document').length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>Documents</span>
                      </h4>
                      <div className="space-y-2">
                        {message.attachments
                          .filter(a => a.type === 'document')
                          .map((attachment, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                            >
                              <div className="flex items-center space-x-3">
                                <FileText className="h-8 w-8 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">{attachment.fileName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(attachment.fileSize)}
                                  </p>
                                </div>
                              </div>
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                              >
                                <Button variant="outline" size="sm">
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </Button>
                              </a>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Image Lightbox */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-7xl max-h-full">
              <img
                src={selectedImage}
                alt="Full size"
                className="max-w-full max-h-[90vh] object-contain"
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-4 right-4"
                onClick={() => setSelectedImage(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
