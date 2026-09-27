"use client";

import { memo } from "react";

interface ShortcutsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: "V", desc: "Select / Move Tool" },
  { key: "S", desc: "Selective Tool (Snapseed control points)" },
  { key: "K", desc: "RGB Tone Curves" },
  { key: "A", desc: "Tune Image (WB, Structure, Vignette)" },
  { key: "C", desc: "Crop & Straighten" },
  { key: "F", desc: "Looks & Filters Strip" },
  { key: "T", desc: "Text Overlay Tool" },
  { key: "L", desc: "Layers Panel" },
  { key: "E", desc: "Export Settings" },
  { key: "Ctrl + Z", desc: "Undo last edit" },
  { key: "Ctrl + Shift + Z", desc: "Redo last edit" },
  { key: "Ctrl + E", desc: "Quick Export download" },
  { key: "0", desc: "Zoom to Fit screen" },
  { key: "1", desc: "Zoom 100% (1:1 actual pixels)" },
  { key: "+ / -", desc: "Zoom in / out" },
  { key: "?", desc: "Toggle this shortcut cheat sheet" },
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
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 font-mono select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#131418] border border-[#26272b] rounded-xl shadow-2xl p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between border-b border-[#26272b] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#f0f0ec]">KEYBOARD SHORTCUTS</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#4b9fef]/15 text-[#4b9fef] border border-[#4b9fef]/30 font-bold">
              PRO EDITING
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#9a9d9a] hover:text-[#f0f0ec] text-sm p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {SHORTCUTS.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between p-2 rounded bg-[#18191e] border border-[#26272b]"
            >
              <span className="text-xs text-[#9a9d9a] truncate mr-2">{s.desc}</span>
              <kbd className="px-1.5 py-0.5 text-[11px] font-bold bg-[#26272b] text-[#4b9fef] rounded border border-white/10 shrink-0">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="border-t border-[#26272b] pt-3 text-center">
          <span className="text-[11px] text-[#9a9d9a]">
            Press <kbd className="text-[#f0f0ec] font-bold">Esc</kbd> or click outside to dismiss
          </span>
        </div>
      </div>
    </div>
  );
});

export default ShortcutsOverlay;
