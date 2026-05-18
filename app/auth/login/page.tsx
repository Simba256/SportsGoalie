'use client';

import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';

import { useAuth } from '@/lib/auth/context';
import { loginSchema, type LoginFormData } from '@/lib/validation/auth';
import { isAuthError } from '@/lib/errors/auth-errors';

const BLUE = '#37b5ff';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(55,181,255,0.2)',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.2s',
};

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.5px',
  color: 'rgba(255,255,255,0.65)',
  display: 'block',
  marginBottom: '6px',
};

function VerificationMessage() {
  const searchParams = useSearchParams();
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (searchParams.get('message') === 'verify-email') setShowMessage(true);
  }, [searchParams]);

  if (!showMessage) return null;

  return (
    <div
      style={{
        marginBottom: '20px',
        borderRadius: '10px',
        border: '1px solid rgba(74,222,128,0.3)',
        background: 'rgba(74,222,128,0.08)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
      }}
    >
      <CheckCircle size={16} style={{ color: '#4ade80', marginTop: '2px', flexShrink: 0 }} />
      <div>
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#4ade80', marginBottom: '2px' }}>
          Registration Successful!
        </p>
        <p style={{ fontSize: '12px', color: 'rgba(74,222,128,0.75)' }}>
          We&apos;ve sent a verification email to your inbox. Please verify your email before signing in.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data);
    } catch (error) {
      setError('root', {
        message: isAuthError(error)
          ? error.userMessage
          : error instanceof Error ? error.message : 'Login failed',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      let destination = '/dashboard';
      if (user.role === 'admin') destination = '/admin';
      else if (user.role === 'coach') destination = '/coach';
      else if (user.role === 'parent') destination = '/parent';
      else if (user.role === 'student' && !user.onboardingCompleted) destination = '/onboarding';
      router.push(destination);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #000f28 0%, #062344 46%, #0a3159 100%)',
        }}
      >
        <Loader2 size={28} style={{ color: BLUE, animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* Left — Image panel */}
      <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: 'url("/login.avif")', filter: 'blur(2px)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(0,15,40,0.92) 0%, rgba(6,35,68,0.82) 50%, rgba(10,49,89,0.75) 100%)',
          }}
        />
        <div className="relative z-10 text-center px-12">
          <Link href="/">
            <img src="/logo.png" alt="Smarter Goalie" className="h-12 mx-auto mb-8" />
          </Link>
          <h2
            style={{
              fontSize: 'clamp(28px, 3.5vw, 48px)',
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            Welcome Back,<br />
            <span style={{ color: BLUE }}>Athlete.</span>
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: '340px', margin: '0 auto' }}>
            Pick up where you left off — your drills, progress, and goals are waiting.
          </p>
          <div
            style={{
              marginTop: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
          >
            <div style={{ width: '32px', height: '1.5px', background: BLUE, opacity: 0.5 }} />
            <p style={{ fontSize: '10px', letterSpacing: '4px', color: BLUE, fontWeight: 700, textTransform: 'uppercase' }}>
              Smarter Goalie
            </p>
            <div style={{ width: '32px', height: '1.5px', background: BLUE, opacity: 0.5 }} />
          </div>
        </div>
      </div>

      {/* Right — Form panel */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #000f28 0%, #062344 60%, #0a3159 100%)',
          padding: '48px 24px',
        }}
        className="lg:w-1/2"
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Link href="/">
              <img src="/logo.png" alt="Smarter Goalie" className="h-10" />
            </Link>
          </div>

          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ width: '24px', height: '1.5px', background: BLUE, opacity: 0.5 }} />
              <p style={{ fontSize: '10px', letterSpacing: '4px', color: BLUE, fontWeight: 700, textTransform: 'uppercase' }}>
                Welcome Back
              </p>
            </div>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 900,
                color: '#fff',
                letterSpacing: '-0.02em',
                marginBottom: '6px',
                textTransform: 'uppercase',
              }}
            >
              Sign In
            </h1>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>
              Enter your credentials to access your account
            </p>
          </div>

          <Suspense fallback={null}>
            <VerificationMessage />
          </Suspense>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }} data-testid="login-form">

            {/* Email */}
            <div>
              <label htmlFor="email" style={labelStyle}>Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email')}
                autoComplete="email"
                data-testid="email-input"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = BLUE)}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(55,181,255,0.2)')}
              />
              {errors.email && (
                <p style={{ fontSize: '12px', color: '#f87171', marginTop: '5px' }} data-testid="email-error">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label htmlFor="password" style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                <Link
                  href="/auth/reset-password"
                  style={{ fontSize: '12px', color: BLUE, textDecoration: 'none', fontWeight: 600 }}
                  data-testid="forgot-password-link"
                >
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password')}
                  autoComplete="current-password"
                  data-testid="password-input"
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = BLUE)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(55,181,255,0.2)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'rgba(255,255,255,0.35)',
                    padding: 0,
                    display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p style={{ fontSize: '12px', color: '#f87171', marginTop: '5px' }} data-testid="password-error">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember me */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                id="rememberMe"
                type="checkbox"
                {...register('rememberMe')}
                data-testid="remember-me-checkbox"
                style={{ width: '15px', height: '15px', accentColor: BLUE, cursor: 'pointer' }}
              />
              <label htmlFor="rememberMe" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', cursor: 'pointer' }}>
                Remember me for 30 days
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              data-testid="login-submit"
              style={{
                width: '100%',
                padding: '13px 0',
                borderRadius: '8px',
                border: 'none',
                background: isLoading
                  ? 'rgba(55,181,255,0.3)'
                  : `linear-gradient(135deg, ${BLUE} 0%, #0ea5e9 100%)`,
                color: '#fff',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: isLoading ? 'none' : '0 4px 20px rgba(55,181,255,0.3)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  Signing In...
                </>
              ) : 'Sign In →'}
            </button>

            {/* Root error */}
            {errors.root && (
              <div
                style={{
                  borderRadius: '8px',
                  border: '1px solid rgba(248,113,113,0.3)',
                  background: 'rgba(248,113,113,0.08)',
                  padding: '12px 14px',
                }}
                data-testid="login-error"
              >
                <p style={{ fontSize: '13px', color: '#f87171' }}>{errors.root.message}</p>
              </div>
            )}
          </form>

          {/* Divider */}
          <div style={{ position: 'relative', margin: '28px 0' }}>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            <span
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: '#040e22',
                padding: '0 12px',
                fontSize: '11px',
                color: 'rgba(255,255,255,0.3)',
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
            >
              Or
            </span>
          </div>

          <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>
            Social login coming soon...
          </p>

          {/* Register link */}
          <div style={{ marginTop: '28px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/register"
                style={{ color: BLUE, fontWeight: 700, textDecoration: 'none' }}
                data-testid="register-link"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
