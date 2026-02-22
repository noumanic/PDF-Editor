# PDF Editor Free 📄✨

<p align="center">
  <img src="images/preview.png" alt="PDF Editor Free Preview" width="100%" />
</p>

A fast, production-ready, client-side-only PDF editor built with **React**, **Vite**, **PDF.js**, and **pdf-lib**. 

## Features

- **100% Client-Side Privacy:** Your files never leave your device.
- **Annotate & Highlight:** Add text, highlight areas, or draw rectangles.
- **Page Management:** Instant visual deletion of individual pages or bulk ranges.
- **Rotate Pages:** Quickly rotate the visual view 90° left or right.
- **Undo / Redo:** Robust stack with 50-step memory (Ctrl+Z / Ctrl+Y).
- **Beautiful Light Theme:** Modern, crisp interface with indigo and glassmorphism accents.
- **Mobile Responsive:** Full-screen mobile preview drawer and dedicated scrollable touch toolbars.
- **Instant Export:** Download the modified PDF instantly without server roundtrips.

## Tech Stack

- **React 18** (Vite build system)
- **PDF.js** (`pdfjs-dist`) for rendering pages to `<canvas>`
- **pdf-lib** for mutating the PDF object buffer and exporting

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```
2. **Start Dev Server**
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173/` in your browser.

## Project Structure

```
src/
├── components/          # React UI components (Sidebar, TopNav, RightToolbar, etc.)
├── hooks/
│   ├── useAnnotations.js  # Annotation state + Undo/Redo tracking
│   └── usePdfDownload.js  # Embeds annotations via pdf-lib and removes pages
├── utils/
│   └── colorUtils.js      # Helpers for hex -> RGB conversion
├── App.jsx              # Main orchestrator
└── index.css            # Global Light Theme variables and animations
```

## How It Works

1. **Loading**: PDF.js renders the file. We intentionally clone the `ArrayBuffer` before letting PDF.js consume it so that way `pdf-lib` has access to the raw bytes for export later (PDF.js web workers detach ArrayBuffers).
2. **Editing**: Annotations (text, highlights, drawing) are tracked in React state and rendered as transparent, interactable HTML elements floating *above* the PDF.js canvas.
3. **Exporting**: When clicking Download, `pdf-lib` is fed the raw bytes, embeds the annotations securely into the PDF tree, snipes out the deleted pages, and exports an optimized Blob.

---

**Developed by [Muhammad Nouman Hafeez](https://www.linkedin.com/in/noumanic)**
