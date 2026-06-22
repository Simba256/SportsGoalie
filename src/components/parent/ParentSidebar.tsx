'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Users, LogOut,
  ChevronLeft, Menu, X, User, UserCircle, Eye, BarChart3,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';

const BLUE = '#37b5ff';
const sidebarBg = 'linear-gradient(180deg, #000f28 0%, #051e3e 60%, #062344 100%)';
const borderColor = 'rgba(55,181,255,0.12)';

interface ParentSidebarProps { isOpen: boolean; onToggle: () => void; }

const navItems = [
  { label: 'Dashboard', href: '/parent',           icon: LayoutDashboard },
  { label: 'My Goalies', href: '/parent/goalies',  icon: Users },
  { label: 'Charting',   href: '/parent/charting', icon: BarChart3 },
  { label: 'Perception', href: '/parent/perception', icon: Eye },
  { label: 'Profile',    href: '/parent/profile',  icon: UserCircle },
];

export function ParentSidebar({ isOpen, onToggle }: ParentSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => { await logout(); router.push('/'); };
  const isActive = (href: string) => href === '/parent' ? pathname === '/parent' : pathname.startsWith(href);

  return (
    <>
      <style>{`
        .p-sidebar { width: 0; transform: translateX(-100%); transition: width 0.3s ease, transform 0.3s ease; }
        .p-sidebar-open { width: 256px !important; transform: translateX(0) !important; }
        @media (min-width: 1024px) { .p-sidebar { width: 80px !important; transform: translateX(0) !important; } }
        .p-nav-inactive:hover{background:rgba(55,181,255,0.08)!important;color:#fff!important}
        .p-logout:hover{background:rgba(248,113,113,0.1)!important;color:#f87171!important}
        .p-toggle:hover{background:rgba(55,181,255,0.1)!important;color:${BLUE}!important}
      `}</style>
      {isOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 40 }} className="lg:hidden" onClick={onToggle} />}
      <aside className={isOpen ? 'p-sidebar-open' : 'p-sidebar'} style={{ position: 'fixed', top: 0, left: 0, height: '100%', zIndex: 50, display: 'flex', flexDirection: 'column', background: sidebarBg, borderRight: `1px solid ${borderColor}`, boxShadow: '4px 0 24px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg, transparent, ${BLUE}, transparent)` }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', padding: '0 16px', borderBottom: `1px solid ${borderColor}`, flexShrink: 0 }}>
          {isOpen ? (
            <>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                <img src="/logo.png" alt="Smarter Goalie" style={{ height: '32px', width: 'auto' }} />
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '13px' }}>SmarterGoalie</span>
              </Link>
              <button onClick={onToggle} className="p-toggle" style={{ padding: '6px', borderRadius: '8px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.2s' }}>
                <X size={18} className="lg:hidden" /><ChevronLeft size={18} className="hidden lg:block" />
              </button>
            </>
          ) : (
            <button onClick={onToggle} className="p-toggle hidden lg:flex" style={{ width: '100%', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '8px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.2s' }}>
              <Menu size={20} />
            </button>
          )}
        </div>

        <div style={{ padding: isOpen ? '16px' : '12px 8px', borderBottom: `1px solid ${borderColor}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isOpen ? '12px' : '0', justifyContent: isOpen ? 'flex-start' : 'center' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: `linear-gradient(135deg, ${BLUE} 0%, #0ea5e9 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `2px solid rgba(55,181,255,0.3)` }}>
              <User size={18} color="#000f28" />
            </div>
            {isOpen && (
              <div style={{ overflow: 'hidden' }}>
                <p style={{ color: '#fff', fontSize: '13px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.displayName || user?.email?.split('@')[0]}</p>
                <p style={{ color: BLUE, fontSize: '11px', fontWeight: 600 }}>Parent</p>
              </div>
            )}
          </div>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px', scrollbarWidth: 'none', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map(item => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} onClick={() => { if (window.innerWidth < 1024) onToggle(); }} className={!active ? 'p-nav-inactive' : ''} title={!isOpen ? item.label : undefined}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: isOpen ? '10px 12px' : '10px', justifyContent: isOpen ? 'flex-start' : 'center', borderRadius: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s', background: active ? `rgba(55,181,255,0.18)` : 'transparent', color: active ? BLUE : 'rgba(255,255,255,0.55)', border: active ? `1px solid rgba(55,181,255,0.3)` : '1px solid transparent', boxShadow: active ? `0 0 12px rgba(55,181,255,0.12)` : 'none' }}>
                <Icon size={18} style={{ flexShrink: 0, color: active ? BLUE : undefined }} />
                {isOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '8px', borderTop: `1px solid ${borderColor}`, flexShrink: 0 }}>
          <button onClick={handleLogout} className="p-logout" title={!isOpen ? 'Log out' : undefined}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: isOpen ? '10px 12px' : '10px', justifyContent: isOpen ? 'flex-start' : 'center', borderRadius: '10px', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {isOpen && <span>Log out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
