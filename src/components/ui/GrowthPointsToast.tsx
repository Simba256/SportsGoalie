'use client';

import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface GrowthPointsToastProps {
  points: number;
  show: boolean;
}

export function GrowthPointsToast({ points, show }: GrowthPointsToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2800);
    return () => clearTimeout(t);
  }, [show]);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes gp-float {
          0%   { opacity: 0; transform: translateY(20px) scale(0.85); }
          15%  { opacity: 1; transform: translateY(0px)  scale(1.06); }
          30%  { transform: translateY(-6px) scale(1); }
          70%  { opacity: 1; transform: translateY(-10px); }
          100% { opacity: 0; transform: translateY(-38px); }
        }
        .gp-toast { animation: gp-float 2.8s ease-out forwards; }
      `}</style>
      <div
        className="gp-toast"
        style={{
          position: 'fixed',
          bottom: '88px',
          right: '28px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          border: '1px solid rgba(251,191,36,0.7)',
          borderRadius: '50px',
          padding: '10px 20px 10px 14px',
          boxShadow: '0 8px 32px rgba(251,191,36,0.45), 0 2px 8px rgba(0,0,0,0.3)',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <Zap size={16} color="#78350f" fill="#78350f" />
        <span style={{ fontSize: '14px', fontWeight: 900, color: '#78350f', letterSpacing: '0.2px' }}>
          +{points} Growth Points
        </span>
      </div>
    </>
  );
}
