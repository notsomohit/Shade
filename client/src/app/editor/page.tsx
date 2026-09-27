"use client";

import { useState, useCallback } from "react";
import { useCanvas } from "@/hooks/useCanvas";
import ImageUploader from "@/components/ImageUploader";
import EditorCanvas from "@/components/EditorCanvas";

interface ImageInfo {
  name: string;
  width: number;
  height: number;
}

export default function EditorPage() {
  const { canvasRef, loadImage } = useCanvas();
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);

  const handleImageSelect = useCallback(
    async (file: File) => {
      try {
        const img = await loadImage(file);
        setImageInfo({
          name: file.name,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      } catch {
        console.error("Failed to load image");
      }
    },
    [loadImage]
  );

  const handleReset = useCallback(() => {
    setImageInfo(null);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center px-4 py-3 border-b border-white/5">
        <a href="/" className="text-lg font-bold tracking-tight">
          Studio<span className="text-indigo-400">North</span>
        </a>
      </header>

      {/* Main content — switches between uploader and canvas */}
      {imageInfo ? (
        <EditorCanvas
          canvasRef={canvasRef}
          imageName={imageInfo.name}
          imageWidth={imageInfo.width}
          imageHeight={imageInfo.height}
          onReset={handleReset}
        />
      ) : (
        <ImageUploader onImageSelect={handleImageSelect} />
      )}
    </div>
  );
}
