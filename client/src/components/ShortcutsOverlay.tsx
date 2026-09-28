"use client";

import { memo } from "react";

interface ShortcutsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: "V", desc: "Select / Move Tool" },
  { key: "A", desc: "Tune Image (Light/Tone/Color/Detail)" },
  { key: "F", desc: "Presets / Stackable Looks" },
  { key: "S", desc: "Selective Control Points" },
  { key: "K", desc: "Tone Curves (RGB/Channels)" },
  { key: "C", desc: "Crop & Straighten" },
  { key: "T", desc: "Text Overlay" },
  { key: "L", desc: "Layers & Double Exposure" },
  { key: "B", desc: "Background Eraser" },
  { key: "E", desc: "Export Settings" },
  { key: "Ctrl + Z", desc: "Undo last edit" },
  { key: "Ctrl + Shift + Z", desc: "Redo last edit" },
  { key: "Ctrl + E", desc: "Quick Export download" },
  { key: "0", desc: "Zoom to Fit screen" },
  { key: "1", desc: "Zoom 100% (1:1 actual pixels)" },
  { key: "+ / -", desc: "Zoom in / out" },
  { key: "?", desc: "Toggle shortcut cheat sheet" },
  { key: "Esc", desc: "Close dialogs / deselect" },
];

const ShortcutsOverlay = memo(function ShortcutsOverlay({
  isOpen,
  onClose,
}: ShortcutsOverlayProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg shadow-2xl p-4 sm:p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-100"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-[var(--text)] uppercase">
              Keyboard Shortcuts
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30 font-bold">
              SHADE
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text)] text-xs p-1 cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
          {SHORTCUTS.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between p-2 rounded bg-[var(--bg-elevated)] border border-[var(--border)]"
            >
              <span className="text-[11px] text-[var(--text-muted)] truncate mr-2">{s.desc}</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-[var(--bg-app)] text-[var(--text)] rounded border border-[var(--border)] shrink-0">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--border)] pt-2.5 text-center">
          <span className="text-[11px] text-[var(--text-muted)]">
            Press <kbd className="text-[var(--text)] font-semibold">Esc</kbd> or click outside to dismiss
          </span>
        </div>
      </div>
    </div>
  );
});

export default ShortcutsOverlay;
