"use client";

import { useState, useCallback, useRef } from "react";

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export default function ImageUploader({ onImageSelect }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const validateAndSelect = useCallback(
    (file: File) => {
      setError(null);

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Unsupported format. Use JPEG, PNG, WebP, or AVIF.");
        return;
      }

      // 50MB limit
      if (file.size > 50 * 1024 * 1024) {
        setError("File too large. Maximum size is 50MB.");
        return;
      }

      onImageSelect(file);
    },
    [onImageSelect]
  );

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
      if (file) validateAndSelect(file);
    },
    [validateAndSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndSelect(file);
    },
    [validateAndSelect]
  );

  return (
    <div
      className="flex flex-1 items-center justify-center p-4 sm:p-8 select-none"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div
        className={`
          w-full max-w-sm rounded-xl border border-dashed p-8 sm:p-10
          text-center transition-all duration-150 cursor-pointer
          ${
            isDragging
              ? "border-[#3b82f6] bg-[#3b82f6]/10 scale-[1.01]"
              : "border-[#2d2d34] hover:border-[#3b82f6]/50 bg-[#121215]/60 hover:bg-[#121215]"
          }
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        {/* Upload icon */}
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#18181c] border border-[#2d2d34] text-[#84848d]">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
            />
          </svg>
        </div>

        <h2 className="text-sm font-semibold text-[#ededed] mb-1">
          {isDragging ? "Drop your photo here" : "Drop your photo here"}
        </h2>

        <p className="text-xs text-[#84848d] mb-4">
          or click to browse from your device
        </p>

        <span className="text-[10px] text-[#5c5c66]">
          JPEG · PNG · WEBP · AVIF
        </span>

        {error && (
          <p className="mt-3 text-xs text-red-400 font-medium">{error}</p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleFileChange}
          className="hidden"
          id="image-upload-input"
        />
      </div>
    </div>
  );
}
