# Ashfall Protocol — Android APK Builder

This package builds a standalone, landscape-locked, immersive fullscreen Android APK for **Ashfall Protocol**, pre-configured to connect to your live multiplayer server:

- **Configured Server URL**: `https://ais-dev-eyo7p5xpqkjnqgc5opy5zt-465114569299.europe-west1.run.app`
- **Orientation**: Locked to `sensorLandscape`
- **Display**: Immersive Sticky Fullscreen (hides navigation & status bars)
- **Multiplayer & Voice Chat**: Live WebSocket rooms (2–8 players) + WebRTC voice chat with `RECORD_AUDIO` & WebView audio capture permissions

## Included Files
- `package.json` — Capacitor 6 & Android build scripts
- `capacitor.config.ts` — App ID (`com.ashfallprotocol.game`) and live server wiring
- `scripts/apply-landscape.mjs` — Scaffolds the Gradle Android project and applies landscape lock, fullscreen, Gradle tuning, and mic permissions
- `android-config/gradle.properties` — Gradle JVM & AndroidX build settings
- `www/index.html` — Offline/connecting launcher screen
- `.github/workflows/build-apk.yml` — One-click cloud APK builder via GitHub Actions

## Option 1: Build Automatically in the Cloud (No Android Studio Required)
1. Unzip this archive and upload the files to a free GitHub repository.
2. Open the **Actions** tab and run **Build Ashfall Protocol Android APK**.
3. Download the **ashfall-protocol-debug-apk** artifact (`app-debug.apk`) and install it on your Android phone.

## Option 2: Build Locally (Android Studio / Gradle)
Prerequisites: Node.js 20+, JDK 17, Android SDK.
```bash
npm install
npm run android:init
npm run android:sync
npm run apk:debug
```
Your installable APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`
