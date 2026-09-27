"use client";

import { RefObject, useState, useCallback, useRef, useEffect } from "react";
import { ToolType } from "@/types/editor";

interface CenterCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  beforeCanvasRef: RefObject<HTMLCanvasElement | null>;
  hasImage: boolean;
  activeTool: ToolType;
  zoom: number;
  compareMode: boolean;
  onToggleCompare: () => void;
  onImageSelect: (file: File) => void;
  onApplyCrop?: (crop: { x: number; y: number; width: number; height: number }) => void;
  renderPipeline: () => void;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export default function CenterCanvas({
  canvasRef,
  beforeCanvasRef,
  hasImage,
  activeTool,
  zoom,
  compareMode,
  onToggleCompare,
  onImageSelect,
  onApplyCrop,
  renderPipeline,
}: CenterCanvasProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dividerPercent, setDividerPercent] = useState<number>(50); // 50% initial split
  const [isDraggingDivider, setIsDraggingDivider] = useState(false);

  // Crop overlay interactive state (normalized 0 to 1)
  const [cropBox] = useState({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Trigger render whenever canvas is mounted or hasImage becomes true
  useEffect(() => {
    if (hasImage) {
      const timer = setTimeout(() => {
        renderPipeline();
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [hasImage, compareMode, renderPipeline]);

  // Pointer position calculation helper for Mouse & Touch events
  const updateDividerPos = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const pct = (offsetX / rect.width) * 100;
    // Clamp divider between 2% and 98%
    const clampedPct = Math.min(98, Math.max(2, pct));
    setDividerPercent(clampedPct);
  }, []);

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingDivider(true);
    updateDividerPos(e.clientX);
  };

  // Touch Handlers for Mobile / Touchscreens
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setIsDraggingDivider(true);
      updateDividerPos(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDraggingDivider && e.touches.length > 0) {
      e.preventDefault(); // Prevent page scrolling during drag
      updateDividerPos(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsDraggingDivider(false);
  };

  // Global window event listeners for smooth dragging outside element bounds
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDraggingDivider) {
        updateDividerPos(e.clientX);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDraggingDivider) {
        setIsDraggingDivider(false);
      }
    };

    if (isDraggingDivider) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDraggingDivider, updateDividerPos]);

  // File Upload Handlers
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

  const handleConfirmCrop = () => {
    if (onApplyCrop) {
      onApplyCrop(cropBox);
    }
  };

  const zoomScale = zoom / 100;

  return (
    <main
      className="flex-1 bg-[#0a0a0c] relative overflow-hidden flex flex-col items-center justify-between p-6 select-none"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Compare Mode Toggle Bar */}
      <div className="w-full flex items-center justify-between px-2 pb-3 border-b border-[#26272b]/40 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleCompare}
            disabled={!hasImage}
            className={`
              flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded border transition-colors cursor-pointer font-semibold
              ${
                !hasImage
                  ? "opacity-30 border-[#26272b] cursor-not-allowed text-[#9a9d9a]"
                  : compareMode
                  ? "bg-white text-black border-white font-bold"
                  : "bg-[#131418] text-[#9a9d9a] border-[#26272b] hover:text-[#f0f0ec]"
              }
            `}
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
                d="M7.5 21L3 16.5m0 0L7.5 12m-4.5 4.5h18m-6-15L21 6m0 0l-4.5 4.5M21 6H3"
              />
            </svg>
            Compare
          </button>

          {activeTool === "crop" && hasImage && (
            <button
              onClick={handleConfirmCrop}
              className="px-3 py-1.5 rounded text-xs font-mono bg-[#4b9fef] text-[#0e0f12] font-bold hover:bg-[#3b8fd9] transition-colors cursor-pointer"
            >
              Apply Crop
            </button>
          )}
        </div>

        <div className="text-xs font-mono text-[#9a9d9a]/60 uppercase tracking-widest font-semibold">
          {compareMode ? "BEFORE / AFTER COMPARE" : "CANVAS WELL"}
        </div>
      </div>

      {/* Main Canvas / Drop Zone Area */}
      <div className="flex-1 w-full flex items-center justify-center relative overflow-auto py-4">
        {!hasImage ? (
          /* Empty State Drop Target */
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`
              w-[480px] h-[320px] border border-dashed rounded-lg flex flex-col items-center justify-center p-8 gap-3.5
              font-mono cursor-pointer transition-all duration-150 text-center
              ${
                isDragging
                  ? "border-[#4b9fef] bg-[#4b9fef]/5 scale-[1.01]"
                  : "border-[#26272b] bg-[#131418]/40 hover:border-[#9a9d9a] hover:bg-[#131418]/70"
              }
            `}
          >
            <div className="w-12 h-12 border border-[#26272b] bg-[#131418] rounded flex items-center justify-center text-[#4b9fef]">
              <svg
                className="w-6 h-6"
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

            <h3 className="text-base font-bold text-[#f0f0ec]">
              {isDragging ? "Drop your image file here" : "No image loaded"}
            </h3>

            <p className="text-xs text-[#9a9d9a]">
              Drag and drop, or click to open a file
            </p>

            <p className="text-[11px] text-[#9a9d9a]/50 uppercase tracking-widest mt-1 font-semibold">
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
          /* High-Precision Compare Slider with clip-path */
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative overflow-hidden border border-white/30 shadow-2xl flex items-center justify-center cursor-ew-resize select-none touch-none"
            style={{ transform: `scale(${zoomScale})` }}
          >
            {/* 1. Bottom Layer: BEFORE (Original unadjusted image) */}
            <canvas ref={beforeCanvasRef} className="block max-w-full max-h-full" />

            {/* 2. Top Layer: AFTER (Edited canvas), Clipped to left portion via clip-path */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                clipPath: `inset(0 ${100 - dividerPercent}% 0 0)`,
              }}
            >
              <canvas ref={canvasRef} className="block max-w-full max-h-full" />
            </div>

            {/* 3. Subtle Low-Opacity Corner Labels */}
            <div className="absolute bottom-3 left-3 text-[11px] font-mono text-white/40 font-bold uppercase tracking-widest pointer-events-none">
              AFTER
            </div>

            <div className="absolute bottom-3 right-3 text-[11px] font-mono text-white/40 font-bold uppercase tracking-widest pointer-events-none">
              BEFORE
            </div>

            {/* 4. Vertical Divider Line & Circular Grip Handle */}
            <div
              className="absolute top-0 bottom-0 z-30 pointer-events-none flex items-center justify-center"
              style={{ left: `${dividerPercent}%`, transform: "translateX(-50%)" }}
            >
              {/* Vertical Divider Line */}
              <div className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_8px_rgba(0,0,0,0.8)]" />

              {/* Circular Drag Handle */}
              <div className="relative w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-2xl border-2 border-black/40 hover:scale-110 transition-transform">
                <svg
                  className="w-4 h-4 text-black"
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
          /* Normal Canvas View + Crop Overlay */
          <div
            className="relative transition-transform duration-75 origin-center flex items-center justify-center border border-[#26272b]/60"
            style={{ transform: `scale(${zoomScale})` }}
          >
            <canvas ref={canvasRef} className="block max-w-full max-h-full" />

            {/* Crop Overlay Handle when Crop Tool Active */}
            {activeTool === "crop" && (
              <div
                className="absolute border-2 border-dashed border-white bg-white/10 pointer-events-none"
                style={{
                  top: `${cropBox.y * 100}%`,
                  left: `${cropBox.x * 100}%`,
                  width: `${cropBox.width * 100}%`,
                  height: `${cropBox.height * 100}%`,
                }}
              >
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-black" />
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-black" />
                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-black" />
                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-black" />
                <div className="absolute top-2 left-2 text-[10px] bg-black/80 text-white px-1.5 py-0.5 font-mono rounded">
                  CROP AREA
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
