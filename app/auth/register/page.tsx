'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Mail, ChevronDown } from 'lucide-react';

import { useAuth } from '@/lib/auth/context';
import { registerSchema, type RegisterFormData } from '@/lib/validation/auth';
import { isAuthError } from '@/lib/errors/auth-errors';
import { toast } from 'sonner';

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

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'parent' as const,
      workflowType: 'automated' as const,
      agreeToTerms: false,
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: Record<string, unknown>) => {
    try {
      setIsLoading(true);
      await registerUser(data as RegisterFormData);
      toast.success('Account created successfully!', {
        description: "Your account is ready. Let's complete onboarding.",
        duration: 6000,
      });
      if (data.role === 'parent') router.push('/onboarding?role=parent');
      else if (data.role === 'admin') router.push('/admin');
      else if (data.role === 'coach') router.push('/coach');
      else router.push('/onboarding');
    } catch (error) {
      if (isAuthError(error)) {
        setError('root', { message: error.userMessage });
        toast.error('Registration failed', { description: error.userMessage });
      } else {
        const msg = error instanceof Error ? error.message : 'Registration failed';
        setError('root', { message: msg });
        toast.error('Registration failed', { description: msg });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* Left — Form panel */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #000f28 0%, #062344 60%, #0a3159 100%)',
          padding: '48px 24px',
          width: '100%',
        }}
        className="lg:w-1/2"
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Mobile logo */}
          <div className="lg:hidden mb-6 flex justify-center">
            <Link href="/">
              <img src="/logo.png" alt="Smarter Goalie" className="h-10" />
            </Link>
          </div>

          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ width: '24px', height: '1.5px', background: BLUE, opacity: 0.5 }} />
              <p style={{ fontSize: '10px', letterSpacing: '4px', color: BLUE, fontWeight: 700, textTransform: 'uppercase' }}>
                Get Started
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
              Create Account
            </h1>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>
              Enter your information to get started
            </p>
          </div>

          {/* Goalie notice */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
              borderRadius: '10px',
              border: `1px solid rgba(55,181,255,0.25)`,
              background: 'rgba(55,181,255,0.07)',
              padding: '12px 14px',
              marginBottom: '20px',
            }}
          >
            <Mail size={14} style={{ color: BLUE, marginTop: '2px', flexShrink: 0 }} />
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
              <span style={{ color: BLUE, fontWeight: 700 }}>Are you a goalie?</span>{' '}
              Goalies register via a personal invite link sent by the admin — not through this form. Check your email for your invitation.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            data-testid="register-form"
          >
            {/* Role */}
            <div>
              <label htmlFor="role" style={labelStyle}>I am a...</label>
              <div style={{ position: 'relative' }}>
                <select
                  id="role"
                  value={selectedRole}
                  onChange={(e) => setValue('role', e.target.value as 'parent' | 'coach')}
                  data-testid="role-select"
                  style={{
                    ...inputStyle,
                    background: '#062344',
                    appearance: 'none',
                    paddingRight: '36px',
                    cursor: 'pointer',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = BLUE)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(55,181,255,0.2)')}
                >
                  <option value="parent" style={{ background: '#062344', color: '#fff' }}>Parent</option>
                  <option value="coach" style={{ background: '#062344', color: '#fff' }}>Coach</option>
                </select>
                <ChevronDown
                  size={14}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'rgba(255,255,255,0.35)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
              {errors.role && (
                <p style={{ fontSize: '12px', color: '#f87171', marginTop: '5px' }} data-testid="role-error">
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Display Name */}
            <div>
              <label htmlFor="displayName" style={labelStyle}>Full Name</label>
              <input
                id="displayName"
                placeholder="Enter your full name"
                {...register('displayName')}
                data-testid="display-name-input"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = BLUE)}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(55,181,255,0.2)')}
              />
              {errors.displayName && (
                <p style={{ fontSize: '12px', color: '#f87171', marginTop: '5px' }} data-testid="display-name-error">
                  {errors.displayName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" style={labelStyle}>Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email')}
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
              <label htmlFor="password" style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password')}
                  data-testid="password-input"
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = BLUE)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(55,181,255,0.2)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  data-testid="toggle-password"
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.35)', padding: 0, display: 'flex',
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" style={labelStyle}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  {...register('confirmPassword')}
                  data-testid="confirm-password-input"
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = BLUE)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(55,181,255,0.2)')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  data-testid="toggle-confirm-password"
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.35)', padding: 0, display: 'flex',
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p style={{ fontSize: '12px', color: '#f87171', marginTop: '5px' }} data-testid="confirm-password-error">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <input
                type="checkbox"
                {...register('agreeToTerms')}
                data-testid="agree-terms-checkbox"
                style={{ width: '15px', height: '15px', accentColor: BLUE, cursor: 'pointer', marginTop: '2px', flexShrink: 0 }}
              />
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                I agree to the{' '}
                <Link href="/terms" style={{ color: BLUE, textDecoration: 'none', fontWeight: 600 }}>
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" style={{ color: BLUE, textDecoration: 'none', fontWeight: 600 }}>
                  Privacy Policy
                </Link>
              </span>
            </div>
            {errors.agreeToTerms && (
              <p style={{ fontSize: '12px', color: '#f87171', marginTop: '-8px' }} data-testid="agree-terms-error">
                {errors.agreeToTerms.message}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              data-testid="register-submit"
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
                  Creating Account...
                </>
              ) : 'Create Account →'}
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
                data-testid="register-error"
              >
                <p style={{ fontSize: '13px', color: '#f87171' }}>{errors.root.message}</p>
              </div>
            )}
          </form>

          {/* Login link */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
              Already have an account?{' '}
              <Link
                href="/auth/login"
                style={{ color: BLUE, fontWeight: 700, textDecoration: 'none' }}
                data-testid="login-link"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right — Image panel */}
      <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: 'url("/register.avif")', filter: 'blur(2px)' }}
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
            Start Your<br />
            <span style={{ color: BLUE }}>Journey Today.</span>
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: '340px', margin: '0 auto' }}>
            Join athletes training smarter with personalized drills, progress tracking, and expert coaching.
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
    </div>
  );
}
