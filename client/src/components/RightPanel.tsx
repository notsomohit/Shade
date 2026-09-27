"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ToolType,
  Adjustments,
  LayerItem,
  FilterSettings,
  ExportSettings,
  CurvesData,
  SelectivePoint,
} from "@/types/editor";
import { TransformState } from "@/hooks/useCanvas";
import { CATEGORIZED_FONTS } from "@/utils/fonts";
import CurvesTool, { DEFAULT_CURVES } from "@/components/CurvesTool";
import SelectiveTool from "@/components/SelectiveTool";
import { PRESET_LOOKS, PremiumLookPreset } from "@/components/FilterPresetsStrip";

interface RightPanelProps {
  activeTool: ToolType;
  adjustments: Adjustments;
  onChangeAdjustment: (key: keyof Adjustments, value: number) => void;
  onResetAdjustments?: () => void;
  curves: CurvesData;
  onChangeCurves: (curves: CurvesData) => void;
  selectivePoints: SelectivePoint[];
  selectedSelectivePointId: string | null;
  onSelectSelectivePoint: (id: string | null) => void;
  onAddSelectivePoint: () => void;
  onUpdateSelectivePoint: (id: string, updates: Partial<SelectivePoint>) => void;
  onDeleteSelectivePoint: (id: string) => void;
  isEyedropperActive: boolean;
  onToggleEyedropper: () => void;
  filterSettings: FilterSettings;
  onChangeFilter: (filter: FilterSettings) => void;
  onApplyLookPreset?: (look: PremiumLookPreset) => void;
  transformState: TransformState;
  onUpdateTransform: (transform: Partial<TransformState>) => void;
  layers: LayerItem[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onToggleLayerVisibility: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onDuplicateLayer?: (id: string) => void;
  onRenameLayer?: (id: string, name: string) => void;
  onReorderLayers: (newLayers: LayerItem[]) => void;
  onResetCrop?: () => void;
  onApplyCrop?: () => void;
  onAddDoubleExposureLayer?: (file: File) => void;
  onUpdateDoubleExposureLayer?: (id: string, opacity: number, blendMode: "normal" | "screen" | "multiply" | "overlay" | "soft-light") => void;
  onAddTextLayer: (
    text: string,
    fontSize: number,
    color: string,
    fontFamily: string,
    category: "standard" | "design" | "artsy" | "display"
  ) => void;
  onUpdateTextLayer?: (
    id: string,
    updates: Partial<{ text: string; fontSize: number; color: string; fontFamily: string }>
  ) => void;
  exportSettings: ExportSettings;
  onChangeExportSettings: (settings: ExportSettings) => void;
  onTriggerExport: () => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

const ASPECT_RATIO_PRESETS = [
  { id: "free", name: "Free" },
  { id: "original", name: "Original" },
  { id: "1:1", name: "1:1 Square" },
  { id: "4:3", name: "4:3 Classic" },
  { id: "16:9", name: "16:9 Widescreen" },
  { id: "3:2", name: "3:2 Photo" },
  { id: "9:16", name: "9:16 Story" },
];

export default function RightPanel({
  activeTool,
  adjustments,
  onChangeAdjustment,
  onResetAdjustments,
  curves,
  onChangeCurves,
  selectivePoints,
  selectedSelectivePointId,
  onSelectSelectivePoint,
  onAddSelectivePoint,
  onUpdateSelectivePoint,
  onDeleteSelectivePoint,
  isEyedropperActive,
  onToggleEyedropper,
  filterSettings,
  onChangeFilter,
  onApplyLookPreset,
  transformState,
  onUpdateTransform,
  layers,
  selectedLayerId,
  onSelectLayer,
  onToggleLayerVisibility,
  onDeleteLayer,
  onDuplicateLayer,
  onRenameLayer,
  onReorderLayers,
  onResetCrop,
  onApplyCrop,
  onAddDoubleExposureLayer,
  onUpdateDoubleExposureLayer,
  onAddTextLayer,
  onUpdateTextLayer,
  exportSettings,
  onChangeExportSettings,
  onTriggerExport,
  collapsed = false,
  onToggleCollapsed,
}: RightPanelProps) {
  // Text tool local inputs
  const [textInput, setTextInput] = useState("StudioNorth");
  const [fontSizeInput, setFontSizeInput] = useState(48);
  const [textColorInput, setTextColorInput] = useState("#4b9fef");
  const [selectedFont, setSelectedFont] = useState(CATEGORIZED_FONTS[0]);

  // Selected layer helpers
  const selectedLayer = layers.find((l) => l.id === selectedLayerId);
  const isTextLayerSelected = selectedLayer && selectedLayer.type === "text";
  const isDoubleExposureSelected = selectedLayer && selectedLayer.type === "double-exposure";

  const doubleExposureFileInputRef = useRef<HTMLInputElement>(null);

  // Automatically sync local text inputs
  useEffect(() => {
    if (selectedLayer && selectedLayer.type === "text" && selectedLayer.textData) {
      const t = selectedLayer.textData;
      setTextInput(t.text);
      setFontSizeInput(t.fontSize);
      setTextColorInput(t.color);
      const font = CATEGORIZED_FONTS.find(
        (f) => f.family === t.fontFamily || f.name === t.fontFamily
      );
      if (font) setSelectedFont(font);
    }
  }, [selectedLayerId, selectedLayer]);

  // Drag reorder state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Layer context menu state
  const [ctxMenu, setCtxMenu] = useState<{ layerId: string; x: number; y: number } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const closeCtxMenu = () => setCtxMenu(null);

  useEffect(() => {
    if (!ctxMenu) return;
    const handler = () => closeCtxMenu();
    window.addEventListener("click", handler);
    window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCtxMenu(); });
    return () => window.removeEventListener("click", handler);
  }, [ctxMenu]);

  const handleRotateCW = () => {
    onUpdateTransform({ rotation: (transformState.rotation + 90) % 360 });
  };

  const handleRotateCCW = () => {
    onUpdateTransform({ rotation: (transformState.rotation + 270) % 360 });
  };

  const handleFlipH = () => {
    onUpdateTransform({ flipH: !transformState.flipH });
  };

  const handleFlipV = () => {
    onUpdateTransform({ flipV: !transformState.flipV });
  };

  const handleStraightenChange = (val: number) => {
    onUpdateTransform({ straighten: val });
  };

  return (
    <aside
      className={`
        border-l border-[#26272b] bg-[#131418] flex flex-col shrink-0 font-mono select-none relative
        transition-[width,min-width,max-width] duration-200 ease-in-out
        ${collapsed ? "w-0 min-w-0 max-w-0 border-l-0" : "w-80 max-w-80"}
      `}
    >
      {/* Collapse / Expand Chevron Tab Button */}
      {onToggleCollapsed && (
        <button
          onClick={onToggleCollapsed}
          title={collapsed ? "Expand adjustments panel" : "Collapse panel"}
          className="absolute -left-3.5 top-1/2 -translate-y-1/2 z-50 w-3.5 h-12 bg-[#1c1d22] hover:bg-[#4b9fef] text-[#9a9d9a] hover:text-black border border-[#26272b] border-r-0 rounded-l flex items-center justify-center cursor-pointer transition-colors shadow-md"
        >
          <span className="text-[10px] font-bold">
            {collapsed ? "‹" : "›"}
          </span>
        </button>
      )}

      {/* Main Panel Content Scroll Area */}
      <div className={`flex-1 overflow-y-auto p-5 space-y-6 ${collapsed ? "hidden" : "block"}`}>

        {/* 1. SELECTIVE (SNAPSEED LOCAL ADJUSTMENTS) */}
        {activeTool === "selective" && (
          <SelectiveTool
            points={selectivePoints}
            selectedPointId={selectedSelectivePointId}
            onSelectPoint={onSelectSelectivePoint}
            onAddPoint={onAddSelectivePoint}
            onUpdatePoint={onUpdateSelectivePoint}
            onDeletePoint={onDeleteSelectivePoint}
          />
        )}

        {/* 2. CURVES (RGB & CHANNEL TONE CURVES) */}
        {activeTool === "curves" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#f0f0ec]">RGB TONE CURVES</span>
              <button
                onClick={() => onChangeCurves(DEFAULT_CURVES)}
                className="text-[10px] text-[#9a9d9a] hover:text-[#f0f0ec] cursor-pointer"
              >
                Reset Curves
              </button>
            </div>
            <CurvesTool curves={curves} onChangeCurves={onChangeCurves} />
          </div>
        )}

        {/* 3. ADJUSTMENTS / TUNE IMAGE (WB, STRUCTURE, VIGNETTE, GRAIN) */}
        {(activeTool === "adjust" || activeTool === "select") && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#26272b] pb-2">
              <span className="text-xs font-bold text-[#f0f0ec]">TUNE IMAGE</span>
              {onResetAdjustments && (
                <button
                  onClick={onResetAdjustments}
                  className="text-[10px] text-[#4b9fef] hover:underline cursor-pointer"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Basic Tonal Sliders */}
            <div className="space-y-4">
              <span className="text-[10px] text-[#9a9d9a] uppercase font-bold tracking-wider">
                Light & Contrast
              </span>

              {/* Exposure */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9a9d9a]">Exposure</span>
                  <span className="text-[#f0f0ec] font-bold">
                    {adjustments.exposure > 0 ? `+${adjustments.exposure}` : adjustments.exposure}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={adjustments.exposure}
                  onChange={(e) => onChangeAdjustment("exposure", Number(e.target.value))}
                  className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Brightness */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9a9d9a]">Brightness</span>
                  <span className="text-[#f0f0ec] font-bold">
                    {adjustments.brightness > 0 ? `+${adjustments.brightness}` : adjustments.brightness}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={adjustments.brightness}
                  onChange={(e) => onChangeAdjustment("brightness", Number(e.target.value))}
                  className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9a9d9a]">Contrast</span>
                  <span className="text-[#f0f0ec] font-bold">
                    {adjustments.contrast > 0 ? `+${adjustments.contrast}` : adjustments.contrast}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={adjustments.contrast}
                  onChange={(e) => onChangeAdjustment("contrast", Number(e.target.value))}
                  className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Saturation */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9a9d9a]">Saturation</span>
                  <span className="text-[#f0f0ec] font-bold">
                    {adjustments.saturation > 0 ? `+${adjustments.saturation}` : adjustments.saturation}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={adjustments.saturation}
                  onChange={(e) => onChangeAdjustment("saturation", Number(e.target.value))}
                  className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* White Balance Section with Eyedropper */}
            <div className="space-y-4 pt-2 border-t border-[#26272b]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#9a9d9a] uppercase font-bold tracking-wider">
                  White Balance
                </span>
                <button
                  onClick={onToggleEyedropper}
                  className={`
                    px-2 py-0.5 text-[11px] rounded border flex items-center gap-1 transition-all cursor-pointer
                    ${
                      isEyedropperActive
                        ? "bg-[#4b9fef] text-black border-[#4b9fef] font-bold"
                        : "bg-[#18191e] text-[#9a9d9a] border-[#26272b] hover:text-[#f0f0ec]"
                    }
                  `}
                  title="Eyedropper: Click on photo to sample neutral gray"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  {isEyedropperActive ? "Sampling..." : "Eyedropper"}
                </button>
              </div>

              {/* Temperature */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9a9d9a]">Temperature (Cool / Warm)</span>
                  <span className="text-[#f0f0ec] font-bold">
                    {adjustments.temperature > 0 ? `+${adjustments.temperature}` : adjustments.temperature}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={adjustments.temperature}
                  onChange={(e) => onChangeAdjustment("temperature", Number(e.target.value))}
                  className="w-full accent-amber-400 h-1.5 bg-gradient-to-r from-blue-600 via-[#26272b] to-amber-500 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Tint */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9a9d9a]">Tint (Green / Magenta)</span>
                  <span className="text-[#f0f0ec] font-bold">
                    {adjustments.tint > 0 ? `+${adjustments.tint}` : adjustments.tint}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={adjustments.tint}
                  onChange={(e) => onChangeAdjustment("tint", Number(e.target.value))}
                  className="w-full accent-fuchsia-400 h-1.5 bg-gradient-to-r from-emerald-600 via-[#26272b] to-fuchsia-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Details & Effects (Structure, Vignette, Grain) */}
            <div className="space-y-4 pt-2 border-t border-[#26272b]">
              <span className="text-[10px] text-[#9a9d9a] uppercase font-bold tracking-wider">
                Details & Texture
              </span>

              {/* Structure / Clarity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9a9d9a]">Structure (Clarity)</span>
                  <span className="text-[#f0f0ec] font-bold">
                    {adjustments.structure > 0 ? `+${adjustments.structure}` : adjustments.structure}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={adjustments.structure}
                  onChange={(e) => onChangeAdjustment("structure", Number(e.target.value))}
                  className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Vignette */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9a9d9a]">Vignette</span>
                  <span className="text-[#f0f0ec] font-bold">
                    {adjustments.vignette > 0 ? `+${adjustments.vignette}` : adjustments.vignette}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={adjustments.vignette}
                  onChange={(e) => onChangeAdjustment("vignette", Number(e.target.value))}
                  className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Film Grain */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9a9d9a]">Film Grain</span>
                  <span className="text-[#f0f0ec] font-bold">{adjustments.grain}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={adjustments.grain}
                  onChange={(e) => onChangeAdjustment("grain", Number(e.target.value))}
                  className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. CROP, ROTATE & STRAIGHTEN */}
        {activeTool === "crop" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#26272b] pb-2">
              <span className="text-xs font-bold text-[#f0f0ec]">CROP & STRAIGHTEN</span>
              {onResetCrop && (
                <button
                  onClick={onResetCrop}
                  className="text-[10px] text-[#4b9fef] hover:underline cursor-pointer"
                >
                  Reset to Full
                </button>
              )}
            </div>

            {/* Quick Action: Apply Crop Button */}
            {onApplyCrop && (
              <button
                onClick={onApplyCrop}
                className="w-full py-2 bg-[#4b9fef] hover:bg-[#3b8fe0] text-black font-bold text-xs rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                Apply Crop Selection
              </button>
            )}

            {/* Aspect Ratio Presets */}
            <div className="space-y-2">
              <span className="text-[10px] text-[#9a9d9a] uppercase font-bold tracking-wider">
                Aspect Ratio
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {ASPECT_RATIO_PRESETS.map((preset) => {
                  const isSelected = (transformState.aspectRatioPreset || "free") === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => onUpdateTransform({ aspectRatioPreset: preset.id as any })}
                      className={`
                        px-2.5 py-1.5 text-xs rounded border text-left cursor-pointer transition-colors
                        ${
                          isSelected
                            ? "bg-[#4b9fef]/20 border-[#4b9fef] text-[#4b9fef] font-bold"
                            : "bg-[#18191e] border-[#26272b] text-[#9a9d9a] hover:text-[#f0f0ec]"
                        }
                      `}
                    >
                      {preset.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Straighten fine angle slider */}
            <div className="space-y-2 pt-2 border-t border-[#26272b]">
              <div className="flex justify-between text-xs">
                <span className="text-[#9a9d9a]">Straighten Angle</span>
                <span className="text-[#4b9fef] font-bold">
                  {transformState.straighten ? `${transformState.straighten > 0 ? "+" : ""}${transformState.straighten}°` : "0°"}
                </span>
              </div>
              <input
                type="range"
                min="-45"
                max="45"
                value={transformState.straighten || 0}
                onChange={(e) => handleStraightenChange(Number(e.target.value))}
                className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#9a9d9a]">
                <span>-45°</span>
                <button
                  onClick={() => handleStraightenChange(0)}
                  className="text-[#4b9fef] hover:underline cursor-pointer"
                >
                  Reset 0°
                </button>
                <span>+45°</span>
              </div>
            </div>

            {/* 90° Rotate & Flip */}
            <div className="space-y-2 pt-2 border-t border-[#26272b]">
              <span className="text-[10px] text-[#9a9d9a] uppercase font-bold tracking-wider">
                Transform
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleRotateCCW}
                  className="p-2 bg-[#18191e] border border-[#26272b] hover:border-[#9a9d9a] rounded text-xs text-[#f0f0ec] flex items-center justify-center gap-1 cursor-pointer"
                >
                  ↺ 90° CCW
                </button>
                <button
                  onClick={handleRotateCW}
                  className="p-2 bg-[#18191e] border border-[#26272b] hover:border-[#9a9d9a] rounded text-xs text-[#f0f0ec] flex items-center justify-center gap-1 cursor-pointer"
                >
                  ↻ 90° CW
                </button>
                <button
                  onClick={handleFlipH}
                  className={`p-2 border rounded text-xs flex items-center justify-center gap-1 cursor-pointer ${
                    transformState.flipH ? "bg-[#4b9fef]/20 border-[#4b9fef] text-[#4b9fef]" : "bg-[#18191e] border-[#26272b] text-[#f0f0ec]"
                  }`}
                >
                  ⇄ Flip H
                </button>
                <button
                  onClick={handleFlipV}
                  className={`p-2 border rounded text-xs flex items-center justify-center gap-1 cursor-pointer ${
                    transformState.flipV ? "bg-[#4b9fef]/20 border-[#4b9fef] text-[#4b9fef]" : "bg-[#18191e] border-[#26272b] text-[#f0f0ec]"
                  }`}
                >
                  ⇅ Flip V
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. LOOKS & PRESETS */}
        {activeTool === "filter" && (
          <div className="space-y-4">
            <span className="text-xs font-bold text-[#f0f0ec]">SNAPSEED LOOKS</span>
            <p className="text-[11px] text-[#9a9d9a]">
              One-tap non-destructive film and color grading profiles.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_LOOKS.map((look) => (
                <button
                  key={look.id}
                  onClick={() => onApplyLookPreset && onApplyLookPreset(look)}
                  className="p-2.5 rounded bg-[#18191e] border border-[#26272b] hover:border-[#4b9fef] text-left transition-all cursor-pointer group flex flex-col gap-1"
                >
                  <div className={`w-full h-10 rounded bg-gradient-to-br ${look.previewBg} border border-white/10 flex items-end p-1`}>
                    <span className="text-[9px] font-bold px-1 bg-black/60 rounded text-[#f0f0ec]">
                      {look.tag}
                    </span>
                  </div>
                  <span className="text-xs text-[#f0f0ec] group-hover:text-[#4b9fef] font-bold truncate">
                    {look.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 6. TEXT TOOL */}
        {activeTool === "text" && (
          <div className="space-y-4">
            <span className="text-xs font-bold text-[#f0f0ec]">
              {isTextLayerSelected ? "EDIT TEXT LAYER" : "ADD TEXT LAYER"}
            </span>

            <div className="space-y-1.5">
              <span className="text-xs text-[#9a9d9a]">Text Content</span>
              <input
                type="text"
                value={textInput}
                onChange={(e) => {
                  setTextInput(e.target.value);
                  if (isTextLayerSelected && selectedLayerId && onUpdateTextLayer) {
                    onUpdateTextLayer(selectedLayerId, { text: e.target.value });
                  }
                }}
                className="w-full px-3 py-2 bg-[#18191e] border border-[#26272b] rounded text-xs text-[#f0f0ec] focus:outline-none focus:border-[#4b9fef]"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs text-[#9a9d9a]">Font Family</span>
              <select
                value={selectedFont.name}
                onChange={(e) => {
                  const font = CATEGORIZED_FONTS.find((f) => f.name === e.target.value);
                  if (font) {
                    setSelectedFont(font);
                    if (isTextLayerSelected && selectedLayerId && onUpdateTextLayer) {
                      onUpdateTextLayer(selectedLayerId, { fontFamily: font.family });
                    }
                  }
                }}
                className="w-full px-3 py-2 bg-[#18191e] border border-[#26272b] rounded text-xs text-[#f0f0ec] focus:outline-none focus:border-[#4b9fef]"
              >
                {CATEGORIZED_FONTS.map((font) => (
                  <option key={font.name} value={font.name}>
                    {font.name} ({font.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <span className="text-xs text-[#9a9d9a]">Font Size</span>
                <input
                  type="number"
                  min="12"
                  max="240"
                  value={fontSizeInput}
                  onChange={(e) => {
                    const size = Number(e.target.value);
                    setFontSizeInput(size);
                    if (isTextLayerSelected && selectedLayerId && onUpdateTextLayer) {
                      onUpdateTextLayer(selectedLayerId, { fontSize: size });
                    }
                  }}
                  className="w-full px-3 py-2 bg-[#18191e] border border-[#26272b] rounded text-xs text-[#f0f0ec]"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-[#9a9d9a]">Text Color</span>
                <input
                  type="color"
                  value={textColorInput}
                  onChange={(e) => {
                    setTextColorInput(e.target.value);
                    if (isTextLayerSelected && selectedLayerId && onUpdateTextLayer) {
                      onUpdateTextLayer(selectedLayerId, { color: e.target.value });
                    }
                  }}
                  className="w-full h-9 p-1 bg-[#18191e] border border-[#26272b] rounded cursor-pointer"
                />
              </div>
            </div>

            {!isTextLayerSelected && (
              <button
                onClick={() => {
                  onAddTextLayer(
                    textInput,
                    fontSizeInput,
                    textColorInput,
                    selectedFont.family,
                    selectedFont.category as any
                  );
                }}
                className="w-full py-2.5 bg-[#4b9fef] text-black font-bold rounded text-xs hover:bg-[#3b8fe0] transition-colors cursor-pointer"
              >
                + Add Text to Canvas
              </button>
            )}
          </div>
        )}

        {/* 7. LAYERS & DOUBLE EXPOSURE */}
        {activeTool === "layers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#f0f0ec]">LAYERS & STACK</span>
              <button
                onClick={() => doubleExposureFileInputRef.current?.click()}
                className="px-2 py-1 text-[11px] rounded bg-[#18191e] border border-[#26272b] text-[#4b9fef] hover:border-[#4b9fef] cursor-pointer flex items-center gap-1"
                title="Blend second image (Double Exposure)"
              >
                + Double Exposure
              </button>
            </div>

            <input
              ref={doubleExposureFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0] && onAddDoubleExposureLayer) {
                  onAddDoubleExposureLayer(e.target.files[0]);
                }
              }}
            />

            {/* Double exposure controls when selected */}
            {isDoubleExposureSelected && selectedLayer && selectedLayer.doubleExposureData && (
              <div className="p-3 bg-[#18191e] border border-[#4b9fef]/40 rounded-lg space-y-3">
                <span className="text-xs font-bold text-[#4b9fef]">Double Exposure Settings</span>
                
                {/* Opacity */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[#9a9d9a]">
                    <span>Blend Opacity</span>
                    <span>{Math.round(selectedLayer.doubleExposureData.opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(selectedLayer.doubleExposureData.opacity * 100)}
                    onChange={(e) => {
                      if (onUpdateDoubleExposureLayer) {
                        onUpdateDoubleExposureLayer(
                          selectedLayer.id,
                          Number(e.target.value) / 100,
                          selectedLayer.doubleExposureData!.blendMode
                        );
                      }
                    }}
                    className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Blend Mode */}
                <div className="space-y-1">
                  <span className="text-xs text-[#9a9d9a]">Blend Mode</span>
                  <select
                    value={selectedLayer.doubleExposureData.blendMode}
                    onChange={(e) => {
                      if (onUpdateDoubleExposureLayer) {
                        onUpdateDoubleExposureLayer(
                          selectedLayer.id,
                          selectedLayer.doubleExposureData!.opacity,
                          e.target.value as any
                        );
                      }
                    }}
                    className="w-full px-2 py-1.5 bg-[#131418] border border-[#26272b] rounded text-xs text-[#f0f0ec]"
                  >
                    <option value="normal">Normal</option>
                    <option value="screen">Screen (Lighten)</option>
                    <option value="multiply">Multiply (Darken)</option>
                    <option value="overlay">Overlay</option>
                    <option value="soft-light">Soft Light</option>
                  </select>
                </div>
              </div>
            )}

            {/* Layer Items List */}
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {layers.map((layer, idx) => {
                const isSelected = layer.id === selectedLayerId;
                return (
                  <div
                    key={layer.id}
                    onClick={() => onSelectLayer(layer.id)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setCtxMenu({ layerId: layer.id, x: e.clientX, y: e.clientY });
                    }}
                    className={`
                      flex items-center justify-between p-2 rounded border text-xs cursor-pointer transition-all
                      ${
                        isSelected
                          ? "bg-[#4b9fef]/15 border-[#4b9fef] text-[#f0f0ec]"
                          : "bg-[#18191e] border-[#26272b] text-[#9a9d9a] hover:text-[#f0f0ec]"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[10px] text-[#9a9d9a]">#{layers.length - idx}</span>
                      <span className="font-bold truncate">{layer.name}</span>
                      <span className="text-[9px] px-1 py-0.5 rounded bg-[#26272b] text-[#9a9d9a] uppercase">
                        {layer.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLayerVisibility(layer.id);
                        }}
                        className="text-[#9a9d9a] hover:text-[#f0f0ec] p-1 cursor-pointer"
                        title="Toggle visibility"
                      >
                        {layer.visible ? "👁" : "🚫"}
                      </button>
                      {layer.type !== "image" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteLayer(layer.id);
                          }}
                          className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                          title="Delete layer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 8. EXPORT PANEL */}
        {activeTool === "export" && (
          <div className="space-y-4">
            <span className="text-xs font-bold text-[#f0f0ec]">EXPORT IMAGE</span>

            <div className="space-y-1.5">
              <span className="text-xs text-[#9a9d9a]">File Format</span>
              <div className="grid grid-cols-3 gap-1.5">
                {(["image/jpeg", "image/png", "image/webp"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => onChangeExportSettings({ ...exportSettings, format: fmt })}
                    className={`
                      py-2 text-xs rounded border uppercase font-bold cursor-pointer transition-colors
                      ${
                        exportSettings.format === fmt
                          ? "bg-[#4b9fef]/20 border-[#4b9fef] text-[#4b9fef]"
                          : "bg-[#18191e] border-[#26272b] text-[#9a9d9a] hover:text-[#f0f0ec]"
                      }
                    `}
                  >
                    {fmt.split("/")[1]}
                  </button>
                ))}
              </div>
            </div>

            {exportSettings.format !== "image/png" && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9a9d9a]">Quality</span>
                  <span className="text-[#f0f0ec] font-bold">
                    {Math.round(exportSettings.quality * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={Math.round(exportSettings.quality * 100)}
                  onChange={(e) =>
                    onChangeExportSettings({
                      ...exportSettings,
                      quality: Number(e.target.value) / 100,
                    })
                  }
                  className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}

            <button
              onClick={onTriggerExport}
              className="w-full py-3 bg-[#4b9fef] text-black font-bold rounded text-xs hover:bg-[#3b8fe0] transition-colors cursor-pointer mt-4 shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Full-Res Photo
            </button>
          </div>
        )}
      </div>

      {/* Layer Context Menu */}
      {ctxMenu && (
        <div
          style={{ top: `${ctxMenu.y}px`, left: `${ctxMenu.x}px` }}
          className="fixed z-50 bg-[#18191e] border border-[#26272b] rounded-lg shadow-2xl py-1 w-44 font-mono text-xs select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {onDuplicateLayer && (
            <button
              onClick={() => {
                onDuplicateLayer(ctxMenu.layerId);
                closeCtxMenu();
              }}
              className="w-full px-3 py-1.5 text-left text-[#f0f0ec] hover:bg-[#4b9fef]/15 hover:text-[#4b9fef] flex items-center gap-2 cursor-pointer"
            >
              Duplicate Layer
            </button>
          )}
          <button
            onClick={() => {
              onToggleLayerVisibility(ctxMenu.layerId);
              closeCtxMenu();
            }}
            className="w-full px-3 py-1.5 text-left text-[#f0f0ec] hover:bg-[#4b9fef]/15 hover:text-[#4b9fef] flex items-center gap-2 cursor-pointer"
          >
            Toggle Visibility
          </button>
          <button
            onClick={() => {
              onDeleteLayer(ctxMenu.layerId);
              closeCtxMenu();
            }}
            className="w-full px-3 py-1.5 text-left text-red-400 hover:bg-red-500/15 flex items-center gap-2 cursor-pointer border-t border-[#26272b] mt-1 pt-1"
          >
            Delete Layer
          </button>
        </div>
      )}
    </aside>
  );
}
