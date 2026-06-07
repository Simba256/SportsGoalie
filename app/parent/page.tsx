'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  TrendingUp,
  Trophy,
  ClipboardCheck,
  UserPlus,
  ArrowRight,
  Sparkles,
  Eye,
  ChevronRight,
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
} from 'lucide-react';

import { useAuth } from '@/lib/auth/context';
import { parentLinkService, voiceSubmissionService } from '@/lib/database';
import type { VoiceSubmission, VoiceCategory } from '@/lib/database';
import { LinkedChildSummary } from '@/types';
import { SkeletonDarkPage } from '@/components/ui/skeletons';

const BLUE = '#37b5ff';
const PURPLE = '#a78bfa';

export default function ParentDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [children, setChildren] = useState<LinkedChildSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [submissions, setSubmissions] = useState<VoiceSubmission[]>([]);
  const [voiceCategory, setVoiceCategory] = useState<VoiceCategory>('COMPLIMENT');
  const [voiceSubject, setVoiceSubject] = useState('');
  const [voiceBody, setVoiceBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
    if (!authLoading && user && user.role !== 'parent') router.push('/dashboard');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || user.role !== 'parent') return;
    const loadData = async () => {
      try {
        setLoading(true);
        const [childrenResult, submissionsResult] = await Promise.allSettled([
          parentLinkService.getLinkedChildren(user.id),
          voiceSubmissionService.getParentSubmissions(user.id),
        ]);
        if (childrenResult.status === 'fulfilled' && childrenResult.value.success && childrenResult.value.data) {
          setChildren(childrenResult.value.data);
        } else if (childrenResult.status === 'fulfilled') {
          setError(childrenResult.value.error?.message || 'Failed to load linked goalies');
        } else {
          setError('Failed to load linked goalies');
        }
        if (submissionsResult.status === 'fulfilled') setSubmissions(submissionsResult.value);
      } catch {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  if (authLoading || loading) return <SkeletonDarkPage />;
  if (!user || user.role !== 'parent') return null;

  const firstName = user.displayName?.split(' ')[0] || user.email?.split('@')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const totalQuizzes = children.reduce((sum, c) => sum + (c.quizzesCompleted || 0), 0);
  const avgProgress = children.length > 0
    ? Math.round(children.reduce((sum, c) => sum + (c.progressPercentage || 0), 0) / children.length)
    : 0;
  const assessmentsDone = children.filter(c => c.hasCompletedAssessment).length;
  const bestStreak = Math.max(...children.map(c => c.currentStreak || 0), 0);

  const handleVoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setVoiceError(null);
    if (!voiceSubject.trim() || !voiceBody.trim()) { setVoiceError('Please fill in all fields.'); return; }
    try {
      setSubmitting(true);
      await voiceSubmissionService.createSubmission({
        parentId: user.id,
        parentName: user.displayName || user.email || 'Parent',
        goalieId: children[0]?.childId ?? null,
        goalieName: children[0]?.displayName ?? null,
        category: voiceCategory,
        subject: voiceSubject.trim(),
        body: voiceBody.trim(),
      });
      setSubmitted(true);
      setVoiceSubject('');
      setVoiceBody('');
      const updated = await voiceSubmissionService.getParentSubmissions(user.id);
      setSubmissions(updated);
    } catch {
      setVoiceError('Failed to send your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <style>{`
        @keyframes blob  { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-15px) scale(1.04)} }
        @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-15px,20px) scale(0.96)} }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes pulse-ring { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.03)} }
        @keyframes fade-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .s1{animation:fade-up .45s .05s both}
        .s2{animation:fade-up .45s .12s both}
        .s3{animation:fade-up .45s .20s both}
        .s4{animation:fade-up .45s .28s both}
        .s5{animation:fade-up .45s .36s both}
        .stat-lift{transition:transform .2s,box-shadow .2s,border-color .2s}
        .stat-lift:hover{transform:translateY(-5px)}
        .qa-btn{transition:transform .18s,box-shadow .18s,border-color .18s,background .18s}
        .qa-btn:hover{transform:translateY(-3px) scale(1.02)}
        .shimmer-bar{background:linear-gradient(90deg,var(--c) 0%,var(--c2) 45%,var(--c) 100%);background-size:400px 100%;animation:shimmer 2.5s infinite linear}
        .dash-grid{display:grid;grid-template-columns:1fr;gap:24px}
        @media(min-width:1024px){.dash-grid{grid-template-columns:1.6fr 1fr}}
        .hero-ring{display:none}
        @media(min-width:520px){.hero-ring{display:block}}
        .goalie-row-link:hover { background: rgba(55,181,255,0.1) !important; border-color: rgba(55,181,255,0.3) !important; }
      `}</style>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', background: 'linear-gradient(130deg,rgba(0,10,31,.98) 0%,rgba(4,21,48,.92) 50%,rgba(0,10,31,.95) 100%)', minHeight: '380px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden', borderBottom: '1px solid rgba(55,181,255,0.12)' }}>
        {/* animated glow blobs */}
        <div style={{ position: 'absolute', top: '5%', right: '12%', width: '380px', height: '380px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(55,181,255,.1) 0%,transparent 70%)', animation: 'blob 7s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', right: '30%', width: '240px', height: '240px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(167,139,250,.07) 0%,transparent 70%)', animation: 'blob2 9s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top,#000a1f,transparent)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '1280px', margin: '0 auto', padding: 'clamp(0px,2vw,0px) clamp(14px,4vw,28px) clamp(24px,5vw,44px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>

          {/* Left text */}
          <div style={{ flex: 1, minWidth: '260px' }}>
            <div className="s1" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(55,181,255,.12)', border: '1px solid rgba(55,181,255,.28)', borderRadius: '30px', padding: '5px 14px', marginBottom: '18px' }}>
              <Sparkles size={12} color={BLUE} />
              <span style={{ fontSize: '12px', color: BLUE, fontWeight: 700, letterSpacing: '.5px' }}>{greeting}</span>
            </div>

            <h1 className="s2" style={{ fontSize: 'clamp(44px,8vw,84px)', fontWeight: 900, lineHeight: 1, letterSpacing: '-.04em', marginBottom: '14px' }}>
              <span style={{ display: 'block', fontSize: '18px', fontWeight: 600, color: 'rgba(255,255,255,.5)', letterSpacing: '.02em', marginBottom: '4px' }}>Welcome back,</span>
              <span style={{ background: `linear-gradient(135deg, #fff 30%, ${BLUE} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {firstName}
              </span>
            </h1>

            <p className="s3" style={{ fontSize: '15px', color: 'rgba(255,255,255,.45)', marginBottom: '28px', maxWidth: '380px', lineHeight: 1.6 }}>
              {children.length > 0
                ? `You're tracking ${children.length} goalie${children.length !== 1 ? 's' : ''}. Stay updated on their progress and development.`
                : "Link your goalie's account to start tracking their progress and development."}
            </p>

            <div className="s4" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/parent/goalies">
                <button style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', background: BLUE, border: 'none', borderRadius: '12px', padding: '14px 26px', color: '#000a1f', fontSize: '14px', fontWeight: 900, letterSpacing: '.3px', cursor: 'pointer', boxShadow: `0 6px 24px ${BLUE}55`, transition: 'transform .15s,box-shadow .15s' }}
                  onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'translateY(-2px)'; b.style.boxShadow = `0 10px 30px ${BLUE}66`; }}
                  onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = ''; b.style.boxShadow = `0 6px 24px ${BLUE}55`; }}
                >
                  <Users size={15} /> My Goalies
                </button>
              </Link>
              <Link href="/parent/perception">
                <button style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.16)', borderRadius: '12px', padding: '14px 26px', color: 'rgba(255,255,255,.7)', fontSize: '14px', fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'background .15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.13)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.08)'; }}
                >
                  <Eye size={15} /> Perception Compare
                </button>
              </Link>
            </div>
          </div>

          {/* Progress ring */}
          <div className="s4 hero-ring" style={{ flexShrink: 0 }}>
            <HeroRing percentage={avgProgress} />
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <div className="s5" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(16px,3vw,24px) clamp(14px,4vw,28px) 0' }}>

        {/* Assessment prompt */}
        {!user.parentOnboardingComplete && children.length > 0 && (
          <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(251,191,36,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ClipboardCheck size={17} color="#fbbf24" />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#fbbf24' }}>Complete Your Assessment</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Compare your perceptions with your goalie&apos;s self-assessment.</p>
              </div>
            </div>
            <Link href="/onboarding?role=parent">
              <button style={{ background: '#fbbf24', border: 'none', borderRadius: '8px', padding: '9px 18px', color: '#000f28', fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer' }}>
                Start Assessment
              </button>
            </Link>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <AlertCircle size={16} color="#f87171" />
            <p style={{ fontSize: '13px', color: '#f87171' }}>{error}</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '14px' }}>
          <StatCard label="Linked Goalies" value={children.length} icon={<Users size={16} />} color={BLUE} delay="0s" />
          <StatCard label="Avg Progress" value={avgProgress > 0 ? `${avgProgress}%` : '--'} icon={<TrendingUp size={16} />} color="#4ade80" delay=".05s" />
          <StatCard label="Total Quizzes" value={totalQuizzes} icon={<Trophy size={16} />} color="#f87171" delay=".10s" />
          <StatCard label="Assessments" value={`${assessmentsDone}/${children.length || 0}`} icon={<ClipboardCheck size={16} />} color="#fb923c" delay=".15s" />
          <StatCard label="Best Streak" value={bestStreak > 0 ? `${bestStreak}d` : '0d'} icon={<Flame size={16} />} color="#fbbf24" delay=".20s" />
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(16px,3vw,24px) clamp(14px,4vw,28px) 64px' }}>
        <div className="dash-grid">

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* My Goalies */}
            <div style={{ background: 'rgba(2,18,44,.85)', border: '1px solid rgba(55,181,255,.14)', borderRadius: '20px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(55,181,255,.09)' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '3px' }}>My Goalies</h2>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,.35)' }}>
                    {children.length} linked {children.length === 1 ? 'goalie' : 'goalies'}
                  </p>
                </div>
                {children.length > 0 && (
                  <Link href="/parent/goalies" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: BLUE, fontWeight: 700, textDecoration: 'none', background: 'rgba(55,181,255,.09)', border: '1px solid rgba(55,181,255,.2)', borderRadius: '10px', padding: '7px 13px', transition: 'background .15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(55,181,255,.16)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(55,181,255,.09)'; }}
                  >
                    View all <ArrowRight size={13} />
                  </Link>
                )}
              </div>
              {children.length === 0 ? <EmptyGoalies /> : (
                <div style={{ padding: '12px' }}>
                  {children.map(child => <GoalieRow key={child.childId} child={child} />)}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            {children.length > 0 && (
              <div style={{ background: 'rgba(2,18,44,.85)', border: '1px solid rgba(55,181,255,.14)', borderRadius: '20px', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(55,181,255,.09)' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '3px' }}>Recent Activity</h2>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,.35)' }}>Latest goalie sessions</p>
                </div>
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {children
                    .filter(c => c.lastActiveAt)
                    .sort((a, b) => (b.lastActiveAt?.getTime() || 0) - (a.lastActiveAt?.getTime() || 0))
                    .slice(0, 5)
                    .map(child => (
                      <div key={`activity-${child.childId}`} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(55,181,255,0.04)', border: '1px solid rgba(55,181,255,0.09)' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `linear-gradient(135deg, ${BLUE}, #0ea5e9)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ color: '#000f28', fontSize: '15px', fontWeight: 800 }}>{child.displayName.charAt(0).toUpperCase()}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{child.displayName}</p>
                          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{child.quizzesCompleted || 0} quizzes · {Math.round(child.progressPercentage || 0)}% progress</p>
                        </div>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>{formatDate(child.lastActiveAt)}</p>
                      </div>
                    ))}
                  {children.filter(c => c.lastActiveAt).length === 0 && (
                    <div style={{ textAlign: 'center', padding: '28px' }}>
                      <Clock size={24} color="rgba(255,255,255,.15)" style={{ margin: '0 auto 8px' }} />
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,.35)' }}>No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Overview */}
            {children.length > 0 && (
              <div style={{ background: 'rgba(2,18,44,.85)', border: '1px solid rgba(55,181,255,.14)', borderRadius: '20px', overflow: 'hidden' }}>
                <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(55,181,255,.09)' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', marginBottom: '3px' }}>Overview</h3>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,.3)' }}>Across all linked goalies</p>
                </div>
                <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <ProgressRow label="Goalies Linked" current={children.length} total={Math.max(children.length, 3)} />
                  <ProgressRow label="Assessments Done" current={assessmentsDone} total={children.length} />
                  <ProgressRow label="Avg Progress" current={avgProgress} total={100} suffix="%" />
                  <div style={{ borderTop: '1px solid rgba(55,181,255,.09)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.45)' }}>Total Quizzes</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Trophy size={13} color="#f87171" /> {totalQuizzes}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.45)' }}>Best Streak</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Flame size={13} color="#fb923c" /> {bestStreak} days
                      </span>
                    </div>
                  </div>
                  {avgProgress > 0 && (
                    <div style={{ background: `${BLUE}0d`, border: `1px solid ${BLUE}28`, borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={14} color={BLUE} style={{ flexShrink: 0 }} />
                      <p style={{ fontSize: '12px', color: BLUE, fontWeight: 600 }}>
                        {avgProgress >= 80 ? 'Your goalies are doing great!' : avgProgress >= 50 ? 'Good progress across the board!' : 'Your goalies are getting started!'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div style={{ background: 'rgba(2,18,44,.85)', border: '1px solid rgba(55,181,255,.14)', borderRadius: '20px', padding: '20px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <QuickActionCard href="/parent/link-child" icon={<UserPlus size={22} />} label="Link Goalie" sub="Add child account" color={BLUE} />
                <QuickActionCard href="/onboarding?role=parent" icon={<ClipboardCheck size={22} />} label="Assessment" sub="Your questionnaire" color="#4ade80" />
                <QuickActionCard href="/parent/perception" icon={<Eye size={22} />} label="Perception" sub="Compare with goalie" color={PURPLE} />
                {children.length > 0
                  ? <QuickActionCard href={`/parent/child/${children[0].childId}`} icon={<TrendingUp size={22} />} label="Goalie Details" sub="View progress" color="#fb923c" />
                  : <QuickActionCard href="/parent/goalies" icon={<Users size={22} />} label="My Goalies" sub="Manage links" color="#fb923c" />
                }
              </div>
            </div>

            {/* Connect With Us */}
            <div style={{ background: 'rgba(2,18,44,.85)', border: '1px solid rgba(55,181,255,.14)', borderRadius: '20px', overflow: 'hidden' }}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(55,181,255,.09)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${BLUE}15`, border: `1px solid ${BLUE}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MessageSquare size={17} color={BLUE} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>Connect With Us</h3>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,.3)' }}>Coach Mike&apos;s team responds within 48h</p>
                </div>
              </div>

              <div style={{ padding: '18px 22px' }}>
                {/* Past submissions */}
                {submissions.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>Your Messages</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {submissions.map((sub) => (
                        <div key={sub.id} style={{ borderRadius: '10px', background: 'rgba(55,181,255,0.04)', border: '1px solid rgba(55,181,255,0.1)', padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                            <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,.85)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.subject}</p>
                            <VoiceStatusBadge status={sub.status} />
                          </div>
                          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,.38)', marginBottom: sub.adminReply ? '8px' : 0 }}>{sub.category.replace('_', ' ')} · {formatDate(sub.createdAt)}</p>
                          {sub.adminReply && (
                            <div style={{ marginTop: '8px', borderRadius: '8px', background: `${BLUE}0a`, border: `1px solid ${BLUE}20`, padding: '8px 10px' }}>
                              <p style={{ fontSize: '10px', fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Coach&apos;s Reply</p>
                              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,.7)', lineHeight: 1.6 }}>{sub.adminReply}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form / Confirmation */}
                {submitted ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px', borderRadius: '12px', background: `${BLUE}0a`, border: `1px solid ${BLUE}25`, textAlign: 'center' }}>
                    <CheckCircle2 size={28} color={BLUE} />
                    <p style={{ fontSize: '13px', fontWeight: 700, color: BLUE }}>Message Sent!</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,.5)', lineHeight: 1.6 }}>Thank you. Coach Mike&apos;s team will respond within 48 hours.</p>
                    <button
                      onClick={() => setSubmitted(false)}
                      style={{ marginTop: '4px', background: 'transparent', border: `1px solid ${BLUE}40`, borderRadius: '7px', padding: '7px 16px', color: BLUE, fontSize: '11px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.5px' }}
                    >
                      Send Another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleVoiceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '7px' }}>Category</p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {([
                          { value: 'COMPLIMENT', label: 'Win to Share' },
                          { value: 'CONCERN', label: 'Concern' },
                          { value: 'QUESTION', label: 'Question' },
                        ] as { value: VoiceCategory; label: string }[]).map(({ value, label }) => (
                          <button key={value} type="button" onClick={() => setVoiceCategory(value)}
                            style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', border: voiceCategory === value ? `1.5px solid ${BLUE}` : '1.5px solid rgba(55,181,255,0.2)', background: voiceCategory === value ? `${BLUE}22` : 'transparent', color: voiceCategory === value ? BLUE : 'rgba(255,255,255,.45)', transition: 'all 0.15s' }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input type="text" value={voiceSubject} onChange={(e) => setVoiceSubject(e.target.value.slice(0, 80))} placeholder="What's on your mind?" maxLength={80} required
                      style={{ width: '100%', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(55,181,255,.2)', borderRadius: '9px', padding: '10px 13px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                    <div>
                      <textarea value={voiceBody} onChange={(e) => setVoiceBody(e.target.value.slice(0, 1000))} placeholder="Share your thoughts with Coach Mike's team..." maxLength={1000} required rows={4}
                        style={{ width: '100%', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(55,181,255,.2)', borderRadius: '9px', padding: '10px 13px', color: '#fff', fontSize: '13px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                      />
                      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,.25)', textAlign: 'right', marginTop: '3px' }}>{voiceBody.length}/1000</p>
                    </div>
                    {voiceError && <p style={{ fontSize: '12px', color: '#f87171' }}>{voiceError}</p>}
                    <button type="submit" disabled={submitting}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', background: submitting ? `${BLUE}60` : BLUE, border: 'none', borderRadius: '9px', padding: '11px 20px', color: '#000f28', fontSize: '12px', fontWeight: 800, letterSpacing: '0.5px', cursor: submitting ? 'not-allowed' : 'pointer', transition: 'background .15s' }}
                    >
                      <Send size={13} /> {submitting ? 'Sending…' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

/* ──────────────────── Sub-components ──────────────────── */

function HeroRing({ percentage }: { percentage: number }) {
  const size = 148;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{ position: 'absolute', inset: '-8px', borderRadius: '50%', background: `radial-gradient(circle,${BLUE}20 0%,transparent 70%)`, animation: 'pulse-ring 3s ease-in-out infinite' }} />
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={BLUE} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 8px ${BLUE}88)`, transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
        <span style={{ fontSize: '34px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{percentage}%</span>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.4)', fontWeight: 600, letterSpacing: '.3px' }}>Avg Progress</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, delay }: { label: string; value: string | number; icon: React.ReactNode; color: string; delay: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="stat-lift"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', background: 'rgba(2,18,44,.85)', border: `1px solid ${hovered ? color + '44' : 'rgba(55,181,255,.14)'}`, borderRadius: '16px', padding: '18px', overflow: 'hidden', boxShadow: hovered ? `0 8px 28px ${color}22` : 'none', animation: `fade-up .45s ${delay} both` }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,transparent,${color}99,transparent)` }} />
      <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: `${color}1a`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', color, boxShadow: hovered ? `0 0 14px ${color}44` : 'none', transition: 'box-shadow .2s' }}>
        {icon}
      </div>
      <p style={{ fontSize: '30px', fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: '6px' }}>{value}</p>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,.38)', fontWeight: 600 }}>{label}</p>
    </div>
  );
}

function GoalieRow({ child }: { child: LinkedChildSummary }) {
  const pct = Math.round(child.progressPercentage || 0);
  return (
    <Link href={`/parent/child/${child.childId}`} className="goalie-row-link"
      style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '14px', background: 'rgba(55,181,255,0.04)', border: '1px solid rgba(55,181,255,0.09)', textDecoration: 'none', transition: 'background .15s, border-color .15s', borderLeft: `4px solid ${BLUE}` }}
    >
      <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: `linear-gradient(135deg, ${BLUE}, #0ea5e9)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ color: '#000f28', fontSize: '17px', fontWeight: 800 }}>{child.displayName.charAt(0).toUpperCase()}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{child.displayName}</h4>
          {child.pacingLevel && (
            <span style={{ fontSize: '10px', fontWeight: 700, color: BLUE, background: 'rgba(55,181,255,.12)', border: '1px solid rgba(55,181,255,.25)', borderRadius: '20px', padding: '1px 8px' }}>{child.pacingLevel}</span>
          )}
          {child.hasCompletedAssessment
            ? <CheckCircle2 size={13} color="#4ade80" style={{ flexShrink: 0 }} />
            : <Clock size={13} color="#fbbf24" style={{ flexShrink: 0 }} />}
        </div>
        <div style={{ height: '5px', background: 'rgba(255,255,255,.07)', borderRadius: '99px', overflow: 'hidden', marginBottom: '6px' }}>
          <div className="shimmer-bar" style={{ height: '100%', borderRadius: '99px', width: `${pct}%`, '--c': BLUE, '--c2': '#0ea5e9' } as React.CSSProperties} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.4)' }}>{pct}% progress</span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.4)', display: 'flex', alignItems: 'center', gap: '3px' }}><Trophy size={11} /> {child.quizzesCompleted || 0}</span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.4)', display: 'flex', alignItems: 'center', gap: '3px' }}><Flame size={11} /> {child.currentStreak || 0}</span>
        </div>
      </div>
      <ChevronRight size={16} color="rgba(255,255,255,.3)" style={{ flexShrink: 0 }} />
    </Link>
  );
}

function EmptyGoalies() {
  return (
    <div style={{ textAlign: 'center', padding: '52px 24px' }}>
      <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(55,181,255,.09)', border: '1px solid rgba(55,181,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: `0 0 24px ${BLUE}22` }}>
        <Users size={26} color={BLUE} />
      </div>
      <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>No linked goalies</h3>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,.35)', marginBottom: '24px', maxWidth: '260px', margin: '0 auto 24px', lineHeight: 1.5 }}>
        Link your goalie&apos;s account to track their progress and support their development.
      </p>
      <Link href="/parent/link-child">
        <button style={{ background: BLUE, border: 'none', borderRadius: '10px', padding: '12px 24px', color: '#000a1f', fontSize: '14px', fontWeight: 800, cursor: 'pointer', boxShadow: `0 4px 16px ${BLUE}44`, display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
          <UserPlus size={15} /> Link Your Goalie
        </button>
      </Link>
    </div>
  );
}

function ProgressRow({ label, current, total, suffix = '' }: { label: string; current: number; total: number; suffix?: string }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.45)' }}>{label}</span>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,.75)' }}>{current}{suffix}/{total}{suffix}</span>
      </div>
      <div style={{ height: '5px', background: 'rgba(255,255,255,.07)', borderRadius: '99px', overflow: 'hidden' }}>
        <div className="shimmer-bar" style={{ height: '100%', borderRadius: '99px', width: `${pct}%`, '--c': BLUE, '--c2': '#0ea5e9' } as React.CSSProperties} />
      </div>
    </div>
  );
}

function QuickActionCard({ href, icon, label, sub, color }: { href: string; icon: React.ReactNode; label: string; sub: string; color: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div className="qa-btn" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{ padding: '18px 14px', borderRadius: '14px', background: hovered ? `${color}18` : `${color}0c`, border: `1px solid ${hovered ? color + '40' : color + '20'}`, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', boxShadow: hovered ? `0 6px 20px ${color}22` : 'none' }}>
        <div style={{ color }}>{icon}</div>
        <div>
          <p style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginBottom: '2px' }}>{label}</p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,.35)' }}>{sub}</p>
        </div>
      </div>
    </Link>
  );
}

function VoiceStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string; border: string }> = {
    NEW: { label: 'New', color: 'rgba(255,255,255,0.5)', bg: 'rgba(255,255,255,0.07)', border: 'rgba(255,255,255,0.12)' },
    IN_PROGRESS: { label: 'In Progress', color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.25)' },
    ANSWERED: { label: 'Answered', color: BLUE, bg: `${BLUE}12`, border: `${BLUE}30` },
    ARCHIVED: { label: 'Archived', color: 'rgba(255,255,255,.35)', bg: 'rgba(255,255,255,.05)', border: 'rgba(255,255,255,.1)' },
    ESCALATED: { label: 'Escalated', color: '#fb923c', bg: 'rgba(251,146,60,.1)', border: 'rgba(251,146,60,.25)' },
  };
  const s = map[status] || map.NEW;
  return (
    <span style={{ flexShrink: 0, fontSize: '9px', fontWeight: 800, letterSpacing: '.8px', textTransform: 'uppercase', color: s.color, background: s.bg, border: `1px solid ${s.border}`, borderRadius: '20px', padding: '2px 8px', whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

function formatDate(date: Date | undefined): string {
  if (!date) return 'Never';
  const now = new Date();
  const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

