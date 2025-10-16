'use client';

import React, { useState } from 'react';
import { X, Send, Loader2, Video } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MultiFileUpload, UploadedFile } from './MultiFileUpload';
import { messageService } from '@/lib/database/services/message.service';
import { CreateMessageInput } from '@/types/message';
import { toast } from 'sonner';

interface VideoFeedbackComposerProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  adminUserId: string;
  videoUrl: string;
  videoReviewId?: string;
  onMessageSent?: () => void;
}

export const VideoFeedbackComposer: React.FC<VideoFeedbackComposerProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  adminUserId,
  videoUrl,
  videoReviewId,
  onMessageSent,
}) => {
  const [subject, setSubject] = useState('Video Review Feedback');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isSending, setIsSending] = useState(false);

  const handleClose = () => {
    if (isSending) return;
    setSubject('Video Review Feedback');
    setMessage('');
    setFiles([]);
    onClose();
  };

  const handleSend = async () => {
    // Validation
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    // Check if any files are still uploading
    const stillUploading = files.some(f => f.uploading);
    if (stillUploading) {
      toast.error('Please wait for all files to finish uploading');
      return;
    }

    // Check if any files have errors
    const hasErrors = files.some(f => f.error);
    if (hasErrors) {
      toast.error('Please remove files with errors before sending');
      return;
    }

    setIsSending(true);

    try {
      // Prepare attachments
      const attachments = files
        .filter(f => f.url) // Only include successfully uploaded files
        .map(f => ({
          type: f.type,
          url: f.url!,
          fileName: f.file.name,
          fileSize: f.file.size,
          mimeType: f.file.type,
        }));

      // Create message input
      const input: CreateMessageInput = {
        toUserId: studentId,
        subject: subject.trim(),
        message: message.trim(),
        type: 'video_review',
        relatedVideoUrl: videoUrl,
        relatedVideoId: videoReviewId,
        attachments,
      };

      // Send message
      const result = await messageService.createMessage(adminUserId, input);

      if (result.success) {
        toast.success('Video feedback sent successfully');
        handleClose();
        onMessageSent?.();
      } else {
        toast.error(result.error || 'Failed to send feedback');
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast.error('Failed to send feedback');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Video Review Feedback to {studentName}</DialogTitle>
          <DialogDescription>
            Provide detailed feedback on the submitted video with optional reference materials
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Student Video Preview */}
          <div className="space-y-2">
            <Label>Student's Video</Label>
            <div className="relative rounded-lg overflow-hidden bg-black">
              <video
                src={videoUrl}
                controls
                className="w-full max-h-64"
                preload="metadata"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This is the video you're providing feedback on
            </p>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Enter feedback subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSending}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {subject.length}/200 characters
            </p>
          </div>

          {/* Feedback Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Feedback</Label>
            <Textarea
              id="message"
              placeholder="Enter your detailed feedback on the video submission..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSending}
              rows={8}
              maxLength={10000}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/10,000 characters
            </p>
          </div>

          {/* Reference Materials */}
          <div className="space-y-2">
            <Label>Reference Materials (Optional)</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Attach images, videos, or documents to help explain your feedback
            </p>
            <MultiFileUpload
              maxFiles={3}
              userId={adminUserId}
              onFilesChange={setFiles}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending || !subject.trim() || !message.trim()}
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Feedback...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Feedback
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
