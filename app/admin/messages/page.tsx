'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SkeletonDarkPage } from '@/components/ui/skeletons';
import {
  MessageSquare, Mail, User, Calendar, Search,
  Eye, FileText, Image as ImageIcon, Video,
} from 'lucide-react';
import Link from 'next/link';
import { AdminRoute } from '@/components/auth/protected-route';
import { messageService } from '@/lib/database/services/message.service';
import { userService } from '@/lib/database/services/user.service';
import { useAuth } from '@/lib/auth/context';
import { Message, MessageType } from '@/types/message';
import { User as UserType } from '@/types';
import { toast } from 'sonner';

const BLUE = '#37b5ff';
const RED = '#f87171';
const card = { background: 'rgba(2,18,44,0.85)', border: '1px solid rgba(55,181,255,0.14)', borderRadius: '16px' } as const;

const TYPE_STYLES: Record<string, { bg: string; color: string }> = {
  general:     { bg: `rgba(55,181,255,0.12)`, color: BLUE },
  instruction: { bg: 'rgba(34,197,94,0.12)',  color: '#22c55e' },
  feedback:    { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
  video_review:{ bg: 'rgba(248,113,113,0.15)', color: RED },
};

export default function AdminMessagesPage() {
  return <AdminRoute><MessagesContent /></AdminRoute>;
}

function MessagesContent() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<Record<string, UserType>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<MessageType | 'all'>('all');
  const [filterRead, setFilterRead] = useState<'all' | 'read' | 'unread'>('all');

  const fetchMessages = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const result = await messageService.getAdminSentMessages(currentUser.id, { limit: 100 });
      if (result.success && result.data) {
        setMessages(result.data.items);
        const userIds = [...new Set(result.data.items.map(m => m.toUserId))];
        const userResults = await Promise.all(userIds.map(id => userService.getUser(id)));
        const usersMap: Record<string, UserType> = {};
        userResults.forEach((res, idx) => {
          if (res.success && res.data) usersMap[userIds[idx]] = res.data;
        });
        setUsers(usersMap);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, [currentUser]);

  const filteredMessages = messages.filter(message => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSubject = message.subject.toLowerCase().includes(query);
      const matchesMessage = message.message.toLowerCase().includes(query);
      const matchesRecipient = users[message.toUserId]?.displayName?.toLowerCase().includes(query);
      if (!matchesSubject && !matchesMessage && !matchesRecipient) return false;
    }
    if (filterType !== 'all' && message.type !== filterType) return false;
    if (filterRead === 'read' && !message.isRead) return false;
    if (filterRead === 'unread' && message.isRead) return false;
    return true;
  });

  const stats = {
    total: messages.length,
    unread: messages.filter(m => !m.isRead).length,
    videoReview: messages.filter(m => m.type === 'video_review').length,
    general: messages.filter(m => m.type === 'general').length,
  };

  const getTypeIcon = (type: MessageType) => {
    switch (type) {
      case 'general': return <MessageSquare size={13} />;
      case 'instruction': return <FileText size={13} />;
      case 'feedback': return <Mail size={13} />;
      case 'video_review': return <Video size={13} />;
      default: return <MessageSquare size={13} />;
    }
  };

  if (loading) return <div style={{ padding: '48px' }}><SkeletonDarkPage /></div>;

  return (
    <>
      <style>{`
        .am-inp { background: rgba(2,18,44,0.7) !important; border: 1px solid rgba(55,181,255,0.18) !important; color: #fff !important; border-radius: 10px !important; padding: 10px 12px 10px 38px !important; width: 100% !important; font-size: 13px !important; outline: none !important; }
        .am-inp:focus { border-color: rgba(55,181,255,0.45) !important; }
        .am-inp::placeholder { color: rgba(255,255,255,0.25) !important; }
        .am-sel { background: rgba(2,18,44,0.7) !important; border: 1px solid rgba(55,181,255,0.18) !important; color: rgba(255,255,255,0.7) !important; border-radius: 10px !important; padding: 10px 12px !important; font-size: 13px !important; outline: none !important; cursor: pointer !important; }
        .am-sel:focus { border-color: rgba(55,181,255,0.45) !important; }
        .am-row { cursor: pointer; transition: background 0.2s; }
        .am-row:hover { background: rgba(55,181,255,0.05) !important; }
        .am-view { transition: all 0.2s !important; }
        .am-view:hover { background: rgba(55,181,255,0.12) !important; color: ${BLUE} !important; }
        @media (max-width: 1024px) { .am-stats { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px) { .am-stats { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Header */}
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '4px' }}>Sent Messages</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px' }}>View and manage messages sent to students</p>
        </div>

        {/* Stat Cards */}
        <div className="am-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[
            { label: 'Total Messages', value: stats.total, icon: MessageSquare, color: BLUE },
            { label: 'Unread', value: stats.unread, icon: Mail, color: RED, sub: stats.total > 0 ? `${Math.round((stats.unread / stats.total) * 100)}% of total` : '0% of total' },
            { label: 'Video Reviews', value: stats.videoReview, icon: Video, color: '#22c55e' },
            { label: 'General', value: stats.general, icon: FileText, color: '#fbbf24' },
          ].map(({ label, value, icon: Icon, color, sub }) => (
            <div key={label} style={{ position: 'relative', ...card, padding: '16px', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${color}66, transparent)` }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', fontWeight: 600 }}>{label}</p>
                <Icon size={14} color={`${color}88`} />
              </div>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: '26px', lineHeight: 1, marginBottom: sub ? '4px' : 0 }}>{value}</p>
              {sub && <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>{sub}</p>}
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ ...card, padding: '18px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={15} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input className="am-inp" placeholder="Search messages, subjects, recipients…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <select className="am-sel" value={filterType} onChange={e => setFilterType(e.target.value as MessageType | 'all')} style={{ minWidth: '160px' }}>
            <option value="all">All Types</option>
            <option value="general">General</option>
            <option value="instruction">Instruction</option>
            <option value="feedback">Feedback</option>
            <option value="video_review">Video Review</option>
          </select>
          <select className="am-sel" value={filterRead} onChange={e => setFilterRead(e.target.value as 'all' | 'read' | 'unread')} style={{ minWidth: '160px' }}>
            <option value="all">All Messages</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>
        </div>

        {/* Messages List */}
        <div style={{ position: 'relative', ...card, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${BLUE}, transparent)` }} />
          <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid rgba(55,181,255,0.08)' }}>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>Messages ({filteredMessages.length})</h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginTop: '2px' }}>
              {filterType !== 'all' ? `Showing ${filterType.replace('_', ' ')} messages` : 'All sent messages'}
              {filterRead !== 'all' ? ` · ${filterRead} only` : ''}
            </p>
          </div>

          {filteredMessages.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <MessageSquare size={44} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: '#fff', fontWeight: 600, fontSize: '15px', marginBottom: '6px' }}>No messages found</p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '15px', marginBottom: '16px' }}>
                {searchQuery || filterType !== 'all' || filterRead !== 'all' ? 'Try adjusting your filters' : "You haven't sent any messages yet"}
              </p>
              {!searchQuery && filterType === 'all' && filterRead === 'all' && (
                <Link href="/admin/users" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `linear-gradient(135deg, ${RED} 0%, #dc2626 100%)`, color: '#fff', padding: '9px 18px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '15px' }}>
                  <User size={14} /> Go to Users
                </Link>
              )}
            </div>
          ) : (
            <div>
              {filteredMessages.map((message, i) => {
                const recipient = users[message.toUserId];
                const ts = TYPE_STYLES[message.type] || TYPE_STYLES.general;
                return (
                  <div key={message.id} className="am-row"
                    style={{ padding: '16px 20px', borderBottom: i < filteredMessages.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: !message.isRead ? 'rgba(55,181,255,0.03)' : 'transparent' }}
                    onClick={() => router.push(`/admin/users/${message.toUserId}?tab=messages`)}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Subject + badges */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.7)', fontSize: '15px', fontWeight: 600 }}>
                            <span style={{ color: ts.color }}>{getTypeIcon(message.type)}</span>
                            {message.subject}
                          </div>
                          <span style={{ background: ts.bg, color: ts.color, padding: '1px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                            {message.type.replace('_', ' ')}
                          </span>
                          {!message.isRead && (
                            <span style={{ background: `rgba(55,181,255,0.15)`, color: BLUE, padding: '1px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>Unread</span>
                          )}
                        </div>
                        {/* Recipient */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '6px' }}>
                          <User size={12} /> To: {recipient?.displayName || 'Unknown User'}
                        </div>
                        {/* Preview */}
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginBottom: '8px', lineHeight: 1.5 }}>
                          {message.message.length > 160 ? message.message.substring(0, 160) + '…' : message.message}
                        </p>
                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div style={{ display: 'flex', gap: '12px', marginBottom: '6px' }}>
                            {message.attachments.some(a => a.type === 'image') && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
                                <ImageIcon size={11} /> {message.attachments.filter(a => a.type === 'image').length} image(s)
                              </span>
                            )}
                            {message.attachments.some(a => a.type === 'video') && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
                                <Video size={11} /> {message.attachments.filter(a => a.type === 'video').length} video(s)
                              </span>
                            )}
                            {message.attachments.some(a => a.type === 'document') && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
                                <FileText size={11} /> {message.attachments.filter(a => a.type === 'document').length} doc(s)
                              </span>
                            )}
                          </div>
                        )}
                        {/* Date */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>
                          <Calendar size={11} /> Sent {(message.createdAt?.toDate?.() ?? new Date()).toLocaleString()}
                          {message.readAt && <span>· Read {(message.readAt?.toDate?.() ?? new Date()).toLocaleString()}</span>}
                        </div>
                      </div>
                      <button className="am-view" onClick={e => { e.stopPropagation(); router.push(`/admin/users/${message.toUserId}?tab=messages`); }}
                        style={{ flexShrink: 0, padding: '7px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Eye size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
