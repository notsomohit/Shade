"use client";

import { useState, useCallback } from "react";
import { SolidCanvasConfig } from "@/types/editor";

interface NewCanvasDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (config: SolidCanvasConfig) => void;
}

const SIZE_PRESETS = [
  { id: "1:1", name: "Square 1:1", width: 1080, height: 1080 },
  { id: "4:5", name: "Portrait 4:5", width: 1080, height: 1350 },
  { id: "9:16", name: "Story 9:16", width: 1080, height: 1920 },
  { id: "16:9", name: "Landscape 16:9", width: 1920, height: 1080 },
  { id: "A4", name: "A4 Portrait", width: 2480, height: 3508 },
  { id: "custom", name: "Custom", width: 1200, height: 900 },
];

const COLOR_PRESETS = [
  { name: "White", hex: "#ffffff" },
  { name: "Black", hex: "#000000" },
  { name: "Midnight Blue", hex: "#0b0d12" },
  { name: "Navy", hex: "#1e2d4a" },
  { name: "Charcoal", hex: "#2d2d2d" },
  { name: "Slate", hex: "#475569" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Coral", hex: "#FF6347" },
  { name: "Gold", hex: "#FFD700" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Royal Blue", hex: "#4169E1" },
  { name: "Purple", hex: "#7c3aed" },
  { name: "Hot Pink", hex: "#FF69B4" },
  { name: "Turquoise", hex: "#40E0D0" },
  { name: "Sky Blue", hex: "#87CEEB" },
  { name: "Lavender", hex: "#E6E6FA" },
];

export default function NewCanvasDialog({ isOpen, onClose, onCreate }: NewCanvasDialogProps) {
  const [color, setColor] = useState("#1e2d4a");
  const [selectedPreset, setSelectedPreset] = useState("1:1");
  const [width, setWidth] = useState(1080);
  const [height, setHeight] = useState(1080);
  const [tooltip, setTooltip] = useState<string | null>(null);

  const selectSizePreset = useCallback((preset: typeof SIZE_PRESETS[0]) => {
    setSelectedPreset(preset.id);
    setWidth(preset.width);
    setHeight(preset.height);
  }, []);

  const handleCreate = useCallback(() => {
    const w = Math.max(100, Math.min(8000, width));
    const h = Math.max(100, Math.min(8000, height));
    onCreate({ color, width: w, height: h });
    onClose();
  }, [color, width, height, onCreate, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#10131a] border border-[#1e2330] rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2330]">
          <span className="text-sm font-bold text-[#e6e8ee] tracking-wide">New Canvas</span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded text-[#8b93a7] hover:text-[#e6e8ee] hover:bg-[#161a23] transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Canvas Size Presets */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8b93a7]">Canvas Size</span>
            <div className="grid grid-cols-3 gap-1.5">
              {SIZE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => selectSizePreset(preset)}
                  className={`px-2 py-1.5 text-[11px] rounded border text-center transition-all cursor-pointer ${
                    selectedPreset === preset.id
                      ? "bg-[#2f7cf6]/20 border-[#2f7cf6]/60 text-[#2f7cf6] font-semibold"
                      : "bg-[#161a23] border-[#1e2330] text-[#8b93a7] hover:text-[#e6e8ee] hover:border-[#262c3d]"
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Width/Height */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-[#8b93a7]">Width (px)</label>
              <input
                type="number"
                min={100}
                max={8000}
                value={width}
                onChange={(e) => {
                  setWidth(Number(e.target.value));
                  setSelectedPreset("custom");
                }}
                className="w-full px-3 py-1.5 bg-[#161a23] border border-[#1e2330] rounded text-xs text-[#e6e8ee] focus:outline-none focus:border-[#2f7cf6] font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-[#8b93a7]">Height (px)</label>
              <input
                type="number"
                min={100}
                max={8000}
                value={height}
                onChange={(e) => {
                  setHeight(Number(e.target.value));
                  setSelectedPreset("custom");
                }}
                className="w-full px-3 py-1.5 bg-[#161a23] border border-[#1e2330] rounded text-xs text-[#e6e8ee] focus:outline-none focus:border-[#2f7cf6] font-mono"
              />
            </div>
          </div>

          {/* Background Color */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8b93a7]">Background Color</span>
            {/* Color Swatches */}
            <div className="flex flex-wrap gap-1.5">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setColor(c.hex)}
                  onMouseEnter={() => setTooltip(c.name)}
                  onMouseLeave={() => setTooltip(null)}
                  title={c.name}
                  className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer relative ${
                    color === c.hex ? "border-[#2f7cf6] scale-110 shadow-md" : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
            {tooltip && (
              <span className="text-[10px] text-[#8b93a7] font-mono">{tooltip}</span>
            )}
            {/* Custom Color Picker */}
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-8 p-0.5 bg-[#161a23] border border-[#1e2330] rounded cursor-pointer shrink-0"
                title="Custom color"
              />
              <div
                className="flex-1 h-8 rounded border border-[#1e2330] flex items-center px-2 font-mono text-xs text-[#e6e8ee] select-text"
                style={{ backgroundColor: color }}
              >
                <span className={color.toLowerCase() === "#ffffff" || parseInt(color.slice(1), 16) > 0xaaaaaa ? "text-black" : "text-white"}>
                  {color.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8b93a7]">Preview</span>
            <div className="h-16 rounded border border-[#1e2330] flex items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: color }}>
              <span className={`text-[10px] font-mono font-bold opacity-50 ${parseInt(color.slice(1), 16) > 0x888888 ? "text-black" : "text-white"}`}>
                {width} × {height}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-[#161a23] border border-[#1e2330] rounded text-xs text-[#8b93a7] hover:text-[#e6e8ee] hover:border-[#262c3d] transition-colors cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="flex-1 py-2 bg-[#2f7cf6] hover:bg-[#256ee0] rounded text-xs text-white font-semibold transition-colors cursor-pointer shadow-md"
            >
              Create Canvas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
