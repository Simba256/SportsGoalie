/**
 * Coach Audio — Michael's recorded voice lines.
 *
 * Naming note: this codebase already uses "voice" for the parent feedback
 * feature (`parent_voice_submissions`, /admin/voice-queue). That is unrelated
 * to audio. Everything to do with Coach Mike's recordings is "coach audio".
 *
 * Two halves, deliberately kept apart:
 *
 *   COACH_AUDIO_CATALOGUE — what *should* exist. A code constant, because the
 *   IDs and the script lines are settled and are not editable data. Michael
 *   fixed these in the 9 September copy pack.
 *
 *   CoachAudioClip (Firestore) — what *has been uploaded*. One document per
 *   catalogue ID, keyed by the ID itself.
 *
 * Keeping them separate is what lets the admin screen show a clip as MISSING
 * rather than simply not showing it. On 12 September Michael sent 51 of the 59
 * files; the eight pillar intros (V-A-19 to V-A-26) were not in the folder even
 * though his pack said only MindSet was outstanding. A catalogue that lives in
 * code makes that kind of gap visible instead of silent.
 */

/** The five recording groups from Section 2 of the copy pack, plus the two
 *  groups added with the 29 September voice batch (outside the copy pack's
 *  V-A/V-B numbering: the Driver-or-Passenger assessment and the parent/coach
 *  onboarding lines). */
export type CoachAudioPart =
  | 'orientation' // Part 1 · V-A-01 to V-A-05
  | 'systems' // Part 2 · V-A-06 to V-A-17
  | 'pillars' // Part 3 · V-A-18 to V-A-26
  | 'utility' // Part 4 · V-A-27 to V-A-37
  | 'triggers' // Part 5 · V-B-01 to V-B-22
  | 'assessment' // Driver-or-Passenger · DOP-INTRO, DOP-A to DOP-D
  | 'guardian'; // Parent/coach onboarding · PARENT-WELCOME, PARENT-P2 to P8, COACH-WELCOME

export const COACH_AUDIO_PART_LABELS: Record<CoachAudioPart, string> = {
  orientation: 'Part 1 — Orientation',
  systems: 'Part 2 — The Systems',
  pillars: 'Part 3 — The 8 Pillars',
  utility: 'Part 4 — Utility',
  triggers: 'Part 5 — Trigger messages',
  assessment: 'Driver or Passenger',
  guardian: 'Parent & Coach Onboarding',
};

export const COACH_AUDIO_PART_ORDER: CoachAudioPart[] = [
  'orientation',
  'systems',
  'pillars',
  'utility',
  'triggers',
  'assessment',
  'guardian',
];

/**
 * A recording that is on file but must not play, because Michael has said he
 * is re-recording it.
 *
 * The hold is by upload date, not by a flag someone has to remember to clear:
 * every upload stamps a fresh `uploadedAt`, so the new take plays the moment it
 * is uploaded, with no code change. Until then the old take stays silent.
 */
export interface CoachAudioReRecord {
  /** Why the take on file is held, in words for the admin screen. */
  reason: string;
  /** A take uploaded before this instant is the old one. ISO 8601. */
  heldBefore: string;
}

/** One expected recording. */
export interface CoachAudioCatalogueEntry {
  /** e.g. 'V-A-01'. Also the Firestore document id and the storage filename. */
  id: string;
  part: CoachAudioPart;
  /** The words Michael reads. Used as the accessible transcript and as the admin label. */
  scriptLine: string;
  /**
   * For V-B clips only: the Block B message id this reads verbatim (B-01 ... B-22).
   * The mapping is one-to-one by design — Michael's pack says "no lookup table needed".
   */
  readsMessageId?: string;
  /** Set when the clip is known not to have been recorded yet, with the reason. */
  notYetRecorded?: string;
  /**
   * Set when Michael is re-recording the clip. `scriptLine` is then the old
   * wording, so it is kept off the public pages until the new wording arrives.
   */
  reRecord?: CoachAudioReRecord;
}

/** An uploaded recording. Firestore: `coach_audio_clips/{id}`. */
export interface CoachAudioClip {
  /** Matches a CoachAudioCatalogueEntry.id. */
  id: string;
  url: string;
  storagePath: string;
  contentType: string;
  sizeBytes: number;
  /** Read off the audio element at upload time. Null if the browser could not decode it. */
  durationSeconds: number | null;
  /** The name of the file as Michael sent it, kept for the audit trail. */
  originalFilename: string;
  uploadedAt: Date;
  updatedAt: Date;
}

/** A catalogue entry joined to its clip, if one has been uploaded. */
export interface CoachAudioStatus {
  entry: CoachAudioCatalogueEntry;
  clip: CoachAudioClip | null;
}

/* ─── The catalogue ──────────────────────────────────────────────────────────
 *
 * 73 entries. Script lines are transcribed from the manifest Michael supplied
 * alongside the .wav files on 12 September, updated 29 September with the
 * final wording from the 34-clip voice batch (V-A-01, 02, 05, 10 corrected;
 * V-A-19–26 pillar intros added; the Driver-or-Passenger and parent/coach
 * onboarding lines added under the 'assessment' and 'guardian' parts).
 *
 * Two deliberate divergences from the written copy pack, both his and both
 * correct:
 *
 *   V-B-18 drops the "[N] weeks running." opening — he cannot speak a number
 *   that changes, so the streak count has to be rendered as on-screen text
 *   beside the audio.
 *
 *   V-B-22 records only the banner line, not the sub-line. The sub-line was
 *   always meant to be read rather than heard.
 */

export const COACH_AUDIO_CATALOGUE: CoachAudioCatalogueEntry[] = [
  // ── Part 1 · Orientation ──────────────────────────────────────────────────
  {
    id: 'V-A-01',
    part: 'orientation',
    scriptLine:
      "Welcome. I'm Coach Mike. Before there were goalie coaches, there were goalies, trying to figure it out alone. I was one of them. With no roadmap, I created one. Smarter Goalie is my life's work. Think Smart. Play Smart.",
  },
  {
    id: 'V-A-02',
    part: 'orientation',
    scriptLine:
      "This isn't a camp. These aren't drills. They are systems. You can't improve what you don't measure, so here, you chart. The chart is not a test. It's a mirror.",
  },
  {
    id: 'V-A-03',
    part: 'orientation',
    scriptLine: "Built Not Born. Greatness isn't born; it's built, one deliberate thought at a time.",
  },
  {
    id: 'V-A-04',
    part: 'orientation',
    scriptLine:
      "One rule that matters more than any technique I'll teach you. Chart what actually happened. A chart you shade to look good teaches me nothing, and it teaches you less.",
  },
  {
    id: 'V-A-05',
    part: 'orientation',
    scriptLine:
      'Put in the time. Do the work the right way, and your game will not be recognizable. Consistency in performance is the object.',
  },

  // ── Part 2 · The Systems ──────────────────────────────────────────────────
  {
    id: 'V-A-06',
    part: 'systems',
    scriptLine:
      "The 7 Angle-Marker System. Above the icing line. It creates an unshakable connection to the net, teaching you where you must be, when, and why. We don't guess. We know.",
  },
  {
    id: 'V-A-07',
    part: 'systems',
    scriptLine:
      "The 6 Zone - 7 Point System. Below the icing line. The puck may be behind the net, but the game is still yours. In the goalie's house, nothing happens without your permission.",
  },
  {
    id: 'V-A-08',
    part: 'systems',
    scriptLine:
      'One and seven are the same. Two and six are the same. Three and five are the same. Four is the dividing line. The only thing that truly changes side to side is the wrap-around, glove or stick.',
  },
  {
    id: 'V-A-09',
    part: 'systems',
    scriptLine:
      'The 4 Level Arch System. Level one, top of the crease. Level two, low slot. Level three, mid slot. Level four, high slot. Position is not location.',
  },
  {
    id: 'V-A-10',
    part: 'systems',
    scriptLine:
      'Three lanes on attack: the left lane, the center lane and the right lane. Know the lane the play is in, and the lane it shifts to.',
  },
  {
    id: 'V-A-11',
    part: 'systems',
    scriptLine:
      'In the game, performance runs on V.M.P: Visual, Mental, Physical. You see it, your mind reads it, your body responds. That order is simple science, and understanding it is powerful.',
  },
  {
    id: 'V-A-12',
    part: 'systems',
    scriptLine:
      'No wasted movement, no wasted energy, no wasted time. Waste one and you waste all three.',
  },
  {
    id: 'V-A-13',
    part: 'systems',
    scriptLine:
      "The Factor Ratio is the number that says whether the work is working. It isn't a grade and it isn't a score. It's a mirror.",
  },
  {
    id: 'V-A-14',
    part: 'systems',
    scriptLine:
      'Your Mind Vault. The place where you keep your best tools: confidence, focus, and staying calm. We build it piece by piece. Stop hoping for confidence, and start accessing it.',
  },
  {
    id: 'V-A-15',
    part: 'systems',
    scriptLine:
      "The Feel Factor is the part nobody else on your team is writing down. It's also the part that tells me the most.",
  },
  {
    id: 'V-A-16',
    part: 'systems',
    scriptLine:
      'Knowledge Acquisition. The technique is not just known. It is owned, and it can be reliably deployed under any circumstance.',
  },
  {
    id: 'V-A-17',
    part: 'systems',
    scriptLine:
      'Self-evaluation builds self-awareness, and self-awareness leads to self-coaching. Development. Improvement. Maintenance. That is the formula.',
  },

  // ── Part 3 · The 8 Pillars ────────────────────────────────────────────────
  {
    id: 'V-A-18',
    part: 'pillars',
    scriptLine:
      'MindSet. Skating Tech. The 7 Angle-Marker System. The 6 Zone 7 Point System. Form Tech. Game Performance Charting System. Practice System. Lifestyle and Hockey.',
  },
  {
    id: 'V-A-19',
    part: 'pillars',
    scriptLine:
      "Coach Mike here. Welcome to the Mind-Vault.\n\nAt Smarter Goalie, we believe that high performance isn't just a byproduct of natural talent. It is the result of a systematic, disciplined approach to every aspect of the game. You are the last line of defense. You occupy the most demanding position in hockey, where a split-second decision determines the outcome of the game. That kind of pressure requires more than physical skill. It requires an unshakable mental framework.\n\nThis is your Mind-Vault.\n\nThink of your Mind-Vault not as a fleeting feeling of confidence, but as a carefully curated repository of your greatest mental assets. It is an impenetrable inner sanctuary where we store your proven strategies, your hard-won successes, and the clarity required to perform under intense pressure.\n\nIn the heat of competition, when distractions rise and mistakes happen, you don't need to hope for confidence. You need to access it. Your Mind-Vault allows you to:\n\nStore and retrieve. Bank your brilliant saves and successful game scenarios, so you can withdraw that confidence exactly when you need it most.\n\nFilter the noise. Develop the laser-like focus necessary to see only what matters: the puck and the play.\n\nTrain the subconscious, the quickest part of your brain. We teach it to play in the now, free of negative influence, controlling the noise with the mantras you develop as your own.\n\nMaster the reset. Transform a challenging goal or a mistake into data, allowing you to re-calibrate and return to peak performance in seconds.\n\nI have spent my career studying what separates the good from the truly great, and it always comes back to one truth: Greatness is built, not born. We don't leave your mental game to chance. We teach you to organize, access, and command your mind with the same precision you apply to your skating and save selection.\n\nWhether you are just starting your journey or refining your game at the highest levels, your Mind-Vault is where your consistency, resilience, and ultimate performance begin.\n\nYour first deposit starts today. The next time the noise shows up, catch it, name it, and write down what you did. That's how a Mind-Vault is built, one deposit at a time.\n\nLet's start building yours.",
  },
  {
    id: 'V-A-20',
    part: 'pillars',
    scriptLine:
      "Coach Mike here. Welcome to Skating Tech.\n\nBefore we build a single stride, let me share how we do this at Smarter Goalie.\n\nEverything we teach is built on four things. Logic. Common sense. Math. And science. Nothing mysterious. Nothing you can't understand and make your own.\n\nOur first objective is Knowledge Acquisition. That means we build your Technical Eye, the ability to see and understand skating, piece by piece, the way it truly works.\n\nWe take it apart methodically, from the ice up. Your edges, your Set-Crouch, what makes motion fluid, what puts you in Game Frequency, and how movement, energy and time connect, all measured in relationship to the net.\n\nOnce you understand the pieces, you can look at your own game and see clearly where you are and where you want to grow. That is Self awareness and Self-Evaluation skills coming to life. It isn't about judging yourself. It's about knowing, so you can build with purpose.\n\nI've done this on the ice for six decades. Now we do it together, online, step by step.\n\nBuilt Not Born. Let's get to work.",
  },
  {
    id: 'V-A-21',
    part: 'pillars',
    scriptLine:
      "Coach Mike here. Welcome to the 7 Angle-Marker System, 7AMS. Think of it as your GPS, your Goalie's Positional System, above the icing line.\n\nThis one is pure logic and geometry, and that's good news, because geometry can be learned and it can be measured.\n\nOur first objective is Knowledge Acquisition. Before we move you anywhere, we build your Technical Eye for position.\n\nHere are the pieces. There's a line from the puck to the center of your net. There are seven markers across your crease, goalpost to goalpost, with Marker 4 as your center of symmetry. There's the angle, and there's your depth on that line. Put together, they describe exactly where you belong for any puck.\n\nOnce you understand that, you can look at where you play today and measure it against the line. That's your Self-Evaluation. Clear numbers, not opinions. You'll see where you're already strong and where there's room.\n\nSix decades on the ice built this system. Now we learn it together, step by step.\n\nBuilt Not Born. Let's understand your spot.",
  },
  {
    id: 'V-A-22',
    part: 'pillars',
    scriptLine:
      "Coach Mike here. Welcome to the 6 Zone - 7 Point System, your proprietary positional system designed to govern positional excellence below the icing line.\n\nAbove the line, the 7 Angle-Marker System made you the guardian of the net. Below the line is a different world, behind you, beside you, down in the corners, and without a system it is where a goalie can panic and scramble. This system puts you in the driver's seat, making sound strategic and tactical decisions.\n\nEverything we teach is built on four core filters: Logic. Common sense. Math. And science. And nowhere is order more valuable than here, because this system takes the most dynamic ice on the rink and applies a higher level of understanding. There is nothing mysterious about a wraparound, a walkout, or a pass from the side of the net or from the corner, and no play down low is too fast to read. Everything is an actionable principle you can deeply understand, execute, and make your own, so you move with the play instead of chasing it.\n\nOur first major objective is Knowledge Acquisition. We focus on building your Technical Eye so you can read the ice below the line analytically rather than reacting in panic.\n\nWe take it apart methodically, and teach you how to own your posts, when to stay on your feet and when to go down. We map the ice below the icing line with 7 grid lines, numbered 1 through 7, identical from left and right, with points 3, 4 and 5 behind the net where strategy and tactical play rule, keeping the advantage in your house. The 6 zones are the addition that elevates the map. This is your grid for smart positional consistency in the most dynamic part of the rink.\n\nThe grid never lies, and the location of the puck and the player, you dominate. The best part is it becomes a part of you. Your reads sharpen, your decisions speed up, and the chaos becomes a calm, mapped sequence.\n\nOnce you understand the individual pieces, you will progress through our structured learning loop, moving from initial instruction to recognition awareness and full dynamic transfer. You will look at your own play below the icing line with perfect clarity, using our video analysis, evaluation and charting tools, and your Goalie Baseline Profile grows with you. You will see exactly where you stand today and where you are growing. That is the essence of Self-Evaluation.\n\nI have spent six decades on the ice studying this beautiful, complex position. Now, we take all of that refined experience and bring it to you, alongside parallel support systems designed to educate your parents and team coaches simultaneously, so we can raise the standard together, online, step by step.\n\nBuilt Not Born. Let's map the ice.",
  },
  {
    id: 'V-A-23',
    part: 'pillars',
    scriptLine:
      "Coach Mike here. Welcome to Form Tech.\n\nForm is your structure, your stance, your set, the way your body makes the save. My rule is simple and it's built on common sense: foundation before flair. Build the base first, and everything else stands on it.\n\nOur first objective is Knowledge Acquisition. Before we shape anything, we build your Technical Eye for form.\n\nWe break it down methodically, using video as your mirror so you can see it for yourself, and simple science to explain why sound form does two things well: it stays consistent, and it saves energy, so you're as strong late as you are early.\n\nOnce you understand what good form is and why, you can look at your own and see clearly where it's already solid and where there's room. That's your Self-Evaluation, and it's honest and motivating, because you're measuring against something you understand.\n\nBuilt Not Born. Let's understand the foundation.",
  },
  {
    id: 'V-A-24',
    part: 'pillars',
    scriptLine:
      "Coach Mike here. Welcome to the Game Performance Charting System. This is where everything comes together, the mind, the skating, the position, the form, live, in the game.\n\nThe game is fast and it's live, so we bring it logic. In the game, performance runs on V.M.P: Visual, Mental, Physical. You see it, your mind reads it, your body responds. That order is simple science, and understanding it is powerful.\n\nOur first objective is Knowledge Acquisition. Before we sharpen anything, we build your Technical Eye for the game.\n\nWe break it down: reading the play, reading the stick and the release, anticipating so your response is on time, and staying in Game Frequency, in sync with the play.\n\nOnce you understand how game reads work, you can look honestly at your own game and see where you're strong and where there's room. That's your Self-Evaluation, and it's yours to drive.\n\nBuilt Not Born. Let's understand the game.",
  },
  {
    id: 'V-A-25',
    part: 'pillars',
    scriptLine:
      "Coach Mike here. Welcome to the Practice System, where the goalie you want to be gets built, one practice at a time.\n\nDesignated training is the most neglected aspect of goaltending. Mobility. Form. Net management, front and back. And the mind. Every one of them carries the number one. Lose one, and you lose your game.\n\nSo you never walk into a rink empty-handed. You arrive with an agenda: the couple of things your chart says need your attention. Chart. Directive. Practice. Chart. That is the Development Loop, and it turns every ice time into progress you can measure.\n\nHere is where it gets smart. Team practice is full of time a goalie can own. The players at the boards for a drill. The water break. The minute between stations. Minutes, not hours, but minutes that add up across a season. That is opportunity time.\n\nAnd you are not doing it alone. Every Smarter Goalie comes with our support, including an introduction for your team coach: a short video and a personal message from me, asking for whatever designated time your coach feels able to give, and more when it's possible. You and your parents take the lead with us. Your coach is brought in, or your coach is the one who set this up. Together, we build that time into the routine of every practice.\n\nThen you work it right. Slow is fast, and fast is slow. As you understand the mechanics, stationary or in motion, your Feel Factor grows. Speed arrives when the movement is right. It never arrives if it isn't.\n\nThis is how a goalie learns to run their own practice, and own their game.\n\nBuilt Not Born. Now go make every minute count.",
  },
  {
    id: 'V-A-26',
    part: 'pillars',
    scriptLine:
      "Coach Mike here. Welcome to Lifestyle and Hockey. In some ways this pillar holds all the others up.\n\nBeing a goalie carries into how you live, on and off the ice. And there's a simple principle behind it, backed by common sense and science: what you maintain, you keep, and what you don't maintain, you lose.\n\nOur first objective is Knowledge Acquisition. Before we change any habits, we build your Technical Eye for maintenance.\n\nWe use the 4 Pillars of Maintenance to organize it: the Charting Routine, the Practice Schedule, the Knowledge Base, and the Pinnacle Routine. And we use simple science to explain how nutrition, rest, routine and upkeep either sustain the athlete you're building or quietly work against it.\n\nOnce you understand how maintenance works, you can look at your own off-ice habits honestly and see what's serving you and what you'd like to grow. That's your Self-Evaluation, and it's yours to lead.\n\nIntegrity, honesty, values, self-awareness. On and off the ice.\n\nBuilt Not Born. Let's understand what holds it all together.",
  },

  // ── Part 4 · Utility ──────────────────────────────────────────────────────
  { id: 'V-A-27', part: 'utility', scriptLine: 'Chart saved.' },
  { id: 'V-A-28', part: 'utility', scriptLine: 'Got it.' },
  { id: 'V-A-29', part: 'utility', scriptLine: "That's in your record." },
  { id: 'V-A-30', part: 'utility', scriptLine: 'Take your time.' },
  { id: 'V-A-31', part: 'utility', scriptLine: 'Go ahead.' },
  { id: 'V-A-32', part: 'utility', scriptLine: "Let's go back one step." },
  { id: 'V-A-33', part: 'utility', scriptLine: 'Say that again for me.' },
  { id: 'V-A-34', part: 'utility', scriptLine: "I didn't catch that one." },
  { id: 'V-A-35', part: 'utility', scriptLine: "Nothing here yet. That's normal on day one." },
  { id: 'V-A-36', part: 'utility', scriptLine: "That's all for today." },
  { id: 'V-A-37', part: 'utility', scriptLine: 'Good. Next.' },

  // ── Part 5 · Trigger messages (read B-01 to B-22 verbatim) ────────────────
  {
    id: 'V-B-01',
    part: 'triggers',
    readsMessageId: 'B-01',
    scriptLine:
      "That's your first chart in - and now it means something, because I can see what you saw. Do the next one the same way: honest, even when the number isn't pretty. A chart you shade to look good teaches me nothing, and it teaches you less.",
  },
  {
    id: 'V-B-02',
    part: 'triggers',
    readsMessageId: 'B-02',
    scriptLine: "Chart's in. It's on your record. Keep the loop turning.",
  },
  {
    id: 'V-B-03',
    part: 'triggers',
    readsMessageId: 'B-03',
    scriptLine:
      "Your Factor Ratio moved the right way. That isn't luck - that's the loop working. Now don't change three things. Change nothing, run it again, and let's see if it holds.",
  },
  {
    id: 'V-B-04',
    part: 'triggers',
    readsMessageId: 'B-04',
    scriptLine:
      'Your Factor Ratio came down. Before you take that the wrong way - a drop after a good stretch almost always means you started guessing instead of reading. Go back to your angle first. Read, then move.',
  },
  {
    id: 'V-B-05',
    part: 'triggers',
    readsMessageId: 'B-05',
    scriptLine:
      "Same number, three times running. Flat isn't failure - it's a plateau, and a plateau means the work stopped asking you a question. Pick the one zone you've been avoiding and put it in front of yourself.",
  },
  {
    id: 'V-B-06',
    part: 'triggers',
    readsMessageId: 'B-06',
    scriptLine:
      "You're losing the same marker in the 7 Angle-Marker System. That's not a reflex problem - that's an angle you haven't settled yet. Stand on that marker with no puck and find your line before you ever play it live.",
  },
  {
    id: 'V-B-07',
    part: 'triggers',
    readsMessageId: 'B-07',
    scriptLine:
      "Here's something your own chart just told me. Below the icing line, 1 and 7 are the same. 2 and 6 are the same. 3 and 5 are the same. 4 is the dividing line. You're strong on one side of that line and losing on its mirror - same read, same footwork. The only thing that genuinely changes side to side is the wrap-around, glove or stick. Fix the mirror and you fix both. Waste one and you waste all three.",
  },
  {
    id: 'V-B-08',
    part: 'triggers',
    readsMessageId: 'B-08',
    scriptLine:
      "Your losses are stacking at one level of the Arch. Depth isn't a feeling - it's a decision. Top of the Crease. Low Slot. Mid Slot. High Slot. Name the level you were standing on before that shot. If you can't name it, that's your answer.",
  },
  {
    id: 'V-B-09',
    part: 'triggers',
    readsMessageId: 'B-09',
    scriptLine:
      "They're beating you out of the same lane. Left, Center, Right - a lane is information, and right now you're not using it. In your next practice, call the lane out loud before the shot comes. Out loud.",
  },
  {
    id: 'V-B-10',
    part: 'triggers',
    readsMessageId: 'B-10',
    scriptLine:
      "You've got flags in more than one place this week. That usually isn't ten problems - it's one, showing up ten ways, and it's usually tired legs or a rushed read. Don't rebuild anything. Pick the earliest thing in the sequence and fix that.",
  },
  {
    id: 'V-B-11',
    part: 'triggers',
    readsMessageId: 'B-11',
    scriptLine:
      "Seven days, no chart. I'm not chasing you - I'm telling you the loop is open. Close it with one chart.",
  },
  {
    id: 'V-B-12',
    part: 'triggers',
    readsMessageId: 'B-12',
    scriptLine:
      "Three weeks. Whatever pushed you off the ice or off this - I've seen all of it before, and none of it is the end of anything. One chart puts you back in. Start there.",
  },
  {
    id: 'V-B-13',
    part: 'triggers',
    readsMessageId: 'B-13',
    scriptLine:
      "You're back. Don't try to make up three weeks in one day - that's how a goalie gets hurt and discouraged in the same week. One chart. One zone. Today.",
  },
  {
    id: 'V-B-14',
    part: 'triggers',
    readsMessageId: 'B-14',
    scriptLine:
      "Knowledge Acquisition Confirmed. That means you don't just know it - you can use it. That's the only kind of knowing that's ever been worth anything to a goalie.",
  },
  {
    id: 'V-B-15',
    part: 'triggers',
    readsMessageId: 'B-15',
    scriptLine:
      'Not confirmed yet - and nobody is timing you. Go back through it once more, then answer it in your own words instead of mine. Your words are the test.',
  },
  {
    id: 'V-B-16',
    part: 'triggers',
    readsMessageId: 'B-16',
    scriptLine:
      "That's in your Mind-Vault now. Read it again in a month. You'll be surprised how much of your progress was written down before you ever felt it.",
  },
  {
    id: 'V-B-17',
    part: 'triggers',
    readsMessageId: 'B-17',
    scriptLine:
      "Logged. The Feel Factor is the part nobody else on your team is writing down, and it's the part that tells me the most.",
  },
  {
    id: 'V-B-18',
    part: 'triggers',
    readsMessageId: 'B-18',
    scriptLine:
      'Consistency is the rarest thing I see in this game, and right now you have it. Protect it.',
  },
  {
    id: 'V-B-19',
    part: 'triggers',
    readsMessageId: 'B-19',
    scriptLine:
      "The run stopped. It happens to everyone who has ever had one. Don't mourn it - start the next one today.",
  },
  {
    id: 'V-B-20',
    part: 'triggers',
    readsMessageId: 'B-20',
    scriptLine:
      "Your video is in. I'll watch it myself. You'll see the clock running on your account, so you know exactly what time went into it. That's how I work - you see what you're getting.",
  },
  {
    id: 'V-B-21',
    part: 'triggers',
    readsMessageId: 'B-21',
    scriptLine:
      'Your review is ready. Watch it twice. Once for what I say. Once for what you were doing before the puck ever moved.',
  },
  {
    id: 'V-B-22',
    part: 'triggers',
    readsMessageId: 'B-22',
    scriptLine: 'Michael has a message waiting.',
  },

  // ── Driver-or-Passenger assessment ────────────────────────────────────────
  {
    id: 'DOP-INTRO',
    part: 'assessment',
    scriptLine:
      "The driver knows they love to drive, and they know they want to be the best driver they can be. The passenger is just along for the ride. The driver has all the responsibility; they want to reach their destination safe and sound, while the passenger can enjoy the scenery. They have no responsibilities. So, who are you? The driver, or the passenger? The driver knows what they want, and they have the passion and the desire and will to be the best they can be. The passenger is just along for the ride. Smarter Goalie was, and is, designed for the motivated, the passionate, those who have a fire in their belly. Designed for the motivated. Build your game.",
  },
  {
    id: 'DOP-A',
    part: 'assessment',
    scriptLine:
      "Good. The motivated act. You understand that this system is your support and guidance, and you are ready to use it to become the 'Intelligent Athletic Goaltender' and the leader you are meant to be. I am not going to chase you; I am going to provide the framework. You will get the system, you will do the work, and you will watch your motivation and confidence build with every repetition and every detail you master. That is the driver's path.",
  },
  {
    id: 'DOP-B',
    part: 'assessment',
    scriptLine:
      "That is an honest answer and a great place to start. Every action you take from this point forward will build your motivation and confidence. The system is your support and guidance to becoming an 'Intelligent Athletic Goaltender' and a leader on the ice. The work you do, whether in the driveway or on the ice, is where you transform. With every repetition and every fundamental detail you master, your confidence will grow, and your motivation will follow naturally. You are the architect of your own progress, and you are building your path to success.",
  },
  {
    id: 'DOP-C',
    part: 'assessment',
    scriptLine:
      "Thank you for being straight about that. Recognizing where you are is the first step to moving forward. You now have the tools to become an 'Intelligent Athletic Goaltender' and a leader. Treat this system as your support and guidance. Start by mastering one thing. As you engage with the work, each action you take will ignite your motivation and fuel your confidence, proving that you have what it takes to lead.",
  },
  {
    id: 'DOP-D',
    part: 'assessment',
    scriptLine:
      "That is a perfectly honest place to start. You do not need to be certain on day one. You are here to learn and grow, and that is what matters. Let this system provide the support and guidance you need. As you explore, ask questions, and engage with the process, your motivation and confidence will naturally grow with every step. You are on your way to becoming an 'Intelligent Athletic Goaltender,' and every action you take is a building block for your future.",
  },

  // ── Parent & coach onboarding ─────────────────────────────────────────────
  {
    id: 'PARENT-WELCOME',
    part: 'guardian',
    scriptLine:
      "Welcome. I'm Coach Mike.\n\nBefore there were goalie coaches, there were goalies, trying to figure it out alone. I was one of them. Six decades later, this system exists so no goalie has to do that again, and so no parent has to guess how to help.\n\nIn the game of hockey, your child has chosen the position with the most responsibility. Our mission is to build Intelligent Athletic Goaltenders: goalies who understand their own game, can evaluate it honestly, and grow it on purpose. Everything we teach is built on four filters. Logic. Common sense. Math. And science. Nothing mysterious.\n\nHere is how it works. Your goalie learns eight pillars, one piece at a time. They chart what actually happened. The chart points to the work that matters. They practise it, and they chart again. The chart is a mirror. A gap isn't a failure. It's a roadmap.\n\nYou don't need to know the position to help. The system is built to educate parents alongside their goalie, in plain language, so you can learn at your own pace and understand what your child is working on, and why.\n\nWhat you share with us is not shown to your goalie directly. The system takes it in, and returns it to them selectively, as the right support at the right time. So be open with us. Every piece helps.\n\nThe most valuable thing you can give is steady support. Be supportive and encouraging, and avoid the temptation to coach from the stands. Let us carry the technical side.\n\nThis work is about more than stopping pucks. It builds character, confidence, and the habit of honest self-evaluation, for the rink and beyond it.\n\nMy commitment to you is a sincere effort, every day, to raise the bar for your goalie and for everyone around them. Welcome to the team. Built Not Born.",
  },
  {
    id: 'PARENT-P2',
    part: 'guardian',
    scriptLine:
      "Here is what this course does and why we start the way we do. Skating is the engine of everything a goalie does. Before we change anything, we teach your child to understand it, using plain logic, common sense and simple science, one piece at a time. That understanding lets them look at their own skating honestly and see where they are and where they can grow. It is designed to motivate, not to criticize. Your role stays simple: encourage the reps and celebrate the small wins.",
  },
  {
    id: 'PARENT-P3',
    part: 'guardian',
    scriptLine:
      "Here is what this course does. Before a goalie makes a save, they have to be in the right place, and that place can be described with simple geometry. We teach your child to understand the angle from the puck to the net and the right depth on that line. Because it's measurable, they can look at their own positioning honestly and see where they are and where they can grow. It's logical, it's fair, and it's built to motivate. Encourage the reps and celebrate the small wins.",
  },
  {
    id: 'PARENT-P4',
    part: 'guardian',
    scriptLine:
      "Here is what this course does. When the puck goes behind or beside the net, the game moves quickly, so we give it structure with a grid. We teach your child to understand that map first, so the busy moments become a logical read instead of a scramble. Then they can look honestly at how they handle those plays and see where they can grow. It's structured, it's logical, and it's built to motivate. Encourage the reps and celebrate the small wins.",
  },
  {
    id: 'PARENT-P5',
    part: 'guardian',
    scriptLine:
      "Here is what this course does. Form is how your child's body makes the save, and our rule is foundation before flair. We use video so they can see their own form, and simple science to explain why consistent form holds up and saves energy. First they understand what good form is, then they can look at their own honestly and see where to grow. It's clear, it's visual, and it's built to motivate. Encourage the reps and celebrate the small wins.",
  },
  {
    id: 'PARENT-P6',
    part: 'guardian',
    scriptLine:
      "Here is what this course does. Game is where everything your child builds shows up live. It works in three logical steps, see, read, react, what we call V.M.P. First we teach them to understand good game reads, like reading the shooter's stick to be ready early. Then they can look honestly at their own games and see where to grow. It's logical and it's built to motivate. Encourage the reps and celebrate the small wins.",
  },
  {
    id: 'PARENT-P7',
    part: 'guardian',
    scriptLine:
      "Here is what this course does. How your child practices is how they'll play, so we teach them to understand what makes a repetition valuable, quality over quantity, before they drill. Every rep builds a habit, so we build good ones on purpose, working the one thing their chart names. Then they can look honestly at their own practice and see where to grow. It's logical and it's built to motivate. Encourage the reps and celebrate the small wins.",
  },
  {
    id: 'PARENT-P8',
    part: 'guardian',
    scriptLine:
      "Here is what this course does, and this is one where you matter most. Being a goalie is a lifestyle, and the principle is simple: what you maintain, you keep. We teach your child to understand how nutrition, rest and routine sustain their game, using common sense and simple science. Then they can look honestly at their own habits and see where to grow. It's practical and it's built to motivate, and the home routine is a big part of it. Your encouragement makes the difference.",
  },
  {
    id: 'COACH-WELCOME',
    part: 'guardian',
    scriptLine:
      "Welcome, Coach. I'm Coach Mike.\n\nFor six decades I've worked with goalies, and I've watched team coaches carry an enormous load: a full roster, systems, lines, and one position that carries the most responsibility on the ice. What the game has rarely given coaches is the tools to really support that position. That was never a coaching failure. The tools simply weren't built.\n\nThat is our mission: to build Intelligent Athletic Goaltenders, and to give the people around them a bridge into the position. Everything we teach is built on four filters. Logic. Common sense. Math. And science. Your goalie works through eight pillars, from MindSet and skating, to the positional systems, form, and game performance. They chart what actually happened. The chart points to the work that matters. They practise it with intent, and they chart again. That is the Development Loop.\n\nThe system runs parallel support for parents and team coaches, so the whole development circle speaks the same language, from plain-language descriptions to full technical terminology. You'll learn how your goalie is being taught, and why.\n\nWhat you share with us is not shown to your goalie directly. The system takes it in, and returns it to them selectively, as the right resource at the right time. Your read from the bench matters, and it will be used with care.\n\nGoalie coaches are givers. We build character, self-esteem, and goalies who can evaluate and train themselves, with our support. A goalie who can do that gives your team a chance to compete, every game.\n\nI'm not here to replace what you do. I'm here to support it, and to raise the bar for this position across the board, together.\n\nWelcome aboard. Built Not Born. Six decades. One system.",
  },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */

const CATALOGUE_BY_ID = new Map(COACH_AUDIO_CATALOGUE.map(e => [e.id, e]));

export function getCoachAudioEntry(id: string): CoachAudioCatalogueEntry | undefined {
  return CATALOGUE_BY_ID.get(id);
}

export function isCoachAudioId(id: string): boolean {
  return CATALOGUE_BY_ID.has(id);
}

/**
 * Pull the clip id out of a filename Michael sent.
 *
 *   SG_VOICE_V-A-01.wav      ->  V-A-01
 *   sg_voice_v-b-22.mp3      ->  V-B-22
 *   V-A-07.wav               ->  V-A-07
 *   SG_VOICE_DOP-INTRO.mp3   ->  DOP-INTRO
 *   SG_VOICE_PARENT-P7.mp3   ->  PARENT-P7
 *   SG_VOICE_COACH-WELCOME.mp3 -> COACH-WELCOME
 *
 * Returns null when the filename does not resolve to a known catalogue id, so
 * the caller can reject an unexpected file rather than storing it under a
 * guessed id.
 */
export function coachAudioIdFromFilename(filename: string): string | null {
  const base = filename.replace(/\.[^.]+$/, '');

  const vMatch = base.match(/(V[-_]?[AB][-_]?\d{2})$/i);
  if (vMatch) {
    const normalized = vMatch[1]
      .toUpperCase()
      .replace(/_/g, '-')
      .replace(/^V-?([AB])-?(\d{2})$/, 'V-$1-$2');
    return isCoachAudioId(normalized) ? normalized : null;
  }

  const otherMatch = base.match(/(DOP[-_](?:INTRO|[A-D])|PARENT[-_](?:WELCOME|P\d{1,2})|COACH[-_]WELCOME)$/i);
  if (otherMatch) {
    const normalized = otherMatch[1].toUpperCase().replace(/_/g, '-');
    return isCoachAudioId(normalized) ? normalized : null;
  }

  return null;
}

/** The Block B message id a trigger clip reads, or null for non-trigger clips. */
export function coachAudioReadsMessage(id: string): string | null {
  return CATALOGUE_BY_ID.get(id)?.readsMessageId ?? null;
}

/**
 * True when the take on file is the old one of a clip Michael is re-recording.
 *
 * A take whose upload date cannot be read counts as held: if it cannot be told
 * apart from the old take, silence is the safer mistake.
 */
export function isHeldForReRecord(clip: Pick<CoachAudioClip, 'id' | 'uploadedAt'>): boolean {
  const hold = CATALOGUE_BY_ID.get(clip.id)?.reRecord;
  if (!hold) return false;
  return !(clip.uploadedAt.getTime() >= Date.parse(hold.heldBefore));
}

/** The clips that may play on the site: everything uploaded, less the held takes. */
export function playableClips(
  clips: Record<string, CoachAudioClip>
): Record<string, CoachAudioClip> {
  return Object.fromEntries(
    Object.entries(clips).filter(([, clip]) => !isHeldForReRecord(clip))
  );
}

/** Audio formats accepted on upload. mp3 is preferred for delivery; wav is the master. */
export const COACH_AUDIO_ACCEPTED_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'audio/ogg',
  'audio/webm',
];

/** 25 MB. The longest line Michael recorded is 31 seconds, so this is generous. */
export const COACH_AUDIO_MAX_BYTES = 25 * 1024 * 1024;
