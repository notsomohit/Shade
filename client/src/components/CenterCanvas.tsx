"use client";

import { RefObject, useState, useCallback, useRef } from "react";

interface CenterCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  hasImage: boolean;
  zoom: number;
  compareMode: boolean;
  onToggleCompare: () => void;
  onImageSelect: (file: File) => void;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export default function CenterCanvas({
  canvasRef,
  hasImage,
  zoom,
  compareMode,
  onToggleCompare,
  onImageSelect,
}: CenterCanvasProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [splitPos, setSplitPos] = useState<number>(50); // 50% split position
  const [isDraggingSplitter, setIsDraggingSplitter] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      const file = e.dataTransfer.files?.[0];
      if (file && ACCEPTED_TYPES.includes(file.type)) {
        onImageSelect(file);
      }
    },
    [onImageSelect]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && ACCEPTED_TYPES.includes(file.type)) {
      onImageSelect(file);
    }
  };

  // Drag logic for Compare split slider
  const handleSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingSplitter(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingSplitter || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const pct = (offsetX / rect.width) * 100;
    // Clamp between 4% and 96%
    const clampedPct = Math.min(96, Math.max(4, pct));
    setSplitPos(clampedPct);
  };

  const handleMouseUp = () => {
    if (isDraggingSplitter) setIsDraggingSplitter(false);
  };

  const zoomScale = zoom / 100;

  return (
    <main
      className="flex-1 bg-[#0a0a0c] relative overflow-hidden flex flex-col items-center justify-between p-6 select-none"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Compare Mode Toggle Bar */}
      <div className="w-full flex items-center justify-between px-2 pb-3 border-b border-[#26272b]/40 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleCompare}
            disabled={!hasImage}
            className={`
              flex items-center gap-2 text-[11px] font-mono px-2.5 py-1 rounded border transition-colors cursor-pointer
              ${
                !hasImage
                  ? "opacity-30 border-[#26272b] cursor-not-allowed text-[#9a9d9a]"
                  : compareMode
                  ? "bg-[#4b9fef]/15 text-[#4b9fef] border-[#4b9fef]/40 font-semibold"
                  : "bg-[#131418] text-[#9a9d9a] border-[#26272b] hover:text-[#f0f0ec]"
              }
            `}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 21L3 16.5m0 0L7.5 12m-4.5 4.5h18m-6-15L21 6m0 0l-4.5 4.5M21 6H3"
              />
            </svg>
            Compare
          </button>
        </div>

        <div className="text-[10px] font-mono text-[#9a9d9a]/60 uppercase">
          {compareMode ? "BEFORE / AFTER SPLIT" : "CANVAS WELL"}
        </div>
      </div>

      {/* Main Canvas / Drop Zone Area */}
      <div className="flex-1 w-full flex items-center justify-center relative overflow-auto py-4">
        {!hasImage ? (
          /* Empty State Drop Target */
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`
              w-[460px] h-[300px] border border-dashed rounded-lg flex flex-col items-center justify-center p-6 gap-3
              font-mono cursor-pointer transition-all duration-150 text-center
              ${
                isDragging
                  ? "border-[#4b9fef] bg-[#4b9fef]/5 scale-[1.01]"
                  : "border-[#26272b] bg-[#131418]/40 hover:border-[#9a9d9a] hover:bg-[#131418]/70"
              }
            `}
          >
            {/* Centered '+' Icon in small bordered square */}
            <div className="w-10 h-10 border border-[#26272b] bg-[#131418] rounded flex items-center justify-center text-[#4b9fef]">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>

            {/* Bold Headline */}
            <h3 className="text-sm font-bold text-[#f0f0ec]">
              {isDragging ? "Drop your image file here" : "No image loaded"}
            </h3>

            {/* Muted Subtext */}
            <p className="text-xs text-[#9a9d9a]">
              Drag and drop, or click to open a file
            </p>

            {/* Formats line */}
            <p className="text-[10px] text-[#9a9d9a]/50 uppercase tracking-widest mt-1">
              Supports JPEG, PNG, WebP, AVIF
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : compareMode ? (
          /* Compare Mode Splitter View */
          <div
            ref={containerRef}
            className="relative overflow-hidden border border-[#26272b] shadow-2xl flex items-center justify-center"
            style={{ transform: `scale(${zoomScale})` }}
          >
            {/* Target Canvas */}
            <canvas ref={canvasRef} className="block max-w-full max-h-full" />

            {/* Overlay Splitter Mask (Simulating Before/Original) */}
            <div
              className="absolute inset-0 overflow-hidden border-r-2 border-[#4b9fef] pointer-events-none"
              style={{ width: `${splitPos}%` }}
            >
              <div className="absolute inset-0 bg-black/20 flex items-end p-3">
                <span className="text-[10px] font-mono bg-[#131418]/90 text-[#4b9fef] border border-[#4b9fef]/40 px-2 py-0.5 rounded uppercase font-semibold">
                  BEFORE
                </span>
              </div>
            </div>

            {/* After Label */}
            <div className="absolute bottom-3 right-3 pointer-events-none">
              <span className="text-[10px] font-mono bg-[#131418]/90 text-[#f0f0ec] border border-[#26272b] px-2 py-0.5 rounded uppercase font-semibold">
                AFTER
              </span>
            </div>

            {/* Draggable Divider Handle */}
            <div
              onMouseDown={handleSplitterMouseDown}
              className="absolute top-0 bottom-0 z-30 cursor-ew-resize flex items-center justify-center"
              style={{ left: `${splitPos}%`, transform: "translateX(-50%)" }}
            >
              <div className="w-7 h-7 rounded-full bg-[#4b9fef] text-[#0e0f12] flex items-center justify-center shadow-lg border border-white/20">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                  />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          /* Normal Canvas View */
          <div
            className="transition-transform duration-75 origin-center flex items-center justify-center border border-[#26272b]/60"
            style={{ transform: `scale(${zoomScale})` }}
          >
            <canvas ref={canvasRef} className="block max-w-full max-h-full" />
          </div>
        )}
      </div>
    </main>
  );
}
