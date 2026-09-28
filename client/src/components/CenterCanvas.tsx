"use client";

import { RefObject, useState, useCallback, useRef, useEffect, memo } from "react";
import {
  ToolType,
  LayerItem,
  TextOverlay,
  ImageMetaData,
  Adjustments,
  SelectivePoint,
} from "@/types/editor";
import { TransformState } from "@/hooks/useCanvas";

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
  selectivePoints: SelectivePoint[];
  selectedSelectivePointId: string | null;
  isEyedropperActive?: boolean;
  transformState?: TransformState;
  onSelectLayer: (id: string | null) => void;
  onSelectSelectivePoint: (id: string | null) => void;
  onAddSelectivePointAt: (normX: number, normY: number) => void;
  onUpdateSelectivePoint: (id: string, updates: Partial<SelectivePoint>) => void;
  onSampleWhiteBalance?: (normX: number, normY: number) => void;
  onUpdateTextPosition: (id: string, x: number, y: number) => void;
  onUpdateTextFontSize: (id: string, fontSize: number) => void;
  onDeleteLayer?: (id: string) => void;
  onToggleCompare: () => void;
  onImageSelect: (file: File) => void;
  onApplyCrop?: (crop: { x: number; y: number; width: number; height: number }) => void;
  renderPipeline: () => void;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

type CropHandle = "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w" | "move";

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
  selectivePoints,
  selectedSelectivePointId,
  isEyedropperActive = false,
  transformState,
  onSelectLayer,
  onSelectSelectivePoint,
  onAddSelectivePointAt,
  onUpdateSelectivePoint,
  onSampleWhiteBalance,
  onUpdateTextPosition,
  onUpdateTextFontSize,
  onImageSelect,
  onApplyCrop,
  renderPipeline,
}: CenterCanvasProps) {
  const textInteractingRef = useRef(false);
  const [isDraggingUpload, setIsDraggingUpload] = useState(false);

  // Pan offset state for moving canvas view
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ startX: 0, startY: 0, origPanX: 0, origPanY: 0 });

  // Compare Slider State (percentage 2..98)
  const [dividerPercent, setDividerPercent] = useState<number>(50);
  const isDraggingDividerRef = useRef(false);
  const compareContainerRef = useRef<HTMLDivElement>(null);

  // DOM Refs for high performance
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Interactive 8-Handle Crop State
  const [cropRect, setCropRect] = useState({ x: 0.05, y: 0.05, width: 0.9, height: 0.9 });
  const cropDragRef = useRef<{
    handle: CropHandle;
    startX: number;
    startY: number;
    origRect: { x: number; y: number; width: number; height: number };
    currentRect: { x: number; y: number; width: number; height: number };
  } | null>(null);
  const cropBoxDOMRef = useRef<HTMLDivElement>(null);

  // Text drag & resize mutable state
  const textDragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    currentX: number;
    currentY: number;
    domEl: HTMLElement | null;
  } | null>(null);

  const textResizeRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    origSize: number;
    currentSize: number;
    domEl: HTMLElement | null;
  } | null>(null);

  // Selective point drag & radius resize mutable state
  const pointDragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    currentX: number;
    currentY: number;
    domEl: HTMLElement | null;
  } | null>(null);

  const pointRadiusRef = useRef<{
    id: string;
    startX: number;
    origRadius: number;
    currentRadius: number;
    ringEl: HTMLElement | null;
  } | null>(null);

  const zoomScale = zoom / 100;
  const imageAspectRatio = imageData ? `${imageData.width} / ${imageData.height}` : "16 / 10";

  // Trigger render when image mounts or compare toggles
  useEffect(() => {
    if (hasImage) {
      const id = requestAnimationFrame(() => {
        renderPipeline();
      });
      return () => cancelAnimationFrame(id);
    }
  }, [hasImage, compareMode, renderPipeline]);

  // Sync crop aspect ratio preset if set
  useEffect(() => {
    if (transformState?.aspectRatioPreset && transformState.aspectRatioPreset !== "free") {
      let targetRatio = 1;
      if (transformState.aspectRatioPreset === "1:1") targetRatio = 1;
      else if (transformState.aspectRatioPreset === "4:3") targetRatio = 4 / 3;
      else if (transformState.aspectRatioPreset === "16:9") targetRatio = 16 / 9;
      else if (transformState.aspectRatioPreset === "3:2") targetRatio = 3 / 2;
      else if (transformState.aspectRatioPreset === "9:16") targetRatio = 9 / 16;
      else if (transformState.aspectRatioPreset === "original" && imageData) {
        targetRatio = imageData.width / imageData.height;
      }

      const imgRatio = imageData ? imageData.width / imageData.height : 1;
      let newW = 0.85;
      let newH = newW / (targetRatio / imgRatio);
      if (newH > 0.85) {
        newH = 0.85;
        newW = newH * (targetRatio / imgRatio);
      }
      const newX = (1 - newW) / 2;
      const newY = (1 - newH) / 2;
      setCropRect({ x: newX, y: newY, width: newW, height: newH });
    }
  }, [transformState?.aspectRatioPreset, imageData]);

  // Compare Divider pointer calculation
  const updateDividerPosFromClientX = useCallback((clientX: number) => {
    if (!compareContainerRef.current) return;
    const rect = compareContainerRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    const clampedPct = Math.min(98, Math.max(2, pct));
    setDividerPercent(clampedPct);
  }, []);

  const handleComparePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDraggingDividerRef.current = true;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    updateDividerPosFromClientX(clientX);
  };

  // Canvas Container Click (Deselect text, Eyedropper, or Add Selective Point)
  const handleCanvasContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasImage || !canvasWrapperRef.current) return;
    if (textInteractingRef.current) {
      textInteractingRef.current = false;
      return;
    }

    const rect = canvasWrapperRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const normX = Math.min(1, Math.max(0, clickX / rect.width));
    const normY = Math.min(1, Math.max(0, clickY / rect.height));

    if (isEyedropperActive && onSampleWhiteBalance) {
      onSampleWhiteBalance(normX, normY);
      return;
    }

    if (activeTool === "selective" && !pointDragRef.current && !pointRadiusRef.current) {
      onAddSelectivePointAt(normX, normY);
      return;
    }

    // Clicked on image background -> Deselect active text layer or control point
    if (selectedLayerId) {
      onSelectLayer(null);
    }
    if (selectedSelectivePointId) {
      onSelectSelectivePoint(null);
    }
  };

  // Outer Workspace Click -> Deselect text when clicking outside
  const handleMainClick = (e: React.MouseEvent) => {
    if (textInteractingRef.current) {
      textInteractingRef.current = false;
      return;
    }
    if (e.target === e.currentTarget) {
      if (selectedLayerId) onSelectLayer(null);
      if (selectedSelectivePointId) onSelectSelectivePoint(null);
    }
  };

  // Crop Drag Handler Start
  const handleCropHandleDown = (e: React.MouseEvent | React.TouchEvent, handle: CropHandle) => {
    e.stopPropagation();
    e.preventDefault();
    textInteractingRef.current = true;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    cropDragRef.current = {
      handle,
      startX: clientX,
      startY: clientY,
      origRect: { ...cropRect },
      currentRect: { ...cropRect },
    };
  };

  // Text Layer Drag Handlers
  const handleTextPointerDown = (
    e: React.MouseEvent | React.TouchEvent,
    id: string,
    curX: number,
    curY: number
  ) => {
    e.stopPropagation();
    textInteractingRef.current = true;
    onSelectLayer(id);

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const target = e.currentTarget as HTMLElement;

    textDragRef.current = {
      id,
      startX: clientX,
      startY: clientY,
      origX: curX,
      origY: curY,
      currentX: curX,
      currentY: curY,
      domEl: target,
    };
  };

  const handleResizeHandleDown = (
    e: React.MouseEvent | React.TouchEvent,
    id: string,
    fontSize: number
  ) => {
    e.stopPropagation();
    textInteractingRef.current = true;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const parentEl = (e.currentTarget as HTMLElement).parentElement;

    textResizeRef.current = {
      id,
      startX: clientX,
      startY: clientY,
      origSize: fontSize,
      currentSize: fontSize,
      domEl: parentEl,
    };
  };

  // Selective Point Drag Handlers
  const handlePointPinDown = (
    e: React.MouseEvent | React.TouchEvent,
    point: SelectivePoint
  ) => {
    e.stopPropagation();
    textInteractingRef.current = true;
    onSelectSelectivePoint(point.id);

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const target = e.currentTarget as HTMLElement;

    pointDragRef.current = {
      id: point.id,
      startX: clientX,
      startY: clientY,
      origX: point.x,
      origY: point.y,
      currentX: point.x,
      currentY: point.y,
      domEl: target,
    };
  };

  const handlePointRadiusHandleDown = (
    e: React.MouseEvent | React.TouchEvent,
    point: SelectivePoint
  ) => {
    e.stopPropagation();
    textInteractingRef.current = true;
    onSelectSelectivePoint(point.id);

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const ring = (e.currentTarget as HTMLElement).parentElement;

    pointRadiusRef.current = {
      id: point.id,
      startX: clientX,
      origRadius: point.radius,
      currentRadius: point.radius,
      ringEl: ring,
    };
  };

  // Canvas Viewport Pan Handler (Space + Drag or Middle Click)
  const handleMainPointerDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.shiftKey || e.altKey) {
      e.preventDefault();
      isPanningRef.current = true;
      panStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origPanX: panOffset.x,
        origPanY: panOffset.y,
      };
    }
  };

  // Global Pointer Listeners (rAF throttled)
  useEffect(() => {
    let animFrameId: number | null = null;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      if (animFrameId) cancelAnimationFrame(animFrameId);

      animFrameId = requestAnimationFrame(() => {
        // Compare Divider Drag
        if (isDraggingDividerRef.current) {
          updateDividerPosFromClientX(clientX);
        }

        // Panning Canvas Viewport
        if (isPanningRef.current) {
          const dx = clientX - panStartRef.current.startX;
          const dy = clientY - panStartRef.current.startY;
          setPanOffset({
            x: panStartRef.current.origPanX + dx,
            y: panStartRef.current.origPanY + dy,
          });
        }

        // Interactive Crop Drag / Resize
        if (cropDragRef.current && canvasWrapperRef.current) {
          const rect = canvasWrapperRef.current.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const dx = (clientX - cropDragRef.current.startX) / rect.width;
            const dy = (clientY - cropDragRef.current.startY) / rect.height;
            const { handle, origRect } = cropDragRef.current;
            let { x, y, width, height } = origRect;

            if (handle === "move") {
              x = Math.max(0, Math.min(1 - width, origRect.x + dx));
              y = Math.max(0, Math.min(1 - height, origRect.y + dy));
            } else {
              if (handle.includes("w")) {
                const maxDx = origRect.width - 0.05;
                const clampedDx = Math.max(-origRect.x, Math.min(maxDx, dx));
                x = origRect.x + clampedDx;
                width = origRect.width - clampedDx;
              }
              if (handle.includes("e")) {
                width = Math.max(0.05, Math.min(1 - origRect.x, origRect.width + dx));
              }
              if (handle.includes("n")) {
                const maxDy = origRect.height - 0.05;
                const clampedDy = Math.max(-origRect.y, Math.min(maxDy, dy));
                y = origRect.y + clampedDy;
                height = origRect.height - clampedDy;
              }
              if (handle.includes("s")) {
                height = Math.max(0.05, Math.min(1 - origRect.y, origRect.height + dy));
              }
            }

            cropDragRef.current.currentRect = { x, y, width, height };

            if (cropBoxDOMRef.current) {
              cropBoxDOMRef.current.style.left = `${x * 100}%`;
              cropBoxDOMRef.current.style.top = `${y * 100}%`;
              cropBoxDOMRef.current.style.width = `${width * 100}%`;
              cropBoxDOMRef.current.style.height = `${height * 100}%`;
            }
          }
        }

        // Text Dragging
        if (textDragRef.current && canvasWrapperRef.current) {
          const rect = canvasWrapperRef.current.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const deltaX = (clientX - textDragRef.current.startX) / rect.width;
            const deltaY = (clientY - textDragRef.current.startY) / rect.height;
            const nextX = Math.max(0, Math.min(0.95, textDragRef.current.origX + deltaX));
            const nextY = Math.max(0, Math.min(0.95, textDragRef.current.origY + deltaY));
            textDragRef.current.currentX = nextX;
            textDragRef.current.currentY = nextY;

            if (textDragRef.current.domEl) {
              textDragRef.current.domEl.style.left = `${nextX * 100}%`;
              textDragRef.current.domEl.style.top = `${nextY * 100}%`;
            }
          }
        }

        // Text Resizing
        if (textResizeRef.current) {
          const deltaX = clientX - textResizeRef.current.startX;
          const deltaY = clientY - textResizeRef.current.startY;
          const distDelta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          const sign = deltaX + deltaY > 0 ? 1 : -1;
          const newSize = Math.max(
            12,
            Math.min(240, Math.round(textResizeRef.current.origSize + sign * distDelta * 0.4))
          );
          textResizeRef.current.currentSize = newSize;

          if (textResizeRef.current.domEl) {
            textResizeRef.current.domEl.style.fontSize = `${newSize}px`;
          }
        }

        // Selective Point Dragging
        if (pointDragRef.current && canvasWrapperRef.current) {
          const rect = canvasWrapperRef.current.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const deltaX = (clientX - pointDragRef.current.startX) / rect.width;
            const deltaY = (clientY - pointDragRef.current.startY) / rect.height;
            const nextX = Math.max(0.01, Math.min(0.99, pointDragRef.current.origX + deltaX));
            const nextY = Math.max(0.01, Math.min(0.99, pointDragRef.current.origY + deltaY));
            pointDragRef.current.currentX = nextX;
            pointDragRef.current.currentY = nextY;

            if (pointDragRef.current.domEl) {
              pointDragRef.current.domEl.style.left = `${nextX * 100}%`;
              pointDragRef.current.domEl.style.top = `${nextY * 100}%`;
            }
          }
        }

        // Selective Point Radius Resizing
        if (pointRadiusRef.current && canvasWrapperRef.current) {
          const rect = canvasWrapperRef.current.getBoundingClientRect();
          const minDim = Math.min(rect.width, rect.height);
          if (minDim > 0) {
            const deltaX = clientX - pointRadiusRef.current.startX;
            const deltaRadius = deltaX / minDim;
            const nextRadius = Math.max(
              0.05,
              Math.min(0.7, pointRadiusRef.current.origRadius + deltaRadius)
            );
            pointRadiusRef.current.currentRadius = nextRadius;

            if (pointRadiusRef.current.ringEl) {
              pointRadiusRef.current.ringEl.style.width = `${nextRadius * 200}%`;
              pointRadiusRef.current.ringEl.style.height = `${nextRadius * 200}%`;
            }
          }
        }
      });
    };

    const handlePointerUp = () => {
      isDraggingDividerRef.current = false;
      isPanningRef.current = false;

      // Commit Crop final coordinates
      if (cropDragRef.current) {
        const finalRect = cropDragRef.current.currentRect;
        setCropRect(finalRect);
        cropDragRef.current = null;
      }

      // Commit Text Drag final coordinates
      if (textDragRef.current) {
        onUpdateTextPosition(
          textDragRef.current.id,
          textDragRef.current.currentX,
          textDragRef.current.currentY
        );
        textDragRef.current = null;
      }

      // Commit Text Resize final font size
      if (textResizeRef.current) {
        onUpdateTextFontSize(
          textResizeRef.current.id,
          textResizeRef.current.currentSize
        );
        textResizeRef.current = null;
      }

      // Commit Selective Point final coordinates
      if (pointDragRef.current) {
        onUpdateSelectivePoint(pointDragRef.current.id, {
          x: pointDragRef.current.currentX,
          y: pointDragRef.current.currentY,
        });
        pointDragRef.current = null;
      }

      // Commit Selective Point final radius
      if (pointRadiusRef.current) {
        onUpdateSelectivePoint(pointRadiusRef.current.id, {
          radius: pointRadiusRef.current.currentRadius,
        });
        pointRadiusRef.current = null;
      }
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("touchend", handlePointerUp);

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [
    updateDividerPosFromClientX,
    onUpdateTextPosition,
    onUpdateTextFontSize,
    onUpdateSelectivePoint,
  ]);

  // Drag-and-drop file uploader
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingUpload(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDraggingUpload(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingUpload(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (ACCEPTED_TYPES.includes(file.type)) {
        onImageSelect(file);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImageSelect(e.target.files[0]);
    }
  };

  const applyActiveCrop = () => {
    if (onApplyCrop) {
      onApplyCrop(cropRect);
    }
  };

  return (
    <main
      onClick={handleMainClick}
      onMouseDown={handleMainPointerDown}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex-1 h-full bg-[#09090b] flex items-center justify-center p-6 relative overflow-hidden select-none"
    >
      {/* Subtle Technical Canvas Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Eyedropper indicator banner */}
      {isEyedropperActive && (
        <div className="absolute top-4 z-40 px-3.5 py-1.5 bg-[#2563eb] text-white font-medium text-xs rounded-md shadow-xl flex items-center gap-2 animate-bounce">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          <span>Click anywhere on the photo to calibrate White Balance</span>
        </div>
      )}

      {/* Drag upload overlay */}
      {isDraggingUpload && (
        <div className="absolute inset-0 bg-[#3b82f6]/10 border-2 border-dashed border-[#3b82f6] z-50 flex items-center justify-center backdrop-blur-sm pointer-events-none">
          <div className="text-center">
            <span className="text-[#3b82f6] text-base font-semibold">
              Drop photo to load
            </span>
          </div>
        </div>
      )}

      {/* Before / After Comparison Slider */}
      {hasImage && compareMode && (
        <div
          ref={compareContainerRef}
          onMouseDown={handleComparePointerDown}
          onTouchStart={handleComparePointerDown}
          className="relative max-w-full max-h-full rounded shadow-2xl border border-[#222227] overflow-hidden cursor-ew-resize select-none touch-none"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
            transformOrigin: "center center",
            aspectRatio: imageAspectRatio,
          }}
        >
          {/* Bottom Layer: ORIGINAL (Before) Canvas on Left */}
          <canvas
            ref={beforeCanvasRef}
            className="block w-full h-full object-contain pointer-events-none"
          />

          {/* Top Layer: EDITED (After) Canvas & Layers on Right (Clipped from left by dividerPercent) */}
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{
              clipPath: `inset(0 0 0 ${dividerPercent}%)`,
            }}
          >
            {/* Edited Canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />

            {/* Text Overlays on the Edited (After) side */}
            {layers
              .filter((l) => l.type === "text" && l.textData && l.visible)
              .map((layer) => {
                const t = layer.textData!;
                return (
                  <div
                    key={layer.id}
                    style={{
                      position: "absolute",
                      left: `${t.x * 100}%`,
                      top: `${t.y * 100}%`,
                      fontFamily: t.fontFamily || "inherit",
                      fontSize: `${t.fontSize}px`,
                      color: t.color,
                      lineHeight: 1,
                    }}
                    className="p-1 font-bold whitespace-nowrap select-none pointer-events-none"
                  >
                    {t.text}
                  </div>
                );
              })}
          </div>

          {/* Draggable Divider Line & Handle */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_8px_rgba(0,0,0,0.8)] z-30 pointer-events-none"
            style={{ left: `${dividerPercent}%` }}
          >
            {/* Center Circular Drag Handle */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white text-[#121215] shadow-2xl flex items-center justify-center font-bold text-[11px] pointer-events-auto cursor-ew-resize border border-black/20 hover:scale-110 active:scale-95 transition-transform">
              ↔
            </div>
          </div>

          {/* Pinned Corner Badges */}
          <div className="absolute bottom-3 left-3 z-20 px-2 py-0.5 bg-[#121215]/90 backdrop-blur-md text-[#84848d] border border-[#222227] rounded text-[10px] uppercase font-semibold tracking-wider pointer-events-none">
            Before
          </div>

          <div className="absolute bottom-3 right-3 z-20 px-2 py-0.5 bg-[#121215]/90 backdrop-blur-md text-[#3b82f6] border border-[#3b82f6]/30 rounded text-[10px] uppercase font-semibold tracking-wider pointer-events-none">
            After
          </div>
        </div>
      )}

      {/* Normal Canvas Mode with Interactive Overlays */}
      {hasImage && !compareMode && (
        <div
          ref={canvasWrapperRef}
          onClick={handleCanvasContainerClick}
          className={`relative max-w-full max-h-full rounded shadow-2xl border border-[#222227] overflow-hidden ${
            isEyedropperActive ? "cursor-crosshair" : activeTool === "selective" ? "cursor-crosshair" : ""
          }`}
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
            transformOrigin: "center center",
            aspectRatio: imageAspectRatio,
          }}
        >
          <canvas
            ref={canvasRef}
            className="block w-full h-full object-contain pointer-events-none"
          />

          {/* Interactive Text Layers Overlay */}
          {layers
            .filter((l) => l.type === "text" && l.textData && l.visible)
            .map((layer) => {
              const t = layer.textData!;
              const isSelected = selectedLayerId === layer.id;

              return (
                <div
                  key={layer.id}
                  onMouseDown={(e) => handleTextPointerDown(e, layer.id, t.x, t.y)}
                  onTouchStart={(e) => handleTextPointerDown(e, layer.id, t.x, t.y)}
                  style={{
                    position: "absolute",
                    left: `${t.x * 100}%`,
                    top: `${t.y * 100}%`,
                    fontFamily: t.fontFamily || "inherit",
                    fontSize: `${t.fontSize}px`,
                    color: t.color,
                    lineHeight: 1,
                  }}
                  className={`
                    cursor-move select-none p-1 font-bold whitespace-nowrap will-change-transform
                    ${
                      isSelected
                        ? "ring-2 ring-[#3b82f6] ring-offset-1 ring-offset-black/50 bg-[#3b82f6]/10 rounded shadow-lg"
                        : "hover:ring-1 hover:ring-white/40 rounded"
                    }
                  `}
                >
                  {t.text}

                  {/* Corner Resize Handle */}
                  {isSelected && (
                    <div
                      onMouseDown={(e) => handleResizeHandleDown(e, layer.id, t.fontSize)}
                      onTouchStart={(e) => handleResizeHandleDown(e, layer.id, t.fontSize)}
                      className="absolute -right-2 -bottom-2 w-3.5 h-3.5 bg-[#3b82f6] rounded-full border border-black cursor-se-resize shadow-md"
                    />
                  )}
                </div>
              );
            })}

          {/* Interactive Selective Control Points Overlay */}
          {activeTool === "selective" &&
            selectivePoints.map((pt, idx) => {
              const isSelected = selectedSelectivePointId === pt.id;

              return (
                <div key={pt.id} className="pointer-events-auto">
                  {/* Outer Radius Visualizer Circle */}
                  {isSelected && (
                    <div
                      style={{
                        position: "absolute",
                        left: `${pt.x * 100}%`,
                        top: `${pt.y * 100}%`,
                        width: `${pt.radius * 200}%`,
                        height: `${pt.radius * 200}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      className="rounded-full border border-dashed border-[#3b82f6]/80 bg-[#3b82f6]/5 pointer-events-none flex items-center justify-end pr-1 will-change-transform"
                    >
                      {/* Radius resize handle on edge of circle */}
                      <div
                        onMouseDown={(e) => handlePointRadiusHandleDown(e, pt)}
                        onTouchStart={(e) => handlePointRadiusHandleDown(e, pt)}
                        className="w-3.5 h-3.5 rounded-full bg-[#3b82f6] border border-black cursor-ew-resize pointer-events-auto shadow-md"
                        title="Drag to adjust affected radius"
                      />
                    </div>
                  )}

                  {/* Center Pin Button */}
                  <div
                    onMouseDown={(e) => handlePointPinDown(e, pt)}
                    onTouchStart={(e) => handlePointPinDown(e, pt)}
                    style={{
                      position: "absolute",
                      left: `${pt.x * 100}%`,
                      top: `${pt.y * 100}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    className={`
                      w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs cursor-move shadow-xl will-change-transform
                      ${
                        isSelected
                          ? "bg-[#3b82f6] text-white ring-2 ring-[#3b82f6]/40 scale-105"
                          : "bg-[#18181c] text-[#ededed] border border-[#2d2d34] hover:border-[#3b82f6]"
                      }
                    `}
                    title={`Control Point #${idx + 1}`}
                  >
                    {idx + 1}
                  </div>
                </div>
              );
            })}

          {/* Interactive 8-Handle Crop Box Overlay */}
          {activeTool === "crop" && (
            <>
              {/* Darkened Scrim overlay around crop box */}
              <div
                className="absolute inset-0 pointer-events-none bg-black/65"
                style={{
                  clipPath: `polygon(
                    0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
                    ${cropRect.x * 100}% ${cropRect.y * 100}%,
                    ${cropRect.x * 100}% ${(cropRect.y + cropRect.height) * 100}%,
                    ${(cropRect.x + cropRect.width) * 100}% ${(cropRect.y + cropRect.height) * 100}%,
                    ${(cropRect.x + cropRect.width) * 100}% ${cropRect.y * 100}%,
                    ${cropRect.x * 100}% ${cropRect.y * 100}%
                  )`,
                }}
              />

              {/* Crop Frame Box */}
              <div
                ref={cropBoxDOMRef}
                onMouseDown={(e) => handleCropHandleDown(e, "move")}
                onTouchStart={(e) => handleCropHandleDown(e, "move")}
                style={{
                  position: "absolute",
                  left: `${cropRect.x * 100}%`,
                  top: `${cropRect.y * 100}%`,
                  width: `${cropRect.width * 100}%`,
                  height: `${cropRect.height * 100}%`,
                }}
                className="border border-[#3b82f6] shadow-2xl cursor-move will-change-transform pointer-events-auto"
              >
                {/* 3x3 Rule-of-Thirds Grid */}
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-50">
                  <div className="border-r border-b border-white/30" />
                  <div className="border-r border-b border-white/30" />
                  <div className="border-b border-white/30" />
                  <div className="border-r border-b border-white/30" />
                  <div className="border-r border-b border-white/30" />
                  <div className="border-b border-white/30" />
                  <div className="border-r border-b border-white/30" />
                  <div className="border-r border-b border-white/30" />
                  <div />
                </div>

                {/* 4 Corner Handles */}
                <div
                  onMouseDown={(e) => handleCropHandleDown(e, "nw")}
                  onTouchStart={(e) => handleCropHandleDown(e, "nw")}
                  className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-[#3b82f6] cursor-nwse-resize shadow-md"
                />
                <div
                  onMouseDown={(e) => handleCropHandleDown(e, "ne")}
                  onTouchStart={(e) => handleCropHandleDown(e, "ne")}
                  className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-[#3b82f6] cursor-nesw-resize shadow-md"
                />
                <div
                  onMouseDown={(e) => handleCropHandleDown(e, "sw")}
                  onTouchStart={(e) => handleCropHandleDown(e, "sw")}
                  className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-[#3b82f6] cursor-nesw-resize shadow-md"
                />
                <div
                  onMouseDown={(e) => handleCropHandleDown(e, "se")}
                  onTouchStart={(e) => handleCropHandleDown(e, "se")}
                  className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-[#3b82f6] cursor-nwse-resize shadow-md"
                />

                {/* 4 Edge Handles */}
                <div
                  onMouseDown={(e) => handleCropHandleDown(e, "n")}
                  onTouchStart={(e) => handleCropHandleDown(e, "n")}
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-2 bg-white border border-[#3b82f6] rounded-xs cursor-ns-resize shadow-md"
                />
                <div
                  onMouseDown={(e) => handleCropHandleDown(e, "s")}
                  onTouchStart={(e) => handleCropHandleDown(e, "s")}
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-2 bg-white border border-[#3b82f6] rounded-xs cursor-ns-resize shadow-md"
                />
                <div
                  onMouseDown={(e) => handleCropHandleDown(e, "w")}
                  onTouchStart={(e) => handleCropHandleDown(e, "w")}
                  className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-5 bg-white border border-[#3b82f6] rounded-xs cursor-ew-resize shadow-md"
                />
                <div
                  onMouseDown={(e) => handleCropHandleDown(e, "e")}
                  onTouchStart={(e) => handleCropHandleDown(e, "e")}
                  className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-5 bg-white border border-[#3b82f6] rounded-xs cursor-ew-resize shadow-md"
                />

                {/* Apply Crop Action Button */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1.5 pointer-events-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      applyActiveCrop();
                    }}
                    className="px-2.5 py-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium text-[11px] rounded shadow-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>✓</span> Apply Crop
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Empty State Upload Screen (SHADE Identity) */}
      {!hasImage && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3.5 p-10 border border-dashed border-[#2d2d34] hover:border-[#3b82f6]/50 bg-[#121215]/60 hover:bg-[#121215] rounded-xl transition-all duration-150 cursor-pointer text-center max-w-sm"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-full bg-[#18181c] border border-[#2d2d34] flex items-center justify-center text-[#84848d] group-hover:text-[#ededed]">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-[#ededed]">
              Drop your photo here
            </span>
            <span className="text-xs text-[#84848d]">
              or click to browse from your device
            </span>
          </div>

          <span className="text-[10px] text-[#5c5c66] pt-1">
            JPEG · PNG · WEBP · AVIF
          </span>
        </div>
      )}
    </main>
  );
});

export default CenterCanvas;
