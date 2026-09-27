"use client";

import { useRef, useCallback, useEffect } from "react";
import { Adjustments, TextOverlay } from "@/types/editor";

export interface TransformState {
  rotation: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
  crop: { x: number; y: number; width: number; height: number } | null;
}

export function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beforeCanvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  const adjustmentsRef = useRef<Adjustments>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    exposure: 0,
  });

  const transformRef = useRef<TransformState>({
    rotation: 0,
    flipH: false,
    flipV: false,
    crop: null,
  });

  const textOverlaysRef = useRef<TextOverlay[]>([]);

  /**
   * Main non-destructive pixel processing & canvas render loop
   */
  const renderPipeline = useCallback(() => {
    const canvas = canvasRef.current;
    const img = originalImageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const transform = transformRef.current;
    const adj = adjustmentsRef.current;

    // 1. Calculate transformed dimensions
    const isRotated90 = transform.rotation === 90 || transform.rotation === 270;
    const baseW = isRotated90 ? img.naturalHeight : img.naturalWidth;
    const baseH = isRotated90 ? img.naturalWidth : img.naturalHeight;

    if (baseW === 0 || baseH === 0) return;

    // Crop bounds
    const cropX = transform.crop ? Math.round(transform.crop.x * baseW) : 0;
    const cropY = transform.crop ? Math.round(transform.crop.y * baseH) : 0;
    const cropW = transform.crop ? Math.round(transform.crop.width * baseW) : baseW;
    const cropH = transform.crop ? Math.round(transform.crop.height * baseH) : baseH;

    canvas.width = cropW;
    canvas.height = cropH;

    // Offscreen canvas for initial transform draw
    const offscreen = document.createElement("canvas");
    offscreen.width = baseW;
    offscreen.height = baseH;
    const offCtx = offscreen.getContext("2d");
    if (!offCtx) return;

    offCtx.save();
    offCtx.translate(baseW / 2, baseH / 2);
    offCtx.rotate((transform.rotation * Math.PI) / 180);
    offCtx.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1);

    const drawW = transform.rotation % 180 === 0 ? baseW : baseH;
    const drawH = transform.rotation % 180 === 0 ? baseH : baseW;
    offCtx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    offCtx.restore();

    // Draw unadjusted cropped region onto main canvas
    ctx.drawImage(offscreen, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    // Draw to Before canvas if present for Compare mode (UNADJUSTED BEFORE LAYER)
    if (beforeCanvasRef.current) {
      const bCanvas = beforeCanvasRef.current;
      bCanvas.width = cropW;
      bCanvas.height = cropH;
      const bCtx = bCanvas.getContext("2d");
      if (bCtx) {
        bCtx.drawImage(offscreen, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      }
    }

    // 2. Pixel Adjustments (Brightness, Contrast, Saturation, Exposure)
    if (
      adj.brightness !== 0 ||
      adj.contrast !== 0 ||
      adj.saturation !== 0 ||
      adj.exposure !== 0
    ) {
      const imageData = ctx.getImageData(0, 0, cropW, cropH);
      const data = imageData.data;

      const brightnessOffset = Math.round((adj.brightness / 100) * 255);
      const contrastFactor =
        (259 * (adj.contrast * 2.55 + 255)) / (255 * (259 - adj.contrast * 2.55));
      const exposureFactor = Math.pow(2, adj.exposure / 50);
      const satMult = (adj.saturation + 100) / 100;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        if (adj.exposure !== 0) {
          r *= exposureFactor;
          g *= exposureFactor;
          b *= exposureFactor;
        }

        if (adj.brightness !== 0) {
          r += brightnessOffset;
          g += brightnessOffset;
          b += brightnessOffset;
        }

        if (adj.contrast !== 0) {
          r = contrastFactor * (r - 128) + 128;
          g = contrastFactor * (g - 128) + 128;
          b = contrastFactor * (b - 128) + 128;
        }

        if (adj.saturation !== 0) {
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          r = gray + (r - gray) * satMult;
          g = gray + (g - gray) * satMult;
          b = gray + (b - gray) * satMult;
        }

        data[i] = Math.min(255, Math.max(0, r));
        data[i + 1] = Math.min(255, Math.max(0, g));
        data[i + 2] = Math.min(255, Math.max(0, b));
      }

      ctx.putImageData(imageData, 0, 0);
    }

    // 3. Render Text Overlays
    textOverlaysRef.current.forEach((t) => {
      if (!t.visible) return;
      ctx.save();
      ctx.font = `bold ${t.fontSize}px ui-monospace, monospace`;
      ctx.fillStyle = t.color;
      ctx.textBaseline = "top";
      const posX = t.x * cropW;
      const posY = t.y * cropH;
      ctx.fillText(t.text, posX, posY);
      ctx.restore();
    });
  }, []);

  const loadImage = useCallback(
    (file: File) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
          originalImageRef.current = img;
          transformRef.current = {
            rotation: 0,
            flipH: false,
            flipV: false,
            crop: null,
          };
          adjustmentsRef.current = {
            brightness: 0,
            contrast: 0,
            saturation: 0,
            exposure: 0,
          };
          textOverlaysRef.current = [];
          requestAnimationFrame(() => {
            renderPipeline();
          });
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

  const updateTransform = useCallback(
    (newTransform: Partial<TransformState>) => {
      transformRef.current = { ...transformRef.current, ...newTransform };
      renderPipeline();
    },
    [renderPipeline]
  );

  const updateTextOverlays = useCallback(
    (overlays: TextOverlay[]) => {
      textOverlaysRef.current = overlays;
      renderPipeline();
    },
    [renderPipeline]
  );

  useEffect(() => {
    const handleResize = () => renderPipeline();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [renderPipeline]);

  return {
    canvasRef,
    beforeCanvasRef,
    originalImageRef,
    loadImage,
    updateAdjustments,
    updateTransform,
    updateTextOverlays,
    transformState: transformRef.current,
    renderPipeline,
  };
}
