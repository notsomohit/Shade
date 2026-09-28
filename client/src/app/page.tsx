"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useCanvas, DEFAULT_ADJUSTMENTS, TransformState } from "@/hooks/useCanvas";
import {
  ToolType,
  Adjustments,
  LayerItem,
  ImageMetaData,
  GridMode,
  FilterSettings,
  ExportSettings,
  CurvesData,
  SelectivePoint,
  PhotoPreset,
} from "@/types/editor";
import TopBar from "@/components/TopBar";
import LeftToolbar from "@/components/LeftToolbar";
import CenterCanvas from "@/components/CenterCanvas";
import RightPanel from "@/components/RightPanel";
import BottomBar from "@/components/BottomBar";
import FilterPresetsStrip from "@/components/FilterPresetsStrip";
import ShortcutsOverlay from "@/components/ShortcutsOverlay";
import { DEFAULT_CURVES } from "@/components/CurvesTool";
import { useToast } from "@/components/Toast";

interface HistoryEntry {
  adjustments: Adjustments;
  filter: FilterSettings;
  curves: CurvesData;
  selectivePoints: SelectivePoint[];
  layers: LayerItem[];
  transform: TransformState;
}

const DEFAULT_TRANSFORM: TransformState = {
  rotation: 0,
  straighten: 0,
  flipH: false,
  flipV: false,
  aspectRatioPreset: "free",
  crop: null,
};

export default function Home() {
  const { toast: showToast } = useToast();

  const {
    canvasRef,
    beforeCanvasRef,
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
    filterSettings,
    renderPipeline,
  } = useCanvas();

  // Primary Workspace State
  const [hasImage, setHasImage] = useState(false);
  const [imageData, setImageData] = useState<ImageMetaData | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [zoom, setZoom] = useState(100);
  const [compareMode, setCompareMode] = useState(false);
  const [gridMode, setGridMode] = useState<GridMode>("none");
  const [isProcessing, setIsProcessing] = useState(false);

  // Panel collapse & shortcuts state
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Snapseed Editing States
  const [adjustments, setAdjustments] = useState<Adjustments>({ ...DEFAULT_ADJUSTMENTS });
  const [curves, setCurves] = useState<CurvesData>({ ...DEFAULT_CURVES });
  const [selectivePoints, setSelectivePoints] = useState<SelectivePoint[]>([]);
  const [selectedSelectivePointId, setSelectedSelectivePointId] = useState<string | null>(null);
  const [isEyedropperActive, setIsEyedropperActive] = useState(false);
  const [transform, setTransform] = useState<TransformState>({ ...DEFAULT_TRANSFORM });

  // Layers & Export
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: "image/jpeg",
    quality: 0.92,
  });

  // History Stacks (Undo / Redo)
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Debounced pipeline timer ref
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Push an immutable snapshot to Undo history
   */
  const pushHistory = useCallback(
    (newEntry: Partial<HistoryEntry>) => {
      const entry: HistoryEntry = {
        adjustments: newEntry.adjustments ?? adjustments,
        filter: newEntry.filter ?? filterSettings,
        curves: newEntry.curves ?? curves,
        selectivePoints: newEntry.selectivePoints ?? selectivePoints,
        layers: newEntry.layers ?? layers,
        transform: newEntry.transform ?? transform,
      };

      setHistory((prev) => {
        const next = prev.slice(0, historyIndex + 1);
        return [...next, entry];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [adjustments, filterSettings, curves, selectivePoints, layers, transform, historyIndex]
  );

  /**
   * Undo Handler
   */
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setAdjustments(prev.adjustments);
      updateAdjustments(prev.adjustments);
      updateFilter(prev.filter);
      setCurves(prev.curves);
      updateCurves(prev.curves);
      setSelectivePoints(prev.selectivePoints);
      updateSelectivePoints(prev.selectivePoints);
      setLayers(prev.layers);
      updateLayers(prev.layers);

      if (prev.transform) {
        setTransform(prev.transform);
        updateTransform(prev.transform);
      }

      setHistoryIndex(historyIndex - 1);
      showToast("Undo", "info");
    }
  }, [
    history,
    historyIndex,
    updateAdjustments,
    updateFilter,
    updateCurves,
    updateSelectivePoints,
    updateLayers,
    updateTransform,
    showToast,
  ]);

  /**
   * Redo Handler
   */
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setAdjustments(next.adjustments);
      updateAdjustments(next.adjustments);
      updateFilter(next.filter);
      setCurves(next.curves);
      updateCurves(next.curves);
      setSelectivePoints(next.selectivePoints);
      updateSelectivePoints(next.selectivePoints);
      setLayers(next.layers);
      updateLayers(next.layers);

      if (next.transform) {
        setTransform(next.transform);
        updateTransform(next.transform);
      }

      setHistoryIndex(historyIndex + 1);
      showToast("Redo", "info");
    }
  }, [
    history,
    historyIndex,
    updateAdjustments,
    updateFilter,
    updateCurves,
    updateSelectivePoints,
    updateLayers,
    updateTransform,
    showToast,
  ]);

  /**
   * Image file upload handler
   */
  const handleImageSelect = useCallback(
    async (file: File) => {
      try {
        setIsProcessing(true);
        const img = await loadImage(file);
        setImageData({
          name: file.name,
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: img.naturalWidth / img.naturalHeight,
        });

        const initialLayers: LayerItem[] = [
          {
            id: "base_image",
            name: "Background Photo",
            visible: true,
            type: "image",
          },
        ];

        setAdjustments({ ...DEFAULT_ADJUSTMENTS });
        setCurves({ ...DEFAULT_CURVES });
        setSelectivePoints([]);
        setSelectedSelectivePointId(null);
        setTransform({ ...DEFAULT_TRANSFORM });
        setLayers(initialLayers);
        updateLayers(initialLayers);
        setHasImage(true);

        // Reset history
        const initialEntry: HistoryEntry = {
          adjustments: { ...DEFAULT_ADJUSTMENTS },
          filter: { id: "original", name: "Original", intensity: 100 },
          curves: { ...DEFAULT_CURVES },
          selectivePoints: [],
          layers: initialLayers,
          transform: { ...DEFAULT_TRANSFORM },
        };
        setHistory([initialEntry]);
        setHistoryIndex(0);

        showToast(`Loaded ${file.name}`, "success");
      } catch {
        showToast("Failed to load image", "error");
      } finally {
        setIsProcessing(false);
      }
    },
    [loadImage, updateLayers, showToast]
  );

  /**
   * Adjustment change handler with fast debounced render pipeline
   */
  const handleChangeAdjustment = useCallback(
    (key: keyof Adjustments, value: number) => {
      const next = { ...adjustments, [key]: value };
      setAdjustments(next);

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        updateAdjustments(next);
        pushHistory({ adjustments: next });
      }, 100);
    },
    [adjustments, updateAdjustments, pushHistory]
  );

  const handleResetAdjustments = useCallback(() => {
    setAdjustments({ ...DEFAULT_ADJUSTMENTS });
    updateAdjustments({ ...DEFAULT_ADJUSTMENTS });
    pushHistory({ adjustments: { ...DEFAULT_ADJUSTMENTS } });
    showToast("Reset all adjustments", "info");
  }, [updateAdjustments, pushHistory, showToast]);

  /**
   * Tone Curves Change Handler
   */
  const handleChangeCurves = useCallback(
    (newCurves: CurvesData) => {
      setCurves(newCurves);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        updateCurves(newCurves);
        pushHistory({ curves: newCurves });
      }, 100);
    },
    [updateCurves, pushHistory]
  );

  /**
   * Selective Control Points Handlers
   */
  const handleAddSelectivePoint = useCallback(() => {
    const newPt: SelectivePoint = {
      id: `sp_${Date.now()}`,
      x: 0.5,
      y: 0.5,
      radius: 0.25,
      brightness: 0,
      contrast: 0,
      saturation: 0,
      structure: 0,
    };
    const next = [...selectivePoints, newPt];
    setSelectivePoints(next);
    setSelectedSelectivePointId(newPt.id);
    updateSelectivePoints(next);
    pushHistory({ selectivePoints: next });
    setActiveTool("selective");
    showToast("Added control point", "success");
  }, [selectivePoints, updateSelectivePoints, pushHistory, showToast]);

  const handleAddSelectivePointAt = useCallback(
    (normX: number, normY: number) => {
      const newPt: SelectivePoint = {
        id: `sp_${Date.now()}`,
        x: normX,
        y: normY,
        radius: 0.25,
        brightness: 0,
        contrast: 0,
        saturation: 0,
        structure: 0,
      };
      const next = [...selectivePoints, newPt];
      setSelectivePoints(next);
      setSelectedSelectivePointId(newPt.id);
      updateSelectivePoints(next);
      pushHistory({ selectivePoints: next });
      showToast(`Placed pin at ${Math.round(normX * 100)}%, ${Math.round(normY * 100)}%`, "info");
    },
    [selectivePoints, updateSelectivePoints, pushHistory, showToast]
  );

  const handleUpdateSelectivePoint = useCallback(
    (id: string, updates: Partial<SelectivePoint>) => {
      const next = selectivePoints.map((p) => (p.id === id ? { ...p, ...updates } : p));
      setSelectivePoints(next);

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        updateSelectivePoints(next);
        pushHistory({ selectivePoints: next });
      }, 80);
    },
    [selectivePoints, updateSelectivePoints, pushHistory]
  );

  const handleDeleteSelectivePoint = useCallback(
    (id: string) => {
      const next = selectivePoints.filter((p) => p.id !== id);
      setSelectivePoints(next);
      if (selectedSelectivePointId === id) {
        setSelectedSelectivePointId(null);
      }
      updateSelectivePoints(next);
      pushHistory({ selectivePoints: next });
      showToast("Removed control point", "info");
    },
    [selectivePoints, selectedSelectivePointId, updateSelectivePoints, pushHistory, showToast]
  );

  /**
   * Eyedropper White Balance Handler
   */
  const handleSampleWhiteBalance = useCallback(
    (normX: number, normY: number) => {
      const result = samplePixelWhiteBalance(normX, normY);
      setIsEyedropperActive(false);

      if (result) {
        const next = {
          ...adjustments,
          temperature: result.temperature,
          tint: result.tint,
        };
        setAdjustments(next);
        updateAdjustments(next);
        pushHistory({ adjustments: next });
        showToast(
          `WB calibrated (Temp: ${result.temperature > 0 ? "+" : ""}${result.temperature}, Tint: ${result.tint > 0 ? "+" : ""}${result.tint})`,
          "success"
        );
      } else {
        showToast("Area too bright or dark to calibrate WB", "info");
      }
    },
    [samplePixelWhiteBalance, adjustments, updateAdjustments, pushHistory, showToast]
  );

  /**
   * Non-destructive Professional Photo Preset Handler (with optional intensity scaling)
   */
  const handleApplyPreset = useCallback(
    (preset: PhotoPreset, intensity: number = 100) => {
      const factor = intensity / 100;
      const base = DEFAULT_ADJUSTMENTS;
      const target = preset.adjustments;

      const nextAdj: Adjustments = {
        exposure: Math.round(base.exposure + (target.exposure - base.exposure) * factor),
        brightness: Math.round(base.brightness + (target.brightness - base.brightness) * factor),
        contrast: Math.round(base.contrast + (target.contrast - base.contrast) * factor),
        highlights: Math.round(base.highlights + (target.highlights - base.highlights) * factor),
        shadows: Math.round(base.shadows + (target.shadows - base.shadows) * factor),
        whites: Math.round(base.whites + (target.whites - base.whites) * factor),
        blacks: Math.round(base.blacks + (target.blacks - base.blacks) * factor),
        saturation: Math.round(base.saturation + (target.saturation - base.saturation) * factor),
        vibrance: Math.round(base.vibrance + (target.vibrance - base.vibrance) * factor),
        temperature: Math.round(base.temperature + (target.temperature - base.temperature) * factor),
        tint: Math.round(base.tint + (target.tint - base.tint) * factor),
        sharpness: Math.round(base.sharpness + (target.sharpness - base.sharpness) * factor),
        clarity: Math.round(base.clarity + (target.clarity - base.clarity) * factor),
        blur: Math.round(base.blur + (target.blur - base.blur) * factor),
        grain: Math.round(base.grain + (target.grain - base.grain) * factor),
        vignette: Math.round(base.vignette + (target.vignette - base.vignette) * factor),
      };

      const nextCurves: CurvesData = preset.curves || curves;
      const nextFilter: FilterSettings = {
        id: preset.id,
        name: preset.name,
        intensity: 100,
      };

      setAdjustments(nextAdj);
      updateAdjustments(nextAdj);
      if (preset.curves) {
        setCurves(nextCurves);
        updateCurves(nextCurves);
      }
      updateFilter(nextFilter);

      pushHistory({
        adjustments: nextAdj,
        curves: preset.curves ? nextCurves : undefined,
        filter: nextFilter,
      });

      showToast(`Applied preset: ${preset.name}`, "success");
    },
    [curves, updateAdjustments, updateCurves, updateFilter, pushHistory, showToast]
  );

  /**
   * Transform & Crop Handlers with Full History Tracking
   */
  const handleUpdateTransform = useCallback(
    (newTransform: Partial<TransformState>) => {
      const next = { ...transform, ...newTransform };
      setTransform(next);
      updateTransform(newTransform);
      pushHistory({ transform: next });
    },
    [transform, updateTransform, pushHistory]
  );

  const handleApplyCrop = useCallback(
    (crop: { x: number; y: number; width: number; height: number }) => {
      const next = { ...transform, crop };
      setTransform(next);
      updateTransform({ crop });
      pushHistory({ transform: next });
      setActiveTool("select");
      showToast("Applied crop", "success");
    },
    [transform, updateTransform, pushHistory, showToast]
  );

  const handleResetCrop = useCallback(() => {
    const next = { ...transform, crop: null, aspectRatioPreset: "free" as const };
    setTransform(next);
    updateTransform({ crop: null, aspectRatioPreset: "free" });
    pushHistory({ transform: next });
    showToast("Reset crop to full photo", "info");
  }, [transform, updateTransform, pushHistory, showToast]);

  /**
   * Double Exposure Layer Handler
   */
  const handleAddDoubleExposureLayer = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      const newLayer: LayerItem = {
        id: `de_${Date.now()}`,
        name: `Exposure (${file.name})`,
        visible: true,
        type: "double-exposure",
        doubleExposureData: {
          imageUrl: url,
          opacity: 0.6,
          blendMode: "screen",
        },
      };
      const next = [newLayer, ...layers];
      setLayers(next);
      updateLayers(next);
      setSelectedLayerId(newLayer.id);
      pushHistory({ layers: next });
      showToast("Added Double Exposure layer", "success");
    },
    [layers, updateLayers, pushHistory, showToast]
  );

  const handleUpdateDoubleExposureLayer = useCallback(
    (
      id: string,
      opacity: number,
      blendMode: "normal" | "screen" | "multiply" | "overlay" | "soft-light"
    ) => {
      const next = layers.map((l) =>
        l.id === id && l.doubleExposureData
          ? {
              ...l,
              doubleExposureData: {
                ...l.doubleExposureData,
                opacity,
                blendMode,
              },
            }
          : l
      );
      setLayers(next);
      updateLayers(next);
    },
    [layers, updateLayers]
  );

  /**
   * Text Layer Handlers
   */
  const handleAddTextLayer = useCallback(
    (
      text: string,
      fontSize: number,
      color: string,
      fontFamily: string,
      category: "standard" | "design" | "artsy" | "display"
    ) => {
      const newTextLayer: LayerItem = {
        id: `text_${Date.now()}`,
        name: `Text: ${text.slice(0, 12)}`,
        visible: true,
        type: "text",
        textData: {
          id: `t_${Date.now()}`,
          text,
          fontSize,
          color,
          fontFamily,
          fontCategory: category,
          x: 0.35,
          y: 0.45,
          visible: true,
        },
      };

      const next = [newTextLayer, ...layers];
      setLayers(next);
      updateLayers(next);
      setSelectedLayerId(newTextLayer.id);
      pushHistory({ layers: next });
      showToast("Added text layer", "success");
    },
    [layers, updateLayers, pushHistory, showToast]
  );

  const handleUpdateTextLayer = useCallback(
    (
      id: string,
      updates: Partial<{ text: string; fontSize: number; color: string; fontFamily: string }>
    ) => {
      const next = layers.map((l) =>
        l.id === id && l.textData
          ? {
              ...l,
              name: updates.text ? `Text: ${updates.text.slice(0, 12)}` : l.name,
              textData: { ...l.textData, ...updates },
            }
          : l
      );
      setLayers(next);
      updateLayers(next);
    },
    [layers, updateLayers]
  );

  const handleUpdateTextPosition = useCallback(
    (id: string, x: number, y: number) => {
      const next = layers.map((l) =>
        l.id === id && l.textData
          ? { ...l, textData: { ...l.textData, x, y } }
          : l
      );
      setLayers(next);
      updateLayers(next);
    },
    [layers, updateLayers]
  );

  const handleUpdateTextFontSize = useCallback(
    (id: string, fontSize: number) => {
      const next = layers.map((l) =>
        l.id === id && l.textData
          ? { ...l, textData: { ...l.textData, fontSize } }
          : l
      );
      setLayers(next);
      updateLayers(next);
    },
    [layers, updateLayers]
  );

  /**
   * Layer Management Handlers
   */
  const handleToggleLayerVisibility = useCallback(
    (id: string) => {
      const next = layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l));
      setLayers(next);
      updateLayers(next);
      pushHistory({ layers: next });
    },
    [layers, updateLayers, pushHistory]
  );

  const handleDeleteLayer = useCallback(
    (id: string) => {
      const next = layers.filter((l) => l.id !== id);
      setLayers(next);
      if (selectedLayerId === id) setSelectedLayerId(null);
      updateLayers(next);
      pushHistory({ layers: next });
      showToast("Layer removed", "info");
    },
    [layers, selectedLayerId, updateLayers, pushHistory, showToast]
  );

  const handleDuplicateLayer = useCallback(
    (id: string) => {
      const target = layers.find((l) => l.id === id);
      if (!target) return;

      const dupe: LayerItem = {
        ...target,
        id: `layer_${Date.now()}`,
        name: `${target.name} (Copy)`,
        textData: target.textData
          ? {
              ...target.textData,
              id: `t_${Date.now()}`,
              x: Math.min(0.9, target.textData.x + 0.05),
              y: Math.min(0.9, target.textData.y + 0.05),
            }
          : undefined,
      };

      const next = [dupe, ...layers];
      setLayers(next);
      updateLayers(next);
      setSelectedLayerId(dupe.id);
      pushHistory({ layers: next });
      showToast("Duplicated layer", "success");
    },
    [layers, updateLayers, pushHistory, showToast]
  );

  const handleRenameLayer = useCallback(
    (id: string, name: string) => {
      const next = layers.map((l) => (l.id === id ? { ...l, name } : l));
      setLayers(next);
      updateLayers(next);
    },
    [layers, updateLayers]
  );

  const handleReorderLayers = useCallback(
    (newLayers: LayerItem[]) => {
      setLayers(newLayers);
      updateLayers(newLayers);
      pushHistory({ layers: newLayers });
    },
    [updateLayers, pushHistory]
  );

  /**
   * Zoom & Viewport Handlers
   */
  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(400, z + 15)), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(25, z - 15)), []);
  const handleResetZoom = useCallback(() => setZoom(100), []);
  const handleZoomFit = useCallback(() => setZoom(85), []);

  /**
   * Export Handler
   */
  const handleTriggerExport = useCallback(() => {
    if (!hasImage) return;
    setIsProcessing(true);
    const dataUrl = exportImage(exportSettings.format, exportSettings.quality);
    setIsProcessing(false);

    if (dataUrl) {
      const ext = exportSettings.format.split("/")[1];
      const link = document.createElement("a");
      link.download = `shade-edit.${ext}`;
      link.href = dataUrl;
      link.click();
      showToast(`Exported as ${ext.toUpperCase()}`, "success");
    } else {
      showToast("Export failed", "error");
    }
  }, [hasImage, exportImage, exportSettings, showToast]);

  /**
   * Global Keyboard Shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (e.key === "Escape") {
        setShowShortcutsModal(false);
        setIsEyedropperActive(false);
        setSelectedLayerId(null);
        setSelectedSelectivePointId(null);
        return;
      }

      if (e.key === "?") {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
        return;
      }

      if (isCtrlOrCmd && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      if (isCtrlOrCmd && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (isCtrlOrCmd && e.key.toLowerCase() === "e") {
        e.preventDefault();
        handleTriggerExport();
        return;
      }

      // Quick Tool Shortcuts
      switch (e.key.toLowerCase()) {
        case "v":
          setActiveTool("select");
          setRightPanelCollapsed(false);
          break;
        case "s":
          setActiveTool("selective");
          setRightPanelCollapsed(false);
          break;
        case "k":
          setActiveTool("curves");
          setRightPanelCollapsed(false);
          break;
        case "a":
          setActiveTool("adjust");
          setRightPanelCollapsed(false);
          break;
        case "c":
          setActiveTool("crop");
          setRightPanelCollapsed(false);
          break;
        case "f":
          setActiveTool("filter");
          setRightPanelCollapsed(false);
          break;
        case "t":
          setActiveTool("text");
          setRightPanelCollapsed(false);
          break;
        case "l":
          setActiveTool("layers");
          setRightPanelCollapsed(false);
          break;
        case "e":
          setActiveTool("export");
          setRightPanelCollapsed(false);
          break;
        case "0":
          handleZoomFit();
          break;
        case "1":
          handleResetZoom();
          break;
        case "=":
        case "+":
          handleZoomIn();
          break;
        case "-":
        case "_":
          handleZoomOut();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleUndo,
    handleRedo,
    handleTriggerExport,
    handleZoomFit,
    handleResetZoom,
    handleZoomIn,
    handleZoomOut,
  ]);

  const handleSelectTool = useCallback((tool: ToolType) => {
    setActiveTool(tool);
    setRightPanelCollapsed(false);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0c0c0e] text-[#ededed] overflow-hidden select-none antialiased">
      {/* Top Header Bar */}
      <TopBar
        hasImage={hasImage}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        compareMode={compareMode}
        onToggleCompare={() => setCompareMode((prev) => !prev)}
        gridMode={gridMode}
        onChangeGridMode={(mode: GridMode) => {
          setGridMode(mode);
          updateGridMode(mode);
        }}
        onExport={handleTriggerExport}
        onFileSelect={handleImageSelect}
      />

      {/* Main Studio Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Vertical Tool Selector */}
        <LeftToolbar activeTool={activeTool} onSelectTool={handleSelectTool} />

        {/* Center Interactive Canvas */}
        <CenterCanvas
          canvasRef={canvasRef}
          beforeCanvasRef={beforeCanvasRef}
          hasImage={hasImage}
          imageData={imageData}
          activeTool={activeTool}
          zoom={zoom}
          compareMode={compareMode}
          layers={layers}
          selectedLayerId={selectedLayerId}
          adjustments={adjustments}
          selectivePoints={selectivePoints}
          selectedSelectivePointId={selectedSelectivePointId}
          isEyedropperActive={isEyedropperActive}
          transformState={transform}
          onSelectLayer={(id) => {
            setSelectedLayerId(id);
            if (id) {
              const l = layers.find((item) => item.id === id);
              if (l?.type === "text") setActiveTool("text");
              setRightPanelCollapsed(false);
            }
          }}
          onSelectSelectivePoint={setSelectedSelectivePointId}
          onAddSelectivePointAt={handleAddSelectivePointAt}
          onUpdateSelectivePoint={handleUpdateSelectivePoint}
          onSampleWhiteBalance={handleSampleWhiteBalance}
          onUpdateTextPosition={handleUpdateTextPosition}
          onUpdateTextFontSize={handleUpdateTextFontSize}
          onDeleteLayer={handleDeleteLayer}
          onToggleCompare={() => setCompareMode((prev) => !prev)}
          onImageSelect={handleImageSelect}
          onApplyCrop={handleApplyCrop}
          renderPipeline={renderPipeline}
        />

        {/* Right Collapsible Adjustments / Tools Panel */}
        <RightPanel
          activeTool={activeTool}
          adjustments={adjustments}
          onChangeAdjustment={handleChangeAdjustment}
          onResetAdjustments={handleResetAdjustments}
          curves={curves}
          onChangeCurves={handleChangeCurves}
          selectivePoints={selectivePoints}
          selectedSelectivePointId={selectedSelectivePointId}
          onSelectSelectivePoint={setSelectedSelectivePointId}
          onAddSelectivePoint={handleAddSelectivePoint}
          onUpdateSelectivePoint={handleUpdateSelectivePoint}
          onDeleteSelectivePoint={handleDeleteSelectivePoint}
          isEyedropperActive={isEyedropperActive}
          onToggleEyedropper={() => setIsEyedropperActive((prev) => !prev)}
          filterSettings={filterSettings}
          onChangeFilter={(f) => {
            updateFilter(f);
            pushHistory({ filter: f });
          }}
          onApplyPreset={handleApplyPreset}
          transformState={transform}
          onUpdateTransform={handleUpdateTransform}
          onResetCrop={handleResetCrop}
          onApplyCrop={() => {
            // Can be triggered from panel
            if (transform.crop) {
              handleApplyCrop(transform.crop);
            }
          }}
          layers={layers}
          selectedLayerId={selectedLayerId}
          onSelectLayer={setSelectedLayerId}
          onToggleLayerVisibility={handleToggleLayerVisibility}
          onDeleteLayer={handleDeleteLayer}
          onDuplicateLayer={handleDuplicateLayer}
          onRenameLayer={handleRenameLayer}
          onReorderLayers={handleReorderLayers}
          onAddDoubleExposureLayer={handleAddDoubleExposureLayer}
          onUpdateDoubleExposureLayer={handleUpdateDoubleExposureLayer}
          onAddTextLayer={handleAddTextLayer}
          onUpdateTextLayer={handleUpdateTextLayer}
          exportSettings={exportSettings}
          onChangeExportSettings={setExportSettings}
          onTriggerExport={handleTriggerExport}
          collapsed={rightPanelCollapsed}
          onToggleCollapsed={() => setRightPanelCollapsed((prev) => !prev)}
        />
      </div>

      {/* Preset Looks Strip (when filter tool or looks active) */}
      {hasImage && activeTool === "filter" && (
        <FilterPresetsStrip
          selectedPresetId={filterSettings.id}
          onSelectPreset={handleApplyPreset}
        />
      )}

      {/* Bottom Status & Zoom Bar */}
      <BottomBar
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onZoomFit={handleZoomFit}
        imageData={imageData}
        hasImage={hasImage}
        isProcessing={isProcessing}
      />

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <ShortcutsOverlay
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </div>
  );
}
