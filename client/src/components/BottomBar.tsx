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
    <footer className="h-10 px-4 flex items-center justify-between border-t border-[#26272b] bg-[#131418] text-xs font-mono text-[#9a9d9a] shrink-0 select-none">
      {/* Left: Zoom controls */}
      <div className="flex items-center gap-3">
        <span className="text-[#9a9d9a] font-mono text-xs font-semibold">
          ZOOM:
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onZoomOut}
            disabled={zoom <= 25}
            className="w-6 h-6 flex items-center justify-center border border-[#26272b] rounded hover:text-[#f0f0ec] hover:bg-[#26272b]/60 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors text-sm font-bold"
            title="Zoom Out (-25%)"
          >
            -
          </button>
          <button
            onClick={onResetZoom}
            className="hover:text-[#4b9fef] cursor-pointer min-w-[44px] text-center font-bold text-xs"
            title="Reset Zoom to 100%"
          >
            {zoom}%
          </button>
          <button
            onClick={onZoomIn}
            disabled={zoom >= 400}
            className="w-6 h-6 flex items-center justify-center border border-[#26272b] rounded hover:text-[#f0f0ec] hover:bg-[#26272b]/60 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors text-sm font-bold"
            title="Zoom In (+25%)"
          >
            +
          </button>
        </div>
      </div>

      {/* Right: Filename and User Avatar circle */}
      <div className="flex items-center gap-5 text-xs">
        <span className="text-[#f0f0ec] font-mono font-medium truncate max-w-[240px]">
          {filename}
        </span>

        {/* User avatar circle */}
        <div
          title="Account: StudioNorth User"
          className="w-6 h-6 rounded-full bg-[#4b9fef]/20 border border-[#4b9fef]/40 flex items-center justify-center text-xs font-bold text-[#4b9fef]"
        >
          SN
        </div>
      </div>
    </footer>
  );
}
