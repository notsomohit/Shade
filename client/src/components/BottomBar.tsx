"use client";

import { memo } from "react";
import { ImageMetaData } from "@/types/editor";

interface BottomBarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onZoomFit: () => void;
  imageData: ImageMetaData | null;
  hasImage?: boolean;
  isProcessing: boolean;
}

const BottomBar = memo(function BottomBar({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onZoomFit,
  imageData,
  hasImage,
  isProcessing,
}: BottomBarProps) {
  const filename = imageData ? imageData.name : "untitled.png";

  return (
    <footer className="h-10 md:h-[50px] px-2 sm:px-4 md:px-5 flex items-center justify-between border-t border-[var(--border)] bg-[var(--bg-panel)] text-xs text-[var(--text-muted)] shrink-0 select-none z-20 w-full min-w-0 overflow-hidden">
      {/* Left: Zoom Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <span className="text-[11px] uppercase font-semibold tracking-wider text-[var(--text-muted)] hidden md:inline">
          Zoom:
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={onZoomOut}
            disabled={zoom <= 25}
            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center border border-[var(--border)] bg-[var(--bg-elevated)] rounded hover:text-[var(--text)] hover:border-[var(--border-subtle)] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors text-xs font-bold shadow-xs"
            title="Zoom Out (-)"
          >
            −
          </button>

          <button
            onClick={onResetZoom}
            className="hover:text-[var(--accent)] cursor-pointer min-w-[36px] sm:min-w-[44px] h-6 sm:h-7 px-1 flex items-center justify-center border border-[var(--border)] bg-[var(--bg-elevated)] rounded font-mono font-medium text-xs text-[var(--text)] transition-colors shadow-xs"
            title="Reset to 100% (1)"
          >
            {zoom}%
          </button>

          <button
            onClick={onZoomIn}
            disabled={zoom >= 400}
            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center border border-[var(--border)] bg-[var(--bg-elevated)] rounded hover:text-[var(--text)] hover:border-[var(--border-subtle)] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors text-xs font-bold shadow-xs"
            title="Zoom In (+)"
          >
            +
          </button>
        </div>

        {/* Fit and 1:1 Shortcuts */}
        <div className="flex items-center gap-1 pl-1 sm:pl-2 border-l border-[var(--border)]">
          <button
            onClick={onZoomFit}
            className="px-1.5 py-1 sm:px-2.5 sm:py-1 text-[11px] font-mono rounded bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--accent)]/50 hover:text-[var(--text)] cursor-pointer transition-colors shadow-xs"
            title="Fit to Screen (0)"
          >
            Fit
          </button>
          <button
            onClick={onResetZoom}
            className="px-1.5 py-1 sm:px-2.5 sm:py-1 text-[11px] font-mono rounded bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--accent)]/50 hover:text-[var(--text)] cursor-pointer transition-colors shadow-xs"
            title="Actual Pixels 100% (1)"
          >
            1:1
          </button>
        </div>
      </div>

      {/* Center: Processing Spinner */}
      {isProcessing && (
        <div className="flex items-center gap-1.5 text-xs text-[var(--accent)] animate-pulse shrink-0 px-2">
          <div className="w-2.5 h-2.5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          <span className="font-medium hidden sm:inline">Processing...</span>
        </div>
      )}

      {/* Right: Metadata Info */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 text-xs text-[var(--text-muted)] min-w-0 shrink truncate justify-end">
        {imageData ? (
          <>
            <span
              className="truncate max-w-[28vw] sm:max-w-[160px] md:max-w-[220px] text-[var(--text)] font-medium"
              title={filename}
            >
              {filename}
            </span>
            <span className="text-[var(--border)] hidden min-[480px]:inline">·</span>
            <span className="font-mono text-[11px] whitespace-nowrap hidden min-[480px]:inline">
              {imageData.width} × {imageData.height}
            </span>
            <span className="text-[var(--border)] hidden lg:inline">·</span>
            <span className="font-mono text-[11px] whitespace-nowrap hidden lg:inline">
              {imageData.aspectRatio.toFixed(2)}:1
            </span>
          </>
        ) : (
          <span className="text-[var(--text-muted)] truncate">No image loaded</span>
        )}
      </div>
    </footer>
  );
});

export default BottomBar;
