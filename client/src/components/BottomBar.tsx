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
  return (
    <footer className="h-7 px-3 flex items-center justify-between border-t border-[#3a3d44] bg-[#141519] text-[11px] font-mono text-[#8f938f] shrink-0 select-none">
      {/* Zoom Controls */}
      <div className="flex items-center gap-2">
        <span className="text-[#8f938f] font-mono">ZOOM:</span>
        <button
          onClick={onZoomOut}
          disabled={zoom <= 25}
          className="w-4 h-4 flex items-center justify-center border border-[#3a3d44] hover:text-[#e8e8e2] hover:bg-[#3a3d44]/30 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
          title="Zoom Out (-25%)"
        >
          -
        </button>
        <button
          onClick={onResetZoom}
          className="hover:text-[#e8e8e2] cursor-pointer min-w-[36px] text-center"
          title="Reset Zoom to 100%"
        >
          {zoom}%
        </button>
        <button
          onClick={onZoomIn}
          disabled={zoom >= 400}
          className="w-4 h-4 flex items-center justify-center border border-[#3a3d44] hover:text-[#e8e8e2] hover:bg-[#3a3d44]/30 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
          title="Zoom In (+25%)"
        >
          +
        </button>
      </div>

      {/* Dimensions & Info */}
      <div className="flex items-center gap-4 text-[10px]">
        {imageData ? (
          <span>
            {imageData.width} × {imageData.height} PX
          </span>
        ) : (
          <span className="text-[#8f938f]/50">NO CANVAS</span>
        )}
      </div>
    </footer>
  );
}
