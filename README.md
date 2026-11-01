# NXNative Cloud Studio (`vercel.app` Web Compiler)

A modern, production-ready web application designed for deployment to **Vercel** (`*.vercel.app`) that converts legally dumped Nintendo Switch game backups (`.nsp`, `.nsz`, `.xci`, `.nro`) into native Apple Silicon iOS/iPadOS `.ipa` packages using **[seedds/nxnative](https://github.com/seedds/nxnative)** and the cloud build architecture pioneered by **[adro0303/ipa-builder](https://github.com/adro0303/ipa-builder)**.

---

## 💡 Architecture & Technical Breakthrough

### Why Traditional Serverless Hosting Cannot Directly Compile Switch Games:
1. **Compilation Requirements:** `nxnative` requires macOS (arm64), Xcode 15/16 with `MetalToolchain`, `xcodegen`, `.NET SDK`, and takes 30–60 minutes per game. Vercel serverless functions run on Linux x86/ARM containers with a strict 10s–60s timeout.
2. **File Sizes:** Nintendo Switch game dumps range from 500 MB to 15+ GB. Vercel serverless request bodies are hard-capped at **4.5 MB**.
3. **Legal & Copyright Liability:** Uploading or hosting proprietary Nintendo ROMs or cryptographic keys (`prod.keys`) onto a shared web server creates severe copyright and DMCA liability.

### How NXNative Cloud Studio Solves This:
* **100% Client-Side In-Browser Inspection:**
  * Uses the browser's HTML5 File API and `ArrayBuffer` slicing to inspect the first 4 KB of files locally in RAM.
  * Detects `PFS0` (NSP/NSZ), `HFS0` / `HEAD` (XCI), and `NRO0` (Homebrew) magic headers.
  * Extracts Title IDs, versions, and partition file tables without uploading a single byte to any server.
  * Validates `prod.keys` cryptographically in browser memory.
* **Cloud Runner Orchestration (`adro0303/ipa-builder` model):**
  * Connects to GitHub Actions to execute on **free Apple Silicon `macos-14` / `macos-15` (M2) cloud runners**.
  * The cloud runner provisions Xcode, downloads `MetalToolchain`, translates ARM64 binaries and Horizon HLE services, recompiles NVN shaders to Apple Metal, and outputs an unsigned `.ipa` artifact.
  * The web interface triggers `workflow_dispatch` and monitors progress in real time.
* **Instant In-Browser Homebrew Packager (`JSZip`):**
  * Directly packages Homebrew executables (`.nro`) into signed/unsigned iOS IPA bundles inside the browser in seconds.
* **Legally Ripped Disclaimer & Compliance Gate:**
  * Users must certify ownership of physical media and personal key extraction before any build action can be dispatched.

---

## 🚀 Key Features

* 🎮 **Format Support:** `.nsp` (eShop / Base), `.nsz` (Compressed NSP), `.xci` / `.xcz` (Cartridge dumps), and `.nro` (Homebrew).
* 🔑 **Keys Validator:** In-browser verification of `header_key`, `key_area_key_application_source`, `titlekek_source`, and Master Keys (v00 – v18).
* ⚙️ **Custom Flags:** Display Name, Bundle ID, Preferred In-Game Language (`en`, `ja`, `es`, `fr`, `de`, `it`, `zh`, `ko`), Metal HUD & FPS Overlay (`--show-fps`).
* ☁️ **GitHub Actions Cloud Pipeline:** One-click repository builder with automated caching (`actions/cache`) and artifact download.
* 💻 **Local Mac Script Generator:** Generates tailored bash scripts to run `scripts/build_ipa_from_nsp.py` offline on Apple Silicon Macs.
* 📱 **Interactive Sideloading Wizard:** Complete guides for **AltStore**, **Sideloadly**, **TrollStore** (no revokes), and **LiveContainer**.

---

## 📦 Deploying to Vercel

### Method 1: Deploy with Vercel CLI
```bash
npm install -g vercel
vercel
```

### Method 2: Deploy via GitHub
1. Push this repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import this repository.
4. Framework Preset: **Next.js**.
5. Click **Deploy**.

---

## 🛠️ Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run the Next.js development server
npm run dev

# 3. Open http://localhost:3000 in your browser
```

---

## ⚖️ Legal & Fair-Use Disclaimer

This application is strictly an educational frontend and automation toolchain for **seedds/nxnative** and **adro0303/ipa-builder**. It does **not** contain, distribute, host, or download any copyrighted Nintendo Switch game code, system firmware, or proprietary cryptographic keys.

Users are solely responsible for ensuring they only process backups of software they have legally purchased and dumped from their personally owned Nintendo Switch consoles for personal, non-commercial archival use under applicable copyright fair-use laws.
