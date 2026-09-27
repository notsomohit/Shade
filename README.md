# StudioNorth

A browser-based photo editing app with non-destructive adjustments, filters, crop tools, text overlay engine, and project persistence.

## Tech Stack

- **Frontend:** Next.js 16 (React 19, App Router, Tailwind CSS v4)
- **Backend:** Node.js / Express with TypeScript
- **Canvas Engine:** Client-side HTML5 Canvas pixel & vector manipulation pipeline

## Core Features Implemented

1. **Clip-Path Draggable Compare Slider**:
   - Two stacked canvas layers: **Original (Before)** on bottom layer, **Edited (After)** on top layer.
   - Top layer clipped via `clipPath: inset(0 ${100 - dividerPercent}% 0 0)`. Zero image distortion or resizing.
   - Dragging right (e.g. 80%) reveals 80% After on left, 20% Before on right.
   - Dragging left (e.g. 30%) reveals 30% After on left, 70% Before on right.
   - Smooth mouse & mobile touch event handling (`mousedown`, `mousemove`, `mouseup`, `touchstart`, `touchmove`, `touchend`).
   - Click anywhere on track to jump divider; 2% to 98% clamping.
   - Subtle low-opacity corner labels (`text-white/40`) for `AFTER` (left) and `BEFORE` (right).
2. **Interactive Text Overlay Tool (Phase 4 / Text Engine)**:
   - **Text (T)** tool added to Left Toolbar.
   - Text input field, font size slider (16px–120px), color palette selector (`#4b9fef`, `#ffffff`, `#facc15`, `#f87171`, `#4ade80`).
   - Pushes text overlay layers directly onto the HTML5 Canvas pipeline and into the Layers panel stack with visibility toggles.
3. **Non-Destructive Core Adjustments**:
   - Live non-destructive pixel adjustments for `Brightness`, `Contrast`, `Saturation`, `Exposure`.
4. **Crop & Transform Engine**:
   - Rotate 90° CW / CCW, Flip Horizontal, Flip Vertical, and Crop Area application.
5. **Enlarged Bottom UI**:
   - Taller preset strip (`h-24`), larger thumbnail boxes (`w-16 h-12`), taller status bar (`h-10`) with bigger zoom `-` / `+` touch targets.

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env

# 3. Run client + server in dev mode
npm run dev:client   # → http://localhost:3000 (or 3001/3002 if port in use)
npm run dev:server   # → http://localhost:4000
```

## Development Phases

- [x] Phase 0 — Project setup
- [x] Phase 1 — Image upload + full-screen editor shell redesign
- [x] Phase 2 — Core adjustments (brightness, contrast, saturation, exposure)
- [x] Phase 3 — Crop + transform (rotate 90°, flip H/V, crop overlay)
- [x] Phase 4 — Text tool & Filter presets engine
- [ ] Phase 5 — Undo/redo + history
- [ ] Phase 6 — Export
- [ ] Phase 7 — Auth
- [ ] Phase 8 — Save/load projects
- [ ] Phase 9 — Gallery/dashboard
- [ ] Phase 10 — Polish
