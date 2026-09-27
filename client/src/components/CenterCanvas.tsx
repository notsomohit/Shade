"use client";

import { RefObject, useState, useCallback, useRef } from "react";

interface CenterCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  hasImage: boolean;
  zoom: number; // e.g. 100 for 100%
  onImageSelect: (file: File) => void;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export default function CenterCanvas({
  canvasRef,
  hasImage,
  zoom,
  onImageSelect,
}: CenterCanvasProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
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
      setIsDragging(false);
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

  const zoomScale = zoom / 100;

  return (
    <main
      className="flex-1 bg-[#07080a] relative overflow-auto flex items-center justify-center p-8 select-none"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {!hasImage ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`
            w-[480px] h-[320px] border border-dashed flex flex-col items-center justify-center gap-3
            font-mono text-xs cursor-pointer transition-colors duration-150
            ${
              isDragging
                ? "border-[#e8e8e2] bg-[#141519]"
                : "border-[#3a3d44] bg-[#0e0f12]/50 hover:border-[#8f938f] hover:bg-[#141519]/50"
            }
          `}
        >
          <svg
            className="w-6 h-6 text-[#8f938f]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          <span className="text-[#e8e8e2] font-semibold tracking-wide">
            {isDragging ? "DROP IMAGE FILE" : "NO IMAGE LOADED"}
          </span>
          <span className="text-[#8f938f] text-[11px]">
            Drag & drop or click to open file
          </span>
          <span className="text-[#8f938f]/60 text-[10px] uppercase mt-2">
            Supports PNG, JPG, WebP, AVIF
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div
          className="transition-transform duration-100 origin-center flex items-center justify-center border border-[#3a3d44]/30"
          style={{ transform: `scale(${zoomScale})` }}
        >
          <canvas ref={canvasRef} className="block max-w-full max-h-full" />
        </div>
      )}
    </main>
  );
}
