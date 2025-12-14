import Link from 'next/link';
import Image from 'next/image';
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  MapPin,
  Phone,
  Heart,
  ArrowRight,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

export function Footer() {
  const year = new Date().getFullYear();

  const platform = [
    { href: '/sports', title: 'Courses', desc: 'Expert-led training' },
    { href: '/quizzes', title: 'Skill Quizzes', desc: 'Test your knowledge' },
    { href: '/progress', title: 'Progress Tracking', desc: 'Monitor your growth' },
    { href: '/dashboard', title: 'Dashboard', desc: 'Your training hub' },
  ];

  const support = [
    { href: '/help', title: 'Help Center', desc: 'Get instant help' },
    { href: '/contact', title: 'Contact Us', desc: 'Reach our team' },
    { href: '/community', title: 'Community', desc: 'Join athletes worldwide' },
    { href: '/tutorials', title: 'Tutorials', desc: 'Learn the platform' },
  ];

  const socials = [
    { Icon: Facebook, label: 'Facebook', className: 'hover:bg-blue-500/10 hover:text-blue-600' },
    { Icon: Twitter, label: 'Twitter', className: 'hover:bg-sky-500/10 hover:text-sky-600' },
    { Icon: Instagram, label: 'Instagram', className: 'hover:bg-pink-500/10 hover:text-pink-600' },
    { Icon: Youtube, label: 'YouTube', className: 'hover:bg-red-500/10 hover:text-red-600' },
  ];

  return (
    <footer className="relative border-t bg-gradient-to-b from-white via-slate-50 to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
      {/* soft glow accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-10 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -top-24 right-10 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4">
        {/* TOP STRIP CTA */}
        <div className="py-10">
          <div className="rounded-2xl border bg-white/70 backdrop-blur dark:bg-white/5 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 md:p-8 items-center">
              <div className="lg:col-span-7">
                <h3 className="text-xl md:text-2xl font-bold">
                  Ready to level up your training?
                </h3>
                <p className="mt-2 text-sm md:text-base text-muted-foreground">
                  Learn skills, take quizzes, and track progress — all in one clean dashboard.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border bg-slate-50/70 dark:bg-white/5 px-4 py-2">
                    <span className="text-lg font-bold text-blue-600">10K+</span>
                    <span className="text-xs text-muted-foreground">Athletes</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border bg-slate-50/70 dark:bg-white/5 px-4 py-2">
                    <span className="text-lg font-bold text-purple-600">500+</span>
                    <span className="text-xs text-muted-foreground">Courses</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border bg-slate-50/70 dark:bg-white/5 px-4 py-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Trusted by 10,000+ athletes</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col sm:flex-row gap-3 justify-end">
                <Button variant="outline" className="rounded-xl" asChild>
                  <Link href="/sports">Explore Courses</Link>
                </Button>
                <Button
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90"
                  asChild
                >
                  <Link href="/auth/register">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN FOOTER GRID */}
        <div className="pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* BRAND */}
            <div className="lg:col-span-4 space-y-4">
              {/* BIG LOGO (header logo.svg) */}
              <div className="flex items-start">
                <Image
                  src="/logo.svg"
                  alt="SmarterGoalie"
                  width={700}
                  height={260}
                  priority
                  unoptimized
                  className="h-28 md:h-32 w-auto object-contain"
                />
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                Empowering athletes through cutting-edge digital learning, personalized training,
                and comprehensive progress tracking. Your journey to excellence starts here.
              </p>

              <p className="text-xs text-muted-foreground">
                Built for consistency, clarity, and real improvement.
              </p>
            </div>

            {/* LINKS */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm font-semibold tracking-wide text-foreground mb-4">
                  Platform
                </h4>
                <ul className="space-y-3">
                  {platform.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="group block rounded-xl border border-transparent px-3 py-2 hover:border-slate-200/70 dark:hover:border-white/10 hover:bg-white/60 dark:hover:bg-white/5 transition"
                      >
                        <div className="text-sm font-medium text-foreground group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold tracking-wide text-foreground mb-4">
                  Support
                </h4>
                <ul className="space-y-3">
                  {support.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="group block rounded-xl border border-transparent px-3 py-2 hover:border-slate-200/70 dark:hover:border-white/10 hover:bg-white/60 dark:hover:bg-white/5 transition"
                      >
                        <div className="text-sm font-medium text-foreground group-hover:text-purple-600 transition-colors">
                          {item.title}
                        </div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CONNECT CARD */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl border bg-white/70 backdrop-blur dark:bg-white/5 p-5 shadow-sm">
                <h4 className="text-sm font-semibold tracking-wide text-foreground mb-4">
                  Connect
                </h4>

                {/* Email / Phone / Location icons like social buttons */}
                <div className="space-y-3">
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 rounded-xl border bg-white/60 dark:bg-white/5 p-3 text-left transition hover:scale-[1.01] hover:bg-blue-500/5"
                  >
                    <span className="h-10 w-10 rounded-xl border bg-white/60 dark:bg-white/5 flex items-center justify-center text-muted-foreground hover:text-blue-600 transition">
                      <Mail className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">
                        hello@smartergoalie.com
                      </div>
                      <div className="text-xs text-muted-foreground">Email us anytime</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="w-full flex items-center gap-3 rounded-xl border bg-white/60 dark:bg-white/5 p-3 text-left transition hover:scale-[1.01] hover:bg-emerald-500/5"
                  >
                    <span className="h-10 w-10 rounded-xl border bg-white/60 dark:bg-white/5 flex items-center justify-center text-muted-foreground hover:text-emerald-600 transition">
                      <Phone className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">
                        +1 (555) 123-4567
                      </div>
                      <div className="text-xs text-muted-foreground">Mon–Fri, 9am–6pm</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="w-full flex items-center gap-3 rounded-xl border bg-white/60 dark:bg-white/5 p-3 text-left transition hover:scale-[1.01] hover:bg-rose-500/5"
                  >
                    <span className="h-10 w-10 rounded-xl border bg-white/60 dark:bg-white/5 flex items-center justify-center text-muted-foreground hover:text-rose-600 transition">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">
                        San Francisco, CA
                      </div>
                      <div className="text-xs text-muted-foreground">HQ</div>
                    </div>
                  </button>
                </div>

                <div className="mt-5">
                  <div className="text-xs font-semibold text-foreground mb-2">Follow</div>
                  <div className="flex gap-2">
                    {socials.map(({ Icon, label, className }) => (
                      <button
                        key={label}
                        aria-label={label}
                        className={`h-10 w-10 rounded-xl border bg-white/60 dark:bg-white/5 text-muted-foreground transition hover:scale-105 ${className}`}
                      >
                        <Icon className="h-5 w-5 mx-auto" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM BAR */}
          <div className="mt-10 border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                © {year} SmarterGoalie. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Made with <Heart className="inline h-3 w-3 text-rose-500" /> for athletes worldwide
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-blue-600 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-blue-600 transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-muted-foreground hover:text-blue-600 transition-colors">
                Cookie Policy
              </Link>
              <Link href="/accessibility" className="text-muted-foreground hover:text-blue-600 transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
