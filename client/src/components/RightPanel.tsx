"use client";

import { useState, useEffect, useRef } from "react";
import {
  ToolType,
  Adjustments,
  LayerItem,
  FilterSettings,
  ExportSettings,
  CurvesData,
  SelectivePoint,
  PhotoPreset,
} from "@/types/editor";
import { TransformState } from "@/hooks/useCanvas";
import { CATEGORIZED_FONTS } from "@/utils/fonts";
import CurvesTool, { DEFAULT_CURVES } from "@/components/CurvesTool";
import SelectiveTool from "@/components/SelectiveTool";
import { PHOTO_PRESETS, PRESET_CATEGORIES } from "@/constants/presets";

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
  onApplyPreset?: (preset: PhotoPreset, intensity?: number) => void;
  onApplyLookPreset?: (preset: any) => void;
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
  onUpdateDoubleExposureLayer?: (
    id: string,
    opacity: number,
    blendMode: "normal" | "screen" | "multiply" | "overlay" | "soft-light"
  ) => void;
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
  onApplyPreset,
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
  const [textInput, setTextInput] = useState("SHADE");
  const [fontSizeInput, setFontSizeInput] = useState(48);
  const [textColorInput, setTextColorInput] = useState("#3b82f6");
  const [selectedFont, setSelectedFont] = useState(CATEGORIZED_FONTS[0]);

  // Preset browser state
  const [presetCategory, setPresetCategory] = useState<string>("All");
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [presetIntensity, setPresetIntensity] = useState<number>(100);

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

  // Layer context menu state
  const [ctxMenu, setCtxMenu] = useState<{ layerId: string; x: number; y: number } | null>(null);
  const closeCtxMenu = () => setCtxMenu(null);

  useEffect(() => {
    if (!ctxMenu) return;
    const handler = () => closeCtxMenu();
    window.addEventListener("click", handler);
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeCtxMenu();
    });
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

  const handlePresetClick = (preset: PhotoPreset) => {
    setSelectedPresetId(preset.id);
    if (onApplyPreset) {
      onApplyPreset(preset, presetIntensity);
    } else if (onApplyLookPreset) {
      onApplyLookPreset(preset);
    }
  };

  const handleIntensityChange = (newIntensity: number) => {
    setPresetIntensity(newIntensity);
    if (selectedPresetId && onApplyPreset) {
      const current = PHOTO_PRESETS.find((p) => p.id === selectedPresetId);
      if (current) {
        onApplyPreset(current, newIntensity);
      }
    }
  };

  const filteredPresets =
    presetCategory === "All"
      ? PHOTO_PRESETS
      : PHOTO_PRESETS.filter((p) => p.category === presetCategory);

  return (
    <aside
      className={`
        border-l border-[#222227] bg-[#121215] flex flex-col shrink-0 select-none relative
        transition-[width,min-width,max-width] duration-180 ease-out
        ${collapsed ? "w-0 min-w-0 max-w-0 border-l-0" : "w-76 max-w-76"}
      `}
    >
      {/* Collapse / Expand Chevron Tab Button */}
      {onToggleCollapsed && (
        <button
          onClick={onToggleCollapsed}
          title={collapsed ? "Expand panel" : "Collapse panel"}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-50 w-3 h-10 bg-[#16161a] hover:bg-[#2563eb] text-[#84848d] hover:text-white border border-[#222227] border-r-0 rounded-l flex items-center justify-center cursor-pointer transition-colors shadow-md"
        >
          <span className="text-[9px] font-bold">{collapsed ? "‹" : "›"}</span>
        </button>
      )}

      {/* Main Panel Content Scroll Area */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-5 ${collapsed ? "hidden" : "block"}`}>
        {/* 1. SELECTIVE CONTROL POINTS */}
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

        {/* 2. TONE CURVES */}
        {activeTool === "curves" && (
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-[#222227] pb-2">
              <span className="text-xs font-semibold text-[#ededed]">TONE CURVES</span>
              <button
                onClick={() => onChangeCurves(DEFAULT_CURVES)}
                className="text-[11px] text-[#84848d] hover:text-[#ededed] cursor-pointer transition-colors"
              >
                Reset
              </button>
            </div>
            <CurvesTool curves={curves} onChangeCurves={onChangeCurves} />
          </div>
        )}

        {/* 3. TUNE IMAGE (LIGHT, TONE, COLOR, DETAIL) */}
        {(activeTool === "adjust" || activeTool === "select") && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-[#222227] pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#ededed]">TUNE IMAGE</span>
              </div>
              {onResetAdjustments && (
                <button
                  onClick={onResetAdjustments}
                  className="text-[11px] text-[#3b82f6] hover:underline cursor-pointer"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* LIGHT: Exposure, Brightness, Contrast */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[#84848d]">
                Light
              </span>

              {/* Exposure */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#84848d]">Exposure</span>
                  <span className="font-mono text-xs text-[#ededed]">
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

              {/* Brightness */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#84848d]">Brightness</span>
                  <span className="font-mono text-xs text-[#ededed]">
                    {adjustments.brightness > 0
                      ? `+${adjustments.brightness}`
                      : adjustments.brightness}
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

              {/* Contrast */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#84848d]">Contrast</span>
                  <span className="font-mono text-xs text-[#ededed]">
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
            </div>

            {/* TONE: Highlights, Shadows, Whites, Blacks */}
            <div className="space-y-3 pt-2 border-t border-[#222227]">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[#84848d]">
                Tone
              </span>

              {/* Highlights */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#84848d]">Highlights</span>
                  <span className="font-mono text-xs text-[#ededed]">
                    {adjustments.highlights > 0
                      ? `+${adjustments.highlights}`
                      : adjustments.highlights}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={adjustments.highlights}
                  onChange={(e) => onChangeAdjustment("highlights", Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Shadows */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#84848d]">Shadows</span>
                  <span className="font-mono text-xs text-[#ededed]">
                    {adjustments.shadows > 0 ? `+${adjustments.shadows}` : adjustments.shadows}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={adjustments.shadows}
                  onChange={(e) => onChangeAdjustment("shadows", Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Whites */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#84848d]">Whites</span>
                  <span className="font-mono text-xs text-[#ededed]">
                    {adjustments.whites > 0 ? `+${adjustments.whites}` : adjustments.whites}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={adjustments.whites}
                  onChange={(e) => onChangeAdjustment("whites", Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Blacks */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#84848d]">Blacks</span>
                  <span className="font-mono text-xs text-[#ededed]">
                    {adjustments.blacks > 0 ? `+${adjustments.blacks}` : adjustments.blacks}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={adjustments.blacks}
                  onChange={(e) => onChangeAdjustment("blacks", Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* COLOR: Temperature, Tint, Saturation, Vibrance */}
            <div className="space-y-3 pt-2 border-t border-[#222227]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-[#84848d]">
                  Color
                </span>
                <button
                  onClick={onToggleEyedropper}
                  className={`
                    px-2 py-0.5 text-[10px] rounded border flex items-center gap-1 transition-all cursor-pointer
                    ${
                      isEyedropperActive
                        ? "bg-[#3b82f6] text-white border-[#3b82f6] font-semibold"
                        : "bg-[#16161a] text-[#84848d] border-[#222227] hover:text-[#ededed] hover:border-[#2d2d34]"
                    }
                  `}
                  title="Eyedropper: Sample neutral gray on photo"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                    />
                  </svg>
                  <span>{isEyedropperActive ? "Sampling..." : "Eyedropper"}</span>
                </button>
              </div>

              {/* Temperature */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#84848d]">Temperature</span>
                  <span className="font-mono text-xs text-[#ededed]">
                    {adjustments.temperature > 0
                      ? `+${adjustments.temperature}`
                      : adjustments.temperature}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={adjustments.temperature}
                  onChange={(e) => onChangeAdjustment("temperature", Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Tint */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#84848d]">Tint</span>
                  <span className="font-mono text-xs text-[#ededed]">
                    {adjustments.tint > 0 ? `+${adjustments.tint}` : adjustments.tint}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={adjustments.tint}
                  onChange={(e) => onChangeAdjustment("tint", Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Saturation */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#84848d]">Saturation</span>
                  <span className="font-mono text-xs text-[#ededed]">
                    {adjustments.saturation > 0
                      ? `+${adjustments.saturation}`
                      : adjustments.saturation}
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

              {/* Vibrance */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#84848d]">Vibrance</span>
                  <span className="font-mono text-xs text-[#ededed]">
                    {adjustments.vibrance > 0 ? `+${adjustments.vibrance}` : adjustments.vibrance}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={adjustments.vibrance}
                  onChange={(e) => onChangeAdjustment("vibrance", Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* DETAIL: Clarity, Sharpness, Blur, Film Grain, Vignette */}
            <div className="space-y-3 pt-2 border-t border-[#222227]">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[#84848d]">
                Detail & Effects
              </span>

              {/* Clarity */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#84848d]">Clarity</span>
                  <span className="font-mono text-xs text-[#ededed]">
                    {(adjustments.clarity ?? adjustments.structure ?? 0) > 0
                      ? `+${adjustments.clarity ?? adjustments.structure ?? 0}`
                      : adjustments.clarity ?? adjustments.structure ?? 0}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={adjustments.clarity ?? adjustments.structure ?? 0}
                  onChange={(e) => onChangeAdjustment("clarity", Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Sharpness */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#84848d]">Sharpness</span>
                  <span className="font-mono text-xs text-[#ededed]">{adjustments.sharpness ?? 0}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={adjustments.sharpness ?? 0}
                  onChange={(e) => onChangeAdjustment("sharpness", Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Blur */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#84848d]">Blur</span>
                  <span className="font-mono text-xs text-[#ededed]">{adjustments.blur ?? 0}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={adjustments.blur ?? 0}
                  onChange={(e) => onChangeAdjustment("blur", Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Film Grain */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#84848d]">Film Grain</span>
                  <span className="font-mono text-xs text-[#ededed]">{adjustments.grain}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={adjustments.grain}
                  onChange={(e) => onChangeAdjustment("grain", Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Vignette */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#84848d]">Vignette</span>
                  <span className="font-mono text-xs text-[#ededed]">
                    {adjustments.vignette > 0 ? `+${adjustments.vignette}` : adjustments.vignette}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={adjustments.vignette}
                  onChange={(e) => onChangeAdjustment("vignette", Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. CROP, ROTATE & STRAIGHTEN */}
        {activeTool === "crop" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-[#222227] pb-2">
              <span className="text-xs font-semibold text-[#ededed]">CROP & STRAIGHTEN</span>
              {onResetCrop && (
                <button
                  onClick={onResetCrop}
                  className="text-[11px] text-[#3b82f6] hover:underline cursor-pointer"
                >
                  Reset to Full
                </button>
              )}
            </div>

            {/* Apply Crop Button */}
            {onApplyCrop && (
              <button
                onClick={onApplyCrop}
                className="w-full py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium text-xs rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>✓</span> Apply Crop Selection
              </button>
            )}

            {/* Aspect Ratio Presets */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[#84848d]">
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
                            ? "bg-[#3b82f6]/15 border-[#3b82f6]/50 text-[#3b82f6] font-semibold"
                            : "bg-[#16161a] border-[#222227] text-[#84848d] hover:text-[#ededed] hover:border-[#2d2d34]"
                        }
                      `}
                    >
                      {preset.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Straighten Angle */}
            <div className="space-y-1.5 pt-2 border-t border-[#222227]">
              <div className="flex justify-between text-xs">
                <span className="text-[#84848d]">Straighten Angle</span>
                <span className="font-mono text-xs text-[#ededed]">
                  {transformState.straighten
                    ? `${transformState.straighten > 0 ? "+" : ""}${transformState.straighten}°`
                    : "0°"}
                </span>
              </div>
              <input
                type="range"
                min="-45"
                max="45"
                value={transformState.straighten || 0}
                onChange={(e) => handleStraightenChange(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-[#5c5c66]">
                <span>-45°</span>
                <button
                  onClick={() => handleStraightenChange(0)}
                  className="text-[#3b82f6] hover:underline cursor-pointer"
                >
                  Reset 0°
                </button>
                <span>+45°</span>
              </div>
            </div>

            {/* Transform Rotate & Flip */}
            <div className="space-y-2 pt-2 border-t border-[#222227]">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[#84848d]">
                Orientation
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={handleRotateCCW}
                  className="p-1.5 bg-[#16161a] border border-[#222227] hover:border-[#2d2d34] rounded text-xs text-[#ededed] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  ↺ 90° CCW
                </button>
                <button
                  onClick={handleRotateCW}
                  className="p-1.5 bg-[#16161a] border border-[#222227] hover:border-[#2d2d34] rounded text-xs text-[#ededed] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  ↻ 90° CW
                </button>
                <button
                  onClick={handleFlipH}
                  className={`p-1.5 border rounded text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                    transformState.flipH
                      ? "bg-[#3b82f6]/15 border-[#3b82f6]/50 text-[#3b82f6]"
                      : "bg-[#16161a] border-[#222227] text-[#ededed] hover:border-[#2d2d34]"
                  }`}
                >
                  ⇄ Flip H
                </button>
                <button
                  onClick={handleFlipV}
                  className={`p-1.5 border rounded text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                    transformState.flipV
                      ? "bg-[#3b82f6]/15 border-[#3b82f6]/50 text-[#3b82f6]"
                      : "bg-[#16161a] border-[#222227] text-[#ededed] hover:border-[#2d2d34]"
                  }`}
                >
                  ⇅ Flip V
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. PRESETS & LOOKS */}
        {activeTool === "filter" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#222227] pb-2">
              <div>
                <span className="text-xs font-semibold text-[#ededed]">PRESETS</span>
                <p className="text-[10px] text-[#84848d]">Non-destructive photographic grades</p>
              </div>
              {onResetAdjustments && (
                <button
                  onClick={onResetAdjustments}
                  className="text-[11px] text-[#3b82f6] hover:underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-1">
              {PRESET_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPresetCategory(cat)}
                  className={`
                    px-2 py-0.5 text-[10px] rounded-full border transition-colors cursor-pointer
                    ${
                      presetCategory === cat
                        ? "bg-[#3b82f6] text-white border-[#3b82f6] font-medium"
                        : "bg-[#16161a] text-[#84848d] border-[#222227] hover:text-[#ededed]"
                    }
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Preset Intensity Slider */}
            {selectedPresetId && (
              <div className="p-2.5 bg-[#16161a] border border-[#222227] rounded-lg space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#84848d]">Preset Intensity</span>
                  <span className="font-mono text-xs text-[#ededed]">{presetIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  value={presetIntensity}
                  onChange={(e) => handleIntensityChange(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            {/* Preset Cards List */}
            <div className="grid grid-cols-1 gap-2">
              {filteredPresets.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetClick(preset)}
                    className={`
                      p-2.5 rounded-lg bg-[#16161a] border text-left transition-all cursor-pointer group flex flex-col gap-1
                      ${
                        isSelected
                          ? "border-[#3b82f6] bg-[#3b82f6]/5 ring-1 ring-[#3b82f6]"
                          : "border-[#222227] hover:border-[#2d2d34]"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${preset.previewBg || "from-sky-500 to-indigo-600"}`}
                        />
                        <span
                          className={`text-xs font-semibold ${
                            isSelected ? "text-[#3b82f6]" : "text-[#ededed] group-hover:text-[#3b82f6]"
                          }`}
                        >
                          {preset.name}
                        </span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 bg-[#121215] rounded text-[#84848d] border border-[#222227]">
                        {preset.tag || preset.category.toUpperCase()}
                      </span>
                    </div>

                    {preset.description && (
                      <p className="text-[10px] text-[#84848d] line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. TEXT TOOL */}
        {activeTool === "text" && (
          <div className="space-y-4">
            <span className="text-xs font-semibold text-[#ededed]">
              {isTextLayerSelected ? "EDIT TEXT LAYER" : "ADD TEXT LAYER"}
            </span>

            <div className="space-y-1">
              <span className="text-xs text-[#84848d]">Text Content</span>
              <input
                type="text"
                value={textInput}
                onChange={(e) => {
                  setTextInput(e.target.value);
                  if (isTextLayerSelected && selectedLayerId && onUpdateTextLayer) {
                    onUpdateTextLayer(selectedLayerId, { text: e.target.value });
                  }
                }}
                className="w-full px-2.5 py-1.5 bg-[#16161a] border border-[#222227] rounded text-xs text-[#ededed] focus:outline-none focus:border-[#3b82f6]"
              />
            </div>

            <div className="space-y-1">
              <span className="text-xs text-[#84848d]">Font Family</span>
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
                className="w-full px-2.5 py-1.5 bg-[#16161a] border border-[#222227] rounded text-xs text-[#ededed] focus:outline-none focus:border-[#3b82f6]"
              >
                {CATEGORIZED_FONTS.map((font) => (
                  <option key={font.name} value={font.name}>
                    {font.name} ({font.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-xs text-[#84848d]">Font Size</span>
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
                  className="w-full px-2.5 py-1.5 bg-[#16161a] border border-[#222227] rounded text-xs text-[#ededed]"
                />
              </div>

              <div className="space-y-1">
                <span className="text-xs text-[#84848d]">Text Color</span>
                <input
                  type="color"
                  value={textColorInput}
                  onChange={(e) => {
                    setTextColorInput(e.target.value);
                    if (isTextLayerSelected && selectedLayerId && onUpdateTextLayer) {
                      onUpdateTextLayer(selectedLayerId, { color: e.target.value });
                    }
                  }}
                  className="w-full h-8 p-1 bg-[#16161a] border border-[#222227] rounded cursor-pointer"
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
                className="w-full py-2 bg-[#2563eb] text-white font-medium rounded text-xs hover:bg-[#1d4ed8] transition-colors cursor-pointer"
              >
                + Add Text to Canvas
              </button>
            )}
          </div>
        )}

        {/* 7. LAYERS & DOUBLE EXPOSURE */}
        {activeTool === "layers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#222227] pb-2">
              <span className="text-xs font-semibold text-[#ededed]">LAYERS</span>
              <button
                onClick={() => doubleExposureFileInputRef.current?.click()}
                className="px-2 py-0.5 text-[11px] rounded bg-[#16161a] border border-[#222227] text-[#3b82f6] hover:border-[#3b82f6] cursor-pointer flex items-center gap-1 transition-colors"
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
              <div className="p-3 bg-[#16161a] border border-[#3b82f6]/30 rounded-lg space-y-2.5">
                <span className="text-xs font-semibold text-[#3b82f6]">Double Exposure Blend</span>

                {/* Opacity */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[#84848d]">
                    <span>Blend Opacity</span>
                    <span className="font-mono text-xs text-[#ededed]">
                      {Math.round(selectedLayer.doubleExposureData.opacity * 100)}%
                    </span>
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
                    className="w-full"
                  />
                </div>

                {/* Blend Mode */}
                <div className="space-y-1">
                  <span className="text-xs text-[#84848d]">Blend Mode</span>
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
                    className="w-full px-2 py-1 bg-[#121215] border border-[#222227] rounded text-xs text-[#ededed]"
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
                          ? "bg-[#3b82f6]/10 border-[#3b82f6]/50 text-[#ededed]"
                          : "bg-[#16161a] border-[#222227] text-[#84848d] hover:text-[#ededed] hover:border-[#2d2d34]"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[10px] text-[#5c5c66]">#{layers.length - idx}</span>
                      <span className="font-medium truncate">{layer.name}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-[#121215] text-[#84848d] uppercase border border-[#222227]">
                        {layer.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLayerVisibility(layer.id);
                        }}
                        className="text-[#84848d] hover:text-[#ededed] p-1 cursor-pointer transition-colors"
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
                          className="text-red-400 hover:text-red-300 p-1 cursor-pointer transition-colors"
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
            <div className="border-b border-[#222227] pb-2">
              <span className="text-xs font-semibold text-[#ededed]">EXPORT IMAGE</span>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs text-[#84848d]">File Format</span>
              <div className="grid grid-cols-3 gap-1.5">
                {(["image/jpeg", "image/png", "image/webp"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => onChangeExportSettings({ ...exportSettings, format: fmt })}
                    className={`
                      py-1.5 text-xs rounded border uppercase font-medium cursor-pointer transition-colors
                      ${
                        exportSettings.format === fmt
                          ? "bg-[#3b82f6]/15 border-[#3b82f6]/50 text-[#3b82f6] font-semibold"
                          : "bg-[#16161a] border-[#222227] text-[#84848d] hover:text-[#ededed] hover:border-[#2d2d34]"
                      }
                    `}
                  >
                    {fmt.split("/")[1]}
                  </button>
                ))}
              </div>
            </div>

            {exportSettings.format !== "image/png" && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#84848d]">Quality</span>
                  <span className="font-mono text-xs text-[#ededed]">
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
                  className="w-full"
                />
              </div>
            )}

            <button
              onClick={onTriggerExport}
              className="w-full py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium rounded text-xs transition-colors cursor-pointer mt-3 shadow-md flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>Download Photo</span>
            </button>
          </div>
        )}
      </div>

      {/* Layer Context Menu */}
      {ctxMenu && (
        <div
          style={{ top: `${ctxMenu.y}px`, left: `${ctxMenu.x}px` }}
          className="fixed z-50 bg-[#16161a] border border-[#222227] rounded-md shadow-2xl py-1 w-40 text-xs select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {onDuplicateLayer && (
            <button
              onClick={() => {
                onDuplicateLayer(ctxMenu.layerId);
                closeCtxMenu();
              }}
              className="w-full px-3 py-1.5 text-left text-[#ededed] hover:bg-[#1e1e24] hover:text-[#3b82f6] flex items-center gap-2 cursor-pointer transition-colors"
            >
              Duplicate Layer
            </button>
          )}
          <button
            onClick={() => {
              onToggleLayerVisibility(ctxMenu.layerId);
              closeCtxMenu();
            }}
            className="w-full px-3 py-1.5 text-left text-[#ededed] hover:bg-[#1e1e24] hover:text-[#3b82f6] flex items-center gap-2 cursor-pointer transition-colors"
          >
            Toggle Visibility
          </button>
          <button
            onClick={() => {
              onDeleteLayer(ctxMenu.layerId);
              closeCtxMenu();
            }}
            className="w-full px-3 py-1.5 text-left text-red-400 hover:bg-red-500/10 flex items-center gap-2 cursor-pointer border-t border-[#222227] mt-1 pt-1 transition-colors"
          >
            Delete Layer
          </button>
        </div>
      )}
    </aside>
  );
}
