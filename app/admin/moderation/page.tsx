'use client';

import { useState, useEffect } from 'react';
import { SkeletonDarkPage } from '@/components/ui/skeletons';
import {
  Flag, Eye, Trash2, CheckCircle, XCircle, AlertTriangle,
  Search, MoreHorizontal, MessageSquare, User, Calendar,
} from 'lucide-react';
import { AdminRoute } from '@/components/auth/protected-route';
import { toast } from 'sonner';

const BLUE = '#37b5ff';
const RED = '#f87171';
const GREEN = '#22c55e';
const AMBER = '#fbbf24';
const card = { background: 'rgba(2,18,44,0.85)', border: '1px solid rgba(55,181,255,0.14)', borderRadius: '16px' } as const;

interface ReportedContent {
  id: string;
  type: 'quiz' | 'sport' | 'skill' | 'comment';
  title: string;
  content: string;
  reportedBy: { id: string; name: string; email: string };
  reportReason: string;
  reportedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
}

interface ContentReview {
  id: string;
  type: 'quiz' | 'sport' | 'skill';
  title: string;
  author: { id: string; name: string; email: string };
  createdAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  reviewNotes?: string;
}

const PRIORITY_STYLES: Record<string, { bg: string; color: string }> = {
  high:   { bg: 'rgba(248,113,113,0.15)', color: RED },
  medium: { bg: `rgba(55,181,255,0.12)`,  color: BLUE },
  low:    { bg: 'rgba(34,197,94,0.12)',   color: GREEN },
};

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  pending:  { bg: 'rgba(251,191,36,0.12)',  color: AMBER },
  approved: { bg: 'rgba(34,197,94,0.12)',   color: GREEN },
  rejected: { bg: 'rgba(248,113,113,0.15)', color: RED },
};

const TABS = [
  { id: 'reports', label: 'Reported Content' },
  { id: 'reviews', label: 'Content Reviews' },
  { id: 'guidelines', label: 'Guidelines' },
];

export default function AdminModerationPage() {
  return <AdminRoute><ModerationContent /></AdminRoute>;
}

function ModerationContent() {
  const [reportedContent, setReportedContent] = useState<ReportedContent[]>([]);
  const [pendingReviews, setPendingReviews] = useState<ContentReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('reports');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setReportedContent([
        { id: '1', type: 'quiz', title: 'Basketball Fundamentals Quiz', content: 'Quiz content with potentially inappropriate questions...', reportedBy: { id: 'user1', name: 'John Doe', email: 'john@example.com' }, reportReason: 'Inappropriate content', reportedAt: new Date('2024-01-15'), status: 'pending', priority: 'high' },
        { id: '2', type: 'comment', title: 'Comment on Soccer Skills', content: 'This is a controversial comment that was reported...', reportedBy: { id: 'user2', name: 'Jane Smith', email: 'jane@example.com' }, reportReason: 'Spam', reportedAt: new Date('2024-01-14'), status: 'pending', priority: 'medium' },
        { id: '3', type: 'sport', title: 'Tennis Training Program', content: 'Sport content that violates community guidelines...', reportedBy: { id: 'user3', name: 'Mike Johnson', email: 'mike@example.com' }, reportReason: 'Copyright violation', reportedAt: new Date('2024-01-13'), status: 'approved', priority: 'low' },
      ]);
      setPendingReviews([
        { id: '1', type: 'quiz', title: 'Advanced Swimming Techniques Quiz', author: { id: 'author1', name: 'Sarah Wilson', email: 'sarah@example.com' }, createdAt: new Date('2024-01-16'), status: 'pending' },
        { id: '2', type: 'sport', title: 'Rock Climbing Basics', author: { id: 'author2', name: 'Tom Brown', email: 'tom@example.com' }, createdAt: new Date('2024-01-15'), status: 'pending' },
      ]);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleApproveReport = (reportId: string) => {
    setReportedContent(prev => prev.map(r => r.id === reportId ? { ...r, status: 'approved' } : r));
    toast.success('Report approved and content removed');
  };

  const handleRejectReport = (reportId: string) => {
    setReportedContent(prev => prev.map(r => r.id === reportId ? { ...r, status: 'rejected' } : r));
    toast.success('Report rejected');
  };

  const handleApproveContent = (reviewId: string) => {
    setPendingReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status: 'approved' } : r));
    toast.success('Content approved and published');
  };

  const handleRejectContent = (reviewId: string) => {
    setPendingReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status: 'rejected' } : r));
    toast.success('Content rejected');
  };

  const filteredReports = reportedContent.filter(report => {
    const matchesSearch = !searchTerm || report.title.toLowerCase().includes(searchTerm.toLowerCase()) || report.content.toLowerCase().includes(searchTerm.toLowerCase()) || report.reportedBy.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (statusFilter === 'all' || report.status === statusFilter) && (priorityFilter === 'all' || report.priority === priorityFilter);
  });

  const filteredReviews = pendingReviews.filter(review =>
    !searchTerm || review.title.toLowerCase().includes(searchTerm.toLowerCase()) || review.author.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingReportsCount = reportedContent.filter(r => r.status === 'pending').length;
  const highPriorityCount = reportedContent.filter(r => r.priority === 'high' && r.status === 'pending').length;
  const pendingReviewsCount = pendingReviews.filter(r => r.status === 'pending').length;

  if (loading) return <div style={{ padding: '48px' }}><SkeletonDarkPage /></div>;

  return (
    <>
      <style>{`
        .mod-inp { background: rgba(2,18,44,0.7) !important; border: 1px solid rgba(55,181,255,0.18) !important; color: #fff !important; border-radius: 10px !important; padding: 10px 12px 10px 38px !important; width: 100% !important; font-size: 13px !important; outline: none !important; }
        .mod-inp:focus { border-color: rgba(55,181,255,0.45) !important; }
        .mod-inp::placeholder { color: rgba(255,255,255,0.25) !important; }
        .mod-sel { background: rgba(2,18,44,0.7) !important; border: 1px solid rgba(55,181,255,0.18) !important; color: rgba(255,255,255,0.7) !important; border-radius: 10px !important; padding: 10px 12px !important; font-size: 13px !important; outline: none !important; cursor: pointer !important; }
        .mod-sel:focus { border-color: rgba(55,181,255,0.45) !important; }
        .mod-tab { transition: all 0.2s !important; }
        .mod-tab:hover { background: rgba(55,181,255,0.06) !important; }
        .mod-row { transition: background 0.2s; }
        .mod-row:hover { background: rgba(55,181,255,0.03) !important; }
        .mod-btn { display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: rgba(255,255,255,0.5); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
        .mod-btn-green:hover { background: rgba(34,197,94,0.12) !important; color: ${GREEN} !important; border-color: rgba(34,197,94,0.3) !important; }
        .mod-btn-red:hover { background: rgba(248,113,113,0.12) !important; color: ${RED} !important; border-color: rgba(248,113,113,0.3) !important; }
        .mod-btn-blue:hover { background: rgba(55,181,255,0.12) !important; color: ${BLUE} !important; border-color: rgba(55,181,255,0.3) !important; }
        .mod-menu-item:hover { background: rgba(55,181,255,0.1) !important; color: #fff !important; }
        @media (max-width: 1024px) { .mod-stats { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px) { .mod-stats { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Header */}
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '4px' }}>Content Moderation</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px' }}>Review reported content and approve new submissions</p>
        </div>

        {/* Stat Cards */}
        <div className="mod-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[
            { label: 'Pending Reports', value: pendingReportsCount, sub: 'Require attention', icon: Flag, color: RED },
            { label: 'High Priority', value: highPriorityCount, sub: 'Urgent reports', icon: AlertTriangle, color: AMBER },
            { label: 'Pending Reviews', value: pendingReviewsCount, sub: 'Awaiting approval', icon: Eye, color: BLUE },
            { label: 'Actions Today', value: 0, sub: 'Moderation actions', icon: CheckCircle, color: GREEN },
          ].map(({ label, value, sub, icon: Icon, color }) => (
            <div key={label} style={{ position: 'relative', ...card, padding: '16px', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${color}66, transparent)` }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', fontWeight: 600 }}>{label}</p>
                <Icon size={14} color={`${color}88`} />
              </div>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: '26px', lineHeight: 1, marginBottom: '4px' }}>{value}</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div style={{ ...card, padding: '18px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={15} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input className="mod-inp" placeholder="Search content, users, or reports…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="mod-sel" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select className="mod-sel" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Tabs + Content */}
        <div style={{ ...card, overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${BLUE}, transparent)` }} />

          <div style={{ display: 'flex', borderBottom: '1px solid rgba(55,181,255,0.1)' }}>
            {TABS.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} className={!active ? 'mod-tab' : ''} onClick={() => setActiveTab(tab.id)}
                  style={{ flex: 1, padding: '14px 8px', background: active ? 'rgba(55,181,255,0.08)' : 'transparent', border: 'none', borderBottom: active ? `2px solid ${BLUE}` : '2px solid transparent', color: active ? BLUE : 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div style={{ padding: '20px' }}>

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              filteredReports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Flag size={44} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 12px' }} />
                  <p style={{ color: '#fff', fontWeight: 600, fontSize: '15px', marginBottom: '6px' }}>No reports found</p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '15px' }}>{searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' ? 'Try adjusting your search criteria' : 'No content has been reported yet'}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {filteredReports.map(report => {
                    const ps = PRIORITY_STYLES[report.priority] || PRIORITY_STYLES.low;
                    const ss = STATUS_STYLES[report.status] || STATUS_STYLES.pending;
                    return (
                      <div key={report.id} className="mod-row" style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Flag size={16} color={RED} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '5px' }}>
                            <p style={{ color: '#fff', fontWeight: 600, fontSize: '15px' }}>{report.title}</p>
                            <span style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', padding: '1px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>{report.type}</span>
                            <span style={{ background: ps.bg, color: ps.color, padding: '1px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, textTransform: 'capitalize' }}>{report.priority}</span>
                            <span style={{ background: ss.bg, color: ss.color, padding: '1px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, textTransform: 'capitalize' }}>{report.status}</span>
                          </div>
                          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginBottom: '8px' }}>{report.content}</p>
                          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
                              <User size={11} /> {report.reportedBy.name}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
                              <MessageSquare size={11} /> {report.reportReason}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
                              <Calendar size={11} /> {report.reportedAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          <button className="mod-btn mod-btn-blue"><Eye size={12} /> Review</button>
                          {report.status === 'pending' && (
                            <>
                              <button className="mod-btn mod-btn-red" onClick={() => handleApproveReport(report.id)}><CheckCircle size={12} /> Remove</button>
                              <button className="mod-btn mod-btn-green" onClick={() => handleRejectReport(report.id)}><XCircle size={12} /> Dismiss</button>
                            </>
                          )}
                          <div style={{ position: 'relative' }}>
                            <button className="mod-btn" onClick={() => setOpenMenuId(openMenuId === report.id ? null : report.id)}>
                              <MoreHorizontal size={14} />
                            </button>
                            {openMenuId === report.id && (
                              <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', background: 'rgba(2,18,44,0.98)', border: '1px solid rgba(55,181,255,0.2)', borderRadius: '10px', padding: '4px', zIndex: 50, minWidth: '160px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                                <button className="mod-menu-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', borderRadius: '7px', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left' }}>
                                  View Full Content
                                </button>
                                <button className="mod-menu-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', borderRadius: '7px', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left' }}>
                                  Contact Reporter
                                </button>
                                <button className="mod-menu-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', borderRadius: '7px', border: 'none', background: 'transparent', color: RED, fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left' }}>
                                  <Trash2 size={12} /> Delete Report
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              filteredReviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Eye size={44} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 12px' }} />
                  <p style={{ color: '#fff', fontWeight: 600, fontSize: '15px', marginBottom: '6px' }}>No content to review</p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '15px' }}>All content has been reviewed or no new submissions</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {filteredReviews.map(review => {
                    const ss = STATUS_STYLES[review.status] || STATUS_STYLES.pending;
                    const initials = review.author.name.split(' ').map(n => n[0]).join('').toUpperCase();
                    return (
                      <div key={review.id} className="mod-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: `linear-gradient(135deg, ${BLUE}33 0%, rgba(14,165,233,0.2) 100%)`, border: '1px solid rgba(55,181,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: BLUE, flexShrink: 0 }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                              <p style={{ color: '#fff', fontWeight: 600, fontSize: '15px' }}>{review.title}</p>
                              <span style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', padding: '1px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>{review.type}</span>
                              <span style={{ background: ss.bg, color: ss.color, padding: '1px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, textTransform: 'capitalize' }}>{review.status}</span>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>By {review.author.name}</p>
                            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={10} /> Submitted {review.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                          <button className="mod-btn mod-btn-blue"><Eye size={12} /> Preview</button>
                          {review.status === 'pending' && (
                            <>
                              <button className="mod-btn mod-btn-green" onClick={() => handleApproveContent(review.id)}><CheckCircle size={12} /> Approve</button>
                              <button className="mod-btn mod-btn-red" onClick={() => handleRejectContent(review.id)}><XCircle size={12} /> Reject</button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* Guidelines Tab */}
            {activeTab === 'guidelines' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  {
                    title: 'Content Standards',
                    items: [
                      'All content must be appropriate for all ages',
                      'No offensive, discriminatory, or harmful language',
                      'Content must be accurate and educational',
                      'No copyright violations or plagiarism',
                      'Must follow sports safety guidelines',
                    ],
                  },
                  {
                    title: 'Report Priorities',
                    items: [
                      'High: Immediate safety concerns, illegal content, severe violations',
                      'Medium: Policy violations, inappropriate content, spam',
                      'Low: Minor issues, duplicate content, formatting problems',
                    ],
                  },
                  {
                    title: 'Moderation Actions',
                    items: [
                      'Approve: Content meets standards and can be published',
                      'Reject: Content violates policies and must be removed',
                      'Request Changes: Content needs modifications before approval',
                      'Escalate: Complex cases requiring senior review',
                    ],
                  },
                  {
                    title: 'Response Times',
                    items: [
                      'High priority reports: 2 hours',
                      'Medium priority reports: 24 hours',
                      'Low priority reports: 72 hours',
                      'Content reviews: 48 hours',
                    ],
                  },
                ].map(({ title, items }) => (
                  <div key={title} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}>
                    <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '3px', height: '14px', background: BLUE, borderRadius: '2px' }} />
                      {title}
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '7px' }}>
                      {items.map((item, i) => (
                        <li key={i} style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', lineHeight: 1.5, paddingLeft: '12px', position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 0, color: BLUE }}>·</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
