// ─── Types ────────────────────────────────────────────────────────────────────

export type PBInputType =
  | 'text'
  | 'goalie_info'   // Two fields: goalie's full name + goalie's age (A3)
  | 'email_phone'   // email + phone
  | 'location'      // city + state/province + country
  | 'radio'
  | 'multi_select'
  | 'scale'
  | 'open_text';

export interface PBQuestionOption {
  id: string;
  text: string;
  hasOpenText?: boolean;
  isSkip?: boolean;
  isPreferNot?: boolean;
}

export interface PBSubQuestion {
  id: string;
  question: string;
  showWhenParentValues: string[];
}

export interface PBQuestion {
  id: string;
  section: PBSectionKey;
  inputType: PBInputType;
  question: string;
  subLabel?: string;
  note?: string;
  tooltip?: string;
  options?: PBQuestionOption[];
  scaleLeft?: string;
  scaleRight?: string;
  required?: boolean;
  evolutionEligible?: boolean;
  conditionalLogic?: {
    parentId: string;
    showWhenIncludes: string[];
  };
  subQuestion?: PBSubQuestion;
}

export interface PBSection {
  key: PBSectionKey;
  title: string;
  categoryLabel: string;
  intro?: string;
  questions: PBQuestion[];
}

export type PBSectionKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

// ─── Sections ─────────────────────────────────────────────────────────────────

export const PARENT_BASELINE_SECTIONS: PBSection[] = [
  // ── SECTION A ──────────────────────────────────────────────────────────────
  {
    key: 'A',
    title: 'ABOUT YOU AND YOUR GOALIE',
    categoryLabel: 'Identity / Family Context',
    questions: [
      {
        id: 'A1',
        section: 'A',
        inputType: 'text',
        question: 'Your full name.',
        required: true,
      },
      {
        id: 'A2',
        section: 'A',
        inputType: 'radio',
        question: 'Your relationship to the goalie.',
        required: true,
        options: [
          { id: 'A2-mother', text: 'Mother' },
          { id: 'A2-father', text: 'Father' },
          { id: 'A2-guardian', text: 'Guardian' },
          { id: 'A2-step', text: 'Step-parent' },
          { id: 'A2-other', text: 'Other family member — tell us', hasOpenText: true },
        ],
      },
      {
        id: 'A3',
        section: 'A',
        inputType: 'goalie_info',
        question: "Your goalie's name and age.",
        required: true,
      },
      {
        id: 'A4',
        section: 'A',
        inputType: 'email_phone',
        question: 'Contact information — email and phone.',
        required: true,
      },
      {
        id: 'A5',
        section: 'A',
        inputType: 'location',
        question: 'Location — city, state or province, country.',
        required: true,
      },
      {
        id: 'A6',
        section: 'A',
        inputType: 'text',
        question: "Your goalie's current team and level.",
        required: false,
      },
      {
        id: 'A7',
        section: 'A',
        inputType: 'radio',
        question: 'How long have you been a goalie parent?',
        required: true,
        options: [
          { id: 'A7-1', text: 'This is our first season' },
          { id: 'A7-2', text: '1–2 seasons' },
          { id: 'A7-3', text: '3–5 seasons' },
          { id: 'A7-4', text: '6–10 seasons' },
          { id: 'A7-5', text: '10+ seasons' },
        ],
      },
    ],
  },

  // ── SECTION B ──────────────────────────────────────────────────────────────
  {
    key: 'B',
    title: 'YOUR INVOLVEMENT',
    categoryLabel: 'Parent Engagement / Hockey Knowledge / Goalie Coach Context',
    intro:
      "We want to understand the world you live in as a goalie parent — your familiarity with the position, your level of involvement, and the support around your goalie. There are no right or wrong answers here. We are simply taking inventory together.",
    questions: [
      {
        id: 'B1',
        section: 'B',
        inputType: 'radio',
        question:
          "How would you describe your current involvement in your goalie's development?",
        evolutionEligible: true,
        options: [
          { id: 'B1-1', text: 'I attend games and that is the extent of my involvement' },
          { id: 'B1-2', text: 'I attend games and practices, but I do not have deep hockey knowledge' },
          { id: 'B1-3', text: 'I try to support development but feel I lack the knowledge to help' },
          { id: 'B1-4', text: 'I am actively involved — finding resources, working with coaches' },
          { id: 'B1-open', text: 'Something else — tell us in your own words', hasOpenText: true },
        ],
      },
      {
        id: 'B2',
        section: 'B',
        inputType: 'radio',
        question: 'How familiar are you with the technical side of goaltending?',
        evolutionEligible: true,
        options: [
          { id: 'B2-1', text: 'Not familiar at all' },
          { id: 'B2-2', text: 'Basic — I know some terminology' },
          { id: 'B2-3', text: 'Moderate — I can follow what is being coached' },
          { id: 'B2-4', text: 'Strong — I played, coached, or have studied the position' },
        ],
      },
      {
        id: 'B3',
        section: 'B',
        inputType: 'radio',
        question: 'Does your goalie currently work with a goalie coach?',
        options: [
          { id: 'B3-1', text: 'Yes — regularly scheduled' },
          { id: 'B3-2', text: 'Yes — occasionally' },
          { id: 'B3-3', text: 'No — currently looking for a goalie coach' },
          { id: 'B3-4', text: 'No — not at this time' },
        ],
      },
      {
        id: 'B3B',
        section: 'B',
        inputType: 'radio',
        question: 'How many different goalie coaches has your goalie worked with over their career?',
        options: [
          { id: 'B3B-1', text: 'Just one' },
          { id: 'B3B-2', text: 'Two' },
          { id: 'B3B-3', text: 'Three' },
          { id: 'B3B-4', text: 'Four or more' },
          { id: 'B3B-5', text: 'None — never worked with a goalie coach' },
          { id: 'B3B-6', text: "I'm not sure" },
        ],
      },
      {
        id: 'B3C',
        section: 'B',
        inputType: 'radio',
        question: 'Has your goalie trained with two or more goalie coaches in the same season?',
        note: 'There is no judgment in this question. We are simply taking inventory. This is important context for Smarter Goalie to understand your goalie\'s teaching environment.',
        options: [
          { id: 'B3C-1', text: 'No — one goalie coach at a time' },
          { id: 'B3C-yes-current', text: 'Yes — currently working with more than one' },
          { id: 'B3C-yes-past', text: 'Yes — in past seasons' },
          { id: 'B3C-ns', text: "I'm not sure" },
        ],
      },
      {
        id: 'B3D',
        section: 'B',
        inputType: 'radio',
        question:
          'When more than one coach is involved — do their teaching philosophies align, or are they teaching different approaches?',
        note: 'Not all goalie coaches share the same teaching philosophies. We ask not to judge — but so we can serve your goalie clearly. Due diligence matters when more than one teaching voice is involved.',
        evolutionEligible: true,
        conditionalLogic: {
          parentId: 'B3C',
          showWhenIncludes: ['B3C-yes-current', 'B3C-yes-past'],
        },
        options: [
          { id: 'B3D-1', text: 'They align — same general teaching approach' },
          { id: 'B3D-2', text: 'They mostly align — small differences' },
          { id: 'B3D-3', text: 'They differ in some important areas' },
          { id: 'B3D-4', text: 'They clash — different philosophies' },
          { id: 'B3D-5', text: "I'm not sure" },
          { id: 'B3D-6', text: 'I had not thought about it this way before' },
        ],
      },
      {
        id: 'B4',
        section: 'B',
        inputType: 'radio',
        question: 'Have you ever played hockey — or played net yourself?',
        note: "This is just context. It helps us understand the athletic foundation you bring to your goalie's experience.",
        options: [
          { id: 'B4-hockey', text: 'Yes — I played hockey' },
          { id: 'B4-net', text: 'Yes — I played net' },
          { id: 'B4-both', text: 'Yes — both' },
          { id: 'B4-sport', text: 'Yes — another sport at a high level' },
          { id: 'B4-no', text: 'No — I did not play competitively' },
        ],
        subQuestion: {
          id: 'B4-sub',
          question: 'Briefly — what did you play, and at what level?',
          showWhenParentValues: ['B4-hockey', 'B4-net', 'B4-both', 'B4-sport'],
        },
      },
      {
        id: 'B5',
        section: 'B',
        inputType: 'radio',
        question:
          "Are you the primary parent involved in your goalie's hockey life — or is that role shared?",
        options: [
          { id: 'B5-1', text: 'Yes — I am the primary parent involved' },
          { id: 'B5-2', text: 'Shared — we both participate' },
          { id: 'B5-3', text: 'My partner is more involved than I am' },
          { id: 'B5-4', text: 'Single parent — I handle it all' },
          { id: 'B5-open', text: 'Other arrangement — tell us', hasOpenText: true },
        ],
      },
    ],
  },

  // ── SECTION C ──────────────────────────────────────────────────────────────
  {
    key: 'C',
    title: 'WHAT YOU OBSERVE',
    categoryLabel: 'External Observation / Style of Play / Cross-Reference',
    intro:
      'You see your goalie play more than almost anyone else in their life. You see them on their good nights and their hard nights. You see them in warm-up, between periods, after the final buzzer. Your observations are a piece of the picture that no one else can offer.',
    questions: [
      {
        id: 'C1',
        section: 'C',
        inputType: 'multi_select',
        question: 'When you watch your goalie play, what do you see most often?',
        note: 'These are examples. Pick what you see — and if something stands out that we did not list, tell us in your own words.',
        options: [
          { id: 'C1-1', text: 'Patient and composed' },
          { id: 'C1-2', text: 'Strong positioning' },
          { id: 'C1-3', text: 'Engaged and focused' },
          { id: 'C1-4', text: 'Confident' },
          { id: 'C1-5', text: 'Over-reacting' },
          { id: 'C1-6', text: 'Inconsistent night to night' },
          { id: 'C1-7', text: 'Distracted or disengaged' },
          { id: 'C1-8', text: 'Hesitant' },
          { id: 'C1-open', text: 'Something else — tell us', hasOpenText: true },
          { id: 'C1-ns', text: "I'm not sure" },
        ],
      },
      {
        id: 'C2',
        section: 'C',
        inputType: 'scale',
        question: 'How would you describe your goalie\'s consistency game to game?',
        scaleLeft: 'Very inconsistent',
        scaleRight: 'Very consistent',
        evolutionEligible: true,
      },
      {
        id: 'C3',
        section: 'C',
        inputType: 'scale',
        question: "How would you describe your goalie's engagement level during practices?",
        scaleLeft: 'Often disengaged',
        scaleRight: 'Fully engaged every time',
        evolutionEligible: true,
      },
      {
        id: 'C4',
        section: 'C',
        inputType: 'scale',
        question: 'How does your goalie recover from a bad goal during a game?',
        scaleLeft: 'Struggles to recover',
        scaleRight: 'Bounces back quickly',
        evolutionEligible: true,
      },
      {
        id: 'C5',
        section: 'C',
        inputType: 'radio',
        question: "During games and practices — can you read your goalie's body language?",
        note: "We are asking whether you can read the signs — actions that show emotional control, or signs of losing it. Your view from the stands or the rink is a valuable lens.",
        evolutionEligible: true,
        options: [
          { id: 'C5-1', text: 'Yes — I can read them clearly' },
          { id: 'C5-2', text: 'Most of the time, yes' },
          { id: 'C5-3', text: 'Sometimes — depends on the night' },
          { id: 'C5-4', text: 'Not really — they are hard to read' },
          { id: 'C5-5', text: 'I had not paid close attention to this before' },
        ],
      },
      {
        id: 'C5B',
        section: 'C',
        inputType: 'radio',
        question: 'When you do read them — what do you usually see in their body language under pressure?',
        evolutionEligible: true,
        options: [
          { id: 'C5B-1', text: 'Emotional control — they stay composed' },
          { id: 'C5B-2', text: 'Mostly composed — small slips' },
          { id: 'C5B-3', text: 'Mixed — they can swing either way' },
          { id: 'C5B-4', text: 'Visible frustration — body language drops' },
          { id: 'C5B-5', text: 'Visible anxiety — tension shows' },
          { id: 'C5B-6', text: 'Hard to tell' },
          { id: 'C5B-open', text: 'Something else — tell us', hasOpenText: true },
        ],
      },
      {
        id: 'C6',
        section: 'C',
        inputType: 'radio',
        question:
          'When your goalie struggles — after a bad goal, a loss, a hard practice — what voice do you hear coming from them, in their words or in their body language?',
        note: 'This is one of the most important questions in this questionnaire. Your view of their inner voice is part of how Smarter Goalie builds the support around them.',
        evolutionEligible: true,
        options: [
          { id: 'C6-1', text: 'Mostly supportive of themselves — they bounce back' },
          { id: 'C6-2', text: 'Mixed — depends on the day' },
          { id: 'C6-3', text: 'Mostly hard on themselves — they spiral' },
          { id: 'C6-4', text: 'Hard to tell — they keep it inside' },
          { id: 'C6-5', text: "I'm not sure" },
        ],
      },
      {
        id: 'C7',
        section: 'C',
        inputType: 'open_text',
        question:
          "What tendencies or habits have you noticed in your goalie's play that we should know about?",
        note: 'Examples — does not freeze the puck quickly enough. Stands too long or goes down too soon. Slow to react to shots. Struggles with the blocker or catcher. Whatever pattern you see repeating.',
        evolutionEligible: true,
      },
    ],
  },

  // ── SECTION D ──────────────────────────────────────────────────────────────
  {
    key: 'D',
    title: 'CHARACTER AND ATTITUDE',
    categoryLabel: 'Character Discovery / Cross-Reference Goalie Self-View',
    intro:
      'Beyond the technical side of the position lies the person playing it. The character of your goalie — how they handle setbacks, what they believe about themselves, where they show resilience, and where they still have growing to do. This section asks for your honest observations as the parent who knows them best.',
    questions: [
      {
        id: 'D1',
        section: 'D',
        inputType: 'scale',
        question: "How would you describe your goalie's confidence — what you actually observe?",
        note: 'Not what they say about themselves. What you SEE in them.',
        scaleLeft: 'Visibly uncertain',
        scaleRight: 'Visibly confident',
        evolutionEligible: true,
      },
      {
        id: 'D2',
        section: 'D',
        inputType: 'open_text',
        question: 'How does your goalie handle adversity — a loss, a hard practice, a setback?',
        evolutionEligible: true,
      },
      {
        id: 'D3',
        section: 'D',
        inputType: 'open_text',
        question: "What do you believe is your goalie's greatest strength as a person?",
        evolutionEligible: true,
      },
      {
        id: 'D4',
        section: 'D',
        inputType: 'open_text',
        question: 'What do you believe is the area where your goalie has the most room to grow as a person?',
        note: 'This is a parent\'s most honest observation — not a criticism. The growth area you name today becomes part of what we walk with them through.',
        evolutionEligible: true,
      },
      {
        id: 'D5',
        section: 'D',
        inputType: 'radio',
        question:
          'Have you ever seen your goalie show real courage — a moment when they faced something daunting and stepped into it anyway?',
        tooltip:
          'Daunting = something that felt big, intimidating, or hard for them. The kind of moment that tested who they are.',
        evolutionEligible: true,
        options: [
          { id: 'D5-yes', text: 'Yes — I have seen it' },
          { id: 'D5-sometimes', text: 'Sometimes — I see flashes' },
          { id: 'D5-not-yet', text: 'Not yet — but I believe it is in them' },
          { id: 'D5-not-sure', text: 'Honestly, I am not sure' },
        ],
        subQuestion: {
          id: 'D5-sub',
          question: 'Briefly tell us about a moment.',
          showWhenParentValues: ['D5-yes'],
        },
      },
      {
        id: 'D6',
        section: 'D',
        inputType: 'radio',
        question:
          'Do you see your goalie as someone who quits when things get hard — or someone who stays the course?',
        evolutionEligible: true,
        options: [
          { id: 'D6-1', text: 'Stays the course — they push through' },
          { id: 'D6-2', text: 'Mostly stays — but struggles sometimes' },
          { id: 'D6-3', text: 'Mixed — depends on the situation' },
          { id: 'D6-4', text: 'Quits when things get hard' },
          { id: 'D6-5', text: "I'm not sure yet" },
        ],
      },
      {
        id: 'D7',
        section: 'D',
        inputType: 'radio',
        question:
          'Has your goalie ever bounced back from a real setback — being benched, cut, selected late, or losing confidence?',
        evolutionEligible: true,
        options: [
          { id: 'D7-yes-stronger', text: 'Yes — and it made them stronger' },
          { id: 'D7-yes-time', text: 'Yes — but it took time' },
          { id: 'D7-still', text: 'They are still working through it' },
          { id: 'D7-not-yet', text: 'Not yet — but I believe they will' },
          { id: 'D7-no-setback', text: 'No setbacks like that yet' },
        ],
        subQuestion: {
          id: 'D7-sub',
          question: 'Briefly tell us.',
          showWhenParentValues: ['D7-yes-stronger', 'D7-yes-time', 'D7-still', 'D7-not-yet'],
        },
      },
    ],
  },

  // ── SECTION E ──────────────────────────────────────────────────────────────
  {
    key: 'E',
    title: 'UNDERSTANDING THE GOALIE PARENT JOURNEY',
    categoryLabel: 'Parent Self-Awareness / Parent Behavior / Parent Education',
    intro:
      "Becoming a goalie parent is one of the more difficult roles in sport. Most parents are not expecting it. The day a child says \"I want to be a goalie\" often comes as a shock. From that moment on, the parent walks a journey that asks more of them than they may have signed up for — emotionally, behaviorally, and as a support person. Smarter Goalie has counseled goalie parents for decades. The questions here are not about your goalie's motivation — that part is already settled the moment they put on the pads. These questions are about YOU. How you are doing in this role. What support you would value. Where you would welcome guidance. We have your back.",
    questions: [
      {
        id: 'E1',
        section: 'E',
        inputType: 'radio',
        question: 'How did you react when your goalie first told you they wanted to play this position?',
        evolutionEligible: true,
        options: [
          { id: 'E1-1', text: 'I was excited and supportive right away' },
          { id: 'E1-2', text: 'I was surprised — but I supported it' },
          { id: 'E1-3', text: 'I was hesitant at first — but I have come around' },
          { id: 'E1-4', text: 'I still worry about it' },
          { id: 'E1-5', text: 'I am not the parent who was there for that moment' },
          { id: 'E1-open', text: 'Something else — tell us', hasOpenText: true },
        ],
      },
      {
        id: 'E2',
        section: 'E',
        inputType: 'radio',
        question: 'How would you describe your emotional experience as a goalie parent right now?',
        note: 'This is for you, not your goalie. We ask because being a goalie parent is hard — and your wellbeing matters too.',
        evolutionEligible: true,
        options: [
          { id: 'E2-1', text: 'I love it — I am fully in' },
          { id: 'E2-2', text: 'I love it most days — some days are hard' },
          { id: 'E2-3', text: 'Mixed — I am still finding my way' },
          { id: 'E2-4', text: 'Honestly, I struggle with the emotional weight of it' },
          { id: 'E2-5', text: "I'm not sure yet" },
        ],
      },
      {
        id: 'E3',
        section: 'E',
        inputType: 'open_text',
        question: 'What is the hardest part of being a goalie parent for you?',
        evolutionEligible: true,
      },
      {
        id: 'E4',
        section: 'E',
        inputType: 'radio',
        question: 'How do you typically behave when your goalie lets in a soft goal — in the moment, in the stands?',
        note: 'Be honest. This is one of the most important pieces of self-awareness in goalie parenting.',
        evolutionEligible: true,
        options: [
          { id: 'E4-1', text: 'I stay quiet and supportive' },
          { id: 'E4-2', text: 'I show visible disappointment' },
          { id: 'E4-3', text: 'I keep it inside but I feel it' },
          { id: 'E4-4', text: 'I sometimes react out loud' },
          { id: 'E4-5', text: "I'm not always sure how I come across" },
          { id: 'E4-6', text: 'I had not thought about this before' },
        ],
      },
      {
        id: 'E5',
        section: 'E',
        inputType: 'open_text',
        question: 'Are there parts of your behavior or language as a goalie parent that you would like to grow in?',
        note: 'Goalies are deeply affected by how their parents behave on game day, in the car ride home, and around the house after a loss. Smarter Goalie helps parents grow here — without judgment.',
        evolutionEligible: true,
      },
      {
        id: 'E6',
        section: 'E',
        inputType: 'radio',
        question:
          'Would you welcome guidance from Smarter Goalie on how to be the most effective support person you can be — in language, behavior, and what to say at the right time?',
        options: [
          { id: 'E6-1', text: 'Yes — I would love that guidance' },
          { id: 'E6-2', text: 'Yes — I am open to it' },
          { id: 'E6-3', text: 'Maybe — depending on the format' },
          { id: 'E6-4', text: 'Not at this time' },
        ],
      },
    ],
  },

  // ── SECTION F ──────────────────────────────────────────────────────────────
  {
    key: 'F',
    title: 'THE CAR RIDE HOME',
    categoryLabel: 'Post-Game Communication / The Most Important Conversation in Goaltending',
    intro:
      "No moment in a goalie's week carries more weight than the car ride home. The game is over. The pads are packed. The arena is behind them. And in that small space — between the rink and the front door — words land deeper than they ever will at the game itself. Smarter Goalie calls this The Car Ride Home. It is the conversation that either builds your goalie up or chips away at them — quietly, over years. Most parents do not know how powerful this moment is until they look back. We want to talk about it now — while you can still shape it.",
    questions: [
      {
        id: 'F1',
        section: 'F',
        inputType: 'radio',
        question: 'What do you typically say to your goalie after a difficult game?',
        evolutionEligible: true,
        options: [
          { id: 'F1-1', text: 'I keep it positive and avoid the negatives' },
          { id: 'F1-2', text: 'I review what happened and discuss the goals' },
          { id: 'F1-3', text: 'I let them lead the conversation' },
          { id: 'F1-4', text: 'I sometimes say things in the moment I later regret' },
          { id: 'F1-5', text: 'I am not always sure what to say' },
          { id: 'F1-open', text: 'Something else — tell us', hasOpenText: true },
        ],
      },
      {
        id: 'F2',
        section: 'F',
        inputType: 'radio',
        question: 'What do you typically say to your goalie after a great game?',
        note: 'This matters too. How we celebrate shapes how the goalie celebrates themselves.',
        evolutionEligible: true,
        options: [
          { id: 'F2-1', text: 'I praise the performance specifically — what they did well' },
          { id: 'F2-2', text: 'I keep it casual — let them enjoy it' },
          { id: 'F2-3', text: 'I move quickly to what we could improve for next time' },
          { id: 'F2-4', text: 'I match their energy — they lead the celebration' },
          { id: 'F2-5', text: 'I am not always sure what to say' },
          { id: 'F2-open', text: 'Something else — tell us', hasOpenText: true },
        ],
      },
      {
        id: 'F3',
        section: 'F',
        inputType: 'radio',
        question:
          'Has your goalie ever asked you not to talk about the game on the car ride home — or after a loss?',
        evolutionEligible: true,
        options: [
          { id: 'F3-1', text: 'Yes — and I respect that' },
          { id: 'F3-2', text: 'Yes — but I find it difficult' },
          { id: 'F3-3', text: 'No — they are open to the conversation' },
          { id: 'F3-4', text: 'We have not had this conversation yet' },
        ],
      },
      {
        id: 'F4',
        section: 'F',
        inputType: 'radio',
        question: 'When your goalie is silent after a tough game — what do you usually do?',
        evolutionEligible: true,
        options: [
          { id: 'F4-1', text: 'I respect the silence and let them lead' },
          { id: 'F4-2', text: 'I try to lighten the mood with something unrelated' },
          { id: 'F4-3', text: 'I gently ask if they want to talk' },
          { id: 'F4-4', text: 'I fill the silence — I find it uncomfortable' },
          { id: 'F4-open', text: 'Something else — tell us', hasOpenText: true },
          { id: 'F4-na', text: 'This has not come up' },
        ],
      },
      {
        id: 'F5',
        section: 'F',
        inputType: 'open_text',
        question: "How does your relationship with your goalie shift in the hours after a tough loss?",
        evolutionEligible: true,
      },
      {
        id: 'F6',
        section: 'F',
        inputType: 'radio',
        question: 'Have you ever said something on a car ride home that you wish you could take back?',
        note: 'Every parent has. There is no judgment in this question. The willingness to look back honestly is what makes growth possible.',
        evolutionEligible: true,
        options: [
          { id: 'F6-1', text: 'Yes — and I have apologized' },
          { id: 'F6-2', text: 'Yes — but I never brought it up afterward' },
          { id: 'F6-3', text: 'Yes — and I am still working on it' },
          { id: 'F6-4', text: 'No — I have been careful' },
          { id: 'F6-5', text: "I'm not sure" },
        ],
      },
      {
        id: 'F7',
        section: 'F',
        inputType: 'radio',
        question:
          'Would you welcome guidance from Smarter Goalie on how to make the car ride home a moment of connection — not pressure?',
        options: [
          { id: 'F7-1', text: 'Yes — I would love that guidance' },
          { id: 'F7-2', text: 'Yes — I am open to it' },
          { id: 'F7-3', text: 'Maybe — depending on the format' },
          { id: 'F7-4', text: 'Not at this time' },
        ],
      },
    ],
  },

  // ── SECTION G ──────────────────────────────────────────────────────────────
  {
    key: 'G',
    title: 'YOUR HOPES AND CONCERNS',
    categoryLabel: 'Vision of Success / Parent Needs / Open Door',
    intro:
      "You have given us a window into your goalie — and into yourself as a goalie parent. This last section is about what you hope for, what you worry about, and what you want from Smarter Goalie. Your honest answers shape how we guide you from here.",
    questions: [
      {
        id: 'G1',
        section: 'G',
        inputType: 'open_text',
        question: 'What does success look like for your goalie this season — in your words?',
        note: 'Not what your goalie has said. Not what their coach said. What it looks like to you.',
        evolutionEligible: true,
      },
      {
        id: 'G2',
        section: 'G',
        inputType: 'open_text',
        question: 'What does success look like for YOU as a goalie parent this season?',
        note: 'This is different. We are asking about you — your own growth, your own peace of mind, your own goals as a support person.',
        evolutionEligible: true,
      },
      {
        id: 'G3',
        section: 'G',
        inputType: 'open_text',
        question: "What worries you the most about your goalie's journey?",
        evolutionEligible: true,
      },
      {
        id: 'G4',
        section: 'G',
        inputType: 'multi_select',
        question: 'What would you most like Smarter Goalie to give you — as a goalie parent?',
        note: 'Pick anything that fits. And if there is something we did not list — tell us in your own words.',
        options: [
          {
            id: 'G4-1',
            text: 'A clear understanding of the position so I can follow what is being taught',
          },
          {
            id: 'G4-2',
            text: 'Guidance on what to say — and what not to say — after games',
          },
          {
            id: 'G4-3',
            text: "Insight into my goalie's development I can trust",
          },
          {
            id: 'G4-4',
            text: 'A way to be more present without adding pressure',
          },
          {
            id: 'G4-5',
            text: 'Tools to grow myself as a goalie parent',
          },
          {
            id: 'G4-6',
            text: 'Connection with other goalie parents on this journey',
          },
          {
            id: 'G4-open',
            text: 'Something we missed — tell us in your own words',
            hasOpenText: true,
          },
        ],
      },
      {
        id: 'G5',
        section: 'G',
        inputType: 'open_text',
        question:
          "A year from now — what would you love to be able to say about your goalie's journey AND about your own growth as a goalie parent?",
        note: 'This becomes a goal we hold with you. Something to build toward together.',
        evolutionEligible: true,
      },
      {
        id: 'G6',
        section: 'G',
        inputType: 'open_text',
        question:
          'Is there anything else you want Coach Mike and the Smarter Goalie team to know about your goalie, your family, or yourself?',
        note: 'This is your open door. Anything we missed. Anything you want us to hear.',
        evolutionEligible: true,
        options: [{ id: 'G6-skip', text: 'Nothing else right now', isSkip: true }],
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getParentActiveQuestions(
  section: PBSection,
  responses: Record<string, string | string[]>
): PBQuestion[] {
  return section.questions.filter((q) => {
    if (!q.conditionalLogic) return true;
    const val = responses[q.conditionalLogic.parentId];
    if (!val) return false;
    const arr = Array.isArray(val) ? val : [val];
    return arr.some((v) => q.conditionalLogic!.showWhenIncludes.includes(v));
  });
}
