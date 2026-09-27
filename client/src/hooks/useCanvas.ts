"use client";

import { useRef, useCallback, useEffect } from "react";
import {
  Adjustments,
  LayerItem,
  GridMode,
  FilterSettings,
  CurvesData,
  SelectivePoint,
} from "@/types/editor";
import { DEFAULT_CURVES } from "@/components/CurvesTool";
import { processPixelData } from "@/workers/imageProcessor.worker";

export interface TransformState {
  rotation: number; // 0, 90, 180, 270
  straighten: number; // -45 to 45
  flipH: boolean;
  flipV: boolean;
  aspectRatioPreset?: "free" | "original" | "1:1" | "4:3" | "16:9" | "3:2" | "9:16";
  crop: { x: number; y: number; width: number; height: number } | null;
}

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
  temperature: 0,
  tint: 0,
  structure: 0,
  vignette: 0,
  grain: 0,
};

const MAX_PREVIEW_DIMENSION = 1920;

export function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beforeCanvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Cached offscreen buffers to avoid GC allocations on every frame
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const adjCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const adjustmentsRef = useRef<Adjustments>({ ...DEFAULT_ADJUSTMENTS });
  const curvesRef = useRef<CurvesData>({ ...DEFAULT_CURVES });
  const selectivePointsRef = useRef<SelectivePoint[]>([]);

  const filterRef = useRef<FilterSettings>({
    id: "original",
    name: "Original",
    intensity: 100,
  });

  const transformRef = useRef<TransformState>({
    rotation: 0,
    straighten: 0,
    flipH: false,
    flipV: false,
    crop: null,
  });

  const gridModeRef = useRef<GridMode>("none");
  const layersRef = useRef<LayerItem[]>([]);
  const rafIdRef = useRef<number | null>(null);

  // Cache loaded double exposure images
  const doubleExposureImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  /**
   * Generates or retrieves the downscaled preview canvas for high-FPS interactive editing
   */
  const getPreviewSource = useCallback((): HTMLCanvasElement | HTMLImageElement | null => {
    const img = originalImageRef.current;
    if (!img) return null;

    // If already reasonably sized, use the original directly
    if (img.naturalWidth <= MAX_PREVIEW_DIMENSION && img.naturalHeight <= MAX_PREVIEW_DIMENSION) {
      return img;
    }

    // Otherwise use/create preview canvas
    if (!previewCanvasRef.current) {
      const scale = Math.min(
        MAX_PREVIEW_DIMENSION / img.naturalWidth,
        MAX_PREVIEW_DIMENSION / img.naturalHeight
      );
      const pw = Math.round(img.naturalWidth * scale);
      const ph = Math.round(img.naturalHeight * scale);

      const pCanvas = document.createElement("canvas");
      pCanvas.width = pw;
      pCanvas.height = ph;
      const pCtx = pCanvas.getContext("2d");
      if (pCtx) {
        pCtx.imageSmoothingEnabled = true;
        pCtx.imageSmoothingQuality = "high";
        pCtx.drawImage(img, 0, 0, pw, ph);
        previewCanvasRef.current = pCanvas;
      }
    }

    return previewCanvasRef.current || img;
  }, []);

  /**
   * Internal render execution
   */
  const executeRender = useCallback(() => {
    const canvas = canvasRef.current;
    const src = getPreviewSource();
    if (!canvas || !src) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const transform = transformRef.current;
    const adj = adjustmentsRef.current;
    const filter = filterRef.current;
    const curves = curvesRef.current;
    const selectivePoints = selectivePointsRef.current;
    const gridMode = gridModeRef.current;

    const naturalW = src instanceof HTMLImageElement ? src.naturalWidth : src.width;
    const naturalH = src instanceof HTMLImageElement ? src.naturalHeight : src.height;

    const isRotated90 = transform.rotation === 90 || transform.rotation === 270;
    const baseW = isRotated90 ? naturalH : naturalW;
    const baseH = isRotated90 ? naturalW : naturalH;

    if (baseW === 0 || baseH === 0) return;

    const cropX = transform.crop ? Math.round(transform.crop.x * baseW) : 0;
    const cropY = transform.crop ? Math.round(transform.crop.y * baseH) : 0;
    const cropW = transform.crop ? Math.round(transform.crop.width * baseW) : baseW;
    const cropH = transform.crop ? Math.round(transform.crop.height * baseH) : baseH;

    if (canvas.width !== cropW || canvas.height !== cropH) {
      canvas.width = cropW;
      canvas.height = cropH;
    }

    ctx.clearRect(0, 0, cropW, cropH);

    // Reuse or initialize offscreen canvas
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement("canvas");
    }
    const offscreen = offscreenCanvasRef.current;
    if (offscreen.width !== baseW || offscreen.height !== baseH) {
      offscreen.width = baseW;
      offscreen.height = baseH;
    }
    const offCtx = offscreen.getContext("2d");
    if (!offCtx) return;

    offCtx.clearRect(0, 0, baseW, baseH);
    offCtx.save();
    offCtx.translate(baseW / 2, baseH / 2);
    const totalRotationDeg = transform.rotation + (transform.straighten || 0);
    offCtx.rotate((totalRotationDeg * Math.PI) / 180);
    offCtx.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1);

    const drawW = transform.rotation % 180 === 0 ? baseW : baseH;
    const drawH = transform.rotation % 180 === 0 ? baseH : baseW;
    offCtx.drawImage(src, -drawW / 2, -drawH / 2, drawW, drawH);
    offCtx.restore();

    // Render "Before" compare canvas if mounted
    if (beforeCanvasRef.current) {
      const bCanvas = beforeCanvasRef.current;
      if (bCanvas.width !== cropW || bCanvas.height !== cropH) {
        bCanvas.width = cropW;
        bCanvas.height = cropH;
      }
      const bCtx = bCanvas.getContext("2d");
      if (bCtx) {
        bCtx.clearRect(0, 0, cropW, cropH);
        bCtx.drawImage(offscreen, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      }
    }

    // Reuse or initialize adjusted canvas
    if (!adjCanvasRef.current) {
      adjCanvasRef.current = document.createElement("canvas");
    }
    const adjCanvas = adjCanvasRef.current;
    if (adjCanvas.width !== cropW || adjCanvas.height !== cropH) {
      adjCanvas.width = cropW;
      adjCanvas.height = cropH;
    }
    const adjCtx = adjCanvas.getContext("2d", { willReadFrequently: true });
    if (!adjCtx) return;

    adjCtx.clearRect(0, 0, cropW, cropH);
    adjCtx.drawImage(offscreen, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    const hasAnyAdjustments =
      adj.brightness !== 0 ||
      adj.contrast !== 0 ||
      adj.saturation !== 0 ||
      adj.exposure !== 0 ||
      adj.temperature !== 0 ||
      adj.tint !== 0 ||
      adj.structure !== 0 ||
      adj.vignette !== 0 ||
      adj.grain > 0 ||
      filter.id !== "original" ||
      (selectivePoints && selectivePoints.length > 0) ||
      (curves &&
        ((curves.rgb && curves.rgb.length > 2) ||
          (curves.red && curves.red.length > 2) ||
          (curves.green && curves.green.length > 2) ||
          (curves.blue && curves.blue.length > 2) ||
          (curves.rgb && (curves.rgb[0].y !== 0 || curves.rgb[1]?.y !== 255))));

    if (hasAnyAdjustments) {
      const imageData = adjCtx.getImageData(0, 0, cropW, cropH);
      processPixelData(
        imageData.data,
        cropW,
        cropH,
        adj,
        filter,
        selectivePoints,
        curves
      );
      adjCtx.putImageData(imageData, 0, 0);
    }

    // Layer compositing
    const currentLayers = layersRef.current;
    if (currentLayers.length === 0) {
      ctx.drawImage(adjCanvas, 0, 0);
    } else {
      for (let i = currentLayers.length - 1; i >= 0; i--) {
        const layer = currentLayers[i];
        if (!layer.visible) continue;

        if (layer.type === "image") {
          ctx.drawImage(adjCanvas, 0, 0);
        } else if (layer.type === "double-exposure" && layer.doubleExposureData) {
          const de = layer.doubleExposureData;
          let deImg = doubleExposureImagesRef.current.get(de.imageUrl);
          if (!deImg) {
            deImg = new Image();
            deImg.crossOrigin = "anonymous";
            deImg.src = de.imageUrl;
            deImg.onload = () => executeRender();
            doubleExposureImagesRef.current.set(de.imageUrl, deImg);
          } else if (deImg.complete) {
            ctx.save();
            ctx.globalAlpha = de.opacity;
            ctx.globalCompositeOperation = (de.blendMode === "normal" ? "source-over" : de.blendMode) as GlobalCompositeOperation;
            ctx.drawImage(deImg, 0, 0, cropW, cropH);
            ctx.restore();
          }
        }
      }
    }

    // High Visibility Grid / Rule of Thirds Guides
    if (gridMode !== "none") {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.shadowBlur = 3;

      if (gridMode === "thirds") {
        const stepX = cropW / 3;
        const stepY = cropH / 3;

        for (let i = 1; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(i * stepX, 0);
          ctx.lineTo(i * stepX, cropH);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(0, i * stepY);
          ctx.lineTo(cropW, i * stepY);
          ctx.stroke();
        }
      } else if (gridMode === "grid") {
        const cols = 8;
        const rows = 8;
        const stepX = cropW / cols;
        const stepY = cropH / rows;

        for (let i = 1; i < cols; i++) {
          ctx.beginPath();
          ctx.moveTo(i * stepX, 0);
          ctx.lineTo(i * stepX, cropH);
          ctx.stroke();
        }
        for (let j = 1; j < rows; j++) {
          ctx.beginPath();
          ctx.moveTo(0, j * stepY);
          ctx.lineTo(cropW, j * stepY);
          ctx.stroke();
        }
      }

      ctx.restore();
    }
  }, [getPreviewSource]);

  /**
   * Main non-destructive pixel processing & canvas render loop (throttled via requestAnimationFrame)
   */
  const renderPipeline = useCallback(() => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = requestAnimationFrame(() => {
      executeRender();
      rafIdRef.current = null;
    });
  }, [executeRender]);

  /**
   * Sample pixel RGB at normalized canvas coordinates for Eyedropper White Balance calibration
   */
  const samplePixelWhiteBalance = useCallback(
    (normX: number, normY: number): { temperature: number; tint: number } | null => {
      const canvas = beforeCanvasRef.current || canvasRef.current;
      if (!canvas) return null;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return null;

      const px = Math.min(canvas.width - 1, Math.max(0, Math.round(normX * canvas.width)));
      const py = Math.min(canvas.height - 1, Math.max(0, Math.round(normY * canvas.height)));

      const pixel = ctx.getImageData(px, py, 1, 1).data;
      const r = pixel[0];
      const g = pixel[1];
      const b = pixel[2];

      const avg = (r + g + b) / 3;
      if (avg < 10 || avg > 245) return null;

      const tempDelta = Math.round(((avg - r) + (b - avg)) * 0.8);
      const tintDelta = Math.round((avg - g) * 1.2);

      return {
        temperature: Math.min(100, Math.max(-100, tempDelta)),
        tint: Math.min(100, Math.max(-100, tintDelta)),
      };
    },
    []
  );

  const loadImage = useCallback(
    (file: File) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
          originalImageRef.current = img;
          previewCanvasRef.current = null; // Invalidate cached preview
          transformRef.current = {
            rotation: 0,
            straighten: 0,
            flipH: false,
            flipV: false,
            crop: null,
          };
          adjustmentsRef.current = { ...DEFAULT_ADJUSTMENTS };
          curvesRef.current = { ...DEFAULT_CURVES };
          selectivePointsRef.current = [];
          filterRef.current = {
            id: "original",
            name: "Original",
            intensity: 100,
          };
          renderPipeline();
          resolve(img);
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("Failed to load image"));
        };

        img.src = url;
      });
    },
    [renderPipeline]
  );

  const updateAdjustments = useCallback(
    (newAdj: Adjustments) => {
      adjustmentsRef.current = newAdj;
      renderPipeline();
    },
    [renderPipeline]
  );

  const updateCurves = useCallback(
    (newCurves: CurvesData) => {
      curvesRef.current = newCurves;
      renderPipeline();
    },
    [renderPipeline]
  );

  const updateSelectivePoints = useCallback(
    (newPoints: SelectivePoint[]) => {
      selectivePointsRef.current = newPoints;
      renderPipeline();
    },
    [renderPipeline]
  );

  const updateFilter = useCallback(
    (newFilter: FilterSettings) => {
      filterRef.current = newFilter;
      renderPipeline();
    },
    [renderPipeline]
  );

  const updateTransform = useCallback(
    (newTransform: Partial<TransformState>) => {
      transformRef.current = { ...transformRef.current, ...newTransform };
      renderPipeline();
    },
    [renderPipeline]
  );

  const updateGridMode = useCallback(
    (mode: GridMode) => {
      gridModeRef.current = mode;
      renderPipeline();
    },
    [renderPipeline]
  );

  const updateLayers = useCallback(
    (newLayers: LayerItem[]) => {
      layersRef.current = newLayers;
      renderPipeline();
    },
    [renderPipeline]
  );

  /**
   * Full-resolution Master Export
   */
  const exportImage = useCallback(
    (format: "image/png" | "image/jpeg" | "image/webp", quality: number) => {
      const img = originalImageRef.current;
      if (!img) return null;

      const transform = transformRef.current;
      const adj = adjustmentsRef.current;
      const filter = filterRef.current;
      const curves = curvesRef.current;
      const selectivePoints = selectivePointsRef.current;

      const naturalW = img.naturalWidth;
      const naturalH = img.naturalHeight;

      const isRotated90 = transform.rotation === 90 || transform.rotation === 270;
      const baseW = isRotated90 ? naturalH : naturalW;
      const baseH = isRotated90 ? naturalW : naturalH;

      const cropX = transform.crop ? Math.round(transform.crop.x * baseW) : 0;
      const cropY = transform.crop ? Math.round(transform.crop.y * baseH) : 0;
      const cropW = transform.crop ? Math.round(transform.crop.width * baseW) : baseW;
      const cropH = transform.crop ? Math.round(transform.crop.height * baseH) : baseH;

      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = cropW;
      exportCanvas.height = cropH;
      const expCtx = exportCanvas.getContext("2d", { willReadFrequently: true });
      if (!expCtx) return null;

      const fullOffscreen = document.createElement("canvas");
      fullOffscreen.width = baseW;
      fullOffscreen.height = baseH;
      const fullOffCtx = fullOffscreen.getContext("2d");
      if (!fullOffCtx) return null;

      fullOffCtx.save();
      fullOffCtx.translate(baseW / 2, baseH / 2);
      const totalRotationDeg = transform.rotation + (transform.straighten || 0);
      fullOffCtx.rotate((totalRotationDeg * Math.PI) / 180);
      fullOffCtx.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1);

      const drawW = transform.rotation % 180 === 0 ? baseW : baseH;
      const drawH = transform.rotation % 180 === 0 ? baseH : baseW;
      fullOffCtx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      fullOffCtx.restore();

      expCtx.drawImage(fullOffscreen, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      const imageData = expCtx.getImageData(0, 0, cropW, cropH);
      processPixelData(
        imageData.data,
        cropW,
        cropH,
        adj,
        filter,
        selectivePoints,
        curves
      );
      expCtx.putImageData(imageData, 0, 0);

      // Composite full-res layers
      const currentLayers = layersRef.current;
      for (let i = currentLayers.length - 1; i >= 0; i--) {
        const layer = currentLayers[i];
        if (!layer.visible) continue;

        if (layer.type === "text" && layer.textData) {
          const t = layer.textData;
          if (!t.visible) continue;
          expCtx.save();
          const family = t.fontFamily || "ui-monospace, monospace";
          // Scale font size proportionally to master resolution
          const scale = cropW / (canvasRef.current?.width || cropW);
          const scaledFontSize = Math.round(t.fontSize * scale);
          expCtx.font = `bold ${scaledFontSize}px ${family}`;
          expCtx.fillStyle = t.color;
          expCtx.textBaseline = "top";
          const posX = t.x * cropW;
          const posY = t.y * cropH;
          expCtx.fillText(t.text, posX, posY);
          expCtx.restore();
        }
      }

      return exportCanvas.toDataURL(format, quality);
    },
    []
  );

  useEffect(() => {
    const handleResize = () => renderPipeline();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [renderPipeline]);

  return {
    canvasRef,
    beforeCanvasRef,
    originalImageRef,
    loadImage,
    updateAdjustments,
    updateCurves,
    updateSelectivePoints,
    updateFilter,
    updateTransform,
    updateGridMode,
    updateLayers,
    samplePixelWhiteBalance,
    exportImage,
    transformState: transformRef.current,
    filterSettings: filterRef.current,
    adjustments: adjustmentsRef.current,
    curves: curvesRef.current,
    selectivePoints: selectivePointsRef.current,
    gridMode: gridModeRef.current,
    renderPipeline,
  };
}
