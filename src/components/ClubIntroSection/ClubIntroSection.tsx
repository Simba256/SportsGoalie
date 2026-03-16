'use client';

import { useEffect, useState } from 'react';
import './ClubIntroSection.css';

const slides = [
  '/1.avif',
  '/2.avif',
  '/3.png',
  '/4.jfif',
  '/5.png',
  '/6.avif',
];

export default function ClubIntroSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 2200);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section id="about" className="club-intro-wrap px-6 py-14 md:py-20" aria-label="About Smarter Goalie Club">
      <div className="club-intro-shell mx-auto max-w-7xl rounded-[2rem] p-7 md:p-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base md:text-lg font-semibold text-zinc-800">About Smarter Goalie Club</h2>
        </div>

        <div className="grid items-end gap-6 md:grid-cols-[1fr_360px_1fr]">
          <div className="club-intro-left order-2 md:order-1">
            <h3 className="club-intro-title text-3xl md:text-5xl lg:text-6xl font-extrabold text-zinc-900 leading-[0.95]">
              MORE THAN COACHING
            </h3>
          </div>

          <div className="club-intro-media order-1 md:order-2">
            <div className="club-intro-frame">
              {slides.map((src, index) => (
                <div
                  key={src}
                  className={`club-intro-slide ${index === activeSlide ? 'is-active' : ''}`}
                  style={{ backgroundImage: `url("${src}")` }}
                  aria-hidden={index !== activeSlide}
                />
              ))}
              <div className="club-intro-overlay" />
            </div>
          </div>

          <div className="club-intro-right order-3">
            <h3 className="club-intro-title text-3xl md:text-4xl lg:text-6xl font-extrabold text-zinc-900 leading-[0.95]">
              A NEW GOALKEEPER LIFESTYLE
            </h3>
          </div>
        </div>

        <div className="mt-7 md:mt-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <p className="max-w-3xl text-zinc-700 leading-relaxed text-sm md:text-base">
            Smarter Goalie is your complete sports learning platform where young athletes train smarter,
            build confidence, and track real growth. From structured learning paths to high-impact drills,
            we turn daily practice into long-term progress.
          </p>
          <a
            href="#features"
            className="inline-flex items-center rounded-full border border-zinc-400/70 bg-transparent px-6 py-3 text-zinc-800 font-semibold text-sm shadow-sm transition-all duration-300 hover:scale-105 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 shrink-0"
          >
            Discover our approach
          </a>
        </div>
      </div>
    </section>
  );
}
