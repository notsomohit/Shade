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
  const menus = ["File", "Edit", "Image", "Layer", "Filter"];

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
      {/* Left: Branding & Menu Row */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center bg-[#4b9fef]/10 border border-[#4b9fef]/40 rounded-sm">
            <svg
              className="w-3 h-3 text-[#4b9fef]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v18m9-9H3m14-5l-5-5-5 5m10 10l-5 5-5-5"
              />
            </svg>
          </div>
          <span className="font-bold tracking-wider text-[#f0f0ec] text-xs">
            STUDIONORTH
          </span>
          <span className="text-[9px] px-1.5 py-0.2 bg-[#4b9fef]/10 text-[#4b9fef] rounded border border-[#4b9fef]/20 font-bold">
            PRO
          </span>
        </div>

        <nav className="flex items-center gap-4 text-[#9a9d9a] text-[11px]">
          {menus.map((menu) => (
            <div key={menu} className="relative">
              {menu === "File" ? (
                <label className="hover:text-[#f0f0ec] cursor-pointer transition-colors">
                  {menu}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
              ) : (
                <button className="hover:text-[#f0f0ec] cursor-pointer transition-colors">
                  {menu}
                </button>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Right: Compare mode, Grid, History controls & Export */}
      <div className="flex items-center gap-3">
        {/* Before / After Compare Slider Toggle */}
        {hasImage && onToggleCompare && (
          <button
            onClick={onToggleCompare}
            className={`
              px-2 py-0.5 text-[11px] rounded border transition-colors cursor-pointer flex items-center gap-1
              ${
                compareMode
                  ? "bg-[#4b9fef] text-black border-[#4b9fef] font-bold"
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
            px-2 py-0.5 text-[10px] font-mono rounded border transition-colors cursor-pointer
            ${
              gridMode !== "none"
                ? "bg-[#4b9fef]/15 text-[#4b9fef] border-[#4b9fef]/40"
                : "bg-transparent text-[#9a9d9a] border-[#26272b] hover:text-[#f0f0ec]"
            }
          `}
          title="Toggle Grid / Rule of Thirds"
        >
          {getGridLabel()}
        </button>

        {/* Undo / Redo */}
        <div className="flex items-center gap-1 bg-[#18191e] border border-[#26272b] rounded p-0.5">
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
          className="h-7 px-3 bg-[#4b9fef] hover:bg-[#3b8fe0] text-black font-bold text-xs rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
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
