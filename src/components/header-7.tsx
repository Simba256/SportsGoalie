'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const navItems = ['Features', 'About', 'Pricing'];

export const Header7 = () => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

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
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img
            src="/logo.png"
            alt="Smarter Goalie Logo"
            className="h-12 w-auto object-contain transition-all duration-300"
          />
        </div>

        <div className="hidden md:flex space-x-8">
          {navItems.map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className={`transition-colors font-medium text-[15px] tracking-wide ${
                isScrolled
                  ? 'text-gray-700 hover:text-gray-900'
                  : 'text-white/90 hover:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]'
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        <button
          onClick={() => router.push('/auth/login')}
          className={`px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 hover:scale-105 ${
            isScrolled
              ? 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-red-500/30'
              : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-black/30'
          }`}
        >
          Get Started
        </button>
      </div>
    </nav>
  );
};