'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, LineChart, Eye } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { SkeletonContentPage } from '@/components/ui/skeletons';
import { userService } from '@/lib/database';
import { User as UserType } from '@/types';
import { toast } from 'sonner';
import { GoalieChartingHistory } from '@/components/charting/GoalieChartingHistory';

const BLUE  = '#37b5ff';
const GOLD  = '#D4A93B';
const cardBg = 'linear-gradient(135deg, #04213f 0%, #0a2d52 100%)';
const border  = '1px solid rgba(55,181,255,0.22)';

export default function CoachStudentChartingPage() {
  const { user }  = useAuth();
  const router    = useRouter();
  const params    = useParams();
  const studentId = params.studentId as string;

  const [student, setStudent] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId || !user) return;
    const load = async () => {
      setLoading(true);
      try {
        const result = await userService.getUser(studentId);
        if (result.success && result.data) {
          if (user.role === 'coach' && result.data.assignedCoachId !== user.id) {
            toast.error('This goalie is not on your roster');
            router.push('/coach/students');
            return;
          }
          setStudent(result.data);
        } else {
          toast.error('Goalie not found');
          router.push('/coach/students');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load goalie');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId, user, router]);

  if (loading) return <SkeletonContentPage />;

  if (!student) {
    return (
      <div style={{ maxWidth: '560px', margin: '80px auto', padding: '0 16px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '16px' }}>Goalie not found</p>
        <Link href="/coach/students" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(55,181,255,0.08)', border: '1px solid rgba(55,181,255,0.2)', color: BLUE, padding: '9px 18px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '13px' }}>
          Back to Goalies
        </Link>
      </div>
    );
  }

  const initials = (student.displayName || student.email || 'G')
    .split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      <style>{`.sc-back:hover { color: ${BLUE} !important; background: rgba(55,181,255,0.08) !important; }`}</style>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(20px,3vw,32px) clamp(14px,3vw,24px) 56px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        <Link href="/coach/students" className="sc-back" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, borderRadius: '8px', padding: '6px 10px', width: 'fit-content', transition: 'all 0.2s' }}>
          <ArrowLeft size={15} /> Back to Goalies
        </Link>

        {/* ── Header ── */}
        <div style={{ position: 'relative', borderRadius: '20px', background: 'linear-gradient(135deg, #04213f 0%, #0b3460 50%, #0d1f40 100%)', border, boxShadow: '0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(55,181,255,0.12)', padding: '24px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-50px', right: '-30px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(212,169,59,0.08)', filter: 'blur(60px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, transparent, ${GOLD}, ${BLUE}44, transparent)` }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: `linear-gradient(135deg, ${GOLD} 0%, #B8891E 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800, color: '#0c0800', flexShrink: 0, border: '2px solid rgba(212,169,59,0.35)' }}>
                {student.profileImage
                  ? <img src={student.profileImage} alt={student.displayName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : initials}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Eye size={14} color={BLUE} />
                  <span style={{ color: BLUE, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>View Only</span>
                  <LineChart size={13} color="rgba(255,255,255,0.2)" />
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Self-Charts</span>
                </div>
                <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '22px' }}>{student.displayName}</h1>
                {student.email && <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', marginTop: '2px' }}>{student.email}</p>}
              </div>
            </div>
            <Link
              href={`/coach/charting/${studentId}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', background: `${GOLD}15`, border: `1px solid ${GOLD}40`, color: GOLD, fontSize: '12px', fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}
            >
              Chart this Goalie →
            </Link>
          </div>
        </div>

        {/* ── Goalie's Self-Charts (read-only) ── */}
        <div style={{ position: 'relative', background: cardBg, border, borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(55,181,255,0.3), transparent)' }} />
          <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid rgba(55,181,255,0.1)' }}>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>Goalie&rsquo;s Self-Charts</h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
              Every session the goalie has charted. Expand a row to read the full reflection, Mind Vault entries, and ratings.
            </p>
          </div>
          <div style={{ padding: '16px' }}>
            <GoalieChartingHistory studentId={studentId} onOpenSession={sid => router.push(`/charting/sessions/${sid}`)} />
          </div>
        </div>

      </div>
    </>
  );
}
