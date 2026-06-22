'use client';

import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';

const BLUE = '#37b5ff';

export default function NotFound() {
  return (
    <>
      <style>{`
        .nf-home:hover { opacity: 0.9 !important; transform: translateY(-1px); }
        .nf-back:hover { background: rgba(55,181,255,0.12) !important; border-color: ${BLUE} !important; }
      `}</style>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg, #000f28 0%, #062344 46%, #0a3159 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ background: 'rgba(2,18,44,0.9)', border: '1.5px solid rgba(55,181,255,0.18)', borderRadius: '20px', padding: '48px 40px', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 8px 48px rgba(0,0,0,0.5)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(55,181,255,0.08)', border: '1px solid rgba(55,181,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span style={{ color: BLUE, fontSize: '22px', fontWeight: 900 }}>404</span>
          </div>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 900, marginBottom: '10px', letterSpacing: '-0.02em' }}>Page Not Found</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: 1.6, marginBottom: '28px' }}>
            Sorry, the page you are looking for doesn't exist or has been moved.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <button className="nf-home" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${BLUE} 0%, #0ea5e9 100%)`, color: '#000f28', fontSize: '13px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(55,181,255,0.3)' }}>
                <Home size={16} /> Go Home
              </button>
            </Link>
            <button
              className="nf-back"
              onClick={() => window.history.back()}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '10px', border: '1px solid rgba(55,181,255,0.2)', background: 'rgba(55,181,255,0.05)', color: BLUE, fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <ArrowLeft size={16} /> Go Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
