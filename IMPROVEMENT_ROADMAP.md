# The Divine Tarot — Improvement Roadmap

A prioritized list of what to do next. Grouped by phase; roughly ordered by impact.

## Phase 1 — Finish the launch essentials (do these first)
1. **App icon** — replace with your Bharti Singh logo (in progress).
2. **Google sign-in live** — add your SHA-1 to Firebase, re-download
   `google-services.json`, rebuild (`GOOGLE_SIGNIN_SETUP.md`).
3. **Phone OTP (proper)** — re-add SMS login via `@react-native-firebase/auth`
   (native, no reСAPTCHA, doesn't break the build). Needs the same
   google-services.json.
4. **Payment verification live** — deploy the Apps Script backend and paste its URL
   into `PAYMENTS_ENDPOINT` (`RAZORPAY_WEBHOOK_SETUP.md`), then switch Razorpay to a
   **test** key for testing.
5. **Firestore security rules** — lock the database so each user can only read/write
   their own profile (right now rules may be open/test-mode).
6. **Privacy policy hosted** — fill placeholders in `PRIVACY_POLICY.md`, publish at
   `thedivinetarotonline.com/privacy`, link it in both stores.

## Phase 2 — Core features from the original plan
7. **Teachable courses** — real enrolment via Teachable API + auto-register the
   student (by email) after a successful payment.
8. **Course progress tracking** — show % complete per course, pulled from Teachable.
9. **Auto-generated certificate** — themed PDF certificate on course completion, with
   the student's name, emailed and downloadable in-app.
10. **Reading history sync** — currently on-device only; also save to Firestore so it
    follows the user across devices.

## Phase 3 — Experience & retention
11. **Upright/reversed cards** — 50% reversed with their own meanings, for authenticity.
12. **Share a reading as an image** — export a beautiful card to WhatsApp/Instagram
    (free marketing + virality).
13. **Reading summary line** — one-sentence takeaway distilling the 3 cards.
14. **Onboarding tutorial** — a 3-slide intro on first open explaining readings,
    courses, Kundli.
15. **Language switch coverage** — make sure Hindi/Hinglish/English applies on every
    screen and inside readings.
16. **Follow-up prompt** — after each reading, "Iske baare mein aur poochho?" to keep
    the conversation going.

## Phase 4 — Store launch & growth
17. **Store listings** — Play Store + App Store: title, description, ASO keywords,
    screenshots, feature graphic.
18. **iOS build** — needs an Apple Developer account; distribute via TestFlight first.
19. **Referral / share incentive** — "Invite a friend, get a free reading."
20. **Ratings prompt** — ask happy users to rate after a good reading.
21. **Analytics dashboard** — turn the Google Sheet logs into a simple chart
    (installs, DAU, regions) — or move to a proper analytics tool.

## Phase 5 — Hardening & quality
22. **Card-image caching** — cache the Wikimedia card art on-device so readings load
    instantly and work offline.
23. **Error toasts / empty states** — friendly messages when offline, payment fails,
    or a screen has no data yet.
24. **Crash reporting** — add Sentry (or Firebase Crashlytics) to catch real-world
    crashes.
25. **Accessibility** — support larger font sizes and check colour contrast.
26. **Performance on web** — the 78-card fan can be heavy in the browser preview;
    lazy-render off-screen cards.

## Suggested next 3
If you want a focused path: **(1) finish the app icon → (2) Google sign-in live →
(3) deploy payment verification.** That gets you to a genuinely shippable v1. Then
tackle Teachable courses + certificate as the big feature push.
