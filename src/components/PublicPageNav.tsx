'use client';

import { useRouter } from 'next/navigation';

const NAV_LINKS = [
  { label: 'WHO WE ARE', path: '/who-we-are' },
  { label: 'THE SYSTEM',  path: '/the-system' },
  { label: 'CONTACT US', path: '/contact' },
];

export function PublicPageNav() {
  const router = useRouter();

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 h-16 flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <img src="/logo.png" alt="Smarter Goalie" className="h-10 sm:h-11 w-auto object-contain" />
        </button>

        <div className="hidden sm:flex gap-6 items-center">
          {NAV_LINKS.map(({ label, path }) => (
            <button
              key={path}
              onClick={() => router.push(path)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                color: '#1e293b',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
