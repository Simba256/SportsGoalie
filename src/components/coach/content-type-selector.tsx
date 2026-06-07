'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, PlayCircle, ArrowRight, Video, FileText, Paperclip, Clock, ListChecks, Award, X } from 'lucide-react';

export type ContentType = 'lesson' | 'quiz';

const BLUE = '#37b5ff';
const PURPLE = '#a78bfa';

interface ContentTypeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: ContentType) => void;
}

export function ContentTypeSelector({ open, onOpenChange, onSelect }: ContentTypeSelectorProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onOpenChange(false); };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  const handleSelect = (type: ContentType) => { onSelect(type); onOpenChange(false); };

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}
      onClick={e => { if (e.target === e.currentTarget) onOpenChange(false); }}
    >
      <style>{`
        .cts-card:hover { border-color: rgba(55,181,255,0.4) !important; background: rgba(55,181,255,0.06) !important; transform: translateY(-3px) !important; box-shadow: 0 12px 40px rgba(55,181,255,0.12) !important; }
        .cts-card:hover .cts-arrow { transform: translateX(4px); }
        .cts-quiz-card:hover { border-color: rgba(167,139,250,0.4) !important; background: rgba(167,139,250,0.06) !important; transform: translateY(-3px) !important; box-shadow: 0 12px 40px rgba(167,139,250,0.12) !important; }
        .cts-cancel:hover { background: rgba(255,255,255,0.08) !important; border-color: rgba(255,255,255,0.2) !important; color: #fff !important; }
      `}</style>

      <div style={{ background: 'rgba(2,14,36,0.98)', border: '1px solid rgba(55,181,255,0.2)', borderRadius: '24px', width: '100%', maxWidth: '640px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>

        {/* Header */}
        <div style={{ position: 'relative', background: 'linear-gradient(135deg, #04213f 0%, #0b3460 60%, #0d1f40 100%)', padding: '28px 32px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-50px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(55,181,255,0.12)', filter: 'blur(60px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(167,139,250,0.08)', filter: 'blur(50px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg, transparent, ${BLUE}, transparent)` }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: BLUE, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Content Library</p>
              <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '6px' }}>Create New Content</h2>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>Choose the type of content you'd like to build</p>
            </div>
            <button onClick={() => onOpenChange(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Cards */}
        <div style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

          {/* Lesson */}
          <button onClick={() => handleSelect('lesson')} className="cts-card"
            style={{ textAlign: 'left', background: 'rgba(55,181,255,0.03)', border: '1px solid rgba(55,181,255,0.18)', borderRadius: '16px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `rgba(55,181,255,0.15)`, border: `1px solid rgba(55,181,255,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 20px rgba(55,181,255,0.2)` }}>
                <BookOpen size={22} color={BLUE} />
              </div>
              <div>
                <p style={{ color: '#fff', fontSize: '15px', fontWeight: 800, marginBottom: '2px' }}>Lesson</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Video + Text Content</p>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', lineHeight: 1.6 }}>
              Create a lesson with video, written instructions, learning objectives, and attachments.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[{ icon: <Video size={10} />, label: 'Video' }, { icon: <FileText size={10} />, label: 'Rich Text' }, { icon: <Paperclip size={10} />, label: 'Attachments' }].map(f => (
                <span key={f.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 600, color: BLUE, background: 'rgba(55,181,255,0.1)', border: '1px solid rgba(55,181,255,0.2)', borderRadius: '20px', padding: '2px 8px' }}>
                  {f.icon}{f.label}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: BLUE, fontSize: '12px', fontWeight: 700, marginTop: '4px' }}>
              Create Lesson <ArrowRight size={13} className="cts-arrow" style={{ transition: 'transform 0.2s' }} />
            </div>
          </button>

          {/* Quiz */}
          <button onClick={() => handleSelect('quiz')} className="cts-quiz-card"
            style={{ textAlign: 'left', background: 'rgba(167,139,250,0.03)', border: '1px solid rgba(167,139,250,0.18)', borderRadius: '16px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 20px rgba(167,139,250,0.2)' }}>
                <PlayCircle size={22} color={PURPLE} />
              </div>
              <div>
                <p style={{ color: '#fff', fontSize: '15px', fontWeight: 800, marginBottom: '2px' }}>Video Quiz</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Interactive Assessment</p>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', lineHeight: 1.6 }}>
              Create an interactive quiz with questions at specific video timestamps.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[{ icon: <Clock size={10} />, label: 'Timed' }, { icon: <ListChecks size={10} />, label: 'Multi Choice' }, { icon: <Award size={10} />, label: 'Auto-grade' }].map(f => (
                <span key={f.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 600, color: PURPLE, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '20px', padding: '2px 8px' }}>
                  {f.icon}{f.label}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: PURPLE, fontSize: '12px', fontWeight: 700, marginTop: '4px' }}>
              Create Quiz <ArrowRight size={13} style={{ transition: 'transform 0.2s' }} />
            </div>
          </button>
        </div>

        {/* Footer */}
        <div style={{ padding: '0 32px 24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => onOpenChange(false)} className="cts-cancel"
            style={{ padding: '9px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  , document.body);
}
