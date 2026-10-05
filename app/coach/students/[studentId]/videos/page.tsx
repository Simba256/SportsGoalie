'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Video, Clock, AlertCircle, CheckCircle, Eye, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { SkeletonContentPage } from '@/components/ui/skeletons';
import { userService } from '@/lib/database';
import { videoReviewService, StudentVideo } from '@/lib/database/services/video-review.service';
import { User as UserType } from '@/types';
import { toast } from 'sonner';

const BLUE  = '#37b5ff';
const GOLD  = '#D4A93B';
const AMBER = '#fbbf24';
const GREEN = '#22c55e';
const cardBg = 'linear-gradient(135deg, #04213f 0%, #0a2d52 100%)';
const border  = '1px solid rgba(55,181,255,0.22)';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatDate(ts: any): string {
  if (!ts) return '—';
  if (typeof ts?.toDate === 'function') return ts.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  if (ts instanceof Date) return ts.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  if (ts?.seconds) return new Date(ts.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return '—';
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

const STATUS_INFO: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  pending:       { color: AMBER, label: 'Pending Review', icon: <AlertCircle size={13} color={AMBER} /> },
  reviewed:      { color: BLUE,  label: 'Under Review',  icon: <Eye size={13} color={BLUE} /> },
  feedback_sent: { color: GREEN, label: 'Feedback Sent', icon: <CheckCircle size={13} color={GREEN} /> },
};

export default function CoachStudentVideosPage() {
  const { user }  = useAuth();
  const router    = useRouter();
  const params    = useParams();
  const studentId = params.studentId as string;

  const [student, setStudent] = useState<UserType | null>(null);
  const [videos, setVideos]   = useState<StudentVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId || !user) return;
    const load = async () => {
      setLoading(true);
      try {
        const [studentResult, videosResult] = await Promise.all([
          userService.getUser(studentId),
          videoReviewService.getStudentVideos(studentId),
        ]);

        if (studentResult.success && studentResult.data) {
          if (user.role === 'coach' && studentResult.data.assignedCoachId !== user.id) {
            toast.error('This goalie is not on your roster');
            router.push('/coach/students');
            return;
          }
          setStudent(studentResult.data);
        } else {
          toast.error('Goalie not found');
          router.push('/coach/students');
          return;
        }

        if (videosResult.success && videosResult.data) {
          setVideos(videosResult.data);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId, user, router]);

  if (loading) return <SkeletonContentPage />;
  if (!student) return null;

  const initials = (student.displayName || student.email || 'G')
    .split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  const pendingCount = videos.filter(v => v.status === 'pending').length;
  const totalLogged  = videos.reduce((sum, v) => sum + (v.totalTimeSpentSeconds || 0), 0);

  return (
    <>
      <style>{`.sv-back:hover { color: ${BLUE} !important; background: rgba(55,181,255,0.08) !important; }`}</style>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(20px,3vw,32px) clamp(14px,3vw,24px) 56px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        <Link href="/coach/students" className="sv-back" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, borderRadius: '8px', padding: '6px 10px', width: 'fit-content', transition: 'all 0.2s' }}>
          <ArrowLeft size={15} /> Back to Goalies
        </Link>

        {/* Header */}
        <div style={{ position: 'relative', borderRadius: '20px', background: 'linear-gradient(135deg, #04213f 0%, #0b3460 50%, #0d1f40 100%)', border, boxShadow: '0 4px 32px rgba(0,0,0,0.5)', padding: '24px', overflow: 'hidden' }}>
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
                  <Video size={14} color={GOLD} />
                  <span style={{ color: GOLD, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Uploaded Videos</span>
                </div>
                <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '22px' }}>{student.displayName}</h1>
                {student.email && <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', marginTop: '2px' }}>{student.email}</p>}
              </div>
            </div>

            {/* Summary pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {pendingCount > 0 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '20px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)' }}>
                  <AlertCircle size={12} color={AMBER} />
                  <span style={{ color: AMBER, fontSize: '11px', fontWeight: 700 }}>{pendingCount} unreviewed</span>
                </div>
              )}
              {totalLogged > 0 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '20px', background: 'rgba(212,169,59,0.1)', border: '1px solid rgba(212,169,59,0.25)' }}>
                  <Clock size={12} color={GOLD} />
                  <span style={{ color: GOLD, fontSize: '11px', fontWeight: 700 }}>{formatDuration(totalLogged)} total logged</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Go to Video Reviews CTA */}
        <div style={{ background: 'rgba(212,169,59,0.06)', border: '1px solid rgba(212,169,59,0.18)', borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', margin: 0 }}>Ready to review a video?</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '3px 0 0' }}>
              Open the Video Reviews module to watch, log analysis time, and send feedback.
            </p>
          </div>
          <Link
            href="/coach/video-reviews"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '10px', background: GOLD, color: '#0c0800', fontSize: '13px', fontWeight: 800, textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            <ExternalLink size={13} /> Go to Video Reviews
          </Link>
        </div>

        {/* Video List */}
        {videos.length === 0 ? (
          <div style={{ background: cardBg, border, borderRadius: '16px', padding: '48px 24px', textAlign: 'center' }}>
            <Video size={36} color="rgba(255,255,255,0.12)" style={{ margin: '0 auto 12px', display: 'block' }} />
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', margin: 0 }}>{student.displayName} hasn&apos;t uploaded any videos yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {videos.map(video => {
              const info   = STATUS_INFO[video.status] ?? { color: 'rgba(255,255,255,0.4)', label: 'Unknown', icon: null };
              const isPending = video.status === 'pending';
              const sessions  = video.timeSessions || [];
              const totalSecs = video.totalTimeSpentSeconds || 0;

              return (
                <div key={video.id} style={{ background: cardBg, borderRadius: '16px', overflow: 'hidden', border: isPending ? `1px solid rgba(251,191,36,0.3)` : border }}>
                  {/* Accent line — amber for pending, blue otherwise */}
                  <div style={{ height: '2px', background: `linear-gradient(90deg, transparent, ${info.color}55, transparent)` }} />

                  <div style={{ padding: '16px 20px' }}>
                    {/* Top row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: isPending ? 'rgba(251,191,36,0.12)' : 'rgba(55,181,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Video size={14} color={isPending ? AMBER : BLUE} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {video.fileName}
                          </p>
                          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: '2px 0 0' }}>
                            Uploaded {formatDate(video.uploadedAt)}
                            {video.sport && <> · {video.sport}</>}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {totalSecs > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} color={GOLD} />
                            <span style={{ color: GOLD, fontWeight: 700, fontSize: '12px' }}>{formatDuration(totalSecs)}</span>
                          </div>
                        )}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: `${info.color}15`, border: `1px solid ${info.color}40`, color: info.color, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '10px' }}>
                          {info.icon} {info.label}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    {video.description && (
                      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', margin: '0 0 12px', lineHeight: 1.5, borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: '10px' }}>
                        {video.description}
                      </p>
                    )}

                    {/* Session log */}
                    {sessions.length > 0 && (
                      <div style={{ background: 'rgba(212,169,59,0.04)', border: '1px solid rgba(212,169,59,0.12)', borderRadius: '10px', padding: '12px 14px' }}>
                        <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 8px' }}>
                          Analysis Log
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {sessions.map((s, i) => (
                            <div key={s.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                              <span style={{ color: 'rgba(255,255,255,0.5)' }}>{formatDate(s.startedAt)} — {s.reviewerName}</span>
                              <span style={{ color: GOLD, fontWeight: 700 }}>{formatDuration(s.durationSeconds)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pending placeholder */}
                    {sessions.length === 0 && isPending && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 10px', background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.12)', borderRadius: '8px' }}>
                        <AlertCircle size={12} color={AMBER} />
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0 }}>No analysis time logged yet</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
