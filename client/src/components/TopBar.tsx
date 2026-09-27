"use client";

import { memo } from "react";
import { GridMode } from "@/types/editor";

interface TopBarProps {
  hasImage?: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  compareMode?: boolean;
  onToggleCompare?: () => void;
  gridMode: GridMode;
  onToggleGrid?: () => void;
  onChangeGridMode?: (mode: GridMode) => void;
  onExport: () => void;
  onFileSelect?: (file: File) => void;
}

const TopBar = memo(function TopBar({
  hasImage,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  compareMode,
  onToggleCompare,
  gridMode,
  onToggleGrid,
  onChangeGridMode,
  onExport,
  onFileSelect,
}: TopBarProps) {
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleCycleGrid = () => {
    if (onToggleGrid) {
      onToggleGrid();
    } else if (onChangeGridMode) {
      if (gridMode === "none") onChangeGridMode("thirds");
      else if (gridMode === "thirds") onChangeGridMode("grid");
      else onChangeGridMode("none");
    }
  };

  const getGridLabel = () => {
    switch (gridMode) {
      case "grid":
        return "GRID: 8×8";
      case "thirds":
        return "GRID: THIRDS";
      case "none":
      default:
        return "GRID: OFF";
    }
  };

  return (
    <header className="h-10 px-3 flex items-center justify-between border-b border-[#26272b] bg-[#131418] text-xs font-mono text-[#f0f0ec] shrink-0 select-none">
      {/* Left: Branding & Open File */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 group cursor-default">
          {/* North Star Aperture Emblem */}
          <div className="w-6 h-6 flex items-center justify-center bg-gradient-to-br from-[#1c2333] via-[#111827] to-[#0b0f19] border border-[#38bdf8]/40 rounded-md shadow-[0_0_12px_rgba(56,189,248,0.2)] group-hover:border-[#38bdf8] group-hover:shadow-[0_0_16px_rgba(56,189,248,0.4)] transition-all duration-300">
            <svg
              className="w-3.5 h-3.5 text-[#38bdf8]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              {/* Central North Star / Compass Diamond */}
              <path d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z" fill="url(#northGrad)" />
              {/* Inner Optical Core */}
              <circle cx="12" cy="12" r="2.2" fill="#0b0f19" stroke="#38bdf8" strokeWidth="1.2" />
              <defs>
                <linearGradient id="northGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#38bdf8" />
                  <stop offset="0.5" stopColor="#60a5fa" />
                  <stop offset="1" stopColor="#818cf8" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* StudioNorth Wordmark */}
          <div className="flex items-center gap-1">
            <span className="font-extrabold tracking-wider text-[#f0f0ec] text-xs">
              STUDIO
            </span>
            <span className="font-black tracking-widest text-xs bg-gradient-to-r from-[#38bdf8] via-[#60a5fa] to-[#818cf8] bg-clip-text text-transparent">
              NORTH
            </span>
          </div>

          {/* Pro Edition Tag */}
          <span className="text-[9px] px-1.5 py-0.5 bg-[#38bdf8]/10 text-[#38bdf8] rounded border border-[#38bdf8]/25 font-bold tracking-widest">
            PRO
          </span>
        </div>

        {/* Open Photo Button */}
        <label className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-[#9a9d9a] hover:text-[#f0f0ec] bg-[#18191e] hover:bg-[#26272b] border border-[#26272b] hover:border-[#38bdf8]/40 rounded cursor-pointer transition-colors shadow-sm">
          <svg className="w-3.5 h-3.5 text-[#38bdf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>Open Photo</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>

      {/* Right: Compare mode, Grid, History controls & Export */}
      <div className="flex items-center gap-3">
        {/* Before / After Compare Slider Toggle */}
        {hasImage && onToggleCompare && (
          <button
            onClick={onToggleCompare}
            className={`
              px-2.5 py-1 text-[11px] rounded border transition-colors cursor-pointer flex items-center gap-1.5
              ${
                compareMode
                  ? "bg-[#4b9fef] text-black border-[#4b9fef] font-bold shadow-sm"
                  : "bg-[#18191e] border-[#26272b] text-[#9a9d9a] hover:text-[#f0f0ec]"
              }
            `}
            title="Split Before / After compare slider"
          >
            ↔ Compare
          </button>
        )}

        {/* Grid Mode Guide Overlay Toggle */}
        <button
          onClick={handleCycleGrid}
          className={`
            px-2.5 py-1 text-[10px] font-mono rounded border transition-colors cursor-pointer
            ${
              gridMode !== "none"
                ? "bg-[#4b9fef]/15 text-[#4b9fef] border-[#4b9fef]/40"
                : "bg-[#18191e] text-[#9a9d9a] border-[#26272b] hover:text-[#f0f0ec]"
            }
          `}
          title="Toggle Grid / Rule of Thirds"
        >
          {getGridLabel()}
        </button>

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 bg-[#18191e] border border-[#26272b] rounded p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="w-6 h-6 flex items-center justify-center rounded text-[#9a9d9a] hover:text-[#f0f0ec] hover:bg-[#26272b] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
            title="Undo (Ctrl+Z)"
          >
            ↶
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="w-6 h-6 flex items-center justify-center rounded text-[#9a9d9a] hover:text-[#f0f0ec] hover:bg-[#26272b] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
            title="Redo (Ctrl+Shift+Z)"
          >
            ↷
          </button>
        </div>

        {/* Export Button */}
        <button
          onClick={onExport}
          className="h-7 px-3.5 bg-[#4b9fef] hover:bg-[#3b8fe0] text-black font-bold text-xs rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          Export
        </button>
      </div>
    </header>
  );
});

export default TopBar;
