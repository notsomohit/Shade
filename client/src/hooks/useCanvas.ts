"use client";

import { useRef, useCallback, useEffect } from "react";
import { Adjustments, LayerItem, GridMode, FilterSettings } from "@/types/editor";

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

  const filterRef = useRef<FilterSettings>({
    id: "original",
    name: "Original",
    intensity: 100,
  });

  const transformRef = useRef<TransformState>({
    rotation: 0,
    flipH: false,
    flipV: false,
    crop: null,
  });

  const gridModeRef = useRef<GridMode>("none");
  const layersRef = useRef<LayerItem[]>([]);

  /**
   * Applies preset LUT filter transformations to pixel buffer
   */
  const applyFilterLUT = (data: Uint8ClampedArray, filter: FilterSettings) => {
    if (filter.id === "original" || filter.intensity <= 0) return;
    const factor = filter.intensity / 100;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      let nr = r;
      let ng = g;
      let nb = b;

      switch (filter.id) {
        case "vintage":
          nr = r * 0.9 + g * 0.1;
          ng = g * 0.7 + b * 0.1;
          nb = b * 0.4 + 20;
          break;

        case "cool":
          nr = r * 0.7;
          ng = g * 0.9 + 15;
          nb = b * 1.2 + 30;
          break;

        case "mono":
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          nr = gray;
          ng = gray;
          nb = gray;
          break;

        case "warm":
          nr = r * 1.15 + 15;
          ng = g * 0.95 + 5;
          nb = b * 0.8;
          break;

        case "dramatic":
          nr = r > 128 ? Math.min(255, r * 1.2) : r * 0.8;
          ng = g > 128 ? Math.min(255, g * 1.2) : g * 0.8;
          nb = b > 128 ? Math.min(255, b * 1.2) : b * 0.8;
          break;

        case "cyber":
          nr = r * 1.2 + 20;
          ng = g * 0.6;
          nb = b * 1.3 + 30;
          break;
      }

      data[i] = Math.min(255, Math.max(0, r + (nr - r) * factor));
      data[i + 1] = Math.min(255, Math.max(0, g + (ng - g) * factor));
      data[i + 2] = Math.min(255, Math.max(0, b + (nb - b) * factor));
    }
  };

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
    const filter = filterRef.current;
    const gridMode = gridModeRef.current;

    const isRotated90 = transform.rotation === 90 || transform.rotation === 270;
    const baseW = isRotated90 ? img.naturalHeight : img.naturalWidth;
    const baseH = isRotated90 ? img.naturalWidth : img.naturalHeight;

    if (baseW === 0 || baseH === 0) return;

    const cropX = transform.crop ? Math.round(transform.crop.x * baseW) : 0;
    const cropY = transform.crop ? Math.round(transform.crop.y * baseH) : 0;
    const cropW = transform.crop ? Math.round(transform.crop.width * baseW) : baseW;
    const cropH = transform.crop ? Math.round(transform.crop.height * baseH) : baseH;

    canvas.width = cropW;
    canvas.height = cropH;

    ctx.clearRect(0, 0, cropW, cropH);

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

    if (beforeCanvasRef.current) {
      const bCanvas = beforeCanvasRef.current;
      bCanvas.width = cropW;
      bCanvas.height = cropH;
      const bCtx = bCanvas.getContext("2d");
      if (bCtx) {
        bCtx.clearRect(0, 0, cropW, cropH);
        bCtx.drawImage(offscreen, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      }
    }

    const adjCanvas = document.createElement("canvas");
    adjCanvas.width = cropW;
    adjCanvas.height = cropH;
    const adjCtx = adjCanvas.getContext("2d", { willReadFrequently: true });
    if (!adjCtx) return;

    adjCtx.drawImage(offscreen, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    if (
      adj.brightness !== 0 ||
      adj.contrast !== 0 ||
      adj.saturation !== 0 ||
      adj.exposure !== 0 ||
      filter.id !== "original"
    ) {
      const imageData = adjCtx.getImageData(0, 0, cropW, cropH);
      const data = imageData.data;

      // Scaled perceptual offsets and multipliers for smooth, natural editing
      const brightnessOffset = Math.round((adj.brightness / 100) * 60);
      const contrastFactor = 1 + (adj.contrast / 100) * 0.65;
      const exposureFactor = Math.pow(2, (adj.exposure / 100) * 0.6);
      const satMult = 1 + (adj.saturation / 100) * 0.75;

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

      applyFilterLUT(data, filter);
      adjCtx.putImageData(imageData, 0, 0);
    }

    const currentLayers = layersRef.current;
    if (currentLayers.length === 0) {
      ctx.drawImage(adjCanvas, 0, 0);
    } else {
      for (let i = currentLayers.length - 1; i >= 0; i--) {
        const layer = currentLayers[i];
        if (!layer.visible) continue;

        if (layer.type === "image") {
          ctx.drawImage(adjCanvas, 0, 0);
        } else if (layer.type === "text" && layer.textData) {
          const t = layer.textData;
          if (!t.visible) continue;
          ctx.save();
          const family = t.fontFamily || "ui-monospace, monospace";
          ctx.font = `bold ${t.fontSize}px ${family}`;
          ctx.fillStyle = t.color;
          ctx.textBaseline = "top";
          const posX = t.x * cropW;
          const posY = t.y * cropH;
          ctx.fillText(t.text, posX, posY);
          ctx.restore();
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
          filterRef.current = {
            id: "original",
            name: "Original",
            intensity: 100,
          };
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

  const exportImage = useCallback(
    (format: "image/png" | "image/jpeg" | "image/webp", quality: number) => {
      const currentGrid = gridModeRef.current;
      gridModeRef.current = "none";
      renderPipeline();

      const canvas = canvasRef.current;
      if (!canvas) return null;

      const dataUrl = canvas.toDataURL(format, quality);

      gridModeRef.current = currentGrid;
      renderPipeline();

      return dataUrl;
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
    updateFilter,
    updateTransform,
    updateGridMode,
    updateLayers,
    exportImage,
    transformState: transformRef.current,
    filterSettings: filterRef.current,
    gridMode: gridModeRef.current,
    renderPipeline,
  };
}
