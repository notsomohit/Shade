# StudioNorth

A browser-based photo editing app with non-destructive adjustments, filters, crop tools, and project persistence.

## Tech Stack

- **Frontend:** Next.js 16 (React 19, App Router, Tailwind CSS v4)
- **Backend:** Node.js / Express with TypeScript
- **Canvas:** HTML5 Canvas for client-side image manipulation

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env

# 3. Run both client + server in dev mode
npm run dev:client   # → http://localhost:3000 (or 3001 if port in use)
npm run dev:server   # → http://localhost:4000
```

## Project Structure

```
studioNorth/
├── client/src/
│   ├── app/
│   │   ├── editor/          # Editor page route (/editor)
│   │   ├── globals.css      # Styling & theme
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home landing page
│   ├── components/
│   │   ├── EditorCanvas.tsx # Canvas display & toolbar
│   │   └── ImageUploader.tsx# Drag-and-drop / file picker zone
│   └── hooks/
│       └── useCanvas.ts     # Canvas initialization & drawing hook
├── server/src/              # Express API backend
├── .env.example             # Environment template
├── .gitignore
├── package.json             # Root workspace config
└── README.md
```

## Development Phases

- [x] Phase 0 — Project setup
- [x] Phase 1 — Image upload + canvas render
- [ ] Phase 2 — Core adjustments (brightness, contrast, etc.)
- [ ] Phase 3 — Crop + transform
- [ ] Phase 4 — Filters
- [ ] Phase 5 — Undo/redo + history
- [ ] Phase 6 — Export
- [ ] Phase 7 — Auth
- [ ] Phase 8 — Save/load projects
- [ ] Phase 9 — Gallery/dashboard
- [ ] Phase 10 — Polish
