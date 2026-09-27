"use client";

import { useState } from "react";
import { ToolType, Adjustments, LayerItem } from "@/types/editor";
import { TransformState } from "@/hooks/useCanvas";

interface RightPanelProps {
  activeTool: ToolType;
  adjustments: Adjustments;
  onChangeAdjustment: (key: keyof Adjustments, value: number) => void;
  transformState: TransformState;
  onUpdateTransform: (transform: Partial<TransformState>) => void;
  layers: LayerItem[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onToggleLayerVisibility: (id: string) => void;
  onReorderLayers: (newLayers: LayerItem[]) => void;
  onAddTextLayer: (text: string, fontSize: number, color: string) => void;
}

export default function RightPanel({
  activeTool,
  adjustments,
  onChangeAdjustment,
  transformState,
  onUpdateTransform,
  layers,
  selectedLayerId,
  onSelectLayer,
  onToggleLayerVisibility,
  onReorderLayers,
  onAddTextLayer,
}: RightPanelProps) {
  // Text tool local inputs
  const [textInput, setTextInput] = useState("StudioNorth");
  const [fontSizeInput, setFontSizeInput] = useState(48);
  const [textColorInput, setTextColorInput] = useState("#4b9fef");

  // Drag reorder state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleRotateCW = () => {
    const nextRot = (transformState.rotation + 90) % 360;
    onUpdateTransform({ rotation: nextRot });
  };

  const handleRotateCCW = () => {
    const nextRot = (transformState.rotation + 270) % 360;
    onUpdateTransform({ rotation: nextRot });
  };

  const handleFlipH = () => {
    onUpdateTransform({ flipH: !transformState.flipH });
  };

  const handleFlipV = () => {
    onUpdateTransform({ flipV: !transformState.flipV });
  };

  const handleResetCrop = () => {
    onUpdateTransform({ crop: null, rotation: 0, flipH: false, flipV: false });
  };

  const handleAddText = () => {
    if (!textInput.trim()) return;
    onAddTextLayer(textInput, fontSizeInput, textColorInput);
  };

  // Reorder helper: Move Up / Down
  const handleMoveLayer = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= layers.length) return;

    const nextLayers = [...layers];
    const [movedItem] = nextLayers.splice(index, 1);
    nextLayers.splice(targetIndex, 0, movedItem);
    onReorderLayers(nextLayers);
  };

  // Drag & Drop reorder handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const nextLayers = [...layers];
    const [movedItem] = nextLayers.splice(draggedIndex, 1);
    nextLayers.splice(index, 0, movedItem);
    onReorderLayers(nextLayers);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const colorPresets = [
    { name: "Blue", hex: "#4b9fef" },
    { name: "White", hex: "#ffffff" },
    { name: "Yellow", hex: "#facc15" },
    { name: "Red", hex: "#f87171" },
    { name: "Green", hex: "#4ade80" },
  ];

  const renderContent = () => {
    switch (activeTool) {
      case "text":
        return (
          <div className="flex flex-col gap-4 font-mono text-xs">
            <div className="text-xs text-[#9a9d9a] uppercase tracking-wider font-semibold border-b border-[#26272b] pb-2">
              TEXT TOOL
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#9a9d9a]">TEXT CONTENT</label>
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter text..."
                className="w-full px-2.5 py-2 bg-[#0e0f12] border border-[#26272b] focus:border-[#4b9fef] text-[#f0f0ec] rounded outline-none text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#9a9d9a]">FONT SIZE</span>
                <span className="text-[#4b9fef] font-bold">{fontSizeInput}px</span>
              </div>
              <input
                type="range"
                min="16"
                max="120"
                value={fontSizeInput}
                onChange={(e) => setFontSizeInput(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#9a9d9a]">TEXT COLOR</label>
              <div className="flex items-center gap-2">
                {colorPresets.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setTextColorInput(c.hex)}
                    title={c.name}
                    className={`w-6 h-6 rounded-full border transition-transform ${
                      textColorInput === c.hex
                        ? "ring-2 ring-white scale-110 border-white"
                        : "border-[#26272b] hover:scale-105"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleAddText}
              className="w-full py-2 bg-[#4b9fef] text-[#0e0f12] font-bold text-xs rounded hover:bg-[#3b8fd9] transition-colors cursor-pointer mt-2"
            >
              + Add Text Layer
            </button>
          </div>
        );

      case "adjust":
        return (
          <div className="flex flex-col gap-5 font-mono text-xs">
            <div className="text-xs text-[#9a9d9a] uppercase tracking-wider font-semibold border-b border-[#26272b] pb-2">
              ADJUSTMENTS
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9a9d9a]">BRIGHTNESS</span>
                <span className="text-[#4b9fef] font-semibold">
                  {adjustments.brightness > 0 ? `+${adjustments.brightness}` : adjustments.brightness}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.brightness}
                onChange={(e) => onChangeAdjustment("brightness", Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9a9d9a]">CONTRAST</span>
                <span className="text-[#4b9fef] font-semibold">
                  {adjustments.contrast > 0 ? `+${adjustments.contrast}` : adjustments.contrast}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.contrast}
                onChange={(e) => onChangeAdjustment("contrast", Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9a9d9a]">SATURATION</span>
                <span className="text-[#4b9fef] font-semibold">
                  {adjustments.saturation > 0 ? `+${adjustments.saturation}` : adjustments.saturation}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.saturation}
                onChange={(e) => onChangeAdjustment("saturation", Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9a9d9a]">EXPOSURE</span>
                <span className="text-[#4b9fef] font-semibold">
                  {adjustments.exposure > 0 ? `+${adjustments.exposure}` : adjustments.exposure}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.exposure}
                onChange={(e) => onChangeAdjustment("exposure", Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        );

      case "crop":
        return (
          <div className="flex flex-col gap-4 font-mono text-xs">
            <div className="text-xs text-[#9a9d9a] uppercase tracking-wider font-semibold border-b border-[#26272b] pb-2">
              CROP & TRANSFORM
            </div>
            <div className="space-y-2 text-xs text-[#9a9d9a]">
              <button
                onClick={handleRotateCW}
                className="w-full p-2.5 border border-[#26272b] hover:text-[#f0f0ec] hover:border-[#9a9d9a] rounded text-left transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>Rotate 90° CW</span>
                <span className="text-[#4b9fef] font-bold">{transformState.rotation}°</span>
              </button>

              <button
                onClick={handleRotateCCW}
                className="w-full p-2.5 border border-[#26272b] hover:text-[#f0f0ec] hover:border-[#9a9d9a] rounded text-left transition-colors cursor-pointer"
              >
                Rotate 90° CCW
              </button>

              <button
                onClick={handleFlipH}
                className={`w-full p-2.5 border rounded text-left transition-colors cursor-pointer flex items-center justify-between ${
                  transformState.flipH
                    ? "border-[#4b9fef] text-[#4b9fef] bg-[#4b9fef]/10"
                    : "border-[#26272b] text-[#9a9d9a] hover:text-[#f0f0ec]"
                }`}
              >
                <span>Flip Horizontal</span>
                {transformState.flipH && <span className="font-bold">ON</span>}
              </button>

              <button
                onClick={handleFlipV}
                className={`w-full p-2.5 border rounded text-left transition-colors cursor-pointer flex items-center justify-between ${
                  transformState.flipV
                    ? "border-[#4b9fef] text-[#4b9fef] bg-[#4b9fef]/10"
                    : "border-[#26272b] text-[#9a9d9a] hover:text-[#f0f0ec]"
                }`}
              >
                <span>Flip Vertical</span>
                {transformState.flipV && <span className="font-bold">ON</span>}
              </button>

              <button
                onClick={handleResetCrop}
                className="w-full p-2.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded text-left transition-colors cursor-pointer mt-4"
              >
                Reset Transforms
              </button>
            </div>
          </div>
        );

      case "filter":
        return (
          <div className="flex flex-col gap-3 font-mono text-xs">
            <div className="text-xs text-[#9a9d9a] uppercase tracking-wider font-semibold border-b border-[#26272b] pb-2">
              FILTER CONTROLS
            </div>
            <p className="text-xs text-[#9a9d9a]/80 leading-relaxed">
              Select preset filters from the bottom strip below canvas to apply real-time LUT styling.
            </p>
          </div>
        );

      case "layers":
      case "select":
      default:
        return (
          <div className="flex flex-col h-full font-mono text-xs">
            <div className="flex items-center justify-between text-xs text-[#9a9d9a] uppercase tracking-wider font-semibold border-b border-[#26272b] pb-2 mb-2">
              <span>LAYERS STACK ({layers.length})</span>
            </div>
            <p className="text-[10px] text-[#9a9d9a]/60 mb-3">
              Top of list renders ABOVE bottom items. Drag to reorder.
            </p>

            <div className="flex-1 overflow-y-auto space-y-1.5">
              {layers.length === 0 ? (
                <div className="text-xs text-[#9a9d9a]/50 py-4 text-center border border-dashed border-[#26272b] rounded">
                  NO LAYERS
                </div>
              ) : (
                layers.map((layer, index) => {
                  const isSelected = selectedLayerId === layer.id;
                  const isDragOver = dragOverIndex === index;
                  return (
                    <div
                      key={layer.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={() => handleDrop(index)}
                      onClick={() => onSelectLayer(layer.id)}
                      className={`
                        flex items-center justify-between px-2.5 py-2 cursor-grab active:cursor-grabbing text-xs transition-all rounded border relative select-none
                        ${
                          isSelected
                            ? "bg-[#4b9fef]/15 text-[#f0f0ec] border-[#4b9fef]"
                            : "bg-[#0e0f12]/50 text-[#9a9d9a] hover:text-[#f0f0ec] hover:bg-[#26272b]/40 border-[#26272b]"
                        }
                        ${isDragOver ? "border-t-2 border-t-white" : ""}
                      `}
                    >
                      <div className="flex items-center gap-2 truncate min-w-0">
                        {/* Drag Handle Gripper Icon */}
                        <svg
                          className="w-3.5 h-3.5 shrink-0 text-[#9a9d9a]/40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.75 9h16.5m-16.5 6h16.5"
                          />
                        </svg>

                        {layer.type === "text" ? (
                          <span className="font-bold text-[#4b9fef] text-xs shrink-0">T</span>
                        ) : (
                          <svg
                            className="w-3.5 h-3.5 shrink-0 text-[#4b9fef]"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                            />
                          </svg>
                        )}
                        <span className="truncate font-medium text-[11px]">{layer.name}</span>
                      </div>

                      {/* Controls: Reorder Up/Down + Visibility Toggle */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveLayer(index, "up");
                          }}
                          disabled={index === 0}
                          title="Move Layer Up (Render Above)"
                          className="hover:text-white disabled:opacity-20 p-0.5 text-[10px]"
                        >
                          ▲
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveLayer(index, "down");
                          }}
                          disabled={index === layers.length - 1}
                          title="Move Layer Down (Render Below)"
                          className="hover:text-white disabled:opacity-20 p-0.5 text-[10px]"
                        >
                          ▼
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleLayerVisibility(layer.id);
                          }}
                          className="hover:text-white shrink-0 p-0.5 ml-1"
                        >
                          {layer.visible ? (
                            <svg
                              className="w-3.5 h-3.5 text-[#f0f0ec]"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-3.5 h-3.5 text-[#9a9d9a]/30"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <aside className="w-[210px] border-l border-[#26272b] bg-[#131418] p-4 flex flex-col shrink-0 font-mono select-none">
      {renderContent()}
    </aside>
  );
}
