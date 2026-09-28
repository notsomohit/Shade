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
    <footer className="h-9 px-3.5 flex items-center justify-between border-t border-[#222227] bg-[#121215] text-xs text-[#84848d] shrink-0 select-none">
      {/* Left: Zoom controls */}
      <div className="flex items-center gap-2.5">
        <span className="text-[10px] uppercase font-semibold tracking-wider text-[#5c5c66]">
          Zoom
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onZoomOut}
            disabled={zoom <= 25}
            className="w-5 h-5 flex items-center justify-center border border-[#222227] bg-[#16161a] rounded hover:text-[#ededed] hover:border-[#2d2d34] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors text-xs font-bold"
            title="Zoom Out (-)"
          >
            −
          </button>
          <button
            onClick={onResetZoom}
            className="hover:text-[#3b82f6] cursor-pointer min-w-[38px] text-center font-mono font-medium text-xs text-[#ededed] transition-colors"
            title="Reset to 100% (1)"
          >
            {zoom}%
          </button>
          <button
            onClick={onZoomIn}
            disabled={zoom >= 400}
            className="w-5 h-5 flex items-center justify-center border border-[#222227] bg-[#16161a] rounded hover:text-[#ededed] hover:border-[#2d2d34] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors text-xs font-bold"
            title="Zoom In (+)"
          >
            +
          </button>
        </div>

        {/* Quick Zoom Fit and 1:1 shortcuts */}
        <div className="flex items-center gap-1 pl-2 border-l border-[#222227]">
          <button
            onClick={onZoomFit}
            className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#16161a] border border-[#222227] hover:border-[#3b82f6] hover:text-[#ededed] cursor-pointer transition-colors"
            title="Fit to Screen (0)"
          >
            FIT
          </button>
          <button
            onClick={onResetZoom}
            className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#16161a] border border-[#222227] hover:border-[#3b82f6] hover:text-[#ededed] cursor-pointer transition-colors"
            title="Actual Pixels 100% (1)"
          >
            1:1
          </button>
        </div>
      </div>

      {/* Center: Processing status spinner */}
      {isProcessing && (
        <div className="flex items-center gap-1.5 text-[11px] text-[#3b82f6] animate-pulse">
          <div className="w-2.5 h-2.5 rounded-full border-2 border-[#3b82f6] border-t-transparent animate-spin" />
          <span>Processing...</span>
        </div>
      )}

      {/* Right: Metadata info */}
      <div className="flex items-center gap-3 text-[11px] text-[#84848d]">
        {imageData ? (
          <>
            <span className="truncate max-w-[180px] text-[#ededed]" title={filename}>
              {filename}
            </span>
            <span className="text-[#222227]">·</span>
            <span className="font-mono">
              {imageData.width} × {imageData.height} px
            </span>
            <span className="text-[#222227]">·</span>
            <span className="font-mono">{imageData.aspectRatio.toFixed(2)}:1</span>
          </>
        ) : (
          <span className="text-[#5c5c66]">No image loaded</span>
        )}
      </div>
    </footer>
  );
});

export default BottomBar;
