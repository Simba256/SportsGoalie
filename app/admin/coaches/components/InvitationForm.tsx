'use client';

import React, { useState } from 'react';
import { CoachInvitation, CreateInvitationData } from '@/types/auth';
import { coachInvitationService } from '@/lib/services/coach-invitation.service';
import { emailService } from '@/lib/services/email.service';
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
import { toast } from 'sonner';
import { Loader2, Mail } from 'lucide-react';

interface InvitationFormProps {
  invitedBy: string;
  invitedByName: string;
  onInvitationCreated: (invitation: CoachInvitation) => void;
}

export function InvitationForm({
  invitedBy,
  invitedByName,
  onInvitationCreated,
}: InvitationFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    organizationName: '',
    customMessage: '',
    expiresInDays: '7',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);

      const invitationData: CreateInvitationData = {
        email: formData.email,
        invitedBy,
        invitedByName,
        expiresInDays: parseInt(formData.expiresInDays),
        metadata: {
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined,
          organizationName: formData.organizationName || undefined,
          customMessage: formData.customMessage || undefined,
        },
      };

      const invitation = await coachInvitationService.createInvitation(invitationData);

      // Send invitation email
      const baseUrl = window.location.origin;
      const inviteUrl = `${baseUrl}/auth/accept-invite?token=${invitation.token}`;

      try {
        await emailService.sendCoachInvitation({ invitation, inviteUrl });
      } catch (emailError) {
        console.error('Failed to send invitation email:', emailError);
        // Don't fail the entire operation if email fails
        toast.warning('Invitation created but email failed to send', {
          description: 'You can copy the invitation link manually',
        });
      }

      onInvitationCreated(invitation);

      // Reset form
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        organizationName: '',
        customMessage: '',
        expiresInDays: '7',
      });

      toast.success('Invitation created successfully!', {
        description: `An invitation has been sent to ${invitation.email}`,
      });
    } catch (error: any) {
      console.error('Failed to create invitation:', error);
      toast.error('Failed to create invitation', {
        description: error.message || 'An error occurred while creating the invitation',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">
          Email Address <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="coach@example.com"
            value={formData.email}
            onChange={e => handleChange('email', e.target.value)}
            className="pl-10"
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* First Name */}
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name (Optional)</Label>
        <Input
          id="firstName"
          type="text"
          placeholder="John"
          value={formData.firstName}
          onChange={e => handleChange('firstName', e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Last Name */}
      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name (Optional)</Label>
        <Input
          id="lastName"
          type="text"
          placeholder="Doe"
          value={formData.lastName}
          onChange={e => handleChange('lastName', e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Organization */}
      <div className="space-y-2">
        <Label htmlFor="organizationName">Organization (Optional)</Label>
        <Input
          id="organizationName"
          type="text"
          placeholder="Hockey Academy"
          value={formData.organizationName}
          onChange={e => handleChange('organizationName', e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Expiry */}
      <div className="space-y-2">
        <Label htmlFor="expiresInDays">Invitation Expires In</Label>
        <Select
          value={formData.expiresInDays}
          onValueChange={value => handleChange('expiresInDays', value)}
          disabled={loading}
        >
          <SelectTrigger id="expiresInDays">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 Day</SelectItem>
            <SelectItem value="3">3 Days</SelectItem>
            <SelectItem value="7">7 Days (Recommended)</SelectItem>
            <SelectItem value="14">14 Days</SelectItem>
            <SelectItem value="30">30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Custom Message */}
      <div className="space-y-2">
        <Label htmlFor="customMessage">Custom Message (Optional)</Label>
        <Textarea
          id="customMessage"
          placeholder="Add a personal message for the coach..."
          value={formData.customMessage}
          onChange={e => handleChange('customMessage', e.target.value)}
          rows={3}
          disabled={loading}
        />
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending Invitation...
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" />
            Send Invitation
          </>
        )}
      </Button>
    </form>
  );
}
