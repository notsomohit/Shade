"use client";

import { memo } from "react";

interface ShortcutsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: "V", desc: "Select / Move Tool" },
  { key: "S", desc: "Selective Control Points" },
  { key: "K", desc: "Tone Curves (RGB/Channels)" },
  { key: "A", desc: "Tune Image (Light/Tone/Color/Detail)" },
  { key: "C", desc: "Crop & Straighten" },
  { key: "F", desc: "Presets / Looks" },
  { key: "T", desc: "Text Overlay" },
  { key: "L", desc: "Layers & Double Exposure" },
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
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#121215] border border-[#222227] rounded-xl shadow-2xl p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-100"
      >
        <div className="flex items-center justify-between border-b border-[#222227] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-[#ededed]">KEYBOARD SHORTCUTS</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 font-medium">
              SHADE
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#84848d] hover:text-[#ededed] text-xs p-1 cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
          {SHORTCUTS.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between p-2 rounded bg-[#16161a] border border-[#222227]"
            >
              <span className="text-[11px] text-[#84848d] truncate mr-2">{s.desc}</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-[#1e1e24] text-[#ededed] rounded border border-white/10 shrink-0">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="border-t border-[#222227] pt-2.5 text-center">
          <span className="text-[11px] text-[#5c5c66]">
            Press <kbd className="text-[#ededed] font-medium">Esc</kbd> or click outside to dismiss
          </span>
        </div>
      </div>
    </div>
  );
});

export default ShortcutsOverlay;
