# The Divine Tarot — Mobile App (v0.2)

A single **React Native + Expo** codebase for Android & iOS, rebuilt to match
**thedivinetarotonline.com** — violet/mystical theme, full home page, reading flow
and courses, with a **glassmorphic animated bottom navigation bar**.

## What's built
- **5-tab app** with a floating frosted-glass nav bar (blur + animated active pill,
  icon lift/scale, notification dot) — `src/components/GlassTabBar.js`
- **Home** matching the website: hero, "feeling stuck" cards, How It Works,
  sample 3-card reading, guidance, Why + stats, testimonials, final CTA
- **Reading** flow: ask → pick 3 cards (spring animation) → reveal + premium upsell
- **Courses**: all 5 courses from the learn site (enrol button stubbed to Teachable)
- **Kundli Milan**: compatibility screen (placeholder calc)
- **Profile**: Google sign-in placeholder + language switch
- **3 languages** (English / हिंदी / Hinglish) — persists on device, whole app
- Entrance animations throughout (reanimated `FadeInUp/Down`)

## What's stubbed (marked `TODO` in code)
- Google OAuth login · Payment (IAP / Razorpay) · Teachable enrol + certificate
- Kundli logic · live reading API (currently a local sample deck)

## Tech
Expo Router (tabs) · react-native-reanimated · expo-blur · expo-linear-gradient ·
@expo/vector-icons · react-i18next

---

## Run it (Windows, project already at D:\DivineTarotDev\Tdt-App)

Open a terminal in this folder and run:
```
npm install
npx expo start
```
- Press **w** for a browser preview, **or**
- Install **Expo Go** on your phone and scan the QR to see it live (best for the
  glass/blur nav — some blur effects are limited on web).

> **First run after this update:** because new libraries were added
> (reanimated, blur, gradient), run `npm install` again before `npx expo start`.

> **Assets:** add real images to `assets/` before a store build —
> `icon.png` (1024×1024), `splash.png`, `adaptive-icon.png`, plus your logo/card art.

### Store builds later (no Mac needed)
```
npm install -g eas-cli
eas build --platform android
eas build --platform ios      # needs an Apple Developer account
```

## Structure
```
app/
├─ _layout.js              # root stack (tabs + pushed reading screens)
├─ (tabs)/
│  ├─ _layout.js           # Tabs + custom GlassTabBar
│  ├─ index.js             # Home
│  ├─ reading.js           # Ask question
│  ├─ courses.js           # 5 courses
│  ├─ kundli.js            # Kundli Milan
│  └─ profile.js           # Login + language
├─ pick-cards.js           # Pick 3 cards
└─ reading-result.js       # Reveal + upsell
src/
├─ theme.js  i18n.js       # brand palette + language setup
├─ components/             # GlassTabBar, GradientButton, Screen
├─ context/                # LanguageProvider + switcher
├─ data/                   # cards, courses, testimonials
└─ locales/                # en / hi / hinglish
```

## Next phases (build plan)
1. Google/Apple login → Gmail auto-registration
2. Connect live reading API
3. Payments (IAP + Razorpay) · 4. Teachable courses + certificate · 5. Notifications
