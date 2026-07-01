'use client';

import { useState } from 'react';
import { Link2, Loader2, CheckCircle2, AlertCircle, UserPlus, KeyRound } from 'lucide-react';
import { parentLinkService } from '@/lib/database';
import { ParentRelationship } from '@/types';

const BLUE = '#37b5ff';
const cardBg = 'rgba(2,18,44,0.82)';
const border = '1px solid rgba(55,181,255,0.18)';

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

  const handleCodeChange = (value: string) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (cleaned.length === 4 && !cleaned.includes('-')) {
      setLinkCode(cleaned + '-');
    } else if (cleaned.length <= 9) {
      setLinkCode(cleaned);
    }
    setValidationResult(null);
    setError(null);
  };

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
        if (!result.data.valid) setError('This code is invalid or has expired');
      } else {
        setError(result.error?.message || 'Failed to validate code');
      }
    } catch {
      setError('Failed to validate code. Please try again.');
    } finally {
      setValidating(false);
    }
  };

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
        setLinkCode('');
        setValidationResult(null);
        onLinkSuccess?.(result.data.childName);
      } else {
        setError(result.error?.message || 'Failed to link account');
      }
    } catch {
      setError('Failed to link account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .lcf-input { background: rgba(0,15,40,0.6) !important; border: 1px solid rgba(55,181,255,0.2) !important; color: #fff !important; border-radius: 10px !important; padding: 12px 16px !important; font-size: 15px !important; font-family: monospace !important; letter-spacing: 0.1em !important; width: 100% !important; outline: none !important; transition: border-color 0.2s !important; }
        .lcf-input::placeholder { color: rgba(255,255,255,0.25) !important; }
        .lcf-input:focus { border-color: rgba(55,181,255,0.55) !important; box-shadow: 0 0 0 3px rgba(55,181,255,0.08) !important; }
        .lcf-verify-btn { padding: 12px 20px; border-radius: 10px; border: 1px solid rgba(55,181,255,0.35); background: rgba(55,181,255,0.1); color: ${BLUE}; font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: all 0.2s; flex-shrink: 0; }
        .lcf-verify-btn:hover:not(:disabled) { background: rgba(55,181,255,0.18); border-color: rgba(55,181,255,0.5); }
        .lcf-verify-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .lcf-select { background: rgba(0,15,40,0.6); border: 1px solid rgba(55,181,255,0.2); color: #fff; border-radius: 10px; padding: 11px 16px; font-size: 13px; width: 100%; outline: none; cursor: pointer; appearance: none; -webkit-appearance: none; transition: border-color 0.2s; }
        .lcf-select:focus { border-color: rgba(55,181,255,0.55); }
        .lcf-select option { background: #041830; color: #fff; }
        .lcf-link-btn { width: 100%; padding: 14px; border-radius: 12px; border: none; background: linear-gradient(135deg, ${BLUE} 0%, #0ea5e9 100%); color: #000f28; font-size: 14px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; box-shadow: 0 4px 20px rgba(55,181,255,0.3); }
        .lcf-link-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(55,181,255,0.4); }
        .lcf-link-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
      `}</style>

      <div style={{ background: cardBg, border, borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '20px', borderBottom: '1px solid rgba(55,181,255,0.1)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `rgba(55,181,255,0.1)`, border: `1px solid rgba(55,181,255,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Link2 size={18} color={BLUE} />
          </div>
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>Enter Link Code</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Enter the code shared by your goalie to connect your accounts</p>
          </div>
        </div>

        {/* Code Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            <KeyRound size={12} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            Link Code
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              className="lcf-input"
              placeholder="XXXX-XXXX"
              value={linkCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              maxLength={9}
            />
            <button className="lcf-verify-btn" onClick={handleValidateCode} disabled={linkCode.length < 9 || validating}>
              {validating ? <Loader2 size={16} className="animate-spin" /> : 'Verify'}
            </button>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
            Codes are 8 characters in the format XXXX-XXXX
          </p>
        </div>

        {/* Validation Success */}
        {validationResult?.valid && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', borderRadius: '12px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)' }}>
            <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0, marginTop: '1px' }} />
            <div>
              <p style={{ color: '#34d399', fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>Valid code!</p>
              <p style={{ color: 'rgba(52,211,153,0.7)', fontSize: '12px' }}>
                Linking to <strong style={{ color: '#34d399' }}>{validationResult.goalieName}</strong>
                {validationResult.expiresAt && (
                  <span style={{ marginLeft: '8px', color: 'rgba(52,211,153,0.5)' }}>
                    · expires {validationResult.expiresAt.toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', borderRadius: '12px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)' }}>
            <AlertCircle size={18} color="#f87171" style={{ flexShrink: 0, marginTop: '1px' }} />
            <p style={{ color: '#f87171', fontSize: '13px' }}>{error}</p>
          </div>
        )}

        {/* Relationship selector */}
        {validationResult?.valid && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Your Relationship
            </label>
            <div style={{ position: 'relative' }}>
              <select
                className="lcf-select"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as ParentRelationship)}
              >
                <option value="parent">Parent</option>
                <option value="guardian">Guardian</option>
                <option value="other">Other</option>
              </select>
              <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(255,255,255,0.4)' }}>▾</div>
            </div>
          </div>
        )}

        {/* Link Button */}
        {validationResult?.valid && (
          <button className="lcf-link-btn" onClick={handleLinkChild} disabled={loading}>
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Linking...</>
            ) : (
              <><UserPlus size={16} /> Link to {validationResult.goalieName}</>
            )}
          </button>
        )}

        {/* Footer note */}
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', textAlign: 'center', lineHeight: 1.6 }}>
          Ask your goalie to generate a link code from their Profile Settings under "Family Links". Codes expire after 7 days.
        </p>
      </div>
    </>
  );
}
