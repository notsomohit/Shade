"use client";

import { ImageMetaData } from "@/types/editor";

interface BottomBarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  imageData: ImageMetaData | null;
}

export default function BottomBar({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  imageData,
}: BottomBarProps) {
  const filename = imageData ? imageData.name : "untitled.png";

  return (
    <footer className="h-8 px-3 flex items-center justify-between border-t border-[#26272b] bg-[#131418] text-[11px] font-mono text-[#9a9d9a] shrink-0 select-none">
      {/* Left: Zoom controls */}
      <div className="flex items-center gap-2">
        <span className="text-[#9a9d9a] font-mono text-[10px]">ZOOM:</span>
        <button
          onClick={onZoomOut}
          disabled={zoom <= 25}
          className="w-4.5 h-4.5 flex items-center justify-center border border-[#26272b] rounded hover:text-[#f0f0ec] hover:bg-[#26272b]/50 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
          title="Zoom Out (-25%)"
        >
          -
        </button>
        <button
          onClick={onResetZoom}
          className="hover:text-[#4b9fef] cursor-pointer min-w-[36px] text-center font-semibold"
          title="Reset Zoom to 100%"
        >
          {zoom}%
        </button>
        <button
          onClick={onZoomIn}
          disabled={zoom >= 400}
          className="w-4.5 h-4.5 flex items-center justify-center border border-[#26272b] rounded hover:text-[#f0f0ec] hover:bg-[#26272b]/50 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
          title="Zoom In (+25%)"
        >
          +
        </button>
      </div>

      {/* Right: Filename and User Avatar circle */}
      <div className="flex items-center gap-4 text-[11px]">
        <span className="text-[#f0f0ec] font-mono truncate max-w-[200px]">
          {filename}
        </span>

        {/* User avatar circle */}
        <div
          title="Account: StudioNorth User"
          className="w-5 h-5 rounded-full bg-[#4b9fef]/20 border border-[#4b9fef]/40 flex items-center justify-center text-[9px] font-bold text-[#4b9fef]"
        >
          SN
        </div>
      </div>
    </footer>
  );
}
