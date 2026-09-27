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
    <footer className="h-10 px-4 flex items-center justify-between border-t border-[#26272b] bg-[#131418] text-xs font-mono text-[#9a9d9a] shrink-0 select-none">
      {/* Left: Zoom controls */}
      <div className="flex items-center gap-3">
        <span className="text-[#9a9d9a] font-mono text-xs font-semibold">ZOOM:</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onZoomOut}
            disabled={zoom <= 25}
            className="w-6 h-6 flex items-center justify-center border border-[#26272b] rounded hover:text-[#f0f0ec] hover:bg-[#26272b]/60 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors text-sm font-bold"
            title="Zoom Out (-)"
          >
            −
          </button>
          <button
            onClick={onResetZoom}
            className="hover:text-[#4b9fef] cursor-pointer min-w-[44px] text-center font-bold text-xs"
            title="Reset to 100% (1)"
          >
            {zoom}%
          </button>
          <button
            onClick={onZoomIn}
            disabled={zoom >= 400}
            className="w-6 h-6 flex items-center justify-center border border-[#26272b] rounded hover:text-[#f0f0ec] hover:bg-[#26272b]/60 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors text-sm font-bold"
            title="Zoom In (+)"
          >
            +
          </button>
        </div>

        {/* Quick Zoom Fit and 1:1 shortcuts */}
        <div className="flex items-center gap-1 pl-2 border-l border-[#26272b]">
          <button
            onClick={onZoomFit}
            className="px-1.5 py-0.5 text-[10px] rounded bg-[#18191e] border border-[#26272b] hover:border-[#4b9fef] hover:text-[#f0f0ec] cursor-pointer transition-colors"
            title="Fit to Screen (0)"
          >
            FIT
          </button>
          <button
            onClick={onResetZoom}
            className="px-1.5 py-0.5 text-[10px] rounded bg-[#18191e] border border-[#26272b] hover:border-[#4b9fef] hover:text-[#f0f0ec] cursor-pointer transition-colors"
            title="Actual Pixels 100% (1)"
          >
            1:1
          </button>
        </div>
      </div>

      {/* Center: Processing status spinner / notification */}
      {isProcessing && (
        <div className="flex items-center gap-2 text-[11px] text-[#4b9fef] animate-pulse">
          <div className="w-2.5 h-2.5 rounded-full border-2 border-[#4b9fef] border-t-transparent animate-spin" />
          <span>Processing pipeline...</span>
        </div>
      )}

      {/* Right: Metadata info */}
      <div className="flex items-center gap-4 text-[#9a9d9a]">
        {imageData ? (
          <>
            <span className="truncate max-w-[180px]" title={filename}>
              {filename}
            </span>
            <span className="text-[#26272b]">|</span>
            <span>
              {imageData.width} × {imageData.height} px
            </span>
            <span className="text-[#26272b]">|</span>
            <span>{imageData.aspectRatio.toFixed(2)}:1</span>
          </>
        ) : (
          <span>No image loaded</span>
        )}
      </div>
    </footer>
  );
});

export default BottomBar;
