'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, PlayCircle, ArrowRight, Video, FileText, Paperclip, Clock, ListChecks, Award, X } from 'lucide-react';

export type ContentType = 'lesson' | 'quiz';

const GOLD   = '#D4A93B';
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
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}
      onClick={e => { if (e.target === e.currentTarget) onOpenChange(false); }}
    >
      <style>{`
        .cts-lesson:hover { border-color: rgba(212,169,59,0.48) !important; background: rgba(212,169,59,0.07) !important; transform: translateY(-3px) !important; box-shadow: 0 12px 40px rgba(212,169,59,0.14) !important; }
        .cts-lesson:hover .cts-arrow { transform: translateX(4px); }
        .cts-quiz:hover   { border-color: rgba(167,139,250,0.45) !important; background: rgba(167,139,250,0.07) !important; transform: translateY(-3px) !important; box-shadow: 0 12px 40px rgba(167,139,250,0.14) !important; }
        .cts-cancel:hover { background: rgba(255,255,255,0.08) !important; border-color: rgba(255,255,255,0.22) !important; color: #fff !important; }
      `}</style>

      <div style={{
        background: 'linear-gradient(145deg, #030e22 0%, #04213f 100%)',
        border: `1px solid rgba(212,169,59,0.25)`,
        borderRadius: '22px',
        width: '100%',
        maxWidth: '660px',
        overflow: 'hidden',
        boxShadow: `0 32px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(212,169,59,0.06)`,
      }}>

        {/* Header */}
        <div style={{ position: 'relative', background: 'linear-gradient(135deg, #04213f 0%, #0b3460 60%, #0d1f40 100%)', padding: '26px 30px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-50px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(212,169,59,0.1)', filter: 'blur(60px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: GOLD, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Content Library</p>
              <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '5px' }}>Create New Content</h2>
              <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: '13px' }}>Choose the type of content you'd like to build</p>
            </div>
            <button onClick={() => onOpenChange(false)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '7px', borderRadius: '9px', display: 'flex' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Cards */}
        <div style={{ padding: '24px 30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

          {/* Lesson card */}
          <button onClick={() => handleSelect('lesson')} className="cts-lesson"
            style={{ textAlign: 'left', background: 'rgba(212,169,59,0.04)', border: `1px solid rgba(212,169,59,0.2)`, borderRadius: '16px', padding: '22px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(212,169,59,0.15)', border: `1px solid rgba(212,169,59,0.32)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 20px rgba(212,169,59,0.18)' }}>
                <BookOpen size={23} color={GOLD} />
              </div>
              <div>
                <p style={{ color: '#fff', fontSize: '15px', fontWeight: 800, marginBottom: '2px' }}>Lesson</p>
                <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '11px' }}>Video + Text Content</p>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: '12px', lineHeight: 1.65 }}>
              Create a lesson with video, written instructions, learning objectives, and attachments.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[{ icon: <Video size={10} />, label: 'Video' }, { icon: <FileText size={10} />, label: 'Rich Text' }, { icon: <Paperclip size={10} />, label: 'Attachments' }].map(f => (
                <span key={f.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 600, color: GOLD, background: 'rgba(212,169,59,0.1)', border: `1px solid rgba(212,169,59,0.22)`, borderRadius: '20px', padding: '2px 8px' }}>
                  {f.icon}{f.label}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: GOLD, fontSize: '12px', fontWeight: 700, marginTop: '4px' }}>
              Create Lesson <ArrowRight size={13} className="cts-arrow" style={{ transition: 'transform 0.2s' }} />
            </div>
          </button>

          {/* Quiz card */}
          <button onClick={() => handleSelect('quiz')} className="cts-quiz"
            style={{ textAlign: 'left', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '16px', padding: '22px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 20px rgba(167,139,250,0.18)' }}>
                <PlayCircle size={23} color={PURPLE} />
              </div>
              <div>
                <p style={{ color: '#fff', fontSize: '15px', fontWeight: 800, marginBottom: '2px' }}>Knowledge Check</p>
                <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '11px' }}>Interactive Assessment</p>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: '12px', lineHeight: 1.65 }}>
              Create an interactive knowledge check with questions at specific video timestamps.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[{ icon: <Clock size={10} />, label: 'Timed' }, { icon: <ListChecks size={10} />, label: 'Multi Choice' }, { icon: <Award size={10} />, label: 'Auto-grade' }].map(f => (
                <span key={f.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 600, color: PURPLE, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.22)', borderRadius: '20px', padding: '2px 8px' }}>
                  {f.icon}{f.label}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: PURPLE, fontSize: '12px', fontWeight: 700, marginTop: '4px' }}>
              Create Knowledge Check <ArrowRight size={13} style={{ transition: 'transform 0.2s' }} />
            </div>
          </button>
        </div>

        {/* Footer */}
        <div style={{ padding: '0 30px 24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => onOpenChange(false)} className="cts-cancel"
            style={{ padding: '10px 22px', background: 'transparent', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  , document.body);
}
