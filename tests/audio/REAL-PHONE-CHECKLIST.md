# Coach Mike's voice — real phone checklist

The browser tests in this folder prove the logic in Chromium with an iPhone-style
tap rule. They cannot prove it on iOS: Playwright's WebKit is not iOS Safari, and
on Windows it cannot play audio at all. This list covers what only a real phone
can show. Run it on at least one iPhone (Safari) and one Android phone (Chrome).

Use the live site (with the preview link while the site is closed) and a test
goalie account. Write the phone, OS version and browser at the top of your notes.

## Before you start

- [ ] **Set a voice clip on a test quiz.** As of 29 Sept 2026 no quiz has one, so
      the freeze-point voice never plays on the live site yet. Use a quiz that is
      not published, or undo the change afterwards. Admin → Quizzes → edit the
      quiz → **Questions** tab → edit a question → **Voice clip (optional)** →
      `V-A-03` → save. Pick a
      question at least 10 seconds into the video.
- [ ] Phone volume up. Turn the silent switch **off** for now (tested below).
- [ ] Close the tab if it is already open, so the test starts from a fresh page.

## 1. The freeze-point voice (the one nobody taps for)

This is the one iOS would block without the fix.

- [ ] Open the quiz. Tap **Start Quiz**. The video starts **with sound** and
      keeps playing. (The fix plays a moment of silence on the same tap. Check it
      does not pause, stutter or mute the video.)
- [ ] At the freeze point the frame holds and **Coach Mike speaks by himself**,
      with no tap.
- [ ] The question panel shows **Hear Coach Mike** (grey outline), not the blue
      **Tap to hear Coach Mike** button.
- [ ] Tap **Hear Coach Mike**: the line plays again from the start. Tap
      **Pause**: it stops.
- [ ] Answer, then tap **PLAY ON**. The voice stops and the video carries on
      with sound.

## 2. Paused and resumed

- [ ] Reload. Tap **Start Quiz**, then pause the video with the player's own
      button before the freeze point. Tap play again. At the freeze point the
      voice still plays by itself.

## 3. The fallback, if the phone refuses

The blue button only appears if the phone refused the automatic play. With the
fix, the normal path should never show it, so "never seen" is the expected
result. Write it down either way.

- [ ] If you ever see the blue **Tap to hear Coach Mike** button, write down
      exactly what you did before it appeared. That is a case the fix misses.
- [ ] Then tap it once: the line plays, and it turns into the grey **Pause**
      button.

## 4. Sound settings

- [ ] **iPhone silent switch on**: repeat step 1. Write down whether the video
      and the voice are heard. (iOS may silence web audio on silent. That is the
      phone's choice, not a fault, but we need to know what happens.)
- [ ] **Music playing** (Spotify or Apple Music) before opening the quiz: the
      site stays silent and the music keeps playing **until you tap Start
      Quiz**. Only then may the music pause.
- [ ] **Bluetooth headphones**: the voice comes through the headphones.
- [ ] Lock the phone during the voice, then unlock: nothing plays twice and
      nothing is stuck.

## 5. The welcome, the first time a goalie arrives

Michael's placement doc (4 Oct 2026) makes V-A-01, 02 and 03 an event: they play
one after another, by themselves, the first time a goalie arrives. There is no
button for them on the onboarding screens. It needs all three uploaded; with any
one missing it stays silent and waits, so nobody uses up their one chance.

It plays **once per account**. To run it again, use a new test goalie invite, or
delete the `voiceMoments` field on that goalie's user document in Firebase.

- [ ] Open a **new** goalie invite link on the phone, fill the form and tap
      **Create account**. On the next screen the welcome plays **by itself**, with
      no tap, in order: **V-A-01, then V-A-02, then V-A-03**, with no gap long
      enough to think it stopped.
- [ ] Music playing first (Spotify or Apple Music): tapping **Create account** may
      pause it. That tap is what unlocks the voice on iPhone, so it is expected
      for a goalie. A coach, parent or admin signing up must **not** touch the
      music.
- [ ] Do not tap anything during the welcome. Reload the page after it ends: it
      does **not** play again. Log out, log back in: it does **not** play again.
- [ ] Start the welcome and tap **pause** (or play any other Coach Mike button)
      part way: the rest of the welcome is dropped, not resumed later.
- [ ] A coach, a parent and an admin account: the welcome never plays.
- [ ] An existing goalie who has **finished** the baseline profile: it never plays.
- [ ] **If the phone refuses** (most likely when an existing goalie simply logs in,
      because login does not unlock the voice on purpose): a pill at the bottom
      reads **TAP TO HEAR COACH MIKE** with an **X**. Tapping the pill plays the
      whole welcome from V-A-01. **X** removes the pill and it does not come
      back until the next page load. Write down what you did before it appeared.
- [ ] With Voice **OFF** (use the **VOICE ON/OFF** switch beside any Coach Mike
      button, before the welcome) the welcome is silent. Switch Voice **ON**
      later, on whatever page the goalie is on: the welcome then plays, once,
      from that tap. It is not lost.

Onboarding screens that still carry a button (these are the Driver-or-Passenger
lines, not Block 1): **driver choice** (DOP-INTRO) and **driver reply** (DOP-A to
DOP-D, after picking an answer).

- [ ] Each shows **HEAR COACH MIKE** once its clip is uploaded, and no button when
      it is not. Tap: plays. Tap again: pauses.
- [ ] On the driver-reply screen, play the line, then tap **CONTINUE** while it is
      still talking. The voice **stops** when the screen changes.
- [ ] The hero, privacy and closing screens carry **no** Coach Mike button.

## 6. Charting, the first time a goalie opens it

V-A-04 then V-A-05, by themselves, the first time a goalie opens Charting. Needs
both uploaded (V-A-05 came in Block 1, the new V-A-04 in Block 4); with either
one missing, nothing plays and nothing is used up.

- [ ] First open of Charting as a goalie: V-A-04 plays, then V-A-05 (the
      commitment, ending "Commit Smart. Play Smart."), with no tap. A goalie who
      has just come from the welcome is **not** counted as having had this one.
- [ ] Open Charting again: it does not play again.
- [ ] A coach opening a goalie's charting: nothing plays.

## 7. Buttons on the pillar and Mind-Vault pages

Open each page as a goalie. A clip that is not uploaded shows **no** button (and no
"not recorded" notice). On a phone each reads just **HEAR COACH MIKE**; the full
words show on wider screens.

- [ ] **Pillar 03, the 7 Angle-Marker System** (`/pillars/pillar_positioning`):
      under the heading, in this order: **V-A-06** (7 Angle-Marker System),
      **V-A-09** (4 Level Arch System), **V-A-10** (Three Lanes of Attack). One
      **VOICE ON** switch for the stack, not three.
- [ ] **Pillar 04, the 6 Zone, 7 Point System** (`/pillars/pillar_seven_point`):
      **V-A-07**, then **V-A-08** (Angles 1 and 7 are the same) directly beneath.
      V-A-08 is still an OPEN question for Michael: it may move to Pillar 03.
- [ ] **Who can open these pages.** `/pillars` and everything under it is the
      goalie portal and needs a login. Logged out (use a private window): going
      to `/pillars/pillar_positioning` sends you to the login page and shows no
      pillar content. A coach is sent to `/coach`, a parent to `/parent`. A goalie
      and an admin get in. The public pillar pages (`/pillar/3`, `/pillar/4`,
      reached from each audience's overview page) stay open to everyone, no login.
- [ ] Any other pillar page: no Coach Mike buttons.
- [ ] Each button plays its own line, tap again pauses, and leaving the page stops
      the voice.
- [ ] **Mind-Vault** (`/mind-vault`), first visit: **HEAR COACH MIKE: THE
      MIND-VAULT** (V-A-14) shows, and does not play by itself. Leave and come
      back: the button is **gone**, for good. (To see it again, delete the
      `voiceMoments.mindVaultFirstVisit` field on the test goalie's user
      document.)

## 8. After Voice Block 1 is uploaded (4 Oct 2026)

Ten takes replace the old ones: V-A-01, 02, 03, 05, 06, 07, 08, 09, 10 and 14.
Each uploads over the old file at the same storage path.

- [ ] Admin → Coach Audio: all ten show a fresh upload date and a duration
      between about 17 and 40 seconds.
- [ ] **Hard-refresh first.** The path is unchanged, so a phone that already
      played the old take may still hold it.
- [ ] In the welcome (section 5), V-A-01 says "I'm Coach Mike" and ends "Not
      smart? Get smart." The old take said "I'm Michael".
- [ ] Every other take says what its line in Admin → Coach Audio says.

## 9. After Voice Blocks 3 to 6 are uploaded (5 Oct 2026)

Only some of these clips have a page that plays them. **They play on the site:**
V-A-04 (charting, section 6), DOP-INTRO and DOP-A to DOP-D (section 5). **Stored,
with no page that plays them yet:** PARENT-WELCOME and COACH-WELCOME (the two
welcome screens exist, but parents and coaches go straight to their baseline
questionnaires, so neither screen is ever shown), PARENT-P2 to P8, V-A-11, 12, 13,
15, 18, V-A-27 to 37 and V-B-01 to 09. To hear one of these, press play on its row
in Admin → Coach Audio.

Hard-refresh first (same storage path as the old takes).

- [ ] Admin → Coach Audio: every uploaded row shows a fresh upload date, and the
      line shown on the row is what the take says (the row label is the transcript).
- [ ] Charting, first open: V-A-04 now includes "honesty is the best policy!" and
      ends "Think Smart. Play Smart." and V-A-05 follows it.
- [ ] Driver choice: DOP-INTRO ends "Are you ready to build your game? Think Smart.
      Play Smart."
- [ ] Driver reply: A ends "Train Smart. Play Smart.", B and C end "Think Smart.
      Play Smart.", D ends "Learn Smart. Play Smart."
- [ ] Admin → Coach Audio, play PARENT-WELCOME: it ends "Built Not Born. Think
      Smart. Play Smart." Play COACH-WELCOME: it ends "Six decades. One system."

## Clean up

- [ ] Remove the test voice clip from the quiz question (or unpublish the test
      quiz) unless Michael wants it there.

## Results

| Check | iPhone (model, iOS) | Android (model, version) | Notes |
|---|---|---|---|
| 1. Freeze voice plays by itself | | | |
| 1. Video not interrupted by Start Quiz | | | |
| 2. Paused and resumed | | | |
| 3. Tap-to-hear fallback (seen / never seen) | | | |
| 4. Silent switch | | n/a | |
| 4. Music not interrupted before Start Quiz | | | |
| 5. Welcome plays by itself, 01 → 02 → 03 | | | |
| 5. Welcome not repeated (reload, re-login) | | | |
| 5. Tap pill fallback (seen / never seen) | | | |
| 5. DOP buttons, stop on Continue | | | |
| 6. Charting V-A-04 → V-A-05, once | | | |
| 7. Pillar 03 and 04 buttons in order | | | |
| 7. Mind-Vault button, first visit only | | | |
| 9. Blocks 3–6 takes say their admin label | | | |
