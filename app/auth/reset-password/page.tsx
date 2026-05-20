'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Loader2, Mail } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { passwordResetSchema, type PasswordResetFormData } from '@/lib/validation/auth';
import { isAuthError } from '@/lib/errors/auth-errors';

const BLUE = '#37b5ff';

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const { register, handleSubmit, formState: { errors }, setError, getValues } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
  });

  const onSubmit = async (data: PasswordResetFormData) => {
    try {
      setIsLoading(true);
      await resetPassword(data.email);
      setIsEmailSent(true);
    } catch (error) {
      if (isAuthError(error)) {
        setError('root', { message: error.userMessage });
      } else {
        setError('root', { message: error instanceof Error ? error.message : 'Failed to send reset email' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    const email = getValues('email');
    if (!email) return;
    try {
      setIsLoading(true);
      await resetPassword(email);
    } catch (error) {
      if (isAuthError(error)) {
        setError('root', { message: error.userMessage });
      } else {
        setError('root', { message: error instanceof Error ? error.message : 'Failed to resend email' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const pageBg = { minHeight: '100vh', background: 'linear-gradient(145deg, #000f28 0%, #062344 46%, #0a3159 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' };
  const card = { background: 'rgba(2,18,44,0.92)', border: `1.5px solid rgba(55,181,255,0.18)`, borderRadius: '20px', padding: '36px', width: '100%', maxWidth: '420px', boxShadow: '0 8px 48px rgba(0,0,0,0.5)' };

  if (isEmailSent) {
    return (
      <>
        <style>{`
          .rp-resend:hover { background: rgba(55,181,255,0.15) !important; border-color: ${BLUE} !important; }
          @keyframes rp-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
        <div style={pageBg}>
          <div style={card}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(55,181,255,0.1)', border: `2px solid rgba(55,181,255,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 24px rgba(55,181,255,0.15)' }}>
                <CheckCircle size={28} color={BLUE} />
              </div>
              <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.02em' }}>Check Your Email</h1>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', lineHeight: 1.6 }}>We've sent a password reset link to your email address.</p>
            </div>

            <div style={{ background: 'rgba(55,181,255,0.06)', border: '1px solid rgba(55,181,255,0.18)', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <Mail size={18} color={BLUE} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ color: BLUE, fontSize: '12px', fontWeight: 700 }}>Reset link sent to: {getValues('email')}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '2px' }}>Check your inbox and follow the instructions to reset your password.</p>
              </div>
            </div>

            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', textAlign: 'center', marginBottom: '12px' }}>
              Didn't receive the email? Check your spam folder or
            </p>

            <button
              onClick={handleResendEmail}
              disabled={isLoading}
              className="rp-resend"
              data-testid="resend-email-button"
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(55,181,255,0.25)', background: 'rgba(55,181,255,0.06)', color: BLUE, fontSize: '13px', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isLoading ? 0.6 : 1 }}
            >
              {isLoading
                ? <><Loader2 size={15} style={{ animation: 'rp-spin 1s linear infinite' }} />Resending...</>
                : 'Resend Email'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Link href="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', textDecoration: 'none' }}>
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        .rp-input::placeholder { color: rgba(255,255,255,0.25); }
        .rp-input:focus { outline: none; border-color: ${BLUE} !important; box-shadow: 0 0 0 3px rgba(55,181,255,0.12) !important; }
        .rp-submit:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(55,181,255,0.45) !important; }
        .rp-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        @keyframes rp-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      <div style={pageBg}>
        <div style={card}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `linear-gradient(135deg, ${BLUE} 0%, #0ea5e9 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: `0 0 24px rgba(55,181,255,0.3)` }}>
              <Mail size={24} color="#000f28" />
            </div>
            <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.02em' }}>Reset Your Password</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: 1.6 }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} data-testid="reset-password-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label htmlFor="email" style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                {...register('email')}
                aria-invalid={!!errors.email}
                autoComplete="email"
                autoFocus
                data-testid="email-input"
                className="rp-input"
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: `1px solid ${errors.email ? '#f87171' : 'rgba(55,181,255,0.2)'}`, background: 'rgba(55,181,255,0.04)', color: '#fff', fontSize: '13px', transition: 'all 0.2s', boxSizing: 'border-box' }}
              />
              {errors.email && (
                <p style={{ color: '#f87171', fontSize: '11px', marginTop: '4px' }} data-testid="email-error">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="rp-submit"
              data-testid="reset-password-submit"
              style={{ width: '100%', padding: '13px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${BLUE} 0%, #0ea5e9 100%)`, color: '#000f28', fontSize: '13px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: `0 4px 16px rgba(55,181,255,0.3)` }}
            >
              {isLoading
                ? <><Loader2 size={15} style={{ animation: 'rp-spin 1s linear infinite' }} />Sending Reset Link...</>
                : 'Send Reset Link'}
            </button>

            {errors.root && (
              <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '10px', padding: '12px', textAlign: 'center' }} data-testid="reset-password-error">
                <p style={{ color: '#f87171', fontSize: '12px' }}>{errors.root.message}</p>
              </div>
            )}
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link href="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', textDecoration: 'none' }} data-testid="back-to-login-link">
              <ArrowLeft size={14} /> Back to Login
            </Link>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
              Remember your password?{' '}
              <Link href="/auth/login" style={{ color: BLUE, textDecoration: 'none', fontWeight: 700 }} data-testid="signin-instead-link">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
