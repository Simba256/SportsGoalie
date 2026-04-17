'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
const navItems = ['Features', 'About', 'Pricing', 'Login'];

export const Header7 = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const isPricingPage = pathname === '/pricing';
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
          ? 'bg-white/40 backdrop-blur-md border-b border-gray-200/50 py-4 shadow-sm'
          : 'bg-transparent py-6'
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
            className="h-12 w-auto object-contain transition-all duration-300 brightness-110 contrast-105"
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
                  ? 'bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-md transition-all duration-300'
                  : isScrolled
                  ? 'text-gray-800 hover:text-gray-900'
                  : isPricingPage
                  ? 'text-gray-800 hover:text-gray-900'
                  : 'text-white hover:text-white/80'
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