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
        return "8×8";
      case "thirds":
        return "THIRDS";
      case "none":
      default:
        return "OFF";
    }
  };

  return (
    <header className="h-10 px-3.5 flex items-center justify-between border-b border-[#222227] bg-[#121215] text-xs text-[#ededed] shrink-0 select-none">
      {/* Left: Branding & Open File */}
      <div className="flex items-center gap-3">
        {/* SHADE Wordmark */}
        <div className="flex items-center gap-2 pr-2 border-r border-[#222227]">
          {/* Minimal Geometric Aperture Glyph */}
          <div className="w-5 h-5 flex items-center justify-center rounded bg-[#1a1a20] border border-[#2d2d36] text-[#ededed]">
            <svg className="w-3 h-3 text-[#3b82f6]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z" />
            </svg>
          </div>

          <span className="font-bold tracking-widest text-xs text-[#ededed]">
            SHADE
          </span>
        </div>

        {/* Open Photo Button */}
        <label className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-[#84848d] hover:text-[#ededed] bg-[#16161a] hover:bg-[#1e1e24] border border-[#222227] hover:border-[#2d2d34] rounded cursor-pointer transition-colors">
          <svg className="w-3.5 h-3.5 text-[#84848d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
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
      <div className="flex items-center gap-2">
        {/* Before / After Compare Slider Toggle */}
        {hasImage && onToggleCompare && (
          <button
            onClick={onToggleCompare}
            className={`
              px-2.5 py-1 text-[11px] rounded border transition-colors cursor-pointer flex items-center gap-1.5
              ${
                compareMode
                  ? "bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/40 font-semibold"
                  : "bg-[#16161a] border-[#222227] text-[#84848d] hover:text-[#ededed] hover:border-[#2d2d34]"
              }
            `}
            title="Split Before / After comparison slider"
          >
            <span className="text-[10px]">↔</span> Compare
          </button>
        )}

        {/* Grid Mode Toggle */}
        <button
          onClick={handleCycleGrid}
          className={`
            px-2.5 py-1 text-[11px] font-mono rounded border transition-colors cursor-pointer flex items-center gap-1
            ${
              gridMode !== "none"
                ? "bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/40 font-semibold"
                : "bg-[#16161a] text-[#84848d] border-[#222227] hover:text-[#ededed] hover:border-[#2d2d34]"
            }
          `}
          title="Cycle Grid Overlay (None / Thirds / 8×8)"
        >
          <span className="text-[10px] text-[#5c5c66]">GRID:</span>
          <span>{getGridLabel()}</span>
        </button>

        {/* Undo / Redo Group */}
        <div className="flex items-center bg-[#16161a] border border-[#222227] rounded p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="w-6 h-6 flex items-center justify-center rounded text-[#84848d] hover:text-[#ededed] hover:bg-[#1e1e24] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a5 5 0 015 5v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="w-6 h-6 flex items-center justify-center rounded text-[#84848d] hover:text-[#ededed] hover:bg-[#1e1e24] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
            title="Redo (Ctrl+Shift+Z)"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 10H11a5 5 0 00-5 5v2M21 10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>

        {/* Export Button */}
        <button
          onClick={onExport}
          className="h-7 px-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-xs rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm ml-1"
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
          <span>Export</span>
        </button>
      </div>
    </header>
  );
});

export default TopBar;
