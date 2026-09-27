"use client";

import { RefObject, useState, useCallback, useRef, useEffect, memo } from "react";
import { ToolType, LayerItem, TextOverlay, ImageMetaData, Adjustments } from "@/types/editor";

interface CenterCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  beforeCanvasRef: RefObject<HTMLCanvasElement | null>;
  hasImage: boolean;
  imageData: ImageMetaData | null;
  activeTool: ToolType;
  zoom: number;
  compareMode: boolean;
  layers: LayerItem[];
  selectedLayerId: string | null;
  adjustments: Adjustments;
  onSelectLayer: (id: string | null) => void;
  onUpdateTextPosition: (id: string, x: number, y: number) => void;
  onUpdateTextFontSize: (id: string, fontSize: number) => void;
  onDeleteLayer: (id: string) => void;
  onToggleCompare: () => void;
  onImageSelect: (file: File) => void;
  onApplyCrop?: (crop: { x: number; y: number; width: number; height: number }) => void;
  renderPipeline: () => void;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

const CenterCanvas = memo(function CenterCanvas({
  canvasRef,
  beforeCanvasRef,
  hasImage,
  imageData,
  activeTool,
  zoom,
  compareMode,
  layers,
  selectedLayerId,
  adjustments,
  onSelectLayer,
  onUpdateTextPosition,
  onUpdateTextFontSize,
  onDeleteLayer,
  onToggleCompare,
  onImageSelect,
  onApplyCrop,
  renderPipeline,
}: CenterCanvasProps) {
  // Track if a pointer-down on a text layer just happened so the main
  // deselect handler (also on mousedown) knows to skip deselecting.
  const textInteractingRef = useRef(false);
  const [isDraggingUpload, setIsDraggingUpload] = useState(false);
  const [dividerPercent, setDividerPercent] = useState<number>(50);
  const [isDraggingDivider, setIsDraggingDivider] = useState(false);

  // Active dragging state for text layers
  const [draggingTextId, setDraggingTextId] = useState<string | null>(null);
  const textDragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  // Corner handle resizing state
  const [resizingTextId, setResizingTextId] = useState<string | null>(null);
  const fontResizeRef = useRef<{ startX: number; startY: number; origSize: number } | null>(null);

  const [cropBox] = useState({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
  const compareContainerRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const rafRef = useRef<number | null>(null);

  const zoomScale = zoom / 100;
  const imageAspectRatio = imageData ? `${imageData.width} / ${imageData.height}` : "16 / 10";

  // Trigger render whenever canvas is mounted or hasImage becomes true
  useEffect(() => {
    if (hasImage) {
      const timer = setTimeout(() => {
        renderPipeline();
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [hasImage, compareMode, renderPipeline]);

  // Pointer position calculation helper for Compare slider
  const updateDividerPos = useCallback((clientX: number) => {
    if (!compareContainerRef.current) return;
    const rect = compareContainerRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const pct = (offsetX / rect.width) * 100;
    const clampedPct = Math.min(98, Math.max(2, pct));
    setDividerPercent(clampedPct);
  }, []);

  const handleCompareMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingDivider(true);
    updateDividerPos(e.clientX);
  };

  const handleCompareTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setIsDraggingDivider(true);
      updateDividerPos(e.touches[0].clientX);
    }
  };

  const handleCompareTouchMove = (e: React.TouchEvent) => {
    if (isDraggingDivider && e.touches.length > 0) {
      e.preventDefault();
      updateDividerPos(e.touches[0].clientX);
    }
  };

  const handleCompareTouchEnd = () => {
    setIsDraggingDivider(false);
  };

  // Text Layer Drag Handler
  const handleTextPointerDown = (
    e: React.MouseEvent | React.TouchEvent,
    textItem: TextOverlay
  ) => {
    // Mark that interaction is with a text layer so the main onMouseDown
    // deselect handler does not clear the selection.
    textInteractingRef.current = true;
    e.stopPropagation();
    onSelectLayer(textItem.id);
    setDraggingTextId(textItem.id);

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    textDragRef.current = {
      startX: clientX,
      startY: clientY,
      origX: textItem.x,
      origY: textItem.y,
    };
  };

  // Corner Anchor Handle Resize Handler
  const handleAnchorResizeDown = (
    e: React.MouseEvent | React.TouchEvent,
    textItem: TextOverlay
  ) => {
    e.stopPropagation();
    onSelectLayer(textItem.id);
    setResizingTextId(textItem.id);

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    fontResizeRef.current = {
      startX: clientX,
      startY: clientY,
      origSize: textItem.fontSize,
    };
  };

  // Global window listeners using requestAnimationFrame for smooth 60 FPS dragging
  useEffect(() => {
    const handlePointerMove = (clientX: number, clientY: number) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        if (isDraggingDivider) {
          updateDividerPos(clientX);
        }

        // Text Layer Position Drag
        if (draggingTextId && textDragRef.current && canvasWrapperRef.current) {
          const rect = canvasWrapperRef.current.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const deltaX = (clientX - textDragRef.current.startX) / rect.width;
            const deltaY = (clientY - textDragRef.current.startY) / rect.height;

            const newX = Math.min(0.95, Math.max(0, textDragRef.current.origX + deltaX));
            const newY = Math.min(0.95, Math.max(0, textDragRef.current.origY + deltaY));

            onUpdateTextPosition(draggingTextId, newX, newY);
          }
        }

        // Corner Anchor Font Size Resize Drag
        if (resizingTextId && fontResizeRef.current) {
          const delta = clientX - fontResizeRef.current.startX + (clientY - fontResizeRef.current.startY);
          const scaleFactor = 0.5;
          const newSize = Math.round(
            Math.min(160, Math.max(12, fontResizeRef.current.origSize + delta * scaleFactor))
          );
          onUpdateTextFontSize(resizingTextId, newSize);
        }
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handlePointerUp = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (isDraggingDivider) setIsDraggingDivider(false);
      if (draggingTextId) setDraggingTextId(null);
      if (resizingTextId) setResizingTextId(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handlePointerUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [isDraggingDivider, draggingTextId, resizingTextId, onUpdateTextPosition, onUpdateTextFontSize, updateDividerPos]);

  // File Upload Handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDraggingUpload(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDraggingUpload(false);
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
      setIsDraggingUpload(false);
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

  const textLayers = layers.filter((l) => l.type === "text" && l.textData && l.visible);

  // Build CSS filter string for live preview during slider drag.
  // This is cheap (GPU compositing) and gives instant feedback.
  const cssAdjustFilter = [
    adjustments.brightness !== 0
      ? `brightness(${1 + (adjustments.brightness / 100) * 0.4})`
      : "",
    adjustments.contrast !== 0
      ? `contrast(${1 + (adjustments.contrast / 100) * 0.6})`
      : "",
    adjustments.saturation !== 0
      ? `saturate(${1 + (adjustments.saturation / 100) * 0.75})`
      : "",
    adjustments.exposure !== 0
      ? `brightness(${Math.pow(2, (adjustments.exposure / 100) * 0.5).toFixed(3)})`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main
      className="flex-1 bg-[#0a0a0c] relative overflow-hidden flex flex-col items-center justify-between p-6 select-none"
      onMouseDown={(e) => {
        // Only deselect when clicking directly on the canvas backdrop,
        // not when the event bubbled from a text layer (stopPropagation handles
        // that, but we also guard with the ref for extra safety).
        if (textInteractingRef.current) {
          textInteractingRef.current = false;
          return;
        }
        onSelectLayer(null);
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Top Controls Bar */}
      <div className="w-full flex items-center justify-between px-2 pb-3 border-b border-[#26272b]/40 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare();
            }}
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
              onClick={(e) => {
                e.stopPropagation();
                handleConfirmCrop();
              }}
              className="px-3 py-1.5 rounded text-xs font-mono bg-[#4b9fef] text-[#0e0f12] font-bold hover:bg-[#3b8fd9] transition-colors cursor-pointer"
            >
              Apply Crop
            </button>
          )}
        </div>

        <div className="text-xs font-mono text-[#9a9d9a]/60 uppercase tracking-widest font-semibold">
          {compareMode
            ? "BEFORE / AFTER COMPARE"
            : imageData
            ? `RATIO ${imageData.width}:${imageData.height}`
            : "CANVAS WELL"}
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 w-full flex items-center justify-center relative overflow-auto py-4">
        {!hasImage ? (
          /* Empty State Placeholder */
          <div
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className={`
              w-[480px] h-[320px] border border-dashed rounded-lg flex flex-col items-center justify-center p-8 gap-3.5
              font-mono cursor-pointer transition-all duration-150 text-center
              ${
                isDraggingUpload
                  ? "border-[#4b9fef] bg-[#4b9fef]/5 scale-[1.01]"
                  : "border-[#26272b] bg-[#131418]/40 hover:border-[#9a9d9a] hover:bg-[#131418]/70"
              }
            `}
            style={{ aspectRatio: "16 / 10" }}
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
              {isDraggingUpload ? "Drop your image file here" : "No image loaded"}
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
          /* Compare View */
          <div
            ref={compareContainerRef}
            onMouseDown={handleCompareMouseDown}
            onTouchStart={handleCompareTouchStart}
            onTouchMove={handleCompareTouchMove}
            onTouchEnd={handleCompareTouchEnd}
            className="relative overflow-hidden border border-white/30 shadow-2xl flex items-center justify-center cursor-ew-resize select-none touch-none max-w-full max-h-full"
            style={{
              aspectRatio: imageAspectRatio,
              transform: `scale(${zoomScale})`,
            }}
          >
            <canvas ref={beforeCanvasRef} className="block w-full h-full object-contain" />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                clipPath: `inset(0 ${100 - dividerPercent}% 0 0)`,
              }}
            >
              <canvas ref={canvasRef} className="block w-full h-full object-contain" />
            </div>

            <div className="absolute bottom-3 left-3 text-[11px] font-mono text-white/40 font-bold uppercase tracking-widest pointer-events-none">
              AFTER
            </div>

            <div className="absolute bottom-3 right-3 text-[11px] font-mono text-white/40 font-bold uppercase tracking-widest pointer-events-none">
              BEFORE
            </div>

            <div
              className="absolute top-0 bottom-0 z-30 pointer-events-none flex items-center justify-center"
              style={{ left: `${dividerPercent}%`, transform: "translateX(-50%)" }}
            >
              <div className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_8px_rgba(0,0,0,0.8)]" />
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
          /* Normal Canvas View + Freely Draggable Text Selection & Quick Delete Badge */
          <div
            ref={canvasWrapperRef}
            className="relative transition-transform duration-75 origin-center flex items-center justify-center border border-[#26272b]/60 max-w-full max-h-full"
            style={{
              aspectRatio: imageAspectRatio,
              transform: `scale(${zoomScale})`,
            }}
          >
            {/* CSS filter applied here for zero-cost live preview during slider drag.
                The actual pixel-accurate render happens debounced in useCanvas. */}
            <canvas
              ref={canvasRef}
              className="block w-full h-full object-contain"
              style={{ filter: cssAdjustFilter || undefined }}
            />

            {/* Freely Draggable Interactive Text Overlay Triggers */}
            {textLayers.map((layer) => {
              const t = layer.textData!;
              const isSelected = selectedLayerId === layer.id;

              return (
                <div
                  key={layer.id}
                  onMouseDown={(e) => handleTextPointerDown(e, t)}
                  onTouchStart={(e) => handleTextPointerDown(e, t)}
                  className={`
                    absolute font-mono font-bold cursor-move leading-none px-2 py-1 rounded transition-all select-none z-20 whitespace-nowrap
                    ${
                      isSelected
                        ? "border-2 border-dashed border-[#4b9fef] bg-[#4b9fef]/10 shadow-lg"
                        : "border border-transparent hover:border-white/40 hover:bg-white/5"
                    }
                  `}
                  style={{
                    left: `${t.x * 100}%`,
                    top: `${t.y * 100}%`,
                    fontSize: `${t.fontSize * 0.35}px`,
                    color: "transparent",
                  }}
                >
                  <span className="invisible">{t.text}</span>

                  {/* Quick Delete Trash Badge on Direct Text Selection */}
                  {isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteLayer(layer.id);
                      }}
                      title="Delete Text Layer"
                      className="absolute -top-7 left-1/2 -translate-x-1/2 bg-red-600 hover:bg-red-500 text-white p-1 rounded-full shadow-lg transition-transform hover:scale-110 cursor-pointer"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </button>
                  )}

                  {/* Corner Anchor Handles for Real-time Font Size Resizing */}
                  {isSelected && (
                    <>
                      <div
                        onMouseDown={(e) => handleAnchorResizeDown(e, t)}
                        onTouchStart={(e) => handleAnchorResizeDown(e, t)}
                        title="Drag to resize text font size"
                        className="absolute -top-2 -left-2 w-3.5 h-3.5 bg-[#4b9fef] border-2 border-white rounded-full cursor-nwse-resize hover:scale-125 transition-transform"
                      />
                      <div
                        onMouseDown={(e) => handleAnchorResizeDown(e, t)}
                        onTouchStart={(e) => handleAnchorResizeDown(e, t)}
                        title="Drag to resize text font size"
                        className="absolute -top-2 -right-2 w-3.5 h-3.5 bg-[#4b9fef] border-2 border-white rounded-full cursor-nesw-resize hover:scale-125 transition-transform"
                      />
                      <div
                        onMouseDown={(e) => handleAnchorResizeDown(e, t)}
                        onTouchStart={(e) => handleAnchorResizeDown(e, t)}
                        title="Drag to resize text font size"
                        className="absolute -bottom-2 -left-2 w-3.5 h-3.5 bg-[#4b9fef] border-2 border-white rounded-full cursor-nesw-resize hover:scale-125 transition-transform"
                      />
                      <div
                        onMouseDown={(e) => handleAnchorResizeDown(e, t)}
                        onTouchStart={(e) => handleAnchorResizeDown(e, t)}
                        title="Drag to resize text font size"
                        className="absolute -bottom-2 -right-2 w-3.5 h-3.5 bg-[#4b9fef] border-2 border-white rounded-full cursor-nwse-resize hover:scale-125 transition-transform"
                      />
                    </>
                  )}
                </div>
              );
            })}

            {/* Crop Overlay when Crop tool is active */}
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
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
});

export default CenterCanvas;
