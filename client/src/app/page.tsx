"use client";

import { useState, useCallback } from "react";
import { useCanvas } from "@/hooks/useCanvas";
import { ToolType, LayerItem, ImageMetaData } from "@/types/editor";
import TopBar from "@/components/TopBar";
import LeftToolbar from "@/components/LeftToolbar";
import CenterCanvas from "@/components/CenterCanvas";
import RightPanel from "@/components/RightPanel";
import BottomBar from "@/components/BottomBar";

export default function Home() {
  const { canvasRef, loadImage } = useCanvas();
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [zoom, setZoom] = useState<number>(100);
  const [imageData, setImageData] = useState<ImageMetaData | null>(null);
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

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

        // Add base layer
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

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0e0f12] text-[#e8e8e2] font-mono select-none">
      {/* 1. Top Bar */}
      <TopBar onFileSelect={handleImageSelect} />

      {/* Main Workspace Area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* 2. Left Toolbar */}
        <LeftToolbar
          activeTool={activeTool}
          onSelectTool={(tool) => setActiveTool(tool)}
        />

        {/* 3. Center Canvas Workspace */}
        <CenterCanvas
          canvasRef={canvasRef}
          hasImage={!!imageData}
          zoom={zoom}
          onImageSelect={handleImageSelect}
        />

        {/* 4. Right Contextual Panel */}
        <RightPanel
          activeTool={activeTool}
          layers={layers}
          selectedLayerId={selectedLayerId}
          onSelectLayer={setSelectedLayerId}
          onToggleLayerVisibility={handleToggleLayerVisibility}
        />
      </div>

      {/* 5. Bottom Status Bar */}
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
