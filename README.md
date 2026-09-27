# StudioNorth

A browser-based photo editing app with non-destructive adjustments, filters, crop tools, dynamic aspect ratio, freely draggable text overlays, layer stacking reordering, and project persistence.

## Tech Stack

- **Frontend:** Next.js 16 (React 19, App Router, Tailwind CSS v4)
- **Backend:** Node.js / Express with TypeScript
- **Canvas Engine:** Client-side HTML5 Canvas pixel & vector manipulation pipeline

## Key Architecture & Features Built

1. **Dynamic Canvas Aspect Ratio**:
   - Canvas container dynamically sets `style={{ aspectRatio: `${naturalWidth} / ${naturalHeight}` }}`.
   - Constrained using `max-w-full max-h-full` so any portrait, landscape, or panoramic image renders at a sane on-screen scale without distortion.
   - Compare Slider (Before/After) inherits this exact dynamic ratio so layers align pixel-for-pixel.
   - 16:10 placeholder ratio maintained for empty state.
2. **Freely Draggable Text Layers**:
   - Text layers added via **Text (T)** tool can be freely dragged anywhere on the canvas viewport via mouse or touch (`mousedown`, `mousemove`, `mouseup`, `touchstart`, `touchmove`, `touchend`).
   - Position stored as normalized percentage `(x, y)` relative to canvas bounds so it scales cleanly with canvas zooming or resizing.
   - Active selected text layer displays a dashed bounding box with corner control handles.
   - Clicking outside deselects the text layer.
3. **Layer Stacking Order (Top of List = Rendered on Top)**:
   - Layers panel matches the Photoshop/Figma mental model: Top item in the panel list renders ABOVE all items below it.
   - Layers can be reordered via **Drag & Drop** or using **▲ / ▼** move buttons in the panel.
   - New text layers are inserted at the **TOP** of the stack (index 0) so they render immediately over background content.
   - Reordering layers changes z-index rendering sequence on canvas without resetting layer positions.

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
- [x] Phase 4 — Dynamic aspect ratio, draggable text layers & layer stacking order
- [ ] Phase 5 — Undo/redo + history
- [ ] Phase 6 — Export
- [ ] Phase 7 — Auth
- [ ] Phase 8 — Save/load projects
- [ ] Phase 9 — Gallery/dashboard
- [ ] Phase 10 — Polish
