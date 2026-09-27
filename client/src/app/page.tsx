"use client";

import { useState, useCallback, useEffect } from "react";
import { useCanvas } from "@/hooks/useCanvas";
import { ToolType, Adjustments, LayerItem, ImageMetaData } from "@/types/editor";
import TopBar from "@/components/TopBar";
import LeftToolbar from "@/components/LeftToolbar";
import CenterCanvas from "@/components/CenterCanvas";
import FilterPresetsStrip from "@/components/FilterPresetsStrip";
import RightPanel from "@/components/RightPanel";
import BottomBar from "@/components/BottomBar";

const INITIAL_ADJUSTMENTS: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
};

export default function Home() {
  const { canvasRef, loadImage } = useCanvas();
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [zoom, setZoom] = useState<number>(100);
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("original");
  const [imageData, setImageData] = useState<ImageMetaData | null>(null);
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  // Adjustments & History Stack
  const [adjustments, setAdjustments] = useState<Adjustments>(INITIAL_ADJUSTMENTS);
  const [history, setHistory] = useState<Adjustments[]>([INITIAL_ADJUSTMENTS]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const pushHistory = (newAdj: Adjustments) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(newAdj);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setAdjustments(history[prevIndex]);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setAdjustments(history[nextIndex]);
    }
  }, [historyIndex, history]);

  const handleChangeAdjustment = (key: keyof Adjustments, value: number) => {
    const updated = { ...adjustments, [key]: value };
    setAdjustments(updated);
    pushHistory(updated);
  };

  // Keyboard Shortcuts (Ctrl+Z / Ctrl+Y / Key tools)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

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
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

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

        // Set base layer
        const baseLayer: LayerItem = {
          id: "layer-0",
          name: file.name,
          visible: true,
          type: "image",
        };
        setLayers([baseLayer]);
        setSelectedLayerId("layer-0");
      } catch (err) {
        console.error("Failed to load image:", err);
      }
    },
    [loadImage]
  );

  const handleZoomIn = () => setZoom((z) => Math.min(400, z + 25));
  const handleZoomOut = () => setZoom((z) => Math.max(25, z - 25));
  const handleResetZoom = () => setZoom(100);

  const handleToggleLayerVisibility = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    );
  };

  const handleExport = () => {
    alert("Export triggered! (Phase 6 full export engine)");
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0e0f12] text-[#f0f0ec] font-mono select-none">
      {/* 1. Top Bar */}
      <TopBar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExport={handleExport}
        onFileSelect={handleImageSelect}
      />

      {/* Main Center Area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* 2. Left Toolbar */}
        <LeftToolbar
          activeTool={activeTool}
          onSelectTool={(tool) => setActiveTool(tool)}
        />

        {/* Center Workspace (Canvas + Filter Presets Strip) */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* 3. Center Canvas Well */}
          <CenterCanvas
            canvasRef={canvasRef}
            hasImage={!!imageData}
            zoom={zoom}
            compareMode={compareMode}
            onToggleCompare={() => setCompareMode(!compareMode)}
            onImageSelect={handleImageSelect}
          />

          {/* 4. Filter Presets Strip */}
          <FilterPresetsStrip
            selectedPresetId={selectedPresetId}
            onSelectPreset={setSelectedPresetId}
          />
        </div>

        {/* 5. Contextual Right Panel */}
        <RightPanel
          activeTool={activeTool}
          adjustments={adjustments}
          onChangeAdjustment={handleChangeAdjustment}
          layers={layers}
          selectedLayerId={selectedLayerId}
          onSelectLayer={setSelectedLayerId}
          onToggleLayerVisibility={handleToggleLayerVisibility}
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
