# New Way Bill Maker

Offline-first bill/receipt app for NEW WAY DRY CLEAN & STEAM PRESS. React + Vite + Tailwind, Capacitor for Android. No backend, no AI, no network needed.

## Develop
    npm install
    npm run dev          # http://localhost:5173
    npm run build        # type-check + production build into dist/

## Android APK (needs JDK 21 + Android Studio / SDK)
    npm run cap:sync     # build + copy into android/
    npx cap open android # then Build > Build APK(s) in Android Studio
    # or: cd android && gradlew assembleDebug  ->  android/app/build/outputs/apk/debug/

## Layout
- `src/components/Receipt.tsx` – the bill design (pure, edit here to tweak the look)
- `src/utils/billUtils.ts` – totals, WhatsApp text, helpers
- `src/utils/storage.ts` – history (`bill_digitizer_history`, newest first, max 50), settings, backup
- `src/utils/exportImage.ts` – PNG export / save / share (Capacitor on device, browser fallback on web)
- `reference/bill.png` – the target design
