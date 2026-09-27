"use client";

import { memo } from "react";
import { GridMode } from "@/types/editor";

interface TopBarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  gridMode: GridMode;
  onToggleGrid: () => void;
  onExport: () => void;
  onFileSelect: (file: File) => void;
}

const TopBar = memo(function TopBar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  gridMode,
  onToggleGrid,
  onExport,
  onFileSelect,
}: TopBarProps) {
  const menus = ["File", "Edit", "Image", "Layer", "Filter"];

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
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

      {/* Right: Grid toggle, History controls & Primary Export button */}
      <div className="flex items-center gap-4">
        {/* Grid Mode Guide Overlay Toggle */}
        <button
          onClick={onToggleGrid}
          title="Toggle Grid Guide Overlays"
          className={`
            px-2.5 py-1 rounded border text-[11px] font-mono transition-colors cursor-pointer font-semibold
            ${
              gridMode !== "none"
                ? "bg-[#4b9fef]/15 text-[#4b9fef] border-[#4b9fef]/40"
                : "bg-[#0e0f12] text-[#9a9d9a] border-[#26272b] hover:text-[#f0f0ec]"
            }
          `}
        >
          {getGridLabel()}
        </button>

        {/* Undo / Redo buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`
              w-7 h-7 flex items-center justify-center rounded transition-colors
              ${
                canUndo
                  ? "text-[#f0f0ec] hover:text-[#4b9fef] hover:bg-[#26272b] cursor-pointer"
                  : "text-[#9a9d9a]/30 cursor-not-allowed"
              }
            `}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
              />
            </svg>
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className={`
              w-7 h-7 flex items-center justify-center rounded transition-colors
              ${
                canRedo
                  ? "text-[#f0f0ec] hover:text-[#4b9fef] hover:bg-[#26272b] cursor-pointer"
                  : "text-[#9a9d9a]/30 cursor-not-allowed"
              }
            `}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"
              />
            </svg>
          </button>
        </div>

        {/* Primary Export Button */}
        <button
          onClick={onExport}
          className="
            flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium font-mono
            bg-[#4b9fef] hover:bg-[#3b8fd9] text-[#0e0f12] font-semibold
            transition-colors duration-150 cursor-pointer shadow-sm
          "
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
