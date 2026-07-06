# ✦ QR QUANTUM // Cyber Brutalist QR Generator

A premium, client-side web application for custom-engineering futuristic QR Codes. Designed with a high-contrast, grid-based **Cyber Brutalist** interface, this utility features segmented tab navigation, real-time live previewing, logo embedding, cache history, and multi-format downloads (PNG, vector SVG, and spec-sheet PDF).

Developed by **[Divyanshu Mehra](https://github.com/Divyanshumehra-01)**.

---

## ⚡ Key Features

* **Brutalist Grid Layout**: Designed with solid black borders, intersecting crosshairs (`+`), and custom layouts combining **Oswald** (for heavy headings) and **Space Grotesk** (for controls and copy) typography.
* **Segmented Tab Navigation**:
  * `/01 GENERATE` — Data input field supporting URLs, emails, phone numbers, and raw text.
  * `/02 CUSTOMIZE` — Live style controls for QR Code Color, Background Color, Quiet Zone margins, resolution size, rounded style toggle, and custom center logo dropzones.
  * `/03 PREVIEW` — Export terminal containing HD PNG, vector SVG, spec-ready PDF, and copy link indicators.
  * `/04 HISTORY` — Local browser storage memory logs syncing the last 8 generated settings.
  * `/05 HELP` — Accessible FAQ guide detailing optimal correction levels and logo dimensions.
* **Speeder Loading Overlay**: Features a custom CSS speed runner loading animation that sweeps across the preview window when generating a code to simulate rendering cycles.
* **Smart Logo Masking**: Reserve center coordinates to place your logo backed by a circular outline mask and structural borders, preserving scan capabilities.
* **Double-Tier Credits Footer**: Integrated inline SVG profile badges linking to LinkedIn, GitHub, and Instagram profiles.

---

## 🛠️ Built With

* **HTML5** & **Vanilla CSS3** — Structured with a flex grid layout and custom responsive media rules.
* **ES6+ JavaScript** — Client-side logic handling state, clocks, files, and local caching.
* **qrcode.js** — QR Code rendering library.
* **jsPDF** — Technical specification vector document renderer.

---

## 🚀 Getting Started

Since QR QUANTUM runs entirely client-side, there are no databases or server installations required.

### Local Execution
1. Clone the repository to your local system:
   ```bash
   git clone https://github.com/Divyanshumehra-01/QR_Code_Generator.git
   ```
2. Navigate into the project folder:
   ```bash
   cd QR_Code_Generator
   ```
3. Open `index.html` directly in any web browser, or launch it using a static local server (e.g., Live Server in VS Code, or python):
   ```bash
   python -m http.server 3000
   ```

---

## 📖 Customization Reference

### Scan Reliability Levels
We support four error correction parameters under the **CUSTOMIZE** tab:
* **LOW (7% Recovery)** — Minimum margin, best for very small QR code sizes.
* **MEDIUM (15% Recovery)** — Balanced density.
* **QUARTILE (25% Recovery)** — High redundancy, suited for dark environments.
* **HIGH (30% Recovery)** — Maximum redundancy. **Required** when embedding custom center logos to ensure readability.

---

## 👨‍💻 Developer Profiles

Connect with the author:

* **LinkedIn**: [in/divyanshu-mehra-6a5377384](https://www.linkedin.com/in/divyanshu-mehra-6a5377384/)
* **GitHub**: [@Divyanshumehra-01](https://github.com/Divyanshumehra-01)
* **Instagram**: [@_daksh.mehra_221](https://www.instagram.com/_daksh.mehra_221)

---

&copy; 2026 QR QUANTUM. All rights reserved.
