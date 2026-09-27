"use client";

import { useRef, useCallback, useEffect } from "react";

/**
 * Manages an HTML canvas element for image rendering.
 *
 * - Sets canvas internal resolution to match the image's natural size
 * - Draws the image onto the canvas
 * - Re-draws on window resize to stay crisp
 * - Exposes the canvas ref and a `drawImage` function
 */
export function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas internal resolution to match the image
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Draw the full image
    ctx.drawImage(img, 0, 0);
  }, []);

  const loadImage = useCallback(
    (file: File) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
          imageRef.current = img;
          drawImage();
          resolve(img);
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("Failed to load image"));
        };

        img.src = url;
      });
    },
    [drawImage]
  );

  // Redraw on window resize so the canvas stays sharp
  useEffect(() => {
    const handleResize = () => drawImage();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawImage]);

  return {
    canvasRef,
    imageRef,
    loadImage,
    drawImage,
  };
}
