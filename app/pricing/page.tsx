'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronDown } from 'lucide-react';

export default function PricingPage() {
  const router = useRouter();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const plans = [
    {
      name: '1 Pillar',
      description: 'Focused training for one skill pillar.',
      upfront: '$95',
      monthly: '$15',
      highlight: false,
      color: 'zinc',
      features: [
        '1 skill pillar access',
        'Video lessons + quizzes',
        'Progress tracking dashboard',
        'Parent access included',
      ],
    },
    {
      name: '3+ Pillars',
      description: 'Balanced plan for multi-skill growth.',
      upfront: '$150',
      monthly: '$15',
      highlight: true,
      color: 'red',
      features: [
        '3+ skill pillars access',
        'Advanced quizzes + analytics',
        'Session charting system',
        'Coach feedback tools',
        'Weekly progress reports',
      ],
    },
    {
      name: 'All 7 Pillars',
      description: 'Full platform access for complete development.',
      upfront: '$225',
      monthly: '$15',
      highlight: false,
      color: 'blue',
      features: [
        'All 7 pillars unlocked',
        'Full lesson + quiz library',
        'Advanced charting + analytics',
        'Priority support + feedback',
      ],
    },
  ];

  const comparisonRows = [
    {
      offer: 'Video Review - 1 Hour',
      founding: '$35 (50% off)',
      postFounding: '$70',
      benefit: 'Founding members keep this discounted rate permanently',
    },
    {
      offer: 'Video Review - 3 Hours',
      founding: '$105 (50% off)',
      postFounding: '$210',
      benefit: 'Best value for extended game/practice analysis',
    },
    {
      offer: 'Goalie Subscription',
      founding: 'Join now and lock your active rate',
      postFounding: '$15/mo',
      benefit: 'Price protection as the platform grows',
    },
    {
      offer: 'Team Subscription',
      founding: 'Founding access + lock-in option',
      postFounding: '$20/mo',
      benefit: 'Lower long-term operational cost',
    },
    {
      offer: 'Organization Subscription',
      founding: 'Founding access + lock-in option',
      postFounding: '$100/mo',
      benefit: 'Early adoption advantage for larger groups',
    },
    {
      offer: 'Federation Subscription',
      founding: 'Founding access + lock-in option',
      postFounding: '$200/mo',
      benefit: 'Enterprise-scale rollout with cost certainty',
    },
    {
      offer: 'Full Platform Launch Pricing',
      founding: 'Enter before launch to secure founding terms',
      postFounding: '$1,500 one-time + $20-$35/mo',
      benefit: 'Largest expected savings window',
    },
  ];

  const faqs = [
    {
      q: 'What does "founding member" mean?',
      a: 'Founding members join during our early-access period and lock in the lowest prices ever offered permanently. When the full platform launches, standard pricing will be significantly higher.',
    },
    {
      q: 'What is the 30-day guarantee?',
      a: 'Your upfront payment is held for 30 days. Cancel in weeks 1-2 for a full refund. Sign the early waiver for immediate payment release. On day 30, the payment is released and your access continues.',
    },
    {
      q: 'Can I upgrade from 1 Pillar to more later?',
      a: 'Yes. You can upgrade your pillar access at any time by paying the difference at founding rates, as long as the founding period is still open.',
    },
    {
      q: 'What is a Skill Pillar?',
      a: 'Our 7 Pillars are Mind-Set, Skating Tech, Seven Angle-Mark System, Seven Point System, Form Tech, Game/Practice Performance Charting, and Decision-Making. Each pillar is a complete learning module.',
    },
    {
      q: 'Do parents get access with any plan?',
      a: 'Yes. All plans include parent access so guardians can monitor progress, view reports, and stay connected to their child\'s development.',
    },
    {
      q: 'Is there team pricing?',
      a: 'Teams are $20/mo, organizations $100/mo, and federations $200/mo post-founding. Contact us for custom team packages during the founding period.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="relative pt-20 pb-12 px-6 overflow-hidden bg-slate-50">

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <p className="inline-flex items-center gap-2 text-xs md:text-sm font-bold tracking-[0.18em] uppercase text-red-600 mb-6">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Founding Member Rates Live
          </p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.05] mb-5 tracking-tight">
            Invest In Your <span className="text-blue-500">Game</span>
          </h1>
          <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto mb-5 leading-relaxed">
            Lock in founding member rates before the full platform launch. Choose your pillar path and pay upfront once to unlock your pillars.
          </p>
          

          <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4 text-sm md:text-base text-slate-700">
            <span className="font-semibold">From $95 upfront</span>
            <span className="text-slate-300">|</span>
            <span className="font-semibold">Only $15/month</span>
            <span className="text-slate-300">|</span>
            <span className="font-semibold">30-day guarantee</span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-6 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="rounded-3xl bg-slate-50 border border-red-200 p-7 md:p-8 flex flex-col transition-all duration-300 hover:border-red-500 hover:shadow-lg"
              >
                <div>
                  <span className="inline-block rounded-xl px-4 py-1.5 text-sm font-semibold mb-5 bg-red-100 text-red-700">
                    {plan.name}
                  </span>
                  <p className="text-base text-slate-600 mb-8 min-h-[56px]">{plan.description}</p>

                  <div className="mb-6">
                    <p className="text-4xl md:text-5xl font-bold text-slate-900 leading-none">{plan.upfront}</p>
                    <p className="text-sm text-slate-500 mt-2">One-time + {plan.monthly}/mo</p>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6 flex-1 flex flex-col">
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                        <span className="text-sm text-slate-700 leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => router.push('/auth/register')}
                    className="mt-8 w-full py-3 rounded-full font-semibold text-base transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r from-red-600 to-red-500 text-white hover:shadow-lg hover:shadow-red-500/30"
                  >
                    Book a Demo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founding and Post-Founding Plans */}
      <section className="py-16 px-6 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-red-500 font-semibold tracking-widest uppercase text-xs mb-3">Founding Plans</p>
            <p className="text-gray-500 max-w-3xl mx-auto">
              A side-by-side view of what you get by joining now compared to standard pricing after the founding period.
            </p>
          </div>

          <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-white to-red-50/30 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[820px]">
                <thead className="bg-gradient-to-r from-slate-900 via-red-900 to-slate-900 text-white">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold">Offer</th>
                    <th className="px-6 py-4 text-sm font-semibold">Founding Member</th>
                    <th className="px-6 py-4 text-sm font-semibold">Post-Founding</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.offer} className="border-t border-slate-100 hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">{row.offer}</td>
                      <td className="px-6 py-4 text-sm text-red-700 font-medium bg-red-50/40">{row.founding}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{row.postFounding}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-blue-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((item, i) => {
              const isOpen = openFaqIndex === i;

              return (
                <div
                  key={item.q}
                  className="rounded-2xl border border-blue-100 bg-gradient-to-r from-slate-50 to-blue-50/40 transition-colors duration-300 hover:border-red-200 hover:bg-white"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-6 px-6 md:px-8 py-5 text-left"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${i}`}
                  >
                    <span className="text-base font-bold text-gray-900">{item.q}</span>
                    <span className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                      isOpen ? 'bg-red-500 text-white' : 'bg-blue-100 text-blue-700'
                    }`}>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </span>
                  </button>

                  {isOpen && (
                    <div id={`faq-answer-${i}`} className="px-6 md:px-8 pb-6">
                      <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 px-6 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        <div className="absolute inset-0 opacity-60 [background-size:48px_48px] [background-image:linear-gradient(to_right,rgba(59,130,246,0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(239,68,68,0.08)_1px,transparent_1px)]"></div>
        <div className="absolute inset-0 [background-size:24px_24px] [background-image:radial-gradient(circle_at_center,rgba(30,41,59,0.05)_1px,transparent_1px)]"></div>
        <div className="absolute -top-14 left-8 w-52 h-52 rounded-full bg-red-500/10 blur-3xl"></div>
        <div className="absolute -bottom-16 right-8 w-60 h-60 rounded-full bg-blue-500/10 blur-3xl"></div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <p className="text-red-500 font-semibold tracking-widest uppercase text-xs mb-4">Limited founding spots</p>
          <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Lock In Your <span className="bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">Rate Today</span>
          </h3>
          <p className="text-slate-600 mb-9 max-w-2xl mx-auto text-base leading-relaxed">
            Join now and permanently secure founding member pricing before the platform goes live at full price.
          </p>
          <button
            onClick={() => router.push('/auth/register')}
            className="group bg-gradient-to-r from-red-600 to-red-500 text-white px-12 py-4 rounded-full hover:shadow-xl hover:shadow-red-500/30 hover:scale-105 transition-all duration-300 font-semibold inline-flex items-center gap-2"
          >
            Claim Founding Rate
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </button>
        </div>
      </section>
    </div>
  );
}
