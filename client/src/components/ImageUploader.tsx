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
        setError("Unsupported format. Use JPG, PNG, WEBP, or AVIF.");
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
        style={{
          border: "1.5px dashed rgba(255, 255, 255, 0.85)",
          borderRadius: "6px",
        }}
        className={`
          w-full max-w-[450px] p-8 sm:p-10
          text-center transition-all duration-150 cursor-pointer flex flex-col items-center justify-center gap-4
          ${
            isDragging
              ? "bg-[var(--accent-soft)]/20 scale-[1.01]"
              : "bg-[var(--bg-panel)]/40 hover:bg-[var(--bg-panel)]/80"
          }
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        {/* ~80px circular dark-navy icon container with blue upload arrow */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#101726] border border-[#1e2d4a] flex items-center justify-center text-[var(--accent)] shrink-0 shadow-inner">
          <svg
            className="w-7 h-7 sm:w-8 sm:h-8"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.75}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
            />
          </svg>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-sm sm:text-base font-bold text-[var(--text)] tracking-tight">
            Drop your photo here
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            or click to browse from your device
          </p>
        </div>

        <div className="px-3 py-1 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/30 text-[10px] font-mono text-[var(--accent)] tracking-wider">
          JPG, PNG, WEBP, AVIF supported
        </div>

        {error && (
          <p className="mt-2 text-xs text-red-400 font-medium">{error}</p>
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
