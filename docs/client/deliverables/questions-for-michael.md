# Questions for Michael — Feature Clarification & Sign-off

**Date:** March 18, 2026
**Purpose:** Before we move deeper into Stages 6-13, we need detailed specifications from you on several areas. This avoids building something twice and ensures every role gets exactly what you envision.

Please answer as extensively as possible. The more detail you provide, the fewer rounds of revision we'll need.

---

## 1. Charting System — Full Specification Per Role

We have a charting system built with dynamic form support. We need your complete specification for each chart type.

### 1a. Goalie Game Chart
- What fields/questions should appear in **Pre-Game**?
- What fields/questions should appear **Per Period** (1st, 2nd, 3rd)?
- What are the exact **8 performance factors** goalies rate themselves on? (We have some — please confirm the final list)
- What fields for **Overtime/Shootout**?
- What fields for **Post-Game Debrief**?
- Should goalies enter shot counts, save counts, goal counts per period?
- Any numeric stats to track (GAA, save %, etc.) or do we calculate those?

### 1b. Goalie Practice Chart
- What does a practice session chart look like vs a game chart?
- Different fields? Simpler? Same structure?
- Should it track drills completed, focus areas, coach notes?

### 1c. Parent Observation Chart
- What can a parent chart/log after watching their child's game?
- Is this a simplified version of the goalie chart?
- What specific questions/fields should parents answer?
- Rating scales? Free-text observations? Checklists?
- Can you provide the full field list with question text?

### 1d. Coach Evaluation Chart
- What does a coach fill out after evaluating a goalie?
- Per-game? Per-practice? Per-period?
- What performance categories does the coach rate?
- Is this the same 8 factors as the goalie self-assessment, or different?
- Does the coach see the goalie's self-assessment before or after filling theirs?
- Can you provide the full field list with question text?

### 1e. Chart Cross-Reference
- Should the system automatically compare Goalie self-chart vs Coach chart vs Parent observation for the same game?
- How should discrepancies be displayed?

---

## 2. Parent Role — Complete Feature List

We have parent dashboard, child linking, and cross-reference assessment built. Please confirm and extend:

### What a parent can currently do:
- Link to child via code (XXXX-XXXX)
- See child's progress (pillar completion %, quiz scores, streaks)
- See child's assessment results
- Compare their own assessment vs child's (cross-reference)
- View multiple children from one account

### Questions:
- What **else** should a parent see or do? Full list please.
- Can parents see their child's **individual quiz answers** or just scores?
- Can parents see their child's **charting session details** (period-by-period) or just summaries?
- Can parents see **coach comments/feedback** on their child?
- Should parents receive **notifications** when their child completes a module, scores low, or gets coach feedback?
- Can parents **message** their child's coach? Or is messaging one-way?
- Should parents see a **recommended actions** section (e.g., "Your child is struggling with Skating — encourage off-ice edgework")?
- Should parents have their own **learning content** (videos about supporting young goalies, nutrition, mental health)?
- Any features parents should **NOT** see? (Privacy boundaries)
- Should the parent observation chart (1c above) feed into their dashboard?

---

## 3. Coach Role — Complete Feature List

### What a coach can currently do:
- Accept invitation from admin
- View assigned students and their progress
- Create custom curricula for individual students
- Create custom content (lessons, quizzes)
- Review student assessments with level adjustment
- View student evaluation details (Q&A breakdown)

### Questions:
- What **else** should a coach see or do? Full list please.
- Should coaches see **charting data** for their students? Which charts?
- Can coaches **leave feedback** on individual charting sessions?
- Should coaches have a **team view** (compare multiple students side by side)?
- Can coaches **assign homework** or practice drills outside the curriculum?
- Should coaches see the **parent cross-reference** results for their students?
- Should coaches receive **alerts** when a student scores low, misses sessions, or breaks a streak?
- Can coaches create **group curricula** (same curriculum for multiple students)?
- Should coaches see **aggregate analytics** across all their students?
- Any features coaches should **NOT** have access to?

---

## 4. Goalie Role — Complete Feature List

### What a goalie can currently do:
- Complete onboarding assessment (28 questions, 7 categories)
- Browse 7 pillars with skills and video lessons
- Take video quizzes with instant feedback
- Track progress (pillar completion, quiz scores, streaks)
- Log game/practice sessions with charting
- View session analytics and trends
- Set goals
- Generate parent link codes
- View achievements/badges
- Send/receive messages

### Questions:
- What **else** should a goalie see or do? Full list please.
- What does the **ideal goalie dashboard** look like in your mind? What's the first thing they see when they log in?
- Should goalies see their **intelligence profile** on their dashboard at all times, or only after assessment?
- Should the system **recommend** which pillar/lesson to do next based on their gaps?
- After charting a game, should the system **automatically suggest** specific lessons to address weak areas?
- Should goalies be able to **compare** their charting results game-over-game?
- Can goalies **upload their own videos** (game highlights, practice clips) for coach review?
- Should goalies see a **calendar** of their sessions and upcoming goals?
- Any features goalies should **NOT** see? (e.g., raw scores vs encouraging language)

---

## 5. Admin Role — Complete Feature List

### What admin can currently do:
- Manage all users across all roles
- Manage 7 pillars, skills, and content
- Create and manage quizzes with video integration
- Invite and manage coaches
- Build custom form templates (dynamic charting forms)
- View platform-wide analytics
- AI project assistant
- Content moderation

### Questions:
- What **else** should admin see or do?
- What **analytics** does admin need that we haven't built? Specific metrics?
- Should admin be able to **preview the platform as any user** (impersonation)?
- Should admin see **revenue/subscription** data? (Or is that separate?)
- Does admin need **bulk actions** (e.g., message all parents, export all data)?
- Should there be **admin roles** (super admin vs content admin vs support admin)?

---

## 6. Learning Portfolio / Content Library — Clarification

Michael's directive mentions "Learning Portfolio" as Block 3 feature. We want to clarify what this means:

### Option A: Public Content Library
- A browseable library of all lessons, videos, drills
- Any registered user can access
- Free tier vs premium content?
- Searchable by pillar, level, system, etc.

### Option B: Personal Portfolio (What Block 3 describes)
- A per-user record of their learning journey
- What they completed, when, scores, struggles
- Not a library — more like a transcript/journal
- Feeds analytics, visible to parents/coaches

### Option C: Both
- Public library (browse content) + Personal portfolio (your journey)

### Questions:
- Which option do you want? A, B, C, or something else?
- If public library — is all content free? Or tiered (Free/Basic/Pro/Premium)?
- If personal portfolio — should the goalie be able to **export** it (PDF)?
- Should the portfolio be **shareable** (like a LinkedIn profile for goalies)?
- What specific data points should the portfolio show?

---

## 7. Analytics — Detailed Requirements Per Role

Please describe exactly what each role should see in their analytics/dashboard:

### 7a. Goalie Analytics
What charts, numbers, or insights should a goalie see?
- Progress by pillar over time?
- Quiz score trends?
- Charting performance trends per game?
- Comparison of self-rating vs coach rating?
- Streak history?
- Time spent learning per week?
- Anything else?

### 7b. Parent Analytics
What should parents see?
- Child's progress over weeks/months?
- Assessment score changes over time?
- Charting trends for their child?
- Engagement metrics (how active is my child)?
- Cross-reference alignment changes over time?
- Comparison to platform averages? (Anonymous)
- Anything else?

### 7c. Coach Analytics
What should coaches see?
- Individual student progress charts?
- Multi-student comparison?
- Class/group averages?
- Which content is working (completion rates)?
- Student engagement (who's active, who's dropping off)?
- Charting trends per student?
- Anything else?

### 7d. Admin Analytics
What does the admin/business need?
- Total users by role?
- Active users per day/week/month?
- Content consumption metrics?
- Quiz pass/fail rates by pillar?
- Revenue metrics? (If applicable)
- User acquisition/churn?
- Most accessed content?
- Assessment completion rates?
- Charting adoption rates?
- Anything else?

---

## 8. Notifications & Communication

- What events should trigger **email notifications**?
  - Quiz completion? Assessment done? Coach feedback? Milestone reached?
- What events should trigger **in-app notifications**?
- Should parents get notified about their child's activity? Which events?
- Should coaches get notified about student activity? Which events?
- Should there be **push notifications** (mobile browser)?
- Any **automated reminders** (e.g., "You haven't logged a session in 3 days")?

---

## 9. Mobile Experience

- Are there specific screens that **must** work perfectly on mobile? (Priority list)
- Is a **native app** planned eventually, or browser-only?
- Should charting be **mobile-first** (goalies log on phone at the rink)?
- Any specific mobile UX requirements?

---

## 10. Content & Data You'll Provide

To complete the remaining stages, we need content from your side:

- [ ] **Chart templates** — full field specifications for all chart types (see Section 1)
- [ ] **Terminology database** — list of all terms for contextual support (M.E.T., V.M.P., Line System, etc.) with explanations and linked videos
- [ ] **Milestone definitions** — what benchmarks trigger celebrations? What quotes/videos to show?
- [ ] **Introduction video** — for landing page placement
- [ ] **Questionnaire verification** — confirm all 104 questions match your specs
- [ ] **Domain purchase** — for production email (Resend)
- [ ] **Content** — actual training videos, lessons, drills to populate the platform

---

## How to Respond

You can answer these in any format:
- Reply inline on this document
- Voice notes we'll transcribe
- Separate document per section
- Quick call to walk through

The more specific you are, the faster we build exactly what you want. Vague answers = more revision cycles.

---

*Prepared by: Basim — March 18, 2026*
