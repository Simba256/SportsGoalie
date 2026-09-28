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

## 5. Onboarding welcome lines

Log in as a new test goalie and go through the Student Baseline Profile.

- [ ] **Hero screen** (V-A-01), **driver choice** (V-A-02) and **closing
      screen** (V-A-05): **no** Coach Mike button. These three are held for
      re-recording and stay silent until Michael's new takes are uploaded.
- [ ] **Driver reply** (V-A-03, after picking an answer) and **privacy screen**
      (V-A-04): a **HEAR COACH MIKE** button shows. (On a phone it reads just
      "HEAR COACH MIKE", and the full name shows on wider screens.)
- [ ] Tap it: the line plays. Tap again: it pauses.
- [ ] On the driver-reply screen, play the line, then tap **CONTINUE** while it
      is still talking. The voice **stops** when the screen changes. It must not
      carry on over the next screen.
- [ ] Nothing on these screens plays by itself.

## 6. After Michael's new takes are uploaded

The upload date releases them. No code change is needed.

- [ ] Admin → Coach Audio: V-A-01, 02, 05 and 10 no longer show
      **HELD · SILENT ON THE SITE**.
- [ ] The hero, driver-choice and closing screens now show their buttons, and
      each plays the **new** take.

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
| 5. Onboarding buttons and stop on Continue | | | |
