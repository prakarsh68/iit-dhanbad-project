# IIT Digital Twin - Web & Mobile Deployment Guide

This guide describes how to deploy the **IIT Digital Twin** application as a web app, a mobile Android application, and an iOS application using our pre-configured build system.

---

## Table of Contents
1. [Backend & API Setup](#1-backend--api-setup)
2. [Web Deployment](#2-web-deployment)
3. [Android Mobile Deployment](#3-android-mobile-deployment)
4. [iOS Mobile Deployment](#4-ios-mobile-deployment)
5. [Developer Workflow & Updates](#5-developer-workflow--updates)

---

## 1. Backend & API Setup

By default, the application is set up with an **Offline Simulation Mode** fallback. If the client app cannot connect to the Python backend or the production API, it automatically runs in demo mode with pre-populated diagnostic readings.

To point your app to a live production backend, define the following variables in your `.env` file before building:
```env
VITE_API_BASE_URL=https://your-production-backend.onrender.com
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_HYDRAULIC_API_KEY=your_hydraulic_api_key_here
```

---

## 2. Web Deployment

The application is pre-configured to be deployed on popular hosting services such as **Vercel** or **Netlify**.

### Option A: Vercel (Recommended)
1. Install the Vercel CLI globally (if not already installed):
   ```bash
   npm install -g vercel
   ```
2. Log in and deploy from the root of the project:
   ```bash
   vercel
   ```
3. Set your production environment variables (e.g., `VITE_API_BASE_URL`) in the Vercel Dashboard, or during the CLI setup.
4. For production deployment:
   ```bash
   vercel --prod
   ```

### Option B: Netlify
1. Install the Netlify CLI globally:
   ```bash
   npm install -g netlify-cli
   ```
2. Run production build:
   ```bash
   npm run build
   ```
3. Deploy the build directory (`dist`):
   ```bash
   netlify deploy --prod --dir=dist
   ```

---

## 3. Android Mobile Deployment

### Prerequisites
- **Android Studio** installed on your machine.
- **Android SDK** and SDK platform tools configured.

### Step-by-Step Instructions
1. **Build and Sync Assets**:
   Sync your latest React code into the Android native wrapper:
   ```bash
   npm run cap:sync
   ```
2. **Open in Android Studio**:
   ```bash
   npm run cap:open-android
   ```
   Android Studio will open. Wait for Gradle to finish indexing.
3. **Run on Emulator / Device**:
   - Select your connected Android device or virtual device (AVD) from the device manager dropdown.
   - Click the green **Run (Play button)** icon in Android Studio.
4. **Generate Signed Release APK / AAB**:
   - In Android Studio, go to **Build > Generate Signed Bundle / APK...**
   - Choose **APK** (for manual installation) or **Android App Bundle (AAB)** (for uploading to Google Play Store).
   - Create or select an existing KeyStore credentials file and sign the app.
   - The compiled release binaries will be generated inside the `android/app/release/` directory.

---

## 4. iOS Mobile Deployment

### Prerequisites
- **macOS** operating system.
- **Xcode** installed.
- **CocoaPods** installed. Install via Homebrew or gem:
  ```bash
  brew install cocoapods
  ```

### Step-by-Step Instructions
1. **Build and Sync Assets**:
   ```bash
   npm run cap:sync
   ```
2. **Install iOS Dependencies**:
   Open terminal inside the `ios/App` directory and install pods:
   ```bash
   cd ios/App
   pod install
   cd ../..
   ```
3. **Open in Xcode**:
   ```bash
   npm run cap:open-ios
   ```
   Xcode will open the workspace file.
4. **Configure Signing**:
   - Select the main **App** target in the left navigation sidebar.
   - Go to **Signing & Capabilities**.
   - Enable **Automatically manage signing**.
   - Select your Apple Developer Team and Certificate.
5. **Run on Simulator / iPhone**:
   - Select your target device/simulator in Xcode.
   - Click the **Run (Play button)** icon or press `Cmd + R` to compile and run.
6. **Archive for App Store / TestFlight**:
   - Select **Any iOS Device (arm64)** as the run target.
   - Go to **Product > Archive**.
   - Follow the prompt to distribute/upload the archive to TestFlight or export as an `.ipa` file.

---

## 5. Developer Workflow & Updates

Whenever you make updates to the React components (`src/`):
1. Test your changes locally: `npm run dev`
2. Sync the modifications to Android/iOS platforms:
   ```bash
   npm run cap:sync
   ```
3. Run the mobile projects again via Android Studio/Xcode to deploy the latest code update onto your testing devices.
