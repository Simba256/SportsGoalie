'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users, BookOpen, GraduationCap, TrendingUp, ArrowRight,
  ChevronRight, Sparkles, ClipboardList, Target,
  CheckCircle2, Clock, UserCheck, BarChart2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { userService, customCurriculumService } from '@/lib/database';

const BLUE = '#37b5ff';
const PURPLE = '#a78bfa';

interface StudentSummary {
  id: string;
  displayName: string;
  email: string;
  progress: number;
  curriculumItems: number;
  completedItems: number;
  hasCurriculum: boolean;
}

export default function CoachDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [stats, setStats] = useState({ totalStudents: 0, studentsWithCurriculum: 0, totalCurriculumItems: 0, averageProgress: 0 });

  useEffect(() => {
    if (user?.id) loadData();
  }, [user?.id]);

  const loadData = async () => {
    try {
      const allUsersResult = await userService.getAllUsers({ role: 'student', limit: 200 });
      if (!allUsersResult.success || !allUsersResult.data) return;

      const assigned = allUsersResult.data.items.filter(
        u => u.workflowType === 'custom' && (user?.role === 'admin' || u.assignedCoachId === user?.id)
      );

      let withCurriculum = 0, totalItems = 0, totalProgress = 0;
      const summaries: StudentSummary[] = [];

      for (const student of assigned) {
        const r = await customCurriculumService.getStudentCurriculum(student.id);
        if (r.success && r.data && r.data.items.length > 0) {
          withCurriculum++;
          const completed = r.data.items.filter(i => i.status === 'completed').length;
          const pct = Math.round((completed / r.data.items.length) * 100);
          totalItems += r.data.items.length;
          totalProgress += pct;
          summaries.push({ id: student.id, displayName: student.displayName || student.email, email: student.email, progress: pct, curriculumItems: r.data.items.length, completedItems: completed, hasCurriculum: true });
        } else {
          summaries.push({ id: student.id, displayName: student.displayName || student.email, email: student.email, progress: 0, curriculumItems: 0, completedItems: 0, hasCurriculum: false });
        }
      }

      setStudents(summaries);
      setStats({
        totalStudents: assigned.length,
        studentsWithCurriculum: withCurriculum,
        totalCurriculumItems: totalItems,
        averageProgress: assigned.length > 0 ? Math.round(totalProgress / assigned.length) : 0,
      });
    } catch (err) { console.error('Failed to load coach stats:', err); }
    finally { setLoading(false); }
  };

  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Coach';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

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
        .student-row{transition:background .15s,padding-left .15s}
        .student-row:hover{background:rgba(255,255,255,0.04)!important;padding-left:26px!important}
        .qa-btn{transition:transform .18s,box-shadow .18s,border-color .18s,background .18s}
        .qa-btn:hover{transform:translateY(-3px) scale(1.02)}
        .coach-dash-grid{display:grid;grid-template-columns:1fr;gap:24px}
        @media(min-width:1024px){.coach-dash-grid{grid-template-columns:1.6fr 1fr}}
        .hero-ring{display:none}
        @media(min-width:520px){.hero-ring{display:block}}
        .shimmer-bar{background:linear-gradient(90deg,var(--c) 0%,var(--c2) 45%,var(--c) 100%);background-size:400px 100%;animation:shimmer 2.5s infinite linear}
        .cta-btn:hover{opacity:0.9;transform:translateY(-2px)}
      `}</style>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '380px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden', background: 'linear-gradient(130deg,rgba(0,10,31,1) 0%,rgba(4,21,56,1) 50%,rgba(2,15,40,1) 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(130deg,rgba(0,10,31,.95) 0%,rgba(4,21,48,.85) 50%,rgba(0,10,31,.78) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', background: 'linear-gradient(to top,#000a1f,transparent)' }} />

        {/* animated glow blobs */}
        <div style={{ position: 'absolute', top: '5%', right: '12%', width: '380px', height: '380px', borderRadius: '50%', background: `radial-gradient(circle,rgba(55,181,255,.12) 0%,transparent 70%)`, animation: 'blob 7s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', right: '30%', width: '240px', height: '240px', borderRadius: '50%', background: `radial-gradient(circle,rgba(167,139,250,.07) 0%,transparent 70%)`, animation: 'blob2 9s ease-in-out infinite', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '1280px', margin: '0 auto', padding: 'clamp(0px,2vw,0px) clamp(14px,4vw,28px) clamp(24px,5vw,44px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>

          {/* Left text block */}
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
              {stats.totalStudents > 0
                ? `You have ${stats.totalStudents} student${stats.totalStudents !== 1 ? 's' : ''} — averaging ${stats.averageProgress}% progress across all curricula.`
                : 'No students assigned yet. Students will appear here once linked through admin.'}
            </p>

            <div className="s4" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/coach/students">
                <button className="cta-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', background: BLUE, border: 'none', borderRadius: '12px', padding: '14px 26px', color: '#000a1f', fontSize: '14px', fontWeight: 900, letterSpacing: '.3px', cursor: 'pointer', boxShadow: `0 6px 24px ${BLUE}55`, transition: 'transform .15s,box-shadow .15s,opacity .15s' }}>
                  <Users size={15} /> View Students
                </button>
              </Link>
              <Link href="/coach/content">
                <button className="cta-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.16)', borderRadius: '12px', padding: '14px 26px', color: 'rgba(255,255,255,.7)', fontSize: '14px', fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'background .15s,opacity .15s,transform .15s' }}>
                  <BookOpen size={15} /> Content Library
                </button>
              </Link>
            </div>
          </div>

          {/* Progress ring */}
          <div className="s4 hero-ring" style={{ flexShrink: 0 }}>
            <HeroRing pct={stats.averageProgress} total={stats.totalStudents} withCurriculum={stats.studentsWithCurriculum} />
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <div className="s5" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(16px,3vw,24px) clamp(14px,4vw,28px) 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '14px' }}>
          <StatCard label="Total Students" value={stats.totalStudents} icon={<Users size={16} />} color={BLUE} delay="0s" />
          <StatCard label="Active Curricula" value={stats.studentsWithCurriculum} icon={<BookOpen size={16} />} color="#4ade80" delay=".05s" />
          <StatCard label="Content Items" value={stats.totalCurriculumItems} icon={<GraduationCap size={16} />} color={PURPLE} delay=".10s" />
          <StatCard label="Avg Progress" value={`${stats.averageProgress}%`} icon={<TrendingUp size={16} />} color="#fb923c" delay=".15s" />
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(16px,3vw,24px) clamp(14px,4vw,28px) 64px' }}>
        <div className="coach-dash-grid">

          {/* LEFT — Students list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: 'rgba(2,18,44,.85)', border: '1px solid rgba(55,181,255,.14)', borderRadius: '20px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(55,181,255,.09)' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '3px' }}>My Students</h2>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,.35)' }}>
                    {stats.totalStudents} assigned student{stats.totalStudents !== 1 ? 's' : ''}
                  </p>
                </div>
                <Link href="/coach/students" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: BLUE, fontWeight: 700, textDecoration: 'none', background: 'rgba(55,181,255,.09)', border: '1px solid rgba(55,181,255,.2)', borderRadius: '10px', padding: '7px 13px', transition: 'background .15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(55,181,255,.16)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(55,181,255,.09)'; }}
                >
                  View all <ArrowRight size={13} />
                </Link>
              </div>

              {loading ? (
                <div style={{ padding: '12px' }}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 24px', borderBottom: i < 2 ? '1px solid rgba(55,181,255,.07)' : 'none' }}>
                      <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(255,255,255,.05)', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ height: '13px', borderRadius: '4px', background: 'rgba(255,255,255,.05)', marginBottom: '10px', width: '45%' }} />
                        <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,.05)' }} />
                      </div>
                      <div style={{ width: '36px', height: '22px', borderRadius: '4px', background: 'rgba(255,255,255,.05)' }} />
                    </div>
                  ))}
                </div>
              ) : students.length === 0 ? (
                <EmptyStudents />
              ) : (
                <div>
                  {students.slice(0, 8).map((student, idx) => {
                    const accent = student.hasCurriculum ? (student.progress >= 80 ? '#4ade80' : BLUE) : 'rgba(255,255,255,.2)';
                    return (
                      <Link key={student.id} href={`/coach/students/${student.id}`} className="student-row"
                        style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 24px', paddingLeft: '20px', borderBottom: idx < students.length - 1 ? '1px solid rgba(55,181,255,.07)' : 'none', textDecoration: 'none', borderLeft: `4px solid ${accent}`, transition: 'all .15s' }}>
                        <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: `rgba(55,181,255,.1)`, border: `1px solid rgba(55,181,255,.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 16px rgba(55,181,255,.15)` }}>
                          <span style={{ color: BLUE, fontSize: '18px', fontWeight: 900 }}>{(student.displayName || 'S').charAt(0).toUpperCase()}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {student.displayName}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ flex: 1, height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,.07)', overflow: 'hidden' }}>
                              <div className="shimmer-bar" style={{ height: '100%', borderRadius: '99px', width: `${student.progress}%`, '--c': accent, '--c2': `${accent}99` } as React.CSSProperties} />
                            </div>
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.3)', flexShrink: 0 }}>
                              {student.completedItems}/{student.curriculumItems}
                            </span>
                          </div>
                        </div>
                        <div style={{ flexShrink: 0, textAlign: 'right' }}>
                          {student.hasCurriculum ? (
                            <span style={{ fontSize: '20px', fontWeight: 900, color: accent, display: 'block' }}>{student.progress}%</span>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.25)', fontWeight: 600 }}>No curriculum</span>
                          )}
                        </div>
                        <ChevronRight size={15} color="rgba(255,255,255,.2)" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Quick actions + overview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Quick Actions */}
            <div style={{ background: 'rgba(2,18,44,.85)', border: '1px solid rgba(55,181,255,.14)', borderRadius: '20px', padding: '20px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <QuickActionCard href="/coach/students" icon={<Users size={22} />} label="Students" sub="View all goalies" color={BLUE} />
                <QuickActionCard href="/coach/content" icon={<BookOpen size={22} />} label="Content" sub="Browse library" color="#4ade80" />
                <QuickActionCard href="/coach/students" icon={<ClipboardList size={22} />} label="Curricula" sub="Manage plans" color={PURPLE} />
                <QuickActionCard href="/coach/students" icon={<BarChart2 size={22} />} label="Progress" sub="Track results" color="#fb923c" />
              </div>
            </div>

            {/* Curriculum Overview */}
            <div style={{ background: 'rgba(2,18,44,.85)', border: '1px solid rgba(55,181,255,.14)', borderRadius: '20px', overflow: 'hidden' }}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(55,181,255,.09)' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', marginBottom: '3px' }}>Curriculum Overview</h3>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,.3)' }}>Student readiness at a glance</p>
              </div>
              <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'With Curriculum', value: stats.studentsWithCurriculum, total: stats.totalStudents, color: '#4ade80', icon: <CheckCircle2 size={14} color="#4ade80" /> },
                  { label: 'No Curriculum Yet', value: stats.totalStudents - stats.studentsWithCurriculum, total: stats.totalStudents, color: '#fbbf24', icon: <Clock size={14} color="#fbbf24" /> },
                  { label: 'Avg Completion', value: stats.averageProgress, total: 100, color: BLUE, icon: <UserCheck size={14} color={BLUE} />, suffix: '%' },
                  { label: 'Total Content Items', value: stats.totalCurriculumItems, total: null, color: PURPLE, icon: <Target size={14} color={PURPLE} /> },
                ].map((row) => (
                  <div key={row.label}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {row.icon}
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>{row.label}</span>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 900, color: '#fff' }}>{row.value}{row.suffix || ''}</span>
                    </div>
                    {row.total !== null && (
                      <div style={{ height: '5px', background: 'rgba(255,255,255,.06)', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${row.total > 0 ? Math.round((row.value / row.total) * 100) : 0}%`, background: row.color, borderRadius: '99px', boxShadow: `0 0 6px ${row.color}66`, transition: 'width .5s' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content library CTA */}
            <Link href="/coach/content" style={{ textDecoration: 'none' }}>
              <div style={{ background: `linear-gradient(135deg,rgba(167,139,250,.14) 0%,rgba(2,18,44,.92) 55%,rgba(109,40,217,.1) 100%)`, border: '1px solid rgba(167,139,250,.22)', borderRadius: '20px', padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', transition: 'border-color .2s,transform .2s' }}
                onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.borderColor = 'rgba(167,139,250,.45)'; d.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.borderColor = 'rgba(167,139,250,.22)'; d.style.transform = ''; }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(167,139,250,.15)', border: '1px solid rgba(167,139,250,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 20px rgba(167,139,250,.2)' }}>
                  <GraduationCap size={24} color={PURPLE} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '3px' }}>Content Library</p>
                  <p style={{ fontSize: '13px', color: 'rgba(167,139,250,.6)', lineHeight: 1.4 }}>Browse and assign lessons to your students</p>
                </div>
                <div style={{ background: 'rgba(167,139,250,.15)', border: '1px solid rgba(167,139,250,.25)', borderRadius: '8px', padding: '6px' }}>
                  <ArrowRight size={16} color={PURPLE} />
                </div>
              </div>
            </Link>

          </div>
        </div>
      </main>
    </div>
  );
}

/* ──────────────────── Sub-components ──────────────────── */

function HeroRing({ pct, total, withCurriculum }: { pct: number; total: number; withCurriculum: number }) {
  const size = 148;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

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
        <span style={{ fontSize: '34px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{pct}%</span>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.4)', fontWeight: 600, letterSpacing: '.3px' }}>Avg Progress</span>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,.25)', marginTop: '2px' }}>{withCurriculum}/{total} active</span>
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
      style={{
        position: 'relative', background: 'rgba(2,18,44,.85)', border: `1px solid ${hovered ? color + '44' : 'rgba(55,181,255,.14)'}`, borderRadius: '16px', padding: '18px', overflow: 'hidden',
        boxShadow: hovered ? `0 8px 28px ${color}22` : 'none',
        animation: `fade-up .45s ${delay} both`,
      }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,transparent,${color}99,transparent)` }} />
      <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: `${color}1a`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', color, boxShadow: hovered ? `0 0 14px ${color}44` : 'none', transition: 'box-shadow .2s' }}>
        {icon}
      </div>
      <p style={{ fontSize: '30px', fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: '6px' }}>{value}</p>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,.38)', fontWeight: 600 }}>{label}</p>
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

function EmptyStudents() {
  return (
    <div style={{ textAlign: 'center', padding: '52px 24px' }}>
      <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(55,181,255,.09)', border: '1px solid rgba(55,181,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: `0 0 24px rgba(55,181,255,.15)` }}>
        <Users size={26} color={BLUE} />
      </div>
      <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>No students yet</h3>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,.35)', maxWidth: '260px', margin: '0 auto', lineHeight: 1.5 }}>
        Students will appear here once assigned to you by an admin.
      </p>
    </div>
  );
}
