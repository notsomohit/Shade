# StudioNorth

A browser-based photo editing app with non-destructive adjustments, LUT filters, edit history undo/redo, export controls, dynamic aspect ratio, freely draggable & resizable text overlays with categorized fonts, high-visibility grid guides, and layer stacking reordering.

## Tech Stack

- **Frontend:** Next.js 16 (React 19, App Router, Tailwind CSS v4)
- **Backend:** Node.js / Express with TypeScript
- **Canvas Engine:** Client-side HTML5 Canvas pixel & vector manipulation pipeline

## Complete Feature Matrix (Phases 0–6 Complete)

1. **Phase 4 — Preset Filters & Color Grading LUTs**:
   - Aesthetic filter preview cards (`NATURAL`, `VNTG`, `COOL`, `MONO`, `WARM`, `DRAMA`, `CYBER`) with micro badges and active glowing rings.
   - Intensity slider (0–100%) to blend LUT filter with image adjustments.
2. **Phase 5 — Complete Undo / Redo Edit History Stack**:
   - Full history tracking for all adjustments, filter preset changes, text additions, and transforms.
   - `Ctrl+Z` (Undo) and `Ctrl+Y` / `Ctrl+Shift+Z` (Redo) with active disabled button states.
3. **Phase 6 — Full Resolution Export Engine**:
   - Download exports in `PNG`, `JPEG`, or `WebP` formats.
   - Quality slider (10% to 100%) for lossy formats.
4. **Interactive Text Layer Resizing & Categorized Fonts**:
   - **Corner Anchor Resizing**: Drag any of the 4 corner handles (`top-left`, `top-right`, `bottom-left`, `bottom-right`) on active text selection box to resize font size live (12px to 160px).
   - **Categorized Fonts**: Standard, Design, Artsy, and Display categories.
5. **Layer Management & Deletion**:
   - Red trash icon on layer rows + `Delete` / `Backspace` key shortcut to delete selected layers.
   - Reorder layers via drag & drop or ▲ / ▼ buttons (top of list = rendered on top).
6. **High-Visibility Canvas Grid Guides**:
   - High contrast guide lines with subtle drop shadows: `GRID: OFF` ➔ `GRID: 8×8` ➔ `GRID: THIRDS`.

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
- [x] Phase 4 — Preset LUT filters & aesthetic filter cards
- [x] Phase 5 — Undo/redo & edit history stack
- [x] Phase 6 — Full resolution PNG/JPEG/WebP export engine
- [ ] Phase 7 — Auth
- [ ] Phase 8 — Save/load projects
- [ ] Phase 9 — Gallery/dashboard
- [ ] Phase 10 — Polish
