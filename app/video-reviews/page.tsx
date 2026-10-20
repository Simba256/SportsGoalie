'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { videoReviewService, StudentVideo } from '@/lib/database/services/video-review.service';
import { SkeletonContentPage } from '@/components/ui/skeletons';
import { Clock, Video, CheckCircle, AlertCircle } from 'lucide-react';

const BLUE  = '#37b5ff';
const GOLD  = '#D4A93B';
const GREEN = '#22c55e';
const AMBER = '#fbbf24';

const card = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(55,181,255,0.12)',
  borderRadius: '14px',
  overflow: 'hidden',
} as const;

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

export default function VideoReviewRecordsPage() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<StudentVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    videoReviewService.getStudentVideos(user.id).then(result => {
      if (result.success && result.data) setVideos(result.data);
      setLoading(false);
    });
  }, [user?.id]);

  if (loading) return <SkeletonContentPage />;

  const totalAnalyzed = videos.filter(v => (v.totalTimeSpentSeconds || 0) > 0).length;

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 16px 64px' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(212,169,59,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Clock size={18} color={GOLD} />
          </div>
          <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '22px', margin: 0 }}>Video Review Records</h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>
          Time logged by your coach for each video analysis session
        </p>

        {/* Summary pill */}
        {totalAnalyzed > 0 && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', padding: '5px 14px', borderRadius: '20px', background: 'rgba(212,169,59,0.1)', border: '1px solid rgba(212,169,59,0.25)' }}>
            <CheckCircle size={13} color={GOLD} />
            <span style={{ color: GOLD, fontSize: '12px', fontWeight: 700 }}>{totalAnalyzed} of {videos.length} {videos.length === 1 ? 'video' : 'videos'} analyzed</span>
          </div>
        )}
      </div>

      {/* Empty state */}
      {videos.length === 0 && (
        <div style={{ ...card, padding: '48px 24px', textAlign: 'center' }}>
          <Video size={36} color="rgba(255,255,255,0.12)" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', margin: 0 }}>No videos submitted yet</p>
        </div>
      )}

      {/* Video cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {videos.map(video => {
          const sessions = video.timeSessions || [];
          const totalSeconds = video.totalTimeSpentSeconds || 0;
          const statusColor = video.status === 'feedback_sent' ? GREEN : video.status === 'reviewed' ? BLUE : AMBER;
          const statusLabel = video.status === 'feedback_sent' ? 'Reviewed' : video.status === 'reviewed' ? 'In Progress' : 'Pending';

          return (
            <div key={video.id} style={card}>
              {/* Top accent line matching status */}
              <div style={{ height: '2px', background: `linear-gradient(90deg, transparent, ${statusColor}55, transparent)` }} />

              {/* Video header row */}
              <div style={{ padding: '16px 20px', borderBottom: sessions.length > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <Video size={15} color="rgba(255,255,255,0.3)" style={{ flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {video.fileName}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: '2px 0 0' }}>
                      Uploaded {formatDate(video.uploadedAt)}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  {totalSeconds > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={13} color={GOLD} />
                      <span style={{ color: GOLD, fontWeight: 700, fontSize: '13px' }}>{formatDuration(totalSeconds)}</span>
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>total</span>
                    </div>
                  )}
                  <span style={{ background: `${statusColor}15`, border: `1px solid ${statusColor}40`, color: statusColor, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '10px' }}>
                    {statusLabel}
                  </span>
                </div>
              </div>

              {/* Time log rows */}
              {sessions.length > 0 && (
                <div style={{ padding: '14px 20px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>
                    Coach Analysis Log
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sessions.map((s, i) => (
                      <div key={s.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', background: 'rgba(212,169,59,0.05)', border: '1px solid rgba(212,169,59,0.14)', borderRadius: '8px' }}>
                        <div>
                          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', fontWeight: 600, margin: 0 }}>{s.reviewerName}</p>
                          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: '2px 0 0' }}>{formatDate(s.startedAt)}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Clock size={12} color={GOLD} />
                          <span style={{ color: GOLD, fontWeight: 700, fontSize: '13px' }}>{formatDuration(s.durationSeconds)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending placeholder */}
              {sessions.length === 0 && video.status === 'pending' && (
                <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={13} color={AMBER} />
                  <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', margin: 0 }}>Coach review not started yet</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
