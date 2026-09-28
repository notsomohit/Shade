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

  const isGridActive = gridMode !== "none";

  return (
    <header className="h-[52px] md:h-[60px] px-3 md:px-5 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-panel)] text-xs text-[var(--text)] shrink-0 select-none z-30 pt-[env(safe-area-inset-top)]">
      {/* Left: Star Logo + SHADE Wordmark + PRO Badge + Open Photo */}
      <div className="flex items-center gap-2 md:gap-3.5">
        <div className="flex items-center gap-2 pr-2 md:pr-3 border-r border-[var(--border)]">
          {/* Blue four-point star in a dark circle */}
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center shrink-0 shadow-inner">
            <svg
              className="w-3.5 h-3.5 md:w-4 md:h-4 text-[var(--accent)]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
            </svg>
          </div>

          <span className="font-bold tracking-[0.2em] text-xs md:text-sm text-[var(--text)] uppercase font-mono">
            SHADE
          </span>

          <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-bold tracking-wider rounded bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30 select-none">
            PRO
          </span>
        </div>

        {/* Open Photo Button */}
        <label className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3.5 py-1.5 text-xs text-[var(--text)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-app)] border border-[var(--border)] hover:border-[var(--accent)]/50 rounded cursor-pointer transition-all duration-150 shadow-sm">
          <svg
            className="w-4 h-4 text-[var(--text-muted)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
            />
          </svg>
          <span className="font-medium hidden sm:inline">Open Photo</span>
          <span className="font-medium sm:hidden">Open</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>

      {/* Right: Compare (if loaded), Grid Toggle, Undo/Redo, and Solid Blue Export */}
      <div className="flex items-center gap-1.5 md:gap-3">
        {/* Split Compare Mode Toggle */}
        {hasImage && onToggleCompare && (
          <button
            onClick={onToggleCompare}
            className={`
              px-2.5 py-1.5 text-xs rounded border transition-colors cursor-pointer hidden sm:flex items-center gap-1.5
              ${
                compareMode
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/50 font-semibold"
                  : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
              }
            `}
            title="Toggle Before / After Split View"
          >
            <span className="text-[11px]">↔</span>
            <span>Compare</span>
          </button>
        )}

        {/* Grid Overlay Toggle */}
        <button
          onClick={handleCycleGrid}
          className={`
            px-2.5 py-1.5 text-xs font-mono rounded border transition-colors cursor-pointer flex items-center gap-1.5
            ${
              isGridActive
                ? "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/50 font-semibold"
                : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)]"
            }
          `}
          title={`Cycle Grid Overlay (Current: ${gridMode.toUpperCase()})`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          <span className="hidden md:inline">Grid:</span>
          <span>{gridMode === "none" ? "OFF" : gridMode === "thirds" ? "3×3" : "8×8"}</span>
        </button>

        {/* Separator */}
        <div className="w-[1px] h-5 bg-[var(--border)] mx-0.5 hidden sm:block" />

        {/* Undo / Redo Group */}
        <div className="flex items-center bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-app)] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 10h10a5 5 0 015 5v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-app)] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
            title="Redo (Ctrl+Shift+Z)"
          >
            <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M21 10H11a5 5 0 00-5 5v2M21 10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>

        {/* Separator */}
        <div className="w-[1px] h-5 bg-[var(--border)] mx-0.5 hidden sm:block" />

        {/* Solid Blue Export Button */}
        <button
          onClick={onExport}
          className="h-8 md:h-9 px-3.5 md:px-4 bg-[var(--accent)] hover:bg-[#256ee0] text-white font-semibold text-xs rounded transition-all duration-150 flex items-center gap-1.5 md:gap-2 cursor-pointer shadow-md active:scale-98 shrink-0"
        >
          <svg
            className="w-4 h-4"
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
          <span className="tracking-wide">Export</span>
        </button>
      </div>
    </header>
  );
});

export default TopBar;
