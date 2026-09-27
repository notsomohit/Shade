"use client";

import { RefObject } from "react";

interface EditorCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  imageName: string;
  imageWidth: number;
  imageHeight: number;
  onReset: () => void;
}

export default function EditorCanvas({
  canvasRef,
  imageName,
  imageWidth,
  imageHeight,
  onReset,
}: EditorCanvasProps) {
  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm font-medium truncate max-w-[200px] sm:max-w-[400px]">
            {imageName}
          </span>
          <span className="hidden sm:inline text-xs text-foreground/40 shrink-0">
            {imageWidth} × {imageHeight}px
          </span>
        </div>

        <button
          onClick={onReset}
          className="
            text-sm px-3 py-1.5 rounded-lg
            text-foreground/60 hover:text-foreground
            bg-white/5 hover:bg-white/10
            transition-colors duration-150 cursor-pointer
          "
        >
          Change image
        </button>
      </div>

      {/* Canvas area */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-8 min-h-0 bg-[#050508]">
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full rounded-lg shadow-2xl shadow-black/50"
          style={{ objectFit: "contain" }}
        />
      </div>

      {/* Footer info — mobile dimensions */}
      <div className="sm:hidden flex items-center justify-center py-2 border-t border-white/5">
        <span className="text-xs text-foreground/40">
          {imageWidth} × {imageHeight}px
        </span>
      </div>
    </div>
  );
}
