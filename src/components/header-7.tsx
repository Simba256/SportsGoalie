'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
const navItems = ['Features', 'About', 'Pricing', 'Login'];

export const Header7 = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const isLandingPage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/85 backdrop-blur-md border-b border-slate-200/70 py-3 shadow-sm'
          : 'bg-slate-100/85 backdrop-blur-md border-b border-slate-200/70 py-4'
      }`}
    >
      <div
        className={`flex justify-between items-center ${
          isLandingPage ? 'w-full px-6 md:px-8 lg:px-10' : 'max-w-7xl mx-auto px-6'
        }`}
      >
        <button
          type="button"
          onClick={() => router.push('/')}
          className="flex items-center space-x-2 cursor-pointer"
          aria-label="Go to landing page"
        >
          <img
            src="/logo.png"
            alt="Smarter Goalie Logo"
            className="h-10 w-auto object-contain transition-all duration-300 brightness-110 contrast-105"
          />
        </button>

        <div className="hidden md:flex space-x-8">
          {navItems.map((label) => (
            <button
              key={label}
              onClick={() => {
                if (label === 'Pricing') {
                  router.push('/pricing');
                } else if (label === 'Login') {
                  router.push('/auth/login');
                } else {
                  // Hash scroll for Features and About
                  const element = document.getElementById(label.toLowerCase());
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }}
              className={`transition-colors duration-500 font-medium text-[15px] tracking-wide cursor-pointer ${
                label === 'Login'
                  ? 'bg-[#37b5ff] hover:bg-[#22a7f5] text-white px-4 py-2 rounded-md transition-all duration-300'
                  : 'text-slate-800 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

      </div>
    </nav>
  );
};