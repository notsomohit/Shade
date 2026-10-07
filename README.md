# SHADE

A clean, professional dark photo editor with non-destructive adjustments, tone curves, selective control points, presets, edit history undo/redo, export controls, dynamic aspect ratio, freely draggable & resizable text overlays with categorized fonts, grid guides, and layer stacking reordering.

> 🚧 **Work in progress.** SHADE is under active development. Features may change, break, or be rewritten as the project evolves. Feedback, bug reports, and contributions are very welcome.

## Tech Stack

- **Frontend:** Next.js 16 (React 19, App Router, Tailwind CSS v4)
- **Backend:** Node.js / Express with TypeScript
- **Canvas Engine:** Client-side HTML5 Canvas pixel & vector manipulation pipeline

## Current Features

### Core Editing
- **Adjustments:** Brightness, contrast, saturation, and exposure, applied non-destructively.
- **Crop & Transform:** Rotate 90°, flip horizontal/vertical, and a crop overlay with dynamic aspect ratio.

### Selective Points (Control Pins)
- Place control pins directly on the photo to target local adjustments instead of editing the whole image.
- Click anywhere on the photo, or use the `Add Pin` button, to drop a new pin.
- `Pins` toggle shows or hides the pins on the canvas while you work.
- Empty state in the panel guides you when no pins have been placed yet.

### Preset Filters & Color Grading
- Aesthetic filter preview cards (`NATURAL`, `VNTG`, `COOL`, `MONO`, `WARM`, `DRAMA`, `CYBER`) with micro badges and active glowing rings.
- Intensity slider (0–100%) to blend the LUT filter with image adjustments.

### Undo / Redo History
- Full history tracking for adjustments, filter preset changes, text additions, and transforms.
- `Ctrl+Z` to undo, `Ctrl+Y` / `Ctrl+Shift+Z` to redo, with disabled button states when there is nothing to step through.

### Export Engine
- Full-resolution downloads in `PNG`, `JPEG`, or `WebP`.
- Quality slider (10% to 100%) for lossy formats.
- Transparency is preserved when exporting to PNG.

### Text Layers
- **Corner anchor resizing:** Drag any of the 4 corner handles on the active text box to resize the font live (12px to 160px).
- **Categorized fonts:** Standard, Design, Artsy, and Display.
- Freely draggable and resizable overlays.

### Layer Management
- Delete via the red trash icon on layer rows, or the `Delete` / `Backspace` key.
- Reorder layers by drag & drop or with the ▲ / ▼ buttons (top of the list renders on top).

### Canvas Grid Guides
- High-contrast guide lines with subtle drop shadows, cycling through `GRID: OFF` ➔ `GRID: 8×8` ➔ `GRID: THIRDS`.

### Background Eraser (Chroma Key)
- Key out a flat, uniform background by colour with a colour picker, an in-canvas `Sample` eyedropper, and a `0–100%` tolerance slider.
- Non-destructive: matching pixels are made transparent in the existing pipeline, so `Ctrl+Z` / `Ctrl+Y` undo and redo it.
- Non-matching pixels keep their original colours, and a soft edge keeps cut-outs from looking jagged.
- A checkerboard shows through where pixels were removed.

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

## Roadmap / Future Updates

### Planned
- [ ] **Proper background remover:** Edge-aware, subject-based removal that works on complex backgrounds, not just flat colours.
- [ ] **Blur tools:** Gaussian, lens, and motion blur, plus a selective/brush blur.
- [ ] **Lasso tool:** Freehand and polygonal selections for targeted edits.
- [ ] **Multiple image layers:** Import, stack, transform, and blend several images in one project.
- [ ] **Masking:** Layer masks and brush-painted masks for non-destructive selective edits.
- [ ] **Better presets:** Higher-quality, more carefully tuned looks with real 3D LUT support.

### Ideas Under Consideration
- [ ] **Blend modes & per-layer opacity** (multiply, screen, overlay, etc.)
- [ ] **Healing / clone stamp** for removing blemishes and unwanted objects
- [ ] **Brush tools:** paint, erase, dodge & burn
- [ ] **Shapes & stickers** as vector layers
- [ ] **Selective color / HSL panel** and color grading wheels (shadows, midtones, highlights)
- [ ] **Sharpening, noise reduction, and grain**
- [ ] **Vignette, chromatic aberration, and glow effects**
- [ ] **Custom LUT import** (`.cube` files) and user-saved presets
- [ ] **Before/after comparison** slider and split view
- [ ] **Histogram & RGB parade** for accurate tonal feedback
- [ ] **Perspective correction** and free-angle straighten
- [ ] **Batch editing / sync settings** across multiple photos
- [ ] **Auth, save/load projects, and a gallery/dashboard**
- [ ] **Keyboard shortcut cheat sheet** and customizable hotkeys
- [ ] **Mobile & touch support**
- [ ] **Performance:** WebGL/WebGPU rendering and Web Workers for heavy filters
- [ ] **AI-assisted tools:** auto-enhance, smart selection, generative fill

Have an idea that isn't listed? Open an issue and let's talk about it.

## Contributing

Contributions are appreciated, whether it's a bug fix, a new feature, better docs, or just a suggestion.

1. **Fork** the repository and create a branch: `git checkout -b feature/your-feature`
2. **Make your changes** and keep commits focused and clearly described.
3. **Test locally** by running both the client and server and checking your change in the browser.
4. **Open a pull request** describing what you changed and why. Screenshots or short clips help for UI changes.

Not sure where to start? Pick something from the roadmap above, look for issues labelled `good first issue`, or open an issue to discuss an idea before you build it.

Please be respectful and constructive in issues and pull requests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
