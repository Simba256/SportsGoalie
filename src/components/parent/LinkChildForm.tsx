'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link2, Loader2, CheckCircle2, AlertCircle, UserPlus } from 'lucide-react';
import { parentLinkService } from '@/lib/database';
import { ParentRelationship } from '@/types';
import { toast } from 'sonner';

interface LinkChildFormProps {
  parentId: string;
  onLinkSuccess?: (childName: string) => void;
}

export function LinkChildForm({ parentId, onLinkSuccess }: LinkChildFormProps) {
  const [linkCode, setLinkCode] = useState('');
  const [relationship, setRelationship] = useState<ParentRelationship>('parent');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    goalieName?: string;
    expiresAt?: Date;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Format input as user types (XXXX-XXXX)
  const handleCodeChange = (value: string) => {
    // Remove non-alphanumeric characters except hyphen
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');

    // Auto-add hyphen after 4 characters
    if (cleaned.length === 4 && !cleaned.includes('-')) {
      setLinkCode(cleaned + '-');
    } else if (cleaned.length <= 9) {
      setLinkCode(cleaned);
    }

    // Clear previous validation
    setValidationResult(null);
    setError(null);
  };

  // Validate code without linking
  const handleValidateCode = async () => {
    if (linkCode.length < 9) {
      setError('Please enter a complete code (XXXX-XXXX)');
      return;
    }

    setValidating(true);
    setError(null);

    try {
      const result = await parentLinkService.validateLinkCode(linkCode);

      if (result.success && result.data) {
        setValidationResult(result.data);
        if (!result.data.valid) {
          setError('This code is invalid or has expired');
        }
      } else {
        setError(result.error?.message || 'Failed to validate code');
      }
    } catch (err) {
      setError('Failed to validate code. Please try again.');
    } finally {
      setValidating(false);
    }
  };

  // Link to child
  const handleLinkChild = async () => {
    if (!validationResult?.valid) {
      setError('Please validate the code first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await parentLinkService.linkParentToChild(parentId, linkCode, relationship);

      if (result.success && result.data) {
        toast.success(`Successfully linked to ${result.data.childName}`);
        setLinkCode('');
        setValidationResult(null);
        onLinkSuccess?.(result.data.childName);
      } else {
        setError(result.error?.message || 'Failed to link account');
      }
    } catch (err) {
      setError('Failed to link account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Link to Your Goalie
        </CardTitle>
        <CardDescription>
          Enter the link code shared by your goalie to connect your accounts. You can find this
          code in their profile settings.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Link Code Input */}
        <div className="space-y-2">
          <Label htmlFor="linkCode">Link Code</Label>
          <div className="flex gap-2">
            <Input
              id="linkCode"
              placeholder="XXXX-XXXX"
              value={linkCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="font-mono text-lg tracking-wider uppercase"
              maxLength={9}
            />
            <Button
              variant="outline"
              onClick={handleValidateCode}
              disabled={linkCode.length < 9 || validating}
            >
              {validating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Verify'
              )}
            </Button>
          </div>
        </div>

        {/* Validation Result */}
        {validationResult?.valid && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Valid code!</strong> This will link you to{' '}
              <span className="font-semibold">{validationResult.goalieName}</span>
              {validationResult.expiresAt && (
                <span className="text-sm text-green-600 ml-2">
                  (expires {validationResult.expiresAt.toLocaleDateString()})
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Relationship Selection */}
        {validationResult?.valid && (
          <div className="space-y-2">
            <Label htmlFor="relationship">Your Relationship</Label>
            <Select value={relationship} onValueChange={(v) => setRelationship(v as ParentRelationship)}>
              <SelectTrigger id="relationship">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="guardian">Guardian</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Link Button */}
        {validationResult?.valid && (
          <Button
            className="w-full"
            onClick={handleLinkChild}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Linking...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Link to {validationResult.goalieName}
              </>
            )}
          </Button>
        )}

        {/* Help Text */}
        <p className="text-xs text-muted-foreground text-center">
          Ask your goalie to generate a link code from their Profile Settings under "Family Links".
          Codes expire after 7 days.
        </p>
      </CardContent>
    </Card>
  );
}
