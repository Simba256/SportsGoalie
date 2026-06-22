// ─── Types ────────────────────────────────────────────────────────────────────

export type CBInputType =
  | 'text'
  | 'email_phone'
  | 'location'
  | 'radio'
  | 'multi_select'
  | 'scale'
  | 'open_text';

export interface CBQuestionOption {
  id: string;
  text: string;
  hasOpenText?: boolean;
  isSkip?: boolean;
  isPreferNot?: boolean;
}

export interface CBSubQuestion {
  id: string;
  question: string;
  showWhenParentValues: string[];
}

export interface CBQuestion {
  id: string;
  section: CBSectionKey;
  inputType: CBInputType;
  question: string;
  subLabel?: string;
  note?: string;
  tooltip?: string;
  options?: CBQuestionOption[];
  scaleLeft?: string;
  scaleRight?: string;
  required?: boolean;
  evolutionEligible?: boolean;
  conditionalLogic?: {
    parentId: string;
    showWhenIncludes: string[];
  };
  subQuestion?: CBSubQuestion;
}

export interface CBSection {
  key: CBSectionKey;
  title: string;
  categoryLabel: string;
  intro?: string;
  questions: CBQuestion[];
}

export type CBSectionKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

// ─── Sections ─────────────────────────────────────────────────────────────────

export const COACH_BASELINE_SECTIONS: CBSection[] = [
  // ── SECTION A ──────────────────────────────────────────────────────────────
  {
    key: 'A',
    title: 'ABOUT YOU AND YOUR ROLE',
    categoryLabel: 'Identity / Coaching Background',
    questions: [
      {
        id: 'A1',
        section: 'A',
        inputType: 'text',
        question: 'Your full name and title.',
        required: true,
      },
      {
        id: 'A2',
        section: 'A',
        inputType: 'radio',
        question: 'Your role with the team.',
        required: true,
        options: [
          { id: 'A2-head', text: 'Head Coach' },
          { id: 'A2-assistant', text: 'Assistant Coach' },
          { id: 'A2-goalie-coach', text: 'Goalie Coach' },
          { id: 'A2-manager', text: 'Team Manager' },
          { id: 'A2-parent', text: 'Parent Volunteer' },
          { id: 'A2-hired', text: 'Hired Support' },
          { id: 'A2-other', text: 'Other — tell us', hasOpenText: true },
        ],
      },
      {
        id: 'A3',
        section: 'A',
        inputType: 'email_phone',
        question: 'Contact information — email and phone.',
        required: true,
      },
      {
        id: 'A4',
        section: 'A',
        inputType: 'location',
        question: 'Location — city, state or province, country.',
        required: true,
      },
      {
        id: 'A5',
        section: 'A',
        inputType: 'text',
        question: 'Team name, league, and level.',
        required: true,
      },
      {
        id: 'A6',
        section: 'A',
        inputType: 'radio',
        question: 'How many years have you been involved in coaching hockey?',
        required: true,
        options: [
          { id: 'A6-1', text: 'This is my first season' },
          { id: 'A6-2', text: '1–3 seasons' },
          { id: 'A6-3', text: '4–10 seasons' },
          { id: 'A6-4', text: '11–20 seasons' },
          { id: 'A6-5', text: '20+ seasons' },
        ],
      },
      {
        id: 'A7',
        section: 'A',
        inputType: 'radio',
        question: 'How did you hear about Smarter Goalie?',
        required: true,
        options: [
          { id: 'A7-1', text: 'Through a parent on the team' },
          { id: 'A7-2', text: 'Through a goalie I coach' },
          { id: 'A7-3', text: 'Through another coach' },
          { id: 'A7-4', text: 'Found online' },
          { id: 'A7-5', text: 'Through my organisation' },
          { id: 'A7-6', text: 'Other' },
        ],
      },
    ],
  },

  // ── SECTION B ──────────────────────────────────────────────────────────────
  {
    key: 'B',
    title: 'YOUR GOALTENDING KNOWLEDGE',
    categoryLabel: 'Self-Rated Knowledge / Learning Openness',
    intro:
      'Smarter Goalie meets every coach where they are. Some coaches played goalie. Some never put on a pad. Both can serve a goaltender well — with the right teaching system around them. We want to know what you bring to the table — respectfully, without prejudice, in honest pursuit of growth as far as you wish to take it.',
    questions: [
      {
        id: 'B1',
        section: 'B',
        inputType: 'radio',
        question:
          'How would you describe your personal knowledge of the goaltender position?',
        note: 'There are no wrong answers. Most coaches were never trained in this position specifically. Pick what reflects you honestly.',
        evolutionEligible: true,
        options: [
          { id: 'B1-1', text: 'I have very little technical knowledge of the position' },
          { id: 'B1-2', text: 'I know enough to support a goalie, but I rely on others for technical work' },
          { id: 'B1-3', text: 'I have some background in the position from playing or observing closely' },
          { id: 'B1-4', text: 'I have studied the position and feel I can guide a goalie in most areas' },
          { id: 'B1-5', text: 'I am still figuring out what I know' },
        ],
      },
      {
        id: 'B2',
        section: 'B',
        inputType: 'radio',
        question: 'Did you ever play the goaltender position yourself?',
        options: [
          { id: 'B2-many', text: 'Yes — for many seasons' },
          { id: 'B2-few', text: 'Yes — for a few seasons' },
          { id: 'B2-brief', text: 'Briefly — at some point' },
          { id: 'B2-no', text: 'No — never' },
        ],
        subQuestion: {
          id: 'B2-sub',
          question: 'At what level?',
          showWhenParentValues: ['B2-many', 'B2-few', 'B2-brief'],
        },
      },
      {
        id: 'B3',
        section: 'B',
        inputType: 'scale',
        question: 'How comfortable are you giving technical feedback to your goaltender right now?',
        scaleLeft: 'Not comfortable at all',
        scaleRight: 'Very comfortable',
        evolutionEligible: true,
      },
      {
        id: 'B4',
        section: 'B',
        inputType: 'radio',
        question:
          'Smarter Goalie provides a Basic Core Observations framework that covers the fundamentals of what we ask coaches to observe — without overstepping what is reasonable inside a coach\'s full plate. Would you like us to tell you a bit more about how this works for coaches like you?',
        note: 'There is no growth requirement on your end. The Basic Core is what we ask. If you wish to enhance your contribution beyond the Basic Core — our Index of Observational Content is open to you, at your own pace, in the areas you choose. We may occasionally share a friendly thought when an additional observation could strengthen what we are seeing together. No pressure. Just partnership.',
        options: [
          { id: 'B4-1', text: 'Yes — tell me more about the Basic Core Observations' },
          { id: 'B4-2', text: 'Yes — and I am also curious about the Index of Observational Content' },
          { id: 'B4-3', text: 'Basic Core is enough for me — I will let SG handle the rest' },
          { id: 'B4-4', text: 'I will find my way as I go — leave the door open' },
        ],
      },
    ],
  },

  // ── SECTION C ──────────────────────────────────────────────────────────────
  {
    key: 'C',
    title: 'YOUR PROGRAM CONTEXT',
    categoryLabel: 'Practical Program Reality / Resource Gaps',
    intro:
      'Every program is different. Different rosters. Different ice time. Different resources. Different histories. We want to understand the reality of your program — not the version on paper, but the one you actually navigate.',
    questions: [
      {
        id: 'C1',
        section: 'C',
        inputType: 'radio',
        question: 'How many goaltenders are on your roster this season?',
        note: '2 is the norm. 3 is unusual but possible. 3 or more is typically a Junior or Professional model in a feeder system.',
        options: [
          { id: 'C1-1', text: '1 (only goalie on the team)' },
          { id: 'C1-2', text: '2 (the norm)' },
          { id: 'C1-3', text: '3 (unusual but possible at higher levels)' },
          { id: 'C1-4', text: 'More than 3 (Junior / Pro / feeder system)' },
          { id: 'C1-5', text: 'We share goalies across multiple teams' },
        ],
      },
      {
        id: 'C2',
        section: 'C',
        inputType: 'radio',
        question: 'Do you currently work with a dedicated goalie coach?',
        note: 'Smarter Goalie does not arrive to displace anyone. We do not call out what is missing in another teaching system. We simply let the system work — and the proof reveals itself in the goalie\'s growth. Goalies, parents, and existing goalie coaches who see the Smarter Goalie way over time tend to recognize what we recognize. No one has to be told. Eyes open on their own.',
        options: [
          { id: 'C2-1', text: 'Yes — full-time, regular practices' },
          { id: 'C2-2', text: 'Yes — occasional sessions' },
          { id: 'C2-3', text: 'No — we are looking for one' },
          { id: 'C2-4', text: 'No — not at this time' },
          { id: 'C2-5', text: 'Sometimes — depending on the season' },
        ],
      },
      {
        id: 'C3',
        section: 'C',
        inputType: 'radio',
        question:
          'As the coach making the final call — are you open to the Smarter Goalie Practice Time concept?',
        tooltip:
          'The Smarter Goalie Practice Time concept empowers the goalie to work on structured development on their own — or in cooperation with support when available. Important: This concept is designed NOT to affect the team\'s practice in any way. Smarter Goalie has a game plan that works alongside your game plan. We are designed to be a positive addition — never a burden.',
        options: [
          { id: 'C3-1', text: 'Yes — anything that develops my goalie independently of team practice is welcome' },
          { id: 'C3-2', text: 'Yes — and I want to see how it works in real terms' },
          { id: 'C3-3', text: 'Open in principle — I will let the goalie engage and see what fits' },
          { id: 'C3-4', text: 'Hesitant — I have questions about how it could affect my team' },
          { id: 'C3-5', text: 'I am not sure yet — tell us more' },
        ],
      },
      {
        id: 'C4',
        section: 'C',
        inputType: 'multi_select',
        question: 'What is the biggest gap in your current goaltender development setup?',
        note: 'Pick anything that fits. If something we missed — tell us in your own words.',
        options: [
          { id: 'C4-1', text: 'No dedicated goalie coach' },
          { id: 'C4-2', text: 'Not enough designated goalie time in practice' },
          { id: 'C4-3', text: 'Lack of a structured teaching system for goalies' },
          { id: 'C4-4', text: 'No way to track goalie development over time' },
          { id: 'C4-5', text: 'Coaches not trained in goaltender development' },
          { id: 'C4-6', text: 'Parents disconnected from goalie development conversation' },
          { id: 'C4-7', text: 'Conflicting teaching philosophies between coaches' },
          { id: 'C4-8', text: 'Resource constraints — budget, time, ice availability' },
          { id: 'C4-9', text: 'Goalies inconsistent in their own engagement' },
          { id: 'C4-open', text: 'Something else — tell us in your own words', hasOpenText: true },
          { id: 'C4-ok', text: 'Honestly, we are doing okay — no major gaps right now' },
        ],
      },
      {
        id: 'C5',
        section: 'C',
        inputType: 'radio',
        question: 'How long has your goalie (or goalies) been with your current program?',
        options: [
          { id: 'C5-1', text: 'First season with us' },
          { id: 'C5-2', text: '2 seasons' },
          { id: 'C5-3', text: '3–5 seasons' },
          { id: 'C5-4', text: 'More than 5 seasons' },
          { id: 'C5-5', text: 'Mixed — depends on the goalie' },
        ],
      },
    ],
  },

  // ── SECTION D ──────────────────────────────────────────────────────────────
  {
    key: 'D',
    title: 'WHAT YOU OBSERVE',
    categoryLabel: 'Bench-Side Observation / Cross-Reference',
    intro:
      "You see your goalie in moments no one else sees. The way they handle a pre-game warm-up. Their body language between periods. How they engage during a tight drill. Your bench-side observations form a layer of the goalie's picture that only the coach can provide.",
    questions: [
      {
        id: 'D1',
        section: 'D',
        inputType: 'multi_select',
        question: 'When you watch your goalie play, what stands out most often?',
        note: 'These are examples. Pick what fits — and if there is something we missed, tell us in your own words.',
        options: [
          { id: 'D1-1', text: 'Patient and composed' },
          { id: 'D1-2', text: 'Strong positioning' },
          { id: 'D1-3', text: 'Engaged and focused' },
          { id: 'D1-4', text: 'Confident' },
          { id: 'D1-5', text: 'Over-reacting' },
          { id: 'D1-6', text: 'Inconsistent night to night' },
          { id: 'D1-7', text: 'Distracted or disengaged' },
          { id: 'D1-8', text: 'Hesitant' },
          { id: 'D1-open', text: 'Something else — tell us', hasOpenText: true },
          { id: 'D1-ns', text: "I'm not sure yet" },
        ],
      },
      {
        id: 'D2',
        section: 'D',
        inputType: 'scale',
        question: 'How would you rate your goalie\'s consistency game to game?',
        scaleLeft: 'Very inconsistent',
        scaleRight: 'Very consistent',
        evolutionEligible: true,
      },
      {
        id: 'D3',
        section: 'D',
        inputType: 'scale',
        question: 'How does your goalie handle giving up a bad goal during a game?',
        scaleLeft: 'Struggles to recover',
        scaleRight: 'Bounces back quickly',
        evolutionEligible: true,
      },
      {
        id: 'D4',
        section: 'D',
        inputType: 'scale',
        question: "How would you describe your goalie's engagement level during practices?",
        scaleLeft: 'Often disengaged',
        scaleRight: 'Fully engaged every time',
        evolutionEligible: true,
      },
      {
        id: 'D5',
        section: 'D',
        inputType: 'radio',
        question: 'When your goalie struggles in a game — what do you SEE in their body language?',
        note: 'Coaches do not hear self-talk. What you see is what we want to capture — posture, head position, recovery between shots, energy on the ice. These visible signs tell us what no one else from your vantage point can see.',
        evolutionEligible: true,
        options: [
          { id: 'D5-1', text: 'They reset visibly — head up, posture strong' },
          { id: 'D5-2', text: 'Mixed — depends on the moment' },
          { id: 'D5-3', text: 'They get visibly down — shoulders drop, posture changes' },
          { id: 'D5-4', text: 'Hard to read — they keep it inside' },
          { id: 'D5-5', text: 'I had not paid close attention to this before' },
        ],
      },
      {
        id: 'D6',
        section: 'D',
        inputType: 'open_text',
        question: 'What is your overall impression of where your goalie stands developmentally right now?',
        evolutionEligible: true,
      },
    ],
  },

  // ── SECTION E ──────────────────────────────────────────────────────────────
  {
    key: 'E',
    title: 'GOALIE PSYCHOLOGY 101',
    categoryLabel: 'Coach Awareness — Most Innovative Section',
    intro:
      "Coach — what you are about to read may be the most important conversation in this entire questionnaire. Most coaches were never trained to understand how their words and actions affect a goaltender's confidence. This is not a criticism — it is reality. The position has been underserved at the coaching education level for as long as the game has existed. These questions do not test you. They surface something most coaches have not been asked to think about. There are no wrong answers. Most coaches I have worked with for decades had not considered these things until asked. Thank you for sitting with these honestly.",
    questions: [
      {
        id: 'E1',
        section: 'E',
        inputType: 'radio',
        question: 'When you have two goaltenders on your roster — do you identify one as the stronger of the two?',
        note: 'This is a question of awareness — not a judgment. Coaches handle this differently. We simply want to know how you see it.',
        evolutionEligible: true,
        options: [
          { id: 'E1-1', text: 'Yes — I clearly identify a #1 and a backup' },
          { id: 'E1-2', text: 'Yes — but I treat them on par publicly to support both' },
          { id: 'E1-3', text: 'Sometimes — depending on the season\'s flow' },
          { id: 'E1-4', text: 'No — I treat them as on par, both can start any game' },
          { id: 'E1-5', text: 'I had not formalized this in my mind before' },
        ],
      },
      {
        id: 'E2',
        section: 'E',
        inputType: 'radio',
        question: 'How do you communicate that identification to your goalies?',
        evolutionEligible: true,
        options: [
          { id: 'E2-1', text: 'Direct conversation — they know where they stand' },
          { id: 'E2-2', text: 'Through ice time — they figure it out from the schedule' },
          { id: 'E2-3', text: 'Through pre-game preparation — the starter prepares differently' },
          { id: 'E2-4', text: 'I do not directly communicate it — but I believe they sense it' },
          { id: 'E2-5', text: 'I had not thought about this before' },
          { id: 'E2-open', text: 'Something else — tell us in your own words', hasOpenText: true },
        ],
      },
      {
        id: 'E3',
        section: 'E',
        inputType: 'radio',
        question: 'When you know which goalie is starting a particular game — when do you typically tell them?',
        evolutionEligible: true,
        options: [
          { id: 'E3-1', text: 'The day before' },
          { id: 'E3-2', text: 'The morning of' },
          { id: 'E3-3', text: 'Upon arrival at the rink' },
          { id: 'E3-4', text: 'During warm-up' },
          { id: 'E3-5', text: 'It varies game to game' },
          { id: 'E3-6', text: 'I do not formally tell them — they figure it out' },
        ],
      },
      {
        id: 'E4',
        section: 'E',
        inputType: 'scale',
        question: 'How important do you feel it is for a goalie to know in advance when they are starting?',
        scaleLeft: 'Not important — they should always be ready',
        scaleRight: 'Very important — knowing changes preparation',
        evolutionEligible: true,
      },
      {
        id: 'E5',
        section: 'E',
        inputType: 'radio',
        question: 'Do you have a defined role for the backup goalie on game days?',
        note: 'Backups often feel forgotten on game days. Many coaches have never considered this question.',
        evolutionEligible: true,
        options: [
          { id: 'E5-1', text: 'Yes — clear, meaningful role' },
          { id: 'E5-2', text: 'Yes — but informal' },
          { id: 'E5-3', text: 'Somewhat — depends on the game' },
          { id: 'E5-4', text: 'No — I have not defined this' },
          { id: 'E5-5', text: 'I had not thought about this before' },
        ],
      },
      {
        id: 'E6',
        section: 'E',
        inputType: 'radio',
        question: 'Before a big game — how do you typically approach your goalie?',
        evolutionEligible: true,
        options: [
          { id: 'E6-1', text: 'I keep things normal — no special treatment' },
          { id: 'E6-2', text: 'I have a calm, supportive pre-game conversation' },
          { id: 'E6-3', text: 'I pump them up with confidence-building words' },
          { id: 'E6-4', text: 'I let them lead — I follow their energy' },
          { id: 'E6-5', text: 'I am not always sure what to say to my goalie before a big game' },
          { id: 'E6-open', text: 'Something else — tell us', hasOpenText: true },
        ],
      },
      {
        id: 'E7',
        section: 'E',
        inputType: 'scale',
        question: 'How aware are you of the unique psychological demands on the goaltender position compared to other players?',
        scaleLeft: 'I had not thought deeply about this',
        scaleRight: 'I am very aware and adjust how I coach them',
        evolutionEligible: true,
      },
      {
        id: 'E8',
        section: 'E',
        inputType: 'radio',
        question: 'Do you understand how much your actions and words can affect the young — or even the more mature — goalie\'s mind?',
        note: 'This is the central question of Goalie Psychology 101. Confidence is built — or eroded — in small moments most coaches do not realize they are creating. Honest awareness is the door to better coaching.',
        evolutionEligible: true,
        options: [
          { id: 'E8-1', text: 'Yes — I am acutely aware and try to coach accordingly' },
          { id: 'E8-2', text: 'Yes — but I know I have room to grow in this area' },
          { id: 'E8-3', text: 'I am aware in theory but I am not sure I always act on it' },
          { id: 'E8-4', text: 'Honestly — I have not thought about this enough' },
          { id: 'E8-5', text: 'This question is opening my eyes right now' },
        ],
      },
      {
        id: 'E9',
        section: 'E',
        inputType: 'radio',
        question: 'Do you regularly check in with your goalie about how they are FEELING — beyond just their play?',
        evolutionEligible: true,
        options: [
          { id: 'E9-1', text: 'Yes — regularly' },
          { id: 'E9-2', text: 'Sometimes — when something stands out' },
          { id: 'E9-3', text: 'Rarely — I focus on the play' },
          { id: 'E9-4', text: 'No — I have not made this a habit' },
          { id: 'E9-5', text: 'I had not considered this as a coaching responsibility' },
        ],
      },
      {
        id: 'E10',
        section: 'E',
        inputType: 'open_text',
        question: 'What is one thing you have learned about coaching goaltenders that you wish you had known earlier in your career?',
        evolutionEligible: true,
        options: [{ id: 'E10-skip', text: "I'm still learning", isSkip: true }],
      },
      {
        id: 'E11',
        section: 'E',
        inputType: 'radio',
        question: 'Would you welcome guidance from Smarter Goalie on the psychological side of coaching goaltenders?',
        note: 'There is no pressure here. If your hands are full, we are here when you need us. If you want to grow in this area — we can walk that path with you.',
        options: [
          { id: 'E11-1', text: 'Yes — I would value this guidance' },
          { id: 'E11-2', text: 'Yes — I am open to it' },
          { id: 'E11-3', text: 'Maybe — depending on the format and time required' },
          { id: 'E11-4', text: 'Not at this time — but good to know it is available' },
        ],
      },
    ],
  },

  // ── SECTION F ──────────────────────────────────────────────────────────────
  {
    key: 'F',
    title: 'TIME AND PARTICIPATION',
    categoryLabel: 'Realistic Commitment / Scalable Participation',
    intro:
      'Smarter Goalie is built to work with coaches at any level of available time. Some coaches have hours per week to invest. Some have minutes. Both can serve a goaltender well — with the right system around them. We want to know what is realistic for you.',
    questions: [
      {
        id: 'F1',
        section: 'F',
        inputType: 'radio',
        question: 'How much time per game can you realistically commit to the Coach Observation Chart?',
        note: "The Coach Observation Chart is one of our 5 coach tools. It captures the bench-side view of the goalie's game. Even a few minutes builds the picture.",
        options: [
          { id: 'F1-1', text: '2–5 minutes — quick capture' },
          { id: 'F1-2', text: '5–10 minutes — moderate detail' },
          { id: 'F1-3', text: '10–15 minutes — full observation' },
          { id: 'F1-4', text: 'I am willing — I just need to see how it works' },
          { id: 'F1-5', text: 'I am not sure yet' },
        ],
      },
      {
        id: 'F2',
        section: 'F',
        inputType: 'radio',
        question: 'How much time per practice can you commit to a quick Practice Observation update?',
        note: 'Practice Observation is lighter than the Coach Observation Chart. A brief note on how the goalie engaged in practice — what stood out, what needs attention.',
        options: [
          { id: 'F2-1', text: '1–2 minutes' },
          { id: 'F2-2', text: '3–5 minutes' },
          { id: 'F2-3', text: '5–10 minutes' },
          { id: 'F2-4', text: 'I am willing — I just need to see how it works' },
          { id: 'F2-5', text: 'I am not sure yet' },
        ],
      },
      {
        id: 'F3',
        section: 'F',
        inputType: 'radio',
        question: 'If you cannot personally complete the observations — is there someone on your staff or in your program who could step in?',
        note: 'Many head coaches delegate this work to an assistant, a team manager, or a parent volunteer. The role can be shared. The goalie still benefits.',
        options: [
          { id: 'F3-1', text: 'Yes — an assistant coach' },
          { id: 'F3-2', text: 'Yes — a goalie coach' },
          { id: 'F3-3', text: 'Yes — a team manager' },
          { id: 'F3-4', text: 'Yes — a parent volunteer' },
          { id: 'F3-5', text: 'No — it would only be me' },
          { id: 'F3-6', text: 'I am not sure yet' },
        ],
      },
      {
        id: 'F4',
        section: 'F',
        inputType: 'radio',
        question: 'How would you describe your willingness to use Smarter Goalie\'s tools — overall?',
        note: 'There is no wrong answer. The system grows with you at the pace you choose.',
        options: [
          { id: 'F4-1', text: 'Fully willing — I want to engage with all the tools available' },
          { id: 'F4-2', text: 'Willing — but I need to see the value as I go' },
          { id: 'F4-3', text: 'Open — but I will start small and grow if it fits' },
          { id: 'F4-4', text: 'Cautious — I will let the goalie engage first and see what comes back' },
          { id: 'F4-5', text: 'I am not sure yet' },
        ],
      },
    ],
  },

  // ── SECTION G ──────────────────────────────────────────────────────────────
  {
    key: 'G',
    title: 'WHAT YOU WANT FOR YOUR GOALIE AND PROGRAM',
    categoryLabel: 'Vision of Success / Program Goals',
    intro:
      'Every program has a vision. Some are chasing championships. Some are building character. Some are doing both. We want to understand what success looks like to you — for your goalie, and for your program as a whole.',
    questions: [
      {
        id: 'G1',
        section: 'G',
        inputType: 'open_text',
        question: 'What does success look like for your goaltender this season?',
        evolutionEligible: true,
      },
      {
        id: 'G2',
        section: 'G',
        inputType: 'open_text',
        question: 'What does success look like for your program in terms of goalie development specifically?',
        note: 'Wins matter. But goalie development is its own measure — and often the unsung one.',
        evolutionEligible: true,
      },
      {
        id: 'G3',
        section: 'G',
        inputType: 'scale',
        question: 'How important is it to you that parents are informed and aligned about goalie development?',
        scaleLeft: "Not important — that is the parent's job",
        scaleRight: 'Very important — alignment matters',
        evolutionEligible: true,
      },
      {
        id: 'G4',
        section: 'G',
        inputType: 'open_text',
        question: 'Where do you see your goaltender being a year from now — in their game and in themselves?',
        evolutionEligible: true,
      },
      {
        id: 'G5',
        section: 'G',
        inputType: 'open_text',
        question: 'What is the biggest challenge your goalie is facing right now — that Smarter Goalie should know about?',
        evolutionEligible: true,
        options: [{ id: 'G5-skip', text: 'Nothing specific right now', isSkip: true }],
      },
      {
        id: 'G6',
        section: 'G',
        inputType: 'multi_select',
        question: 'What would you most want Smarter Goalie to deliver — for your goalie and your program?',
        note: 'Pick anything that fits. If we missed something — tell us in your own words.',
        options: [
          { id: 'G6-1', text: 'A structured teaching system my goalie can work through on their own' },
          { id: 'G6-2', text: 'Tools that connect games and practices into one development picture' },
          { id: 'G6-3', text: 'A way to track goalie development over time with real data' },
          { id: 'G6-4', text: 'Coach education on the goaltender position' },
          { id: 'G6-5', text: 'Parent education to align the support around the goalie' },
          { id: 'G6-6', text: 'Independent goalie development without burdening team practice' },
          { id: 'G6-7', text: "Recognition and milestones that build my goalie's confidence" },
          { id: 'G6-open', text: 'Something we missed — tell us in your own words', hasOpenText: true },
        ],
      },
    ],
  },

  // ── SECTION H ──────────────────────────────────────────────────────────────
  {
    key: 'H',
    title: 'OPEN DOOR',
    categoryLabel: 'Final Thoughts',
    questions: [
      {
        id: 'H1',
        section: 'H',
        inputType: 'open_text',
        question: 'Is there anything else you want Coach Mike and the Smarter Goalie team to know about your program, your goalie, or your situation?',
        note: 'This is your open door. Anything we missed. Anything you want us to hear. A history, a context, a hope, a concern — whatever feels important.',
        evolutionEligible: true,
        options: [{ id: 'H1-skip', text: 'Nothing else right now', isSkip: true }],
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getCoachActiveQuestions(
  section: CBSection,
  responses: Record<string, string | string[]>
): CBQuestion[] {
  return section.questions.filter((q) => {
    if (!q.conditionalLogic) return true;
    const val = responses[q.conditionalLogic.parentId];
    if (!val) return false;
    const arr = Array.isArray(val) ? val : [val];
    return arr.some((v) => q.conditionalLogic!.showWhenIncludes.includes(v));
  });
}
