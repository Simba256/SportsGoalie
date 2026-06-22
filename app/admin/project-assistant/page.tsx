import { Metadata } from 'next';
import { ChatInterface } from '@/components/admin/chat-interface';
import { SessionStatsPanel } from '@/components/admin/session-stats';
import { Bot, MessageCircle, Zap, Shield, Info } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Project Assistant | Admin',
  description: 'Your AI assistant for the Smarter Goalie platform',
};

const BLUE = '#37b5ff';
const card = { background: 'rgba(2,18,44,0.85)', border: '1px solid rgba(55,181,255,0.14)', borderRadius: '16px' } as const;

export default function ProjectAssistantPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <style>{`@media (max-width: 1024px) { .pa-layout { grid-template-columns: 1fr !important; } }`}</style>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', marginBottom: '6px' }}>Project Assistant</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px' }}>Your AI helper for understanding the platform and tracking progress</p>
      </div>

      {/* Info Alert */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'rgba(55,181,255,0.08)', border: '1px solid rgba(55,181,255,0.2)', borderRadius: '12px', padding: '16px' }}>
        <Info size={16} color={BLUE} style={{ flexShrink: 0, marginTop: '2px' }} />
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>
          Ask me anything about what the platform can do, how to use different features, or check on the project progress. I&apos;m here to help!
        </p>
      </div>

      {/* Main layout */}
      <div className="pa-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
        <div>
          <ChatInterface />
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <SessionStatsPanel />

          {/* What I Can Help With */}
          <div style={{ position: 'relative', ...card, padding: '20px', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${BLUE}66, transparent)` }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Zap size={15} color={BLUE} />
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>What I Can Help With</h3>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginBottom: '16px' }}>Just ask!</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { title: 'Platform Features', sub: 'What you can do and where to find things' },
                { title: 'Project Progress', sub: "What's been built and what's coming next" },
                { title: 'Navigation Help', sub: 'Find the right page for what you need' },
                { title: 'How-To Guides', sub: 'Step-by-step help for common tasks' },
              ].map(({ title, sub }) => (
                <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <MessageCircle size={14} color={`${BLUE}88`} style={{ flexShrink: 0, marginTop: '3px' }} />
                  <div>
                    <p style={{ color: '#fff', fontWeight: 600, fontSize: '15px' }}>{title}</p>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div style={{ position: 'relative', ...card, padding: '20px', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${BLUE}66, transparent)` }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Bot size={15} color={BLUE} />
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>Tips</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {['Ask "What can I do?" for a quick overview', 'Ask "Where do I...?" to find pages', 'Ask "How is progress?" for updates', 'Be specific for better answers'].map((tip) => (
                <p key={tip} style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>• {tip}</p>
              ))}
            </div>
          </div>

          {/* Private & Secure */}
          <div style={{ position: 'relative', ...card, padding: '20px', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${BLUE}66, transparent)` }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Shield size={15} color={BLUE} />
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>Private &amp; Secure</h3>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Only admins can access this assistant. Your conversations are private and not stored.</p>
          </div>

          {/* Try Asking */}
          <div style={{ background: 'rgba(55,181,255,0.06)', border: '1px solid rgba(55,181,255,0.15)', borderRadius: '12px', padding: '16px' }}>
            <p style={{ color: BLUE, fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>Try Asking</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {['"What can I do as an admin?"', '"How do I invite a new coach?"', '"Where can I see student progress?"', '"What features are ready?"', '"How is the project going?"'].map((q) => (
                <p key={q} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontStyle: 'italic' }}>{q}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
