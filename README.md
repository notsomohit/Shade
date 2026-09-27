# StudioNorth

A browser-based photo editing app with non-destructive adjustments, filters, crop tools, and project persistence.

## Tech Stack

- **Frontend:** Next.js 16 (React 19, App Router, Tailwind CSS v4)
- **Backend:** Node.js / Express with TypeScript
- **Canvas:** HTML5 Canvas for client-side image manipulation

## Design & Aesthetics

- **Single Full-Screen Editor:** No landing pages or separate routes. Lands directly into the editor UI shell at `/`.
- **Dark Technical Theme:** Background `#0e0f12` / `#141519`, borders `#3a3d44`, primary text `#e8e8e2`, secondary text `#8f938f`.
- **Typography:** Pure monospace typography throughout.
- **Flat Layout:** Hairline 1px borders, no shadows or gradients.
- **Modular Layout:**
  - `TopBar`: Branding + file/edit menu bar.
  - `LeftToolbar`: 52px fixed-width tool selection icons.
  - `CenterCanvas`: Recessed canvas workspace (`#07080a`) with placeholder drop box.
  - `RightPanel`: Contextual panel switching based on tool selection (Layers, Adjustments, Filters, Crop).
  - `BottomBar`: Zoom controls (+/-) and canvas resolution readouts.

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
- [x] Phase 1 — Image upload + canvas shell redesign
- [ ] Phase 2 — Core adjustments (brightness, contrast, etc.)
- [ ] Phase 3 — Crop + transform
- [ ] Phase 4 — Filters
- [ ] Phase 5 — Undo/redo + history
- [ ] Phase 6 — Export
- [ ] Phase 7 — Auth
- [ ] Phase 8 — Save/load projects
- [ ] Phase 9 — Gallery/dashboard
- [ ] Phase 10 — Polish
