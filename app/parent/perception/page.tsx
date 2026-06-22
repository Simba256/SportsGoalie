'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Eye, Users, ClipboardCheck, CheckCircle2,
  Clock, Sparkles, TrendingUp, GitCompare, UserPlus,
  ChevronRight, AlertCircle,
} from 'lucide-react';

import { useAuth } from '@/lib/auth/context';
import { parentLinkService } from '@/lib/database';
import { LinkedChildSummary } from '@/types';
import { SkeletonDarkPage } from '@/components/ui/skeletons';

const BLUE = '#37b5ff';
const PURPLE = '#a78bfa';

export default function ParentPerceptionPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [children, setChildren] = useState<LinkedChildSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
    if (!authLoading && user && user.role !== 'parent') router.push('/dashboard');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || user.role !== 'parent') return;
    const load = async () => {
      try {
        const result = await parentLinkService.getLinkedChildren(user.id);
        if (result.success && result.data) setChildren(result.data);
      } catch { /* handled */ }
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  if (authLoading || loading) return <SkeletonDarkPage />;
  if (!user || user.role !== 'parent') return null;

  const hasAssessment = user.parentOnboardingComplete;
  return (
    <>
      <style>{`
        .perc-child:hover { border-color: rgba(55,181,255,0.3) !important; background: rgba(55,181,255,0.04) !important; transform: translateY(-1px); }
        .perc-cta:hover { opacity: 0.9 !important; transform: translateY(-1px); }
        .perc-outline:hover { background: rgba(55,181,255,0.12) !important; border-color: ${BLUE} !important; }
        @keyframes perc-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes perc-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>

      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* ── Hero ── */}
        <div style={{ position: 'relative', borderRadius: '20px', background: 'linear-gradient(135deg, #04213f 0%, #0b3460 50%, #0d1f40 100%)', border: '1px solid rgba(55,181,255,0.2)', padding: '32px', overflow: 'hidden', boxShadow: '0 4px 40px rgba(0,0,0,0.5)' }}>
          <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '280px', height: '280px', borderRadius: '50%', background: `rgba(167,139,250,0.1)`, filter: 'blur(70px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '10%', width: '200px', height: '200px', borderRadius: '50%', background: `rgba(55,181,255,0.08)`, filter: 'blur(60px)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `rgba(167,139,250,0.12)`, border: `1px solid rgba(167,139,250,0.25)`, borderRadius: '20px', padding: '4px 12px', marginBottom: '14px' }}>
                <Sparkles size={12} color={PURPLE} />
                <span style={{ color: PURPLE, fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Perception Engine</span>
              </div>
              <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '10px' }}>Perception Comparison</h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.7, maxWidth: '500px' }}>
                Uncover where your view of your goalie aligns — and where it differs — from how they see themselves. Real insight starts with honest comparison.
              </p>
            </div>

          </div>
        </div>

        {/* ── How It Works ── */}
        <div style={{ background: 'rgba(2,18,44,0.7)', border: '1px solid rgba(55,181,255,0.1)', borderRadius: '16px', padding: '24px' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>How It Works</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {[
              { icon: ClipboardCheck, color: BLUE, label: 'You assess', desc: 'Complete your parent assessment about your goalie' },
              { icon: Users, color: PURPLE, label: 'Goalie assesses', desc: 'Your goalie completes their own self-assessment' },
              { icon: GitCompare, color: '#34d399', label: 'Compare results', desc: 'See alignment and gaps across key mental areas' },
              { icon: TrendingUp, color: '#fbbf24', label: 'Take action', desc: 'Use insights to better support their development' },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${step.color}15`, border: `1px solid ${step.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={15} color={step.color} />
                  </div>
                  <div>
                    <p style={{ color: '#fff', fontSize: '12px', fontWeight: 700, marginBottom: '3px' }}>{step.label}</p>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', lineHeight: 1.5 }}>{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>


        {/* ── Goalies Section ── */}
        {hasAssessment && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Your Goalies</p>
              {children.length > 0 && (
                <Link href="/parent/link-child" style={{ textDecoration: 'none' }}>
                  <button className="perc-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '8px', border: `1px solid rgba(55,181,255,0.2)`, background: 'rgba(55,181,255,0.05)', color: BLUE, fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                    <UserPlus size={12} /> Link Another
                  </button>
                </Link>
              )}
            </div>

            {children.length === 0 ? (
              <div style={{ background: 'rgba(2,18,44,0.82)', border: '1px solid rgba(55,181,255,0.14)', borderRadius: '16px', padding: '48px 32px', textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(55,181,255,0.07)', border: '1px solid rgba(55,181,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <Users size={26} color="rgba(255,255,255,0.25)" />
                </div>
                <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>No Goalies Linked Yet</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', maxWidth: '320px', margin: '0 auto 20px', lineHeight: 1.7 }}>
                  Link a goalie to your account to start comparing assessments and gaining deeper insight.
                </p>
                <Link href="/parent/link-child" style={{ textDecoration: 'none' }}>
                  <button className="perc-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 22px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${BLUE} 0%, #0ea5e9 100%)`, color: '#000f28', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: `0 4px 16px rgba(55,181,255,0.3)` }}>
                    <UserPlus size={15} /> Link a Goalie
                  </button>
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {children.map((child) => {
                  const ready = child.hasCompletedAssessment;
                  const statusColor = ready ? '#34d399' : '#fbbf24';
                  const pct = Math.round(child.progressPercentage || 0);

                  return (
                    <Link
                      key={child.childId}
                      href={`/parent/child/${child.childId}?tab=perception`}
                      className="perc-child"
                      style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 22px', borderRadius: '16px', background: 'rgba(2,18,44,0.82)', border: '1px solid rgba(55,181,255,0.14)', textDecoration: 'none', transition: 'all 0.2s' }}
                    >
                      {/* Avatar */}
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(37,99,235,0.3)' }}>
                          <span style={{ color: '#fff', fontSize: '20px', fontWeight: 900 }}>{child.displayName.charAt(0).toUpperCase()}</span>
                        </div>
                        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '18px', height: '18px', borderRadius: '50%', background: ready ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.12)', border: `2px solid ${ready ? '#34d399' : '#fbbf24'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {ready
                            ? <CheckCircle2 size={10} color="#34d399" />
                            : <Clock size={10} color="#fbbf24" />
                          }
                        </div>
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                          <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: 800 }}>{child.displayName}</h4>
                          {child.pacingLevel && (
                            <span style={{ padding: '2px 8px', borderRadius: '20px', background: `rgba(55,181,255,0.1)`, border: `1px solid rgba(55,181,255,0.2)`, color: BLUE, fontSize: '10px', fontWeight: 700 }}>
                              {child.pacingLevel}
                            </span>
                          )}
                          <span style={{ padding: '2px 8px', borderRadius: '20px', background: `${statusColor}12`, border: `1px solid ${statusColor}30`, color: statusColor, fontSize: '10px', fontWeight: 700 }}>
                            {ready ? '✓ Ready to compare' : 'Awaiting goalie'}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden', marginBottom: '6px', maxWidth: '240px' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${BLUE}, #0ea5e9)`, borderRadius: '99px', transition: 'width 0.5s' }} />
                        </div>

                        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '12px' }}>
                          {ready
                            ? 'Both assessments complete — tap to view full comparison'
                            : "Waiting for goalie's self-assessment to unlock comparison"}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        {ready ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', background: `rgba(55,181,255,0.1)`, border: `1px solid rgba(55,181,255,0.2)` }}>
                            <Eye size={14} color={BLUE} />
                            <span style={{ color: BLUE, fontSize: '12px', fontWeight: 700 }}>View</span>
                          </div>
                        ) : (
                          <ChevronRight size={18} color="rgba(255,255,255,0.2)" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── No assessment — blocked state with explanation ── */}
        {!hasAssessment && (
          <div style={{ background: 'rgba(2,18,44,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '28px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <AlertCircle size={16} color="rgba(255,255,255,0.3)" />
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: 600 }}>What you'll unlock after completing your assessment:</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Side-by-side score comparison', desc: 'See exactly where your ratings match or differ from your goalie\'s' },
                { label: 'Alignment score', desc: 'A single percentage showing overall perception alignment' },
                { label: 'Gap analysis', desc: 'Identify specific areas that may need open conversation' },
                { label: 'Personalised recommendations', desc: 'Actionable advice based on the gaps detected' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: `rgba(55,181,255,0.1)`, border: `1px solid rgba(55,181,255,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                    <span style={{ color: BLUE, fontSize: '10px', fontWeight: 800 }}>{i + 1}</span>
                  </div>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>{item.label}</p>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
