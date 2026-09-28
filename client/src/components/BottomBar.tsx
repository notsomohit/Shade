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
    <footer className="h-10 md:h-[52px] px-3.5 md:px-5 flex items-center justify-between border-t border-[var(--border)] bg-[var(--bg-panel)] text-xs text-[var(--text-muted)] shrink-0 select-none z-20">
      {/* Left: Zoom Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        <span className="text-[11px] uppercase font-semibold tracking-wider text-[var(--text-muted)] hidden sm:inline">
          Zoom:
        </span>
        
        <div className="flex items-center gap-1">
          <button
            onClick={onZoomOut}
            disabled={zoom <= 25}
            className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center border border-[var(--border)] bg-[var(--bg-elevated)] rounded hover:text-[var(--text)] hover:border-[var(--border-subtle)] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors text-xs font-bold shadow-xs"
            title="Zoom Out (-)"
          >
            −
          </button>
          
          <button
            onClick={onResetZoom}
            className="hover:text-[var(--accent)] cursor-pointer min-w-[40px] md:min-w-[46px] h-6 md:h-7 px-1 flex items-center justify-center border border-[var(--border)] bg-[var(--bg-elevated)] rounded font-mono font-medium text-xs text-[var(--text)] transition-colors shadow-xs"
            title="Reset to 100% (1)"
          >
            {zoom}%
          </button>
          
          <button
            onClick={onZoomIn}
            disabled={zoom >= 400}
            className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center border border-[var(--border)] bg-[var(--bg-elevated)] rounded hover:text-[var(--text)] hover:border-[var(--border-subtle)] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors text-xs font-bold shadow-xs"
            title="Zoom In (+)"
          >
            +
          </button>
        </div>

        {/* Fit and 1:1 Shortcuts */}
        <div className="flex items-center gap-1 pl-1.5 md:pl-2 border-l border-[var(--border)]">
          <button
            onClick={onZoomFit}
            className="px-2 py-1 md:px-2.5 md:py-1 text-[11px] font-mono rounded bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--accent)]/50 hover:text-[var(--text)] cursor-pointer transition-colors shadow-xs"
            title="Fit to Screen (0)"
          >
            Fit
          </button>
          <button
            onClick={onResetZoom}
            className="px-2 py-1 md:px-2.5 md:py-1 text-[11px] font-mono rounded bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--accent)]/50 hover:text-[var(--text)] cursor-pointer transition-colors shadow-xs"
            title="Actual Pixels 100% (1)"
          >
            1:1
          </button>
        </div>
      </div>

      {/* Center: Processing Spinner */}
      {isProcessing && (
        <div className="flex items-center gap-1.5 text-xs text-[var(--accent)] animate-pulse">
          <div className="w-3 h-3 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          <span className="font-medium hidden sm:inline">Processing...</span>
        </div>
      )}

      {/* Right: Metadata Info */}
      <div className="flex items-center gap-2 md:gap-3 text-xs text-[var(--text-muted)]">
        {imageData ? (
          <>
            <span className="truncate max-w-[120px] sm:max-w-[200px] text-[var(--text)] font-medium" title={filename}>
              {filename}
            </span>
            <span className="text-[var(--border)]">·</span>
            <span className="font-mono text-[11px]">
              {imageData.width} × {imageData.height}
            </span>
            <span className="text-[var(--border)] hidden sm:inline">·</span>
            <span className="font-mono text-[11px] hidden sm:inline">
              {imageData.aspectRatio.toFixed(2)}:1
            </span>
          </>
        ) : (
          <span className="text-[var(--text-muted)]">No image loaded</span>
        )}
      </div>
    </footer>
  );
});

export default BottomBar;
