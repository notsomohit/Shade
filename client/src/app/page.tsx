"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useCanvas } from "@/hooks/useCanvas";
import {
  ToolType,
  Adjustments,
  LayerItem,
  ImageMetaData,
  TextOverlay,
  GridMode,
  FilterSettings,
  ExportSettings,
} from "@/types/editor";
import TopBar from "@/components/TopBar";
import LeftToolbar from "@/components/LeftToolbar";
import CenterCanvas from "@/components/CenterCanvas";
import FilterPresetsStrip, { PRESET_FILTERS } from "@/components/FilterPresetsStrip";
import RightPanel from "@/components/RightPanel";
import BottomBar from "@/components/BottomBar";

const INITIAL_ADJUSTMENTS: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
};

export default function Home() {
  const {
    canvasRef,
    beforeCanvasRef,
    loadImage,
    updateAdjustments,
    updateFilter,
    updateTransform,
    updateGridMode,
    updateLayers,
    exportImage,
    transformState,
    renderPipeline,
  } = useCanvas();

  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [zoom, setZoom] = useState<number>(100);
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [gridMode, setGridMode] = useState<GridMode>("none");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("original");

  const [filterSettings, setFilterSettings] = useState<FilterSettings>({
    id: "original",
    name: "Original",
    intensity: 100,
  });

  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: "image/png",
    quality: 0.9,
  });

  const [imageData, setImageData] = useState<ImageMetaData | null>(null);
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  // Adjustments & History Stack
  const [adjustments, setAdjustments] = useState<Adjustments>(INITIAL_ADJUSTMENTS);
  const [history, setHistory] = useState<{ adjustments: Adjustments; filter: FilterSettings }[]>([
    { adjustments: INITIAL_ADJUSTMENTS, filter: { id: "original", name: "Original", intensity: 100 } },
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const pushHistory = (newAdj: Adjustments, newFilt: FilterSettings) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push({ adjustments: newAdj, filter: newFilt });
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      const targetState = history[prevIndex];
      setAdjustments(targetState.adjustments);
      updateAdjustments(targetState.adjustments);
      setFilterSettings(targetState.filter);
      updateFilter(targetState.filter);
      setSelectedPresetId(targetState.filter.id);
    }
  }, [historyIndex, history, updateAdjustments, updateFilter]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      const targetState = history[nextIndex];
      setAdjustments(targetState.adjustments);
      updateAdjustments(targetState.adjustments);
      setFilterSettings(targetState.filter);
      updateFilter(targetState.filter);
      setSelectedPresetId(targetState.filter.id);
    }
  }, [historyIndex, history, updateAdjustments, updateFilter]);

  // Debounce ref — state updates instantly, expensive pixel pipeline waits 200ms.
  const adjDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChangeAdjustment = (key: keyof Adjustments, value: number) => {
    const updated = { ...adjustments, [key]: value };
    // Instantly update React state → slider tracks position + CSS filter preview updates.
    setAdjustments(updated);
    // Debounce the heavy pixel-level canvas re-render.
    if (adjDebounceRef.current) clearTimeout(adjDebounceRef.current);
    adjDebounceRef.current = setTimeout(() => {
      updateAdjustments(updated);
      pushHistory(updated, filterSettings);
    }, 200);
  };

  const handleChangeFilter = (newFilter: FilterSettings) => {
    setFilterSettings(newFilter);
    updateFilter(newFilter);
    pushHistory(adjustments, newFilter);
  };

  const handleSelectPreset = (id: string) => {
    setSelectedPresetId(id);
    const found = PRESET_FILTERS.find((p) => p.id === id);
    const newFilter: FilterSettings = {
      id,
      name: found ? found.name : "Custom",
      intensity: 100,
    };
    setFilterSettings(newFilter);
    updateFilter(newFilter);
    pushHistory(adjustments, newFilter);
  };

  const handleApplyCrop = (crop: { x: number; y: number; width: number; height: number }) => {
    updateTransform({ crop });
  };

  const handleToggleGrid = () => {
    const nextMode: GridMode = gridMode === "none" ? "grid" : gridMode === "grid" ? "thirds" : "none";
    setGridMode(nextMode);
    updateGridMode(nextMode);
  };

  const handleReorderLayers = useCallback(
    (newLayers: LayerItem[]) => {
      setLayers(newLayers);
      updateLayers(newLayers);
    },
    [updateLayers]
  );

  const handleDeleteLayer = useCallback(
    (id: string) => {
      setLayers((prev) => {
        const nextLayers = prev.filter((l) => l.id !== id);
        updateLayers(nextLayers);
        return nextLayers;
      });
      if (selectedLayerId === id) setSelectedLayerId(null);
    },
    [selectedLayerId, updateLayers]
  );

  const handleAddTextLayer = (
    text: string,
    fontSize: number,
    color: string,
    fontFamily: string,
    category: "standard" | "design" | "artsy" | "display"
  ) => {
    const id = `text-${Date.now()}`;
    const newOverlay: TextOverlay = {
      id,
      text,
      fontSize,
      fontFamily,
      fontCategory: category,
      color,
      x: 0.1,
      y: 0.15 + layers.length * 0.08,
      visible: true,
    };

    const newLayerItem: LayerItem = {
      id,
      name: `Text: ${text}`,
      visible: true,
      type: "text",
      textData: newOverlay,
    };

    const nextLayers = [newLayerItem, ...layers];
    setLayers(nextLayers);
    updateLayers(nextLayers);
    setSelectedLayerId(id);
  };

  const handleUpdateTextPosition = useCallback(
    (id: string, x: number, y: number) => {
      setLayers((prev) => {
        const nextLayers = prev.map((layer) => {
          if (layer.id === id && layer.textData) {
            return {
              ...layer,
              textData: { ...layer.textData, x, y },
            };
          }
          return layer;
        });
        updateLayers(nextLayers);
        return nextLayers;
      });
    },
    [updateLayers]
  );

  // Resize text font size from corner anchor handles
  const handleUpdateTextFontSize = useCallback(
    (id: string, fontSize: number) => {
      setLayers((prev) => {
        const nextLayers = prev.map((layer) => {
          if (layer.id === id && layer.textData) {
            return {
              ...layer,
              textData: { ...layer.textData, fontSize },
            };
          }
          return layer;
        });
        updateLayers(nextLayers);
        return nextLayers;
      });
    },
    [updateLayers]
  );

  const handleSelectLayer = useCallback(
    (id: string | null) => {
      setSelectedLayerId(id);
      if (id) {
        setLayers((currentLayers) => {
          const target = currentLayers.find((l) => l.id === id);
          if (target && target.type === "text") {
            setActiveTool("text");
          }
          return currentLayers;
        });
      }
    },
    []
  );

  // Update text layer properties (font, size, color, text)
  const handleUpdateTextLayer = useCallback(
    (id: string, updates: Partial<TextOverlay>) => {
      setLayers((prev) => {
        const nextLayers = prev.map((layer) => {
          if (layer.id === id && layer.textData) {
            const newTextData = { ...layer.textData, ...updates };
            return {
              ...layer,
              name: updates.text ? `Text: ${updates.text}` : layer.name,
              textData: newTextData,
            };
          }
          return layer;
        });
        updateLayers(nextLayers);
        return nextLayers;
      });
    },
    [updateLayers]
  );

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedLayerId && selectedLayerId !== "layer-0") {
          handleDeleteLayer(selectedLayerId);
        }
      } else if (!e.ctrlKey && !e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "v":
            setActiveTool("select");
            break;
          case "c":
            setActiveTool("crop");
            break;
          case "a":
            setActiveTool("adjust");
            break;
          case "f":
            setActiveTool("filter");
            break;
          case "t":
            setActiveTool("text");
            break;
          case "l":
            setActiveTool("layers");
            break;
          case "e":
            setActiveTool("export");
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo, selectedLayerId, handleDeleteLayer]);

  const handleImageSelect = useCallback(
    async (file: File) => {
      try {
        const img = await loadImage(file);
        const meta: ImageMetaData = {
          name: file.name,
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: img.naturalWidth / img.naturalHeight,
        };
        setImageData(meta);
        setAdjustments(INITIAL_ADJUSTMENTS);
        setHistory([
          { adjustments: INITIAL_ADJUSTMENTS, filter: { id: "original", name: "Original", intensity: 100 } },
        ]);
        setHistoryIndex(0);

        const baseLayer: LayerItem = {
          id: "layer-0",
          name: file.name,
          visible: true,
          type: "image",
        };
        setLayers([baseLayer]);
        updateLayers([baseLayer]);
        setSelectedLayerId("layer-0");
      } catch (err) {
        console.error("Failed to load image:", err);
      }
    },
    [loadImage, updateLayers]
  );

  const handleZoomIn = () => setZoom((z) => Math.min(400, z + 25));
  const handleZoomOut = () => setZoom((z) => Math.max(25, z - 25));
  const handleResetZoom = () => setZoom(100);

  const handleToggleLayerVisibility = (id: string) => {
    setLayers((prev) => {
      const nextLayers = prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l));
      updateLayers(nextLayers);
      return nextLayers;
    });
  };

  const handleTriggerExport = () => {
    if (!imageData) {
      alert("No image loaded to export!");
      return;
    }
    const dataUrl = exportImage(exportSettings.format, exportSettings.quality);
    if (!dataUrl) return;

    const ext = exportSettings.format.split("/")[1];
    const link = document.createElement("a");
    link.download = `edited-${imageData.name.split(".")[0]}.${ext}`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0e0f12] text-[#f0f0ec] font-mono select-none">
      {/* 1. Top Bar */}
      <TopBar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        gridMode={gridMode}
        onToggleGrid={handleToggleGrid}
        onExport={() => setActiveTool("export")}
        onFileSelect={handleImageSelect}
      />

      {/* Main Center Area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* 2. Left Toolbar */}
        <LeftToolbar
          activeTool={activeTool}
          onSelectTool={(tool) => setActiveTool(tool)}
        />

        {/* Center Workspace */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* 3. Center Canvas Well */}
          <CenterCanvas
            canvasRef={canvasRef}
            beforeCanvasRef={beforeCanvasRef}
            hasImage={!!imageData}
            imageData={imageData}
            activeTool={activeTool}
            zoom={zoom}
            compareMode={compareMode}
            layers={layers}
            selectedLayerId={selectedLayerId}
            adjustments={adjustments}
            onSelectLayer={handleSelectLayer}
            onUpdateTextPosition={handleUpdateTextPosition}
            onUpdateTextFontSize={handleUpdateTextFontSize}
            onDeleteLayer={handleDeleteLayer}
            onToggleCompare={() => setCompareMode(!compareMode)}
            onImageSelect={handleImageSelect}
            onApplyCrop={handleApplyCrop}
            renderPipeline={renderPipeline}
          />

          {/* 4. Filter Presets Strip */}
          <FilterPresetsStrip
            selectedPresetId={selectedPresetId}
            onSelectPreset={handleSelectPreset}
          />
        </div>

        {/* 5. Contextual Right Panel */}
        <RightPanel
          activeTool={activeTool}
          adjustments={adjustments}
          onChangeAdjustment={handleChangeAdjustment}
          filterSettings={filterSettings}
          onChangeFilter={handleChangeFilter}
          transformState={transformState}
          onUpdateTransform={updateTransform}
          layers={layers}
          selectedLayerId={selectedLayerId}
          onSelectLayer={handleSelectLayer}
          onToggleLayerVisibility={handleToggleLayerVisibility}
          onDeleteLayer={handleDeleteLayer}
          onReorderLayers={handleReorderLayers}
          onAddTextLayer={handleAddTextLayer}
          onUpdateTextLayer={handleUpdateTextLayer}
          exportSettings={exportSettings}
          onChangeExportSettings={setExportSettings}
          onTriggerExport={handleTriggerExport}
        />
      </div>

      {/* 6. Bottom Bar */}
      <BottomBar
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        imageData={imageData}
      />
    </div>
  );
}
