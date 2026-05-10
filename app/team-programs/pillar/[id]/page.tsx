'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Play, Pause, ArrowLeft, ClipboardList } from 'lucide-react';
import { TiltCard } from '@/components/ui/tilt-card';
import { Boxes } from '@/components/ui/background-boxes';
import { BeamsBackground } from '@/components/ui/beams-background';

const BLUE = '#37b5ff';
const BLUE2 = '#60cdff';
const BLUE3 = '#0ea5e9';

// ─── Pillar content data ────────────────────────────────────────────────────

interface PillarFact {
  statement: string;
  support?: string;
  voiceLabel: string;
  extra?: { label: string; items: string[] };
}

interface PillarData {
  number: string;
  title: string;
  titleOneLine?: boolean;
  subtitle: string;
  intro: string;
  accent: string;
  accentAlt: string;
  facts: PillarFact[];
  close?: { statement: string; support: string };
}

const PILLARS: Record<string, PillarData> = {
  '1': {
    number: '01',
    title: 'Mind-Set',
    subtitle: 'The Foundation of Everything',
    intro: 'Pillar 1 is the foundation of the entire Smarter Goalie system. Everything else is built on what happens between the goalie\'s ears. The facts in this section are universal — they apply to every role. The goalie lives them. The parent supports them. The coach works around them. The organization builds them.',
    accent: '#00f2ff',
    accentAlt: '#60cdff',
    facts: [
      {
        statement: 'THE SUB-CONSCIOUS MIND RUNS AT GAME SPEED. THE CONSCIOUS MIND DOESN\'T. WE TRAIN THE RIGHT ONE.',
        voiceLabel: 'HEAR COACH MIKE: THE SUB-CONSCIOUS AND WHY EVERY OTHER PROGRAM IS TRAINING THE WRONG MIND',
      },
      {
        statement: 'THE GOALIE IS THE MOST IMPORTANT POSITION ON THE TEAM AND THE LEAST UNDERSTOOD.',
        voiceLabel: 'HEAR COACH MIKE: THE GOALIE\'S RESPONSIBILITY AND WHY THE POSITION IS UNLIKE ANY OTHER IN SPORT',
      },
      {
        statement: 'IF THE GOALIE SHOWS UP WITH THEIR A-GAME — THE TEAM SHOWS UP WITH THEIR A-GAME.',
        support: 'Four scenarios. Every goalie needs to understand all four.',
        voiceLabel: 'HEAR COACH MIKE: THE FOUR SCENARIOS AND WHAT THE GOALIE\'S RESPONSIBILITY MEANS IN REAL TERMS',
        extra: {
          label: 'The Four Scenarios',
          items: [
            'Goalie A-Game + Team A-Game: Win or tie. The best possible outcome.',
            'Goalie A-Game + Team so-so: Win or tie still possible. The goalie carries the weight.',
            'Goalie A-Game + Team no-show: The goalie keeps respect in the house.',
            'Goalie does not bring A-Game: The team has no foundation. The goalie is the foundation.',
          ],
        },
      },
      {
        statement: 'THE GOALIE KEEPS RESPECT IN THE HOUSE.',
        support: 'Your reputation is always in play. In the game. In practice. In a tryout. In a casual skate. Always.',
        voiceLabel: 'HEAR COACH MIKE: REPUTATION, PRIDE, AND WHAT IT MEANS TO NEVER LET YOURSELF OR THOSE WHO COACH YOU DOWN',
      },
      {
        statement: 'V.M.P. — VISUAL. MENTAL. PHYSICAL. IN THAT ORDER. ALWAYS.',
        support: 'Intensity is not competing hard. Intensity is assessed as Low, Medium-Spotty, or High-Consistent. Most goalies never learn the difference. Smarter Goalie teaches it from day one.',
        voiceLabel: 'HEAR COACH MIKE: V.M.P. INTENSITY AND WHY THE ORDER IS NON-NEGOTIABLE',
      },
      {
        statement: 'PRACTICE ATTITUDE IS NOT OPTIONAL. IT IS THE GOALIE\'S DECLARATION THAT THEY BELONG IN THAT NET.',
        support: 'The first one was a gift. The second you had to earn.\n\nThe goalie\'s greatest practice motivation is simple — shut down your teammates. Earn their respect by making them work for everything.',
        voiceLabel: 'HEAR COACH MIKE: PRACTICE ATTITUDE AND WHAT IT PRODUCES OVER A FULL SEASON',
      },
      {
        statement: 'THE GOALIE WHO CAN SELF-COACH IS THE GOALIE WHO NEVER STOPS DEVELOPING.',
        support: 'Most programs create dependency. Smarter Goalie builds independence. The Technical Eye. The Feel Factor. The ability to observe your own execution and correct it without being told.',
        voiceLabel: 'HEAR COACH MIKE: SELF-COACHING AND WHY IT IS THE HIGHEST LEVEL OF GOALTENDING DEVELOPMENT',
      },
      {
        statement: 'CHARACTER IS NOT A SIDE EFFECT OF THE SMARTER GOALIE SYSTEM. IT IS ARCHITECTURE.',
        support: 'Built from day one. Baked into every Pillar and every session. Leadership, accountability, resilience, and self-awareness are not optional extras. They are the product.',
        voiceLabel: 'HEAR COACH MIKE: CHARACTER AS ARCHITECTURE AND WHAT THAT MEANS FOR THE GOALIE\'S LIFE BEYOND HOCKEY',
      },
    ],
  },
  '2': {
    number: '02',
    title: 'Skating Tech',
    subtitle: 'The Engine of the System',
    intro: 'Skating Tech is the locomotion Pillar. Every save starts and ends with movement. The goalie who moves with precision, economy, and purpose is the goalie who covers the ice with authority. Skating Tech teaches the goalie how to move — not just how to get from point A to point B, but how to arrive in position ready to execute.',
    accent: BLUE2,
    accentAlt: BLUE,
    facts: [
      {
        statement: 'THE GOALIE WHO MOVES WITH PURPOSE IS NEVER OUT OF POSITION. THE GOALIE WHO MOVES AT RANDOM IS ALWAYS SCRAMBLING.',
        support: 'Every movement in the Smarter Goalie system has a reason. Skating Tech teaches the goalie why they move, not just how.',
        voiceLabel: 'HEAR COACH MIKE: PURPOSEFUL MOVEMENT AND WHAT IT MEANS TO ARRIVE READY',
      },
      {
        statement: 'THE T-PUSH, THE C-CUT, AND THE SHUFFLE ARE NOT EQUAL TOOLS. KNOWING WHEN TO USE EACH IS THE SKILL.',
        support: 'Most programs teach the mechanics. Smarter Goalie teaches the decision. The right movement at the right time is not instinct — it is trained.',
        voiceLabel: 'HEAR COACH MIKE: THE THREE PRIMARY MOVEMENTS AND THE DECISIONS THAT GOVERN THEM',
      },
      {
        statement: 'SKATING TECH AND THE 7AMS WORK TOGETHER. POSITION IS MEANINGLESS WITHOUT THE MOVEMENT TO GET THERE.',
        support: 'The 7 Angle-Mark System tells the goalie where to be. Skating Tech gives them the tools to get there. Neither Pillar is complete without the other.',
        voiceLabel: 'HEAR COACH MIKE: HOW SKATING TECH AND THE 7AMS CONNECT INTO ONE POSITIONAL SYSTEM',
      },
      {
        statement: 'ECONOMY OF MOVEMENT IS NOT LAZINESS. IT IS INTELLIGENCE.',
        support: 'The goalie who takes two steps when one is required is spending energy they will need later. Smarter Goalie builds economy into every movement pattern.',
        voiceLabel: 'HEAR COACH MIKE: ECONOMY OF MOVEMENT AND WHAT IT PRODUCES ACROSS A FULL SIXTY MINUTES',
      },
      {
        statement: 'RECOVERY IS A SKILL. MOST GOALIES NEVER TRAIN IT.',
        support: 'Going down is easy. Getting back up — efficiently, in position, ready for the next shot — is what separates the developed goalie from the developing one. Skating Tech includes recovery as a first-class skill.',
        voiceLabel: 'HEAR COACH MIKE: RECOVERY MOVEMENT AND WHY IT BELONGS IN EVERY PRACTICE',
      },
    ],
  },
  '3': {
    number: '03',
    title: '7 Angle-Mark System',
    titleOneLine: true,
    subtitle: 'The Goalie\'s GPS',
    intro: 'The 7 Angle-Mark System is the goalie\'s GPS. It is the mathematical framework that tells the goalie exactly where they are on the ice in relation to the puck at all times. It is the most original and powerful technical tool in the Smarter Goalie system. Nothing like it exists anywhere else in goaltending instruction.',
    accent: BLUE,
    accentAlt: BLUE3,
    facts: [
      {
        statement: 'THE 7 ANGLE-MARK SYSTEM IS THE GOALIE\'S GPS. SEVEN MARKERS. ONE COMPLETE POSITIONAL GRID.',
        support: 'Most goalies guess where they are in relation to the puck. The 7AMS removes the guess. The goalie feels their position within the marker grid as the puck moves while reading adjacent markers.',
        voiceLabel: 'HEAR COACH MIKE: THE 7AMS AND HOW IT TRANSFORMS POSITIONAL AWARENESS FROM GUESSWORK TO PRECISION',
      },
      {
        statement: 'THE ICING LINE IS THE FIRST LANDMARK. THE POSTS ARE ATTACHED TO IT. EVERYTHING BUILDS FROM THERE.',
        support: 'The 7AMS grid is built from the ice up. The icing line anchors everything. The goalie learns to read the grid from the moment the puck crosses the line.',
        voiceLabel: 'HEAR COACH MIKE: THE FOUNDATIONAL LANDMARKS OF THE 7AMS AND HOW THE GRID IS READ',
      },
      {
        statement: 'THE FEEL FACTOR IS THE GOALIE FEELING THEIR POSITION WITHIN THE MARKER GRID IN REAL TIME.',
        support: 'Not a fixed-point concept. Not a single marker. A spatial awareness that moves with the puck. The goalie feels where they are — before they see where they need to be.',
        voiceLabel: 'HEAR COACH MIKE: THE FEEL FACTOR AND HOW IT CONNECTS TO THE 7AMS IN LIVE PLAY',
      },
      {
        statement: 'MOST GOALIES ARE TAUGHT ANGLES. FEW ARE TAUGHT THE MATHEMATICAL SYSTEM THAT MAKES ANGLES WORK CONSISTENTLY.',
        support: 'Teaching a goalie to come out on angles without giving them a positional reference system is like teaching someone to drive without giving them a map. Smarter Goalie gives the goalie the map.',
        voiceLabel: 'HEAR COACH MIKE: THE DIFFERENCE BETWEEN TEACHING ANGLES AND TEACHING THE SYSTEM THAT MAKES ANGLES WORK',
      },
      {
        statement: 'THE 7AMS WORKS AT EVERY LEVEL. ATOM TO AAA. THE FRAMEWORK DOES NOT CHANGE. THE GOALIE GROWS INTO IT.',
        support: 'The system is introduced at the Foundation level and refined through Development and Refinement. The markers are always there. The goalie\'s ability to read and feel them deepens over time.',
        voiceLabel: 'HEAR COACH MIKE: HOW THE 7AMS SCALES WITH THE GOALIE\'S DEVELOPMENT',
      },
      {
        statement: 'A GOALIE WHO KNOWS WHERE THEY ARE NEVER HAS TO THINK ABOUT WHERE THEY ARE. THE MIND IS FREE TO READ THE PLAY.',
        support: 'Positional certainty frees the mind. The sub-conscious handles the positioning. The conscious mind reads the play. This is the goal of the 7AMS. This is what Smarter Goalie builds.',
        voiceLabel: 'HEAR COACH MIKE: POSITIONAL CERTAINTY AND WHAT THE MIND CAN DO WHEN IT IS FREE FROM POSITIONAL DOUBT',
      },
    ],
  },
  '4': {
    number: '04',
    title: '7 Point System',
    subtitle: 'Command Everything Below the Icing Line',
    intro: 'The 7 Point System governs everything that happens below the icing line. Wraparounds. Behind-net play. Net management. This is the area of the ice most goalies are least prepared for and most vulnerable in. The 7 Points give the goalie a complete framework for what is historically the most dangerous area of the ice.',
    accent: BLUE3,
    accentAlt: BLUE,
    facts: [
      {
        statement: 'BELOW THE ICING LINE IS WHERE MOST GOALS ARE SCORED AND WHERE MOST GOALIES HAVE THE LEAST TRAINING.',
        support: 'The area behind and around the net is the most dangerous real estate on the ice. Most programs spend the least time developing it. Smarter Goalie gives it an entire Pillar.',
        voiceLabel: 'HEAR COACH MIKE: WHY BELOW THE ICING LINE DESERVES ITS OWN COMPLETE FRAMEWORK',
      },
      {
        statement: 'THE 7 POINT SYSTEM GIVES THE GOALIE A COMPLETE POSITIONAL FRAMEWORK FOR EVERY SITUATION BELOW THE ICING LINE.',
        support: 'Seven specific positions. Seven specific reads. Every wraparound, every cycle, every behind-net play has a correct positional response. The 7 Points define what that response is.',
        voiceLabel: 'HEAR COACH MIKE: THE 7 POINT SYSTEM AND HOW IT MAPS EVERY SITUATION BELOW THE ICING LINE',
      },
      {
        statement: 'A GOALIE WHO DOES NOT OWN THE AREA BELOW THE ICING LINE IS NOT A COMPLETE GOALTENDER.',
        support: 'Net management is a skill. It is developed. Most goalies learn it by accident over years. Smarter Goalie teaches it deliberately from the beginning.',
        voiceLabel: 'HEAR COACH MIKE: NET MANAGEMENT AS A TRAINED SKILL AND WHAT IT LOOKS LIKE WHEN IT IS FULLY DEVELOPED',
      },
      {
        statement: 'EVERY WRAPAROUND IS PREVENTABLE. NONE ARE SURPRISES WHEN THE GOALIE KNOWS THE 7 POINTS.',
        support: 'A goalie who knows the system sees the wraparound developing before the puck carrier does. Anticipation. Not reaction. The 7 Points build anticipation.',
        voiceLabel: 'HEAR COACH MIKE: WRAPAROUNDS, ANTICIPATION, AND WHY THE GOALIE WHO KNOWS THE SYSTEM IS NEVER SURPRISED',
      },
      {
        statement: 'THE 7 POINT SYSTEM AND THE 7AMS WORK TOGETHER. POSITION ABOVE THE ICING LINE AND BELOW IT ARE ONE CONNECTED SYSTEM.',
        support: 'No Pillar in the Smarter Goalie system operates in isolation. The 7AMS gives the goalie positional certainty above the icing line. The 7 Points complete the picture below it.',
        voiceLabel: 'HEAR COACH MIKE: HOW THE 7AMS AND 7 POINT SYSTEM CONNECT INTO ONE COMPLETE POSITIONAL FRAMEWORK',
      },
    ],
  },
  '5': {
    number: '05',
    title: 'Form Tech',
    subtitle: 'The Technical Execution Pillar',
    intro: 'Form Tech is the technical execution Pillar. Set crouch. Maximum coverage. Minimal movement. Every save technique examined, taught, and refined. The goalie\'s body is their tool. Form Tech teaches them how to use it with precision. This is where the goalie discovers their game — not a template applied to their body.',
    accent: '#38bdf8',
    accentAlt: BLUE2,
    facts: [
      {
        statement: 'YOUR SET CROUCH IS THE MOST IMPORTANT POSITION IN GOALTENDING. AND IT IS YOURS.',
        support: 'No two goalies have the same set crouch. The body that works for a 6 foot 3 goalie does not work for a 5 foot 8 goalie. Smarter Goalie finds your set crouch. Not someone else\'s.',
        voiceLabel: 'HEAR COACH MIKE: THE SET CROUCH, WHAT IT MEANS, AND WHY IT IS THE FOUNDATION OF ALL TECHNICAL EXECUTION',
      },
      {
        statement: 'MAXIMUM COVERAGE WITH MINIMAL MOVEMENT. EVERY TECHNIQUE IN FORM TECH IS BUILT ON THIS PRINCIPLE.',
        support: 'The goalie who moves the most is not the goalie who stops the most. The goalie who covers the most with the least movement wins. M.E.T. applied to technical execution.',
        voiceLabel: 'HEAR COACH MIKE: MAXIMUM COVERAGE WITH MINIMAL MOVEMENT AND WHAT IT LOOKS LIKE IN PRACTICE',
      },
      {
        statement: 'MOST GOALIE SCHOOLS TEACH A 6 FOOT PLUS GAME TO YOUTH GOALIES. THIS IS WRONG AND WE WILL TELL YOU WHY.',
        support: 'A technique built for a large body does not fit a developing body. Forcing a young goalie into a technique designed for a body they do not have creates habits that need to be unlearned later. Smarter Goalie teaches for the body in front of them.',
        voiceLabel: 'HEAR COACH MIKE: WHY TEACHING THE WRONG BODY TEMPLATE IS THE MOST COMMON AND DAMAGING MISTAKE IN YOUTH GOALTENDING INSTRUCTION',
      },
      {
        statement: 'THE BUTTERFLY IS A TOOL. NOT A RELIGION. KNOWING WHEN TO USE IT AND WHEN NOT TO IS THE SKILL.',
        support: 'Most programs teach the butterfly as the default technique. Smarter Goalie teaches the goalie when the butterfly is the right tool and when it is not. A goalie who only has one tool is predictable.',
        voiceLabel: 'HEAR COACH MIKE: THE BUTTERFLY, WHEN IT SERVES THE GOALIE AND WHEN IT DOES NOT',
      },
      {
        statement: 'FORM TECH IS WHERE THE FEEL FACTOR AND TECHNICAL EXECUTION MEET.',
        support: 'The Feel Factor is the internal read during execution. Does it feel right before you see the result? The Technical Eye is the observation after. Form Tech is where both are trained together.',
        voiceLabel: 'HEAR COACH MIKE: THE CONNECTION BETWEEN FORM TECH, THE FEEL FACTOR, AND THE TECHNICAL EYE',
      },
      {
        statement: 'EVERY SAVE TECHNIQUE HAS A CORRECT FORM. EVERY CORRECT FORM HAS A FEELING. SMARTER GOALIE TEACHES BOTH.',
        support: 'Most programs teach what to do. Smarter Goalie teaches what it should feel like when you do it correctly. The difference between knowing a technique and owning it is the feel.',
        voiceLabel: 'HEAR COACH MIKE: TEACHING THE FEEL OF CORRECT TECHNIQUE AND WHY IT PRODUCES PERMANENT DEVELOPMENT',
      },
    ],
  },
  '6': {
    number: '06',
    title: 'Game & Practice Performance',
    subtitle: 'Where Everything Comes Together',
    intro: 'Game and Practice Performance is where everything comes together. Reading the play. Reading the stick. Reading the breakout. Charting the game and the practice. The Development Loop. This Pillar is the measure of the entire system — it is where the goalie finds out if everything they have built actually works under game conditions.',
    accent: '#22d3ee',
    accentAlt: BLUE3,
    facts: [
      {
        statement: 'A GOALIE WHO CANNOT READ THE PLAY IS ALWAYS REACTING. A GOALIE WHO CAN IS ALWAYS COMPETING.',
        support: 'Reading the breakout. Reading the stick. Reading the shooter. These are trainable skills. Smarter Goalie teaches them in sequence — each one building on the last.',
        voiceLabel: 'HEAR COACH MIKE: READING THE PLAY AS A TRAINABLE SKILL AND HOW SMARTER GOALIE DEVELOPS IT SYSTEMATICALLY',
      },
      {
        statement: 'THE GAME CHART IS NOT A RECORD OF WHAT HAPPENED. IT IS A ROADMAP FOR WHAT COMES NEXT.',
        support: 'Factor Ratios. Good goal versus bad goal. V.M.P. intensity read period by period. Strong Side versus Weak Side. The game chart tells the goalie exactly what to work on in the next practice. Nothing is guesswork.',
        voiceLabel: 'HEAR COACH MIKE: THE GAME CHART, WHAT IT CAPTURES, AND HOW IT DRIVES THE NEXT PRACTICE',
      },
      {
        statement: 'THE DEVELOPMENT LOOP IS THE MOST POWERFUL TOOL IN GOALTENDING DEVELOPMENT. MOST PROGRAMS DO NOT HAVE ONE.',
        support: 'Game Chart → Practice Index → Practice Chart → Next Game Chart. Every game informs every practice. Every practice prepares for every game. The loop never breaks. Nothing is ever lost.',
        voiceLabel: 'HEAR COACH MIKE: THE DEVELOPMENT LOOP AND WHY IT MAKES SMARTER GOALIE DIFFERENT FROM EVERY OTHER PROGRAM',
      },
      {
        statement: 'A GOOD GOAL AND A BAD GOAL ARE NOT THE SAME THING. MOST GOALIES NEVER LEARN THE DIFFERENCE.',
        support: 'A good goal is one the goalie could not have stopped given their position and the shot. A bad goal is one they could have stopped. Smarter Goalie teaches goalies to make that distinction honestly and use it for development.',
        voiceLabel: 'HEAR COACH MIKE: THE GOOD GOAL AND BAD GOAL DISTINCTION AND WHY HONEST SELF-EVALUATION IS THE FOUNDATION OF DEVELOPMENT',
      },
      {
        statement: 'THE PRACTICE THAT HAS NO DIRECTION IS NOT A PRACTICE. IT IS A WORKOUT. SMARTER GOALIE GIVES EVERY PRACTICE DIRECTION.',
        support: 'One directive per practice. Derived from the game chart. Connected to the Development Loop. Every minute on the ice has a purpose. Nothing is random.',
        voiceLabel: 'HEAR COACH MIKE: THE ONE DIRECTIVE PER PRACTICE MODEL AND HOW IT TRANSFORMS PRACTICE FROM ACTIVITY TO DEVELOPMENT',
      },
      {
        statement: 'STRONG SIDE AND WEAK SIDE ARE DEVELOPED SIMULTANEOUSLY. NEITHER IS NEGLECTED. EVER.',
        support: 'The Maintenance Program holds the Strong Side while the Weak Side develops. Both sides grow. The gap closes. The goalie becomes complete.',
        voiceLabel: 'HEAR COACH MIKE: STRONG SIDE, WEAK SIDE, AND THE MAINTENANCE PROGRAM',
      },
    ],
  },
  '7': {
    number: '07',
    title: 'Lifestyle',
    subtitle: 'The Pillar Most Programs Never Address',
    intro: 'Lifestyle is the final Pillar and the one most programs never address at all. Off-ice routine. Mental preparation. Balance. Sleep. Nutrition. Recovery. The goalie who takes care of themselves off the ice is the goalie who performs on it. Lifestyle is not separate from goaltending. It is part of it.',
    accent: BLUE2,
    accentAlt: BLUE,
    facts: [
      {
        statement: 'WHAT THE GOALIE DOES BETWEEN GAMES IS AS IMPORTANT AS WHAT THEY DO DURING THEM.',
        support: 'Sleep. Nutrition. Recovery. Mental preparation. Off-ice routine. These are not lifestyle suggestions. They are performance variables. Smarter Goalie treats them as such.',
        voiceLabel: 'HEAR COACH MIKE: LIFESTYLE AS A PERFORMANCE VARIABLE AND WHY MOST PROGRAMS IGNORE IT',
      },
      {
        statement: 'THE GOALIE WHO PREPARES MENTALLY BEFORE THEY ARRIVE AT THE RINK HAS ALREADY WON HALF THE BATTLE.',
        support: 'Pre-game routine is a trained behaviour. The mental state the goalie arrives in determines the mental state they compete in. Smarter Goalie builds the routine that produces the right state.',
        voiceLabel: 'HEAR COACH MIKE: PRE-GAME MENTAL PREPARATION AND WHAT THE RIGHT ROUTINE PRODUCES',
      },
      {
        statement: 'ACCEPTANCE IS A SKILL. THE GOALIE WHO CAN ACCEPT WHAT CANNOT BE CHANGED IS FREE TO COMPETE.',
        support: 'The Mind Vault. Acceptance Lists. Cannot-Accept Lists. The goalie learns to identify what they can control and release what they cannot. This is not philosophy. It is a trained mental practice with specific exercises.',
        voiceLabel: 'HEAR COACH MIKE: THE MIND VAULT, ACCEPTANCE, AND WHY MENTAL FREEDOM IS THE FOUNDATION OF CONSISTENT PERFORMANCE',
      },
      {
        statement: 'BALANCE IS NOT A LUXURY. IT IS A PERFORMANCE REQUIREMENT.',
        support: 'The goalie who is consumed by hockey at the expense of everything else does not become a better goalie. They become a burned-out one. Smarter Goalie builds balance deliberately — school, family, rest, enjoyment alongside the development.',
        voiceLabel: 'HEAR COACH MIKE: BALANCE AND WHY THE MOST DEVELOPED GOALIES ARE ALSO THE MOST BALANCED PEOPLE',
      },
      {
        statement: 'THE MAINTENANCE PROGRAM IS NOT JUST A PRACTICE TOOL. IT IS A LIFESTYLE DISCIPLINE.',
        support: 'The habits that maintain the Strong Side are off-ice habits as much as on-ice ones. Rest. Visualization. Routine. The Maintenance Program extends beyond the rink.',
        voiceLabel: 'HEAR COACH MIKE: THE MAINTENANCE PROGRAM EXTENDING INTO THE GOALIE\'S LIFESTYLE',
      },
      {
        statement: 'SMARTER GOALIE DOES NOT BUILD BETTER GOALIES. IT BUILDS BETTER PEOPLE WHO HAPPEN TO PLAY GOAL.',
        support: 'The character, leadership, self-awareness, and discipline built through the Smarter Goalie system do not stay in the rink. They go everywhere the goalie goes. For the rest of their life.',
        voiceLabel: 'HEAR COACH MIKE: THE LIFETIME VALUE OF WHAT SMARTER GOALIE BUILDS AND WHY IT MATTERS BEYOND THE GAME',
      },
    ],
    close: {
      statement: 'SEVEN PILLARS. ONE COMPLETE SYSTEM. BUILT ON SIX DECADES. PROVEN ON EVERY GOALIE IT HAS EVER TOUCHED.',
      support: 'Every goalie Coach Mike has ever coached advanced to AA or AAA status. Not one stayed behind.\n\nThe system is not theory. It is not a program. It is a mathematical, systems-based approach to goaltending development that has been stress-tested for sixty years.\n\nIt has never been successfully challenged.\n\nTEST US AND SEE. CHALLENGE US AND KNOW.',
    },
  },
};

// ─── Shared components ───────────────────────────────────────────────────────

function VoiceButton({ label }: { label: string }) {
  const [playing, setPlaying] = useState(false);
  const [on, setOn] = useState(true);
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={() => on && setPlaying(p => !p)}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: on ? 'linear-gradient(135deg, rgba(55,181,255,0.14), rgba(96,205,255,0.07))' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${on ? 'rgba(96,205,255,0.32)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '50px', padding: '9px 18px 9px 10px',
          color: on ? BLUE2 : '#475569', fontSize: '11px', fontWeight: 700,
          letterSpacing: '1.2px', cursor: on ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
          boxShadow: on ? '0 2px 10px rgba(55,181,255,0.12)' : 'none',
        }}
      >
        <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: on ? `linear-gradient(135deg, ${BLUE}, ${BLUE3})` : '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {playing ? <Pause size={10} color="#fff" /> : <Play size={10} color="#fff" fill="#fff" />}
        </span>
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden">HEAR COACH MIKE</span>
      </button>
      <button onClick={() => { setOn(v => !v); if (on) setPlaying(false); }} style={{ fontSize: '10px', color: on ? BLUE2 : '#475569', letterSpacing: '1.5px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase' }}>
        VOICE {on ? 'ON' : 'OFF'}
      </button>
    </div>
  );
}

function FactSection({ fact, accent, index }: { fact: PillarFact; accent: string; index: number }) {
  const isAlt = index % 2 === 1;
  const bg = isAlt
    ? 'linear-gradient(150deg, #0d2848 0%, #133050 100%)'
    : 'radial-gradient(circle at 65% 30%, #0d1b3a 0%, #050912 100%)';

  return (
    <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(72px,9vw,120px) 0', background: bg }}>
      {/* Ghost number */}
      <div style={{ position: 'absolute', right: '-2%', top: '50%', transform: 'translateY(-50%)', fontSize: 'clamp(160px,22vw,320px)', fontWeight: 900, fontStyle: 'italic', color: `${accent}08`, letterSpacing: '-0.05em', lineHeight: 1, userSelect: 'none', pointerEvents: 'none', zIndex: 0 }}>
        {String(index + 1).padStart(2, '0')}
      </div>
      {/* Glow */}
      <div style={{ position: 'absolute', top: '-10%', left: isAlt ? 'auto' : '-5%', right: isAlt ? '-5%' : 'auto', width: '500px', height: '500px', background: `radial-gradient(ellipse, ${accent}09 0%, transparent 70%)`, pointerEvents: 'none', zIndex: 0 }} />
      {/* Diagonal texture */}
      <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.006) 0px, rgba(255,255,255,0.006) 1px, transparent 1px, transparent 12px)', pointerEvents: 'none', zIndex: 0 }} />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
        {/* Accent bar + number */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
          <div style={{ width: '6px', height: '52px', background: accent, boxShadow: `0 0 14px ${accent}`, borderRadius: '3px', flexShrink: 0 }} />
          <span style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '3px', color: accent, textTransform: 'uppercase' }}>
            FACT {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* Statement */}
        <h2 style={{ fontSize: 'clamp(28px, 5vw, 68px)', fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.02em', margin: '0 0 28px', maxWidth: '960px' }}>
          {fact.statement}
        </h2>

        {/* Support copy */}
        {fact.support && (
          <div style={{ maxWidth: '760px', marginBottom: '32px' }}>
            {fact.support.split('\n\n').map((para, pi) => (
              <p key={pi} style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'rgba(184,212,232,0.88)', fontStyle: 'italic', lineHeight: 1.85, margin: pi < fact.support!.split('\n\n').length - 1 ? '0 0 16px' : '0' }}>
                {para}
              </p>
            ))}
          </div>
        )}

        {/* Extra: four scenarios or similar */}
        {fact.extra && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', maxWidth: '960px', marginBottom: '32px' }}>
            {fact.extra.items.map((item, ii) => (
              <TiltCard
                key={ii}
                effect="gravitate"
                tiltLimit={8}
                scale={1.04}
                style={{ border: `1px solid ${accent}44`, borderRadius: '14px', boxShadow: `0 0 20px ${accent}10` }}
              >
                <div style={{ padding: '20px 22px', background: `linear-gradient(135deg, ${accent}0a, rgba(4,8,20,0.88))`, borderRadius: '13px', backdropFilter: 'blur(12px)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: accent, boxShadow: `0 0 8px ${accent}`, marginBottom: '12px' }} />
                  <p style={{ fontSize: 'clamp(13px, 1.5vw, 15px)', color: 'rgba(200,228,248,0.9)', lineHeight: 1.7, margin: 0 }}>{item}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        )}

        <VoiceButton label={fact.voiceLabel} />
      </div>
    </section>
  );
}

// ─── Main page component ─────────────────────────────────────────────────────

export default function PillarPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const pillar = PILLARS[id];

  if (!pillar) {
    return (
      <div style={{ minHeight: '100vh', background: '#050912', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: BLUE2, fontSize: '14px', letterSpacing: '3px', fontWeight: 700, marginBottom: '16px' }}>PILLAR NOT FOUND</p>
          <button onClick={() => router.push('/team-programs')} style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE3})`, color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 800, letterSpacing: '1.5px' }}>
            BACK TO TEAM PROGRAMS
          </button>
        </div>
      </div>
    );
  }

  const { accent } = pillar;
  const prevId = String(Number(id) - 1);
  const nextId = String(Number(id) + 1);
  const hasPrev = Number(id) > 1;
  const hasNext = Number(id) < 7;

  // Map each pillar's accent hex to an HSL hue range for the beams
  const pillarHueRanges: Record<string, [number, number]> = {
    '1': [180, 192],   // #00f2ff  cyan       hue ~184
    '2': [195, 207],   // #60cdff  light blue hue ~199
    '3': [202, 212],   // #37b5ff  blue       hue ~206
    '4': [195, 204],   // #0ea5e9  blue3      hue ~199
    '5': [197, 206],   // #38bdf8  sky blue   hue ~200
    '6': [184, 194],   // #22d3ee  cyan       hue ~188
    '7': [195, 207],   // #60cdff  light blue hue ~199
  };
  const beamHueRange = pillarHueRanges[id] ?? [195, 215];

  return (
    <div style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif', color: '#fff' }}>

      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 h-16 flex items-center justify-between">
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <img src="/logo.png" alt="Smarter Goalie" className="h-10 sm:h-11 w-auto object-contain" />
          </button>
          <div className="hidden sm:flex gap-6 items-center">
            {['WHO WE ARE', 'THE SYSTEM'].map((item) => (
              <button key={item} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: BLUE, flexShrink: 0 }} />{item}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Role bar */}
      <div style={{ background: '#0e2448', borderBottom: '1px solid rgba(96,205,255,0.22)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-3 flex items-center gap-4">
          <button
            onClick={() => router.push('/team-programs')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: BLUE2, fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', flexShrink: 0 }}
          >
            <ArrowLeft size={13} />
            TEAM PROGRAMS
          </button>
          <div style={{ width: '1px', height: '16px', background: 'rgba(96,205,255,0.3)', flexShrink: 0 }} />
          <ClipboardList size={14} color={BLUE2} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '2.5px', color: BLUE2, textTransform: 'uppercase' }}>
            PILLAR {pillar.number}
          </span>
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase' }}>
            {pillar.title}
          </span>
        </div>
      </div>

      {/* ── HERO ── */}
      <BeamsBackground
        intensity="medium"
        hueRange={beamHueRange}
        className="min-h-screen flex flex-col justify-center py-[clamp(80px,10vw,130px)]"
      >
        {/* Accent glow overlay */}
        <div style={{ position: 'absolute', top: '-10%', right: '-8%', width: '55vw', height: '55vw', maxWidth: '680px', maxHeight: '680px', background: `radial-gradient(ellipse, ${accent}22 0%, transparent 65%)`, pointerEvents: 'none', zIndex: 1 }} />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 2 }}>
          {/* Pillar number badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: `${accent}14`, border: `1px solid ${accent}40`, borderRadius: '50px', padding: '8px 20px', marginBottom: '32px', boxShadow: `0 2px 16px ${accent}18` }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: accent, boxShadow: `0 0 0 3px ${accent}30`, flexShrink: 0 }} />
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3px', color: accent, margin: 0, textTransform: 'uppercase' }}>
              PILLAR {pillar.number} — THE 7 PILLAR SYSTEM
            </p>
          </div>

          <h1 style={{ fontSize: 'clamp(48px, 8vw, 108px)', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.03em', margin: '0 0 20px', color: '#fff', whiteSpace: pillar.titleOneLine ? 'nowrap' : 'normal' }}>
            {pillar.titleOneLine
              ? pillar.title
              : pillar.title.split(' ').map((word, wi) => (
                  <span key={wi}>
                    {wi > 0 && <br />}
                    {word}
                  </span>
                ))
            }
          </h1>
          <p style={{ fontSize: 'clamp(20px, 2.8vw, 34px)', fontWeight: 800, color: accent, margin: '0 0 32px', letterSpacing: '-0.01em' }}>
            {pillar.subtitle}
          </p>
          <p style={{ fontSize: 'clamp(15px, 1.7vw, 19px)', color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, maxWidth: '520px', margin: '0 0 44px' }}>
            {pillar.intro}
          </p>

          {/* Pillar nav dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {Array.from({ length: 7 }, (_, i) => {
              const isActive = String(i + 1) === id;
              return (
                <button
                  key={i}
                  onClick={() => router.push(`/team-programs/pillar/${i + 1}`)}
                  style={{
                    width: isActive ? '28px' : '8px',
                    height: '8px',
                    borderRadius: isActive ? '4px' : '50%',
                    background: isActive ? accent : 'rgba(255,255,255,0.22)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                    boxShadow: isActive ? `0 0 10px ${accent}` : 'none',
                    padding: 0,
                    flexShrink: 0,
                  }}
                />
              );
            })}
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,0.3)', marginLeft: '8px', textTransform: 'uppercase' }}>
              {id} OF 7
            </span>
          </div>
        </div>
      </BeamsBackground>

      {/* ── Origin section for Pillar 1 ── */}
      {id === '1' && (
        <>
          {/* Six Decades */}
          <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(80px,10vw,130px) 0', background: 'linear-gradient(155deg, #0d2848 0%, #133050 65%, #0b2242 100%)' }}>
            <Boxes />
            <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 25%, #0d2848 72%)' }} />
            <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 2 }}>
              <h2 style={{ fontSize: 'clamp(30px, 6vw, 80px)', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.03em', color: '#fff', margin: '0 0 28px', maxWidth: '1000px' }}>
                SIX DECADES OF STUDY THAT{' '}
                <span style={{ color: BLUE2 }}>CONTINUES TO THIS DAY.</span>
              </h2>
              <div style={{ maxWidth: '760px', marginBottom: '40px' }}>
                <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'rgba(184,212,232,0.9)', fontStyle: 'italic', lineHeight: 1.85, marginBottom: '16px' }}>
                  Born 1955. Living room floor. Pillow as chest protector. Hockey Night in Canada on a black and white television. No goalie coaches existed. Not one.
                </p>
                <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'rgba(184,212,232,0.9)', fontStyle: 'italic', lineHeight: 1.85, marginBottom: '16px' }}>
                  Michael Locicero did not inherit a system. He built one. From nothing. Asking WHY before HOW for sixty years.
                </p>
                <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'rgba(184,212,232,0.9)', fontStyle: 'italic', lineHeight: 1.85, marginBottom: '16px' }}>
                  He played competitively until age 32. Then he never stopped. Six decades of observation, testing, teaching, and refining. The playing gave him the foundation. The six decades gave him the depth.
                </p>
                <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: '#fff', fontStyle: 'italic', lineHeight: 1.85, fontWeight: 700, margin: 0 }}>
                  The system is not frozen. It is still being built. Today.
                </p>
              </div>
              <VoiceButton label="HEAR COACH MIKE: THE ORIGIN STORY — BORN 1955, THE LIVING ROOM FLOOR, AND THE DECISION TO BUILD IT HIMSELF" />
            </div>
          </section>

          {/* Puzzle section */}
          <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(80px,10vw,130px) 0', background: 'linear-gradient(140deg, #1b3c7c 0%, #143270 100%)' }}>
            <div style={{ position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)', fontSize: 'clamp(100px, 14vw, 200px)', fontWeight: 900, color: 'rgba(255,255,255,0.02)', letterSpacing: '-6px', lineHeight: 1, userSelect: 'none', pointerEvents: 'none', textTransform: 'uppercase' }}>PUZZLE</div>
            <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: 'clamp(28px, 5vw, 68px)', fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.02em', margin: '0 0 24px', maxWidth: '960px' }}>
                GOALTENDING WAS A 1,000-PIECE PUZZLE WITH NO PICTURE, NO BORDER, NO BOX.
              </h2>
              <div style={{ maxWidth: '760px', marginBottom: '36px' }}>
                <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'rgba(184,212,232,0.9)', fontStyle: 'italic', lineHeight: 1.85, marginBottom: '16px' }}>
                  Most programs hand the goalie a handful of pieces and hope for the best. Smarter Goalie built the border first. Then filled in every piece. In order. With purpose.
                </p>
                <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'rgba(184,212,232,0.9)', fontStyle: 'italic', lineHeight: 1.85, margin: 0 }}>
                  The First Test Subject: Michael Locicero was his own first experiment. Every principle was proven on himself before it was taught to anyone else.
                </p>
              </div>
              <VoiceButton label="HEAR COACH MIKE: THE PUZZLE WITH NO PICTURE — WHAT IT MEANS AND WHY IT STILL APPLIES TO EVERY GOALIE TODAY" />
            </div>
          </section>

          {/* Pillar 1 label */}
          <section style={{ padding: 'clamp(40px,5vw,60px) 0', background: 'radial-gradient(circle at 50% 50%, #0d1b3a 0%, #050912 100%)' }}>
            <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ width: '6px', height: '80px', background: accent, boxShadow: `0 0 15px ${accent}`, borderRadius: '3px', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '3px', color: accent, textTransform: 'uppercase', margin: '0 0 6px' }}>Now Entering</p>
                  <h2 style={{ fontSize: 'clamp(28px, 4vw, 56px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.05 }}>
                    PILLAR 1 — MIND-SET<br />
                    <span style={{ color: accent }}>THE FOUNDATION OF EVERYTHING.</span>
                  </h2>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── FACTS ── */}
      {pillar.facts.map((fact, i) => (
        <FactSection key={i} fact={fact} accent={accent} index={i} />
      ))}

      {/* ── PILLAR 7 CLOSE ── */}
      {id === '7' && pillar.close && (
        <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(100px,12vw,160px) 0', background: 'linear-gradient(160deg, #092038 0%, #0e2848 100%)' }}>
          <div style={{ position: 'absolute', right: '-60px', top: '50%', transform: 'translateY(-50%)', fontSize: 'clamp(200px,30vw,440px)', fontWeight: 900, color: 'rgba(255,255,255,0.018)', letterSpacing: '-20px', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>VII</div>
          <div style={{ position: 'absolute', top: '-20%', left: '50%', width: '800px', height: '800px', background: 'radial-gradient(ellipse, rgba(55,181,255,0.06) 0%, transparent 70%)', pointerEvents: 'none', transform: 'translateX(-50%)' }} />
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 text-center w-full" style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 'clamp(26px, 4.5vw, 62px)', fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.025em', margin: '0 0 36px', maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto' }}>
              {pillar.close.statement}
            </h2>
            <div style={{ maxWidth: '680px', margin: '0 auto 48px' }}>
              {pillar.close.support.split('\n\n').map((para, pi) => {
                const isChallenge = para.includes('TEST US');
                return (
                  <p key={pi} style={{
                    fontSize: isChallenge ? 'clamp(20px, 3vw, 36px)' : 'clamp(16px, 2vw, 19px)',
                    color: isChallenge ? accent : 'rgba(175,215,238,0.88)',
                    lineHeight: 1.75,
                    fontWeight: isChallenge ? 900 : 400,
                    letterSpacing: isChallenge ? '0.02em' : 'normal',
                    marginBottom: pi < pillar.close!.support.split('\n\n').length - 1 ? '18px' : '0',
                    fontStyle: isChallenge ? 'normal' : 'italic',
                    textShadow: isChallenge ? `0 0 24px ${accent}55` : 'none',
                  }}>
                    {para}
                  </p>
                );
              })}
            </div>
            <VoiceButton label="HEAR COACH MIKE: SEVEN PILLARS, SIX DECADES, THE RECORD, AND THE INVITATION" />
          </div>
        </section>
      )}

      {/* ── PILLAR NAVIGATION ── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) 0', background: 'radial-gradient(circle at 28% 55%, #0d1b3a 0%, #050912 100%)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full">
          {/* All 7 pillars overview */}
          <div style={{ marginBottom: '52px' }}>
            <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '3px', color: BLUE2, textTransform: 'uppercase', margin: '0 0 24px' }}>EXPLORE ALL 7 PILLARS</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 items-start" style={{ maxWidth: '960px' }}>
              {([
                { num: '01', label: 'Mind-Set', a: '#00f2ff' },
                { num: '02', label: 'Skating Tech', a: BLUE2 },
                { num: '03', label: '7AMS', a: BLUE },
                { num: '04', label: '7 Point', a: BLUE3 },
                { num: '05', label: 'Form Tech', a: '#38bdf8' },
                { num: '06', label: 'Game & Practice', a: '#22d3ee' },
                { num: '07', label: 'Lifestyle', a: BLUE2 },
              ] as { num: string; label: string; a: string }[]).map((p, i) => {
                const isCurrentPillar = String(i + 1) === id;
                return (
                  <TiltCard
                    key={i}
                    effect="gravitate"
                    tiltLimit={10}
                    scale={1.06}
                    style={{
                      border: isCurrentPillar ? `2px solid ${p.a}` : `1px solid ${p.a}33`,
                      borderRadius: '14px',
                      boxShadow: isCurrentPillar ? `0 0 24px ${p.a}35` : 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() => router.push(`/team-programs/pillar/${i + 1}`)}
                  >
                    <div style={{ padding: '18px 10px 16px', background: isCurrentPillar ? `linear-gradient(160deg, ${p.a}18, rgba(4,8,20,0.92))` : 'rgba(4,8,20,0.88)', backdropFilter: 'blur(16px)', borderRadius: '13px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '24px', height: '2px', background: p.a, borderRadius: '2px', opacity: isCurrentPillar ? 1 : 0.5 }} />
                      <p style={{ fontSize: '22px', fontWeight: 900, color: p.a, lineHeight: 1, margin: 0, textShadow: isCurrentPillar ? `0 0 16px ${p.a}80` : 'none' }}>{p.num}</p>
                      <p style={{ fontSize: '9px', color: isCurrentPillar ? `${p.a}EE` : `${p.a}88`, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', margin: 0, lineHeight: 1.4 }}>{p.label}</p>
                      {isCurrentPillar && (
                        <div style={{ background: `${p.a}22`, border: `1px solid ${p.a}55`, borderRadius: '20px', padding: '2px 8px' }}>
                          <p style={{ fontSize: '7px', color: p.a, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', margin: 0 }}>CURRENT</p>
                        </div>
                      )}
                    </div>
                  </TiltCard>
                );
              })}
            </div>
          </div>

          {/* Prev / Next navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              {hasPrev && (
                <button
                  onClick={() => router.push(`/team-programs/pillar/${prevId}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(96,205,255,0.22)', borderRadius: '12px', padding: '14px 22px', color: BLUE2, fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(55,181,255,0.1)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; }}
                >
                  <ArrowLeft size={14} />
                  PILLAR {prevId}
                </button>
              )}
            </div>
            <button
              onClick={() => router.push('/team-programs')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', transition: 'color 0.2s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = BLUE2; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)'; }}
            >
              ALL PILLARS
            </button>
            <div>
              {hasNext && (
                <button
                  onClick={() => router.push(`/team-programs/pillar/${nextId}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(96,205,255,0.22)', borderRadius: '12px', padding: '14px 22px', color: BLUE2, fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(55,181,255,0.1)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; }}
                >
                  PILLAR {nextId}
                  <ArrowLeft size={14} style={{ transform: 'rotate(180deg)' }} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div style={{ background: '#061530', padding: '28px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '3px', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>
          &copy; 2026 SMARTER GOALIE INC. | THE INTELLIGENT ATHLETIC GOALTENDER
        </p>
      </div>
    </div>
  );
}
