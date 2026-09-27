# StudioNorth

A browser-based photo editing app with non-destructive adjustments, filters, crop tools, and project persistence.

## Tech Stack

- **Frontend:** Next.js 16 (React 19, App Router, Tailwind CSS v4)
- **Backend:** Node.js / Express with TypeScript
- **Canvas:** HTML5 Canvas for client-side image manipulation

## Visual Design & Systems

- **Single Full-Screen Editor:** User lands directly into the editor UI shell at `/`.
- **Restrained Dark System:**
  - Page/Canvas area background: `#0e0f12`
  - Chrome panels (Top bar, Left toolbar, Right panel, Bottom bar): `#131418`
  - Canvas well: `#0a0a0c`
  - Hairline borders throughout: `#26272b`
  - Text: Primary `#f0f0ec`, Secondary `#9a9d9a`
  - **Single Accent Color:** `#4b9fef` (Blue) — reserved exclusively for active tool indicators, primary Export button, live slider fills, preset selection ring, and user avatar.
- **Monospace Typography:** `ui-monospace`, `Courier New` throughout.

## Component Architecture

1. `TopBar.tsx`: Geometric logo mark, `STUDIONORTH` wordmark, top menu headers, working Undo/Redo buttons (with disabled logic), and primary `Export` button.
2. `LeftToolbar.tsx`: `52px` fixed-width column with outline icons, accent blue active state, and hover tooltips (`Crop (C)`, `Select (V)`, etc.). Supports global keyboard hotkeys (`V`, `C`, `A`, `F`, `T`, `L`, `Ctrl+Z`, `Ctrl+Y`).
3. `CenterCanvas.tsx`: Deep recessed canvas well (`#0a0a0c`).
   - **Empty State**: Dashed box with centered `+` icon, bold "No image loaded", drag/drop & click-to-upload targets.
   - **Compare Mode**: Top toggle switch enabling a draggable `Before` / `After` split slider (clamped 4%–96%) with circular grip handle and corner labels.
4. `FilterPresetsStrip.tsx`: Horizontal scrollable preset strip (`Original`, `Vintage`, `Cool`, `Mono`, `Warm`, `Dramatic`, `Cyber`) with accent blue selection ring.
5. `RightPanel.tsx`: `210px` contextual panel:
   - **Adjustments View**: Live sliders (`Brightness`, `Contrast`, `Saturation`, `Exposure`) with numeric value readouts in accent blue and custom range tracks.
   - **Layers View**: Layer stack items with visibility toggles.
6. `BottomBar.tsx`: Zoom scale controls (`-`, `%`, `+`), filename readout, and `SN` accent avatar circle.

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env

# 3. Run client + server in dev mode
npm run dev:client   # → http://localhost:3000 (or 3001 if port in use)
npm run dev:server   # → http://localhost:4000
```

## Development Phases

- [x] Phase 0 — Project setup
- [x] Phase 1 — Image upload + full-screen editor shell redesign
- [ ] Phase 2 — Core adjustments (brightness, contrast, etc.)
- [ ] Phase 3 — Crop + transform
- [ ] Phase 4 — Filters
- [ ] Phase 5 — Undo/redo + history
- [ ] Phase 6 — Export
- [ ] Phase 7 — Auth
- [ ] Phase 8 — Save/load projects
- [ ] Phase 9 — Gallery/dashboard
- [ ] Phase 10 — Polish
