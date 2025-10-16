'use client';

import React, { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MultiFileUpload, UploadedFile } from './MultiFileUpload';
import { messageService } from '@/lib/database/services/message.service';
import { MessageType, CreateMessageInput } from '@/types/message';
import { toast } from 'sonner';

interface MessageComposerProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  adminUserId: string;
  onMessageSent?: () => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  adminUserId,
  onMessageSent,
}) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('general');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isSending, setIsSending] = useState(false);

  const handleClose = () => {
    if (isSending) return;
    setSubject('');
    setMessage('');
    setMessageType('general');
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
        type: messageType,
        attachments,
      };

      // Send message
      const result = await messageService.createMessage(adminUserId, input);

      if (result.success) {
        toast.success('Message sent successfully');
        handleClose();
        onMessageSent?.();
      } else {
        toast.error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Message to {studentName}</DialogTitle>
          <DialogDescription>
            Compose a message with optional attachments (images, videos, or documents)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Message Type */}
          <div className="space-y-2">
            <Label htmlFor="message-type">Message Type</Label>
            <Select
              value={messageType}
              onValueChange={(value) => setMessageType(value as MessageType)}
              disabled={isSending}
            >
              <SelectTrigger id="message-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Message</SelectItem>
                <SelectItem value="instruction">Instruction</SelectItem>
                <SelectItem value="feedback">Feedback</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {messageType === 'general' && 'General communication with the student'}
              {messageType === 'instruction' && 'Specific instructions or guidance'}
              {messageType === 'feedback' && 'General feedback (not linked to video review)'}
            </p>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Enter message subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSending}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {subject.length}/200 characters
            </p>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message..."
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

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Attachments (Optional)</Label>
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
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
