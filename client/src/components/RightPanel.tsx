"use client";

import { useState, useEffect, useRef, memo } from "react";
import {
  ToolType,
  Adjustments,
  LayerItem,
  ExportSettings,
  CurvesData,
  SelectivePoint,
  PresetLayer,
  BackgroundEraserSettings,
  TextStroke,
  TextGlow,
  TextShadow,
} from "@/types/editor";
import { TransformState } from "@/hooks/useCanvas";
import { CATEGORIZED_FONTS } from "@/utils/fonts";
import CurvesTool, { DEFAULT_CURVES } from "@/components/CurvesTool";
import SelectiveTool from "@/components/SelectiveTool";
import {
  STACKABLE_PRESETS,
  STACKABLE_PRESET_CATEGORIES,
} from "@/constants/presets";
import { TEXT_COLOR_SWATCHES } from "@/constants/textColors";

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
  presetLayers: PresetLayer[];
  onAddPresetLayer: (presetId: string, name: string) => void;
  onUpdatePresetLayerAmount: (id: string, amount: number, commit?: boolean) => void;
  onTogglePresetLayerVisibility: (id: string) => void;
  onDeletePresetLayer: (id: string) => void;
  onClearPresetLayers: () => void;
  transformState: TransformState;
  onUpdateTransform: (transform: Partial<TransformState>) => void;
  layers: LayerItem[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onToggleLayerVisibility: (id: string) => void;
  onToggleLayerLock?: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onDuplicateLayer?: (id: string) => void;
  onRenameLayer?: (id: string, name: string) => void;
  onReorderLayers: (newLayers: LayerItem[]) => void;
  onCommitPresets?: () => void;
  onBakeTextLayer?: (id: string) => void;
  onDuplicateSelectivePoint?: (id: string) => void;
  showSelectiveMarkers?: boolean;
  onToggleSelectiveMarkers?: () => void;
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
    category: "standard" | "design" | "artsy" | "display",
    extraStyles?: {
      fontWeight?: "normal" | "bold" | "bolder";
      textAlign?: "left" | "center" | "right";
      rotation?: number;
      opacity?: number;
      stroke?: TextStroke;
      outline?: TextStroke;
      glow?: TextGlow;
      shadow?: TextShadow;
      skewX?: number;
      skewY?: number;
      curl?: number;
    }
  ) => void;
  onUpdateTextLayer?: (
    id: string,
    updates: Partial<{
      text: string;
      fontSize: number;
      color: string;
      fontFamily: string;
      fontWeight?: "normal" | "bold" | "bolder";
      textAlign?: "left" | "center" | "right";
      rotation?: number;
      opacity?: number;
      stroke?: TextStroke | null;
      outline?: TextStroke | null;
      glow?: TextGlow | null;
      shadow?: TextShadow | null;
      skewX?: number;
      skewY?: number;
      curl?: number;
    }>
  ) => void;
  exportSettings: ExportSettings;
  onChangeExportSettings: (settings: ExportSettings) => void;
  onTriggerExport: () => void;
  backgroundEraser: BackgroundEraserSettings;
  onChangeEraserColor: (color: string) => void;
  onChangeEraserTolerance: (tolerance: number) => void;
  onCommitEraser: () => void;
  onToggleBackgroundRemoval: (enabled: boolean) => void;
  onResetBackgroundEraser: () => void;
  isEraserPickerActive: boolean;
  onToggleEraserPicker: () => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  hasImage?: boolean;
  isMobileSheet?: boolean;
  onCloseMobileSheet?: () => void;
}

const ASPECT_RATIO_PRESETS = [
  { id: "free", name: "Free" },
  { id: "original", name: "Original" },
  { id: "1:1", name: "1:1 Square" },
  { id: "4:3", name: "4:3 Classic" },
  { id: "16:9", name: "16:9 Wide" },
  { id: "3:2", name: "3:2 Photo" },
  { id: "9:16", name: "9:16 Story" },
];

/**
 * Standard Compact Slider Row:
 * [Muted Label 90px] [Thin Track + Blue Thumb Slider] [Dark Monospace Value Box 48px]
 */
interface CompactSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  onCommit?: () => void;
  specialTrack?: "temperature" | "tint" | "bipolar" | "unipolar";
  formatDisplay?: (val: number) => string;
}

function CompactSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  onCommit,
  specialTrack = "bipolar",
  formatDisplay,
}: CompactSliderProps) {
  const getTrackBackground = () => {
    if (specialTrack === "temperature") {
      return "linear-gradient(to right, #38bdf8 0%, #1e2330 50%, #f59e0b 100%)";
    }
    if (specialTrack === "tint") {
      return "linear-gradient(to right, #4ade80 0%, #1e2330 50%, #e879f9 100%)";
    }
    if (specialTrack === "bipolar" && min < 0) {
      // Bipolar center-to-thumb soft blue fill
      const centerPct = 50;
      const currentPct = ((value - min) / (max - min)) * 100;
      const left = Math.min(centerPct, currentPct);
      const right = Math.max(centerPct, currentPct);
      return `linear-gradient(to right, var(--border) 0%, var(--border) ${left}%, var(--accent) ${left}%, var(--accent) ${right}%, var(--border) ${right}%, var(--border) 100%)`;
    }
    return undefined;
  };

  const displayVal = formatDisplay
    ? formatDisplay(value)
    : value > 0
    ? `+${value}`
    : `${value}`;

  return (
    <div className="flex items-center gap-2.5 h-7">
      <span className="text-[13px] text-[var(--text-muted)] w-[88px] shrink-0 truncate font-normal">
        {label}
      </span>

      <div className="flex-1 relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onPointerUp={onCommit}
          onKeyUp={onCommit}
          style={{ background: getTrackBackground() }}
          className="w-full rounded-sm"
        />
      </div>

      <div className="w-[48px] h-6 bg-[var(--bg-elevated)] border border-[var(--border)] rounded flex items-center justify-center font-mono text-xs text-[var(--text)] shrink-0 select-text">
        {displayVal}
      </div>
    </div>
  );
}

/**
 * Reusable Color Picker with preset swatches (Popular + Among Us crewmates) and custom color input
 */
function ColorSwatchPicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (hex: string) => void;
  label?: string;
}) {
  return (
    <div className="space-y-1.5">
      {label && <div className="text-[11px] text-[var(--text-muted)] font-medium">{label}</div>}
      <div className="flex items-center gap-2">
        <label className="relative flex items-center justify-center w-7 h-7 rounded border border-[var(--border)] overflow-hidden cursor-pointer shrink-0 shadow-sm hover:border-[var(--accent)] transition-colors">
          <input
            type="color"
            value={value.startsWith("#") && value.length === 7 ? value : "#ffffff"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -inset-2 w-12 h-12 opacity-0 cursor-pointer"
          />
          <div className="w-full h-full" style={{ backgroundColor: value }} />
        </label>
        <span className="font-mono text-xs text-[var(--text)] uppercase select-all">
          {value}
        </span>
      </div>

      {/* Swatches grid */}
      <div className="space-y-1 pt-1">
        <div className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] font-bold">Presets</div>
        <div className="flex flex-wrap gap-1">
          {TEXT_COLOR_SWATCHES.map((swatch) => (
            <button
              key={swatch.name + swatch.hex}
              onClick={() => onChange(swatch.hex)}
              className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                value.toLowerCase() === swatch.hex.toLowerCase()
                  ? "ring-2 ring-[var(--accent)] ring-offset-1 ring-offset-[#121316] scale-110 border-white"
                  : "border-black/40 hover:scale-110 hover:border-white/80"
              }`}
              style={{ backgroundColor: swatch.hex }}
              title={`${swatch.name} (${swatch.hex})`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const RightPanel = memo(function RightPanel({
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
  presetLayers,
  onAddPresetLayer,
  onUpdatePresetLayerAmount,
  onTogglePresetLayerVisibility,
  onDeletePresetLayer,
  onClearPresetLayers,
  transformState,
  onUpdateTransform,
  layers,
  selectedLayerId,
  onSelectLayer,
  onToggleLayerVisibility,
  onToggleLayerLock,
  onDeleteLayer,
  onDuplicateLayer,
  onRenameLayer,
  onReorderLayers,
  onCommitPresets,
  onBakeTextLayer,
  onDuplicateSelectivePoint,
  showSelectiveMarkers,
  onToggleSelectiveMarkers,
  onResetCrop,
  onApplyCrop,
  onAddDoubleExposureLayer,
  onUpdateDoubleExposureLayer,
  onAddTextLayer,
  onUpdateTextLayer,
  exportSettings,
  onChangeExportSettings,
  onTriggerExport,
  backgroundEraser,
  onChangeEraserColor,
  onChangeEraserTolerance,
  onCommitEraser,
  onToggleBackgroundRemoval,
  onResetBackgroundEraser,
  isEraserPickerActive,
  onToggleEraserPicker,
  collapsed = false,
  onToggleCollapsed,
  hasImage = false,
  isMobileSheet = false,
  onCloseMobileSheet,
}: RightPanelProps) {
  // Top Active Tab: Default to TUNE unless tool is PRESETS/FILTER, or user explicitly clicks tab
  const [activeTab, setActiveTab] = useState<"TUNE" | "PRESETS">("TUNE");

  // Keep active tab in sync when user clicks Filter/Presets tool in left bar
  useEffect(() => {
    if (activeTool === "filter") {
      setActiveTab("PRESETS");
    } else if (activeTool === "adjust") {
      setActiveTab("TUNE");
    }
  }, [activeTool]);

  // Collapsible section states in Tune tab
  const [openSections, setOpenSections] = useState({
    light: true,
    tone: true,
    color: true,
    detail: true,
  });

  const toggleSection = (section: "light" | "tone" | "color" | "detail") => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Preset Layer selection for editing amount
  const [selectedPresetLayerId, setSelectedPresetLayerId] = useState<string | null>(null);

  // Text tool local inputs
  const [textInput, setTextInput] = useState("SHADE");
  const [fontSizeInput, setFontSizeInput] = useState(48);
  const [textColorInput, setTextColorInput] = useState("#2f7cf6");
  const [selectedFont, setSelectedFont] = useState(CATEGORIZED_FONTS[0]);
  // Extended text styling state
  const [textFontWeight, setTextFontWeight] = useState<"normal" | "bold" | "bolder">("bold");
  const [textAlign, setTextAlignState] = useState<"left" | "center" | "right">("left");
  const [textRotation, setTextRotation] = useState(0);
  const [textOpacity, setTextOpacity] = useState(100);
  const [textStroke, setTextStroke] = useState<TextStroke | null>(null);
  const [textOutline, setTextOutline] = useState<TextStroke | null>(null);
  const [textGlow, setTextGlow] = useState<TextGlow | null>(null);
  const [textShadow, setTextShadow] = useState<TextShadow | null>(null);
  const [textSkewX, setTextSkewX] = useState(0);
  const [textSkewY, setTextSkewY] = useState(0);
  const [textCurl, setTextCurl] = useState(0);
  // Track which text effects sub-section is open
  const [openTextSections, setOpenTextSections] = useState({
    basic: true,
    stroke: false,
    effects: false,
    transform: false,
  });

  /** Helper: push text style update to active layer */
  const pushTextUpdate = (updates: Parameters<NonNullable<typeof onUpdateTextLayer>>[1]) => {
    if (isTextLayerSelected && selectedLayerId && onUpdateTextLayer) {
      onUpdateTextLayer(selectedLayerId, updates);
    }
  };

  /** Collect current state into extraStyles for new layer creation */
  const collectExtraStyles = () => ({
    fontWeight: textFontWeight,
    textAlign,
    rotation: textRotation,
    opacity: textOpacity,
    stroke: textStroke ?? undefined,
    outline: textOutline ?? undefined,
    glow: textGlow ?? undefined,
    shadow: textShadow ?? undefined,
    skewX: textSkewX,
    skewY: textSkewY,
    curl: textCurl,
  });

  /** Reset all text effects to defaults */
  const resetTextEffects = () => {
    setTextFontWeight("bold");
    setTextAlignState("left");
    setTextRotation(0);
    setTextOpacity(100);
    setTextStroke(null);
    setTextOutline(null);
    setTextGlow(null);
    setTextShadow(null);
    setTextSkewX(0);
    setTextSkewY(0);
    setTextCurl(0);
    if (isTextLayerSelected && selectedLayerId && onUpdateTextLayer) {
      onUpdateTextLayer(selectedLayerId, {
        fontWeight: "bold",
        textAlign: "left",
        rotation: 0,
        opacity: 100,
        stroke: null,
        outline: null,
        glow: null,
        shadow: null,
        skewX: 0,
        skewY: 0,
        curl: 0,
      });
    }
  };

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
      setTextFontWeight(t.fontWeight || "bold");
      setTextAlignState(t.textAlign || "left");
      setTextRotation(t.rotation ?? 0);
      setTextOpacity(t.opacity ?? 100);
      setTextStroke(t.stroke || null);
      setTextOutline(t.outline || null);
      setTextGlow(t.glow || null);
      setTextShadow(t.shadow || null);
      setTextSkewX(t.skewX ?? 0);
      setTextSkewY(t.skewY ?? 0);
      setTextCurl(t.curl ?? 0);
      const font = CATEGORIZED_FONTS.find(
        (f) => f.family === t.fontFamily || f.name === t.fontFamily
      );
      if (font) setSelectedFont(font);
    }
  }, [selectedLayerId, selectedLayer]);


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

  // Determine if specific tools (Curves, Selective, Crop, Text, Layers, Eraser, Export) take over panel view
  const isSpecialTool =
    activeTool === "curves" ||
    activeTool === "selective" ||
    activeTool === "crop" ||
    activeTool === "text" ||
    activeTool === "layers" ||
    activeTool === "eraser" ||
    activeTool === "export";

  return (
    <aside
      className={`
        border-l border-[var(--border)] bg-[var(--bg-panel)] flex flex-col shrink-0 select-none relative z-20
        transition-[width,min-width,max-width,transform] duration-200 ease-out
        ${
          isMobileSheet
            ? "w-full max-h-[55vh] rounded-t-xl border-t border-l-0 shadow-2xl overflow-hidden fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]"
            : collapsed
            ? "w-0 min-w-0 max-w-0 border-l-0 overflow-hidden"
            : "w-[320px] md:w-[350px] lg:w-[370px] max-w-[370px]"
        }
      `}
    >
      {/* Mobile Bottom Sheet Drag Handle and Close Button */}
      {isMobileSheet && (
        <div className="flex items-center justify-between px-4 pt-2.5 pb-1 border-b border-[var(--border)] bg-[var(--bg-elevated)] shrink-0">
          <div className="w-8" />
          <div className="w-10 h-1 bg-[var(--border-subtle)] rounded-full" />
          <button
            onClick={onCloseMobileSheet}
            className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Desktop Collapse / Expand Chevron Tab Button */}
      {!isMobileSheet && onToggleCollapsed && (
        <button
          onClick={onToggleCollapsed}
          title={collapsed ? "Expand panel" : "Collapse panel"}
          className="absolute -left-3.5 top-1/2 -translate-y-1/2 z-50 w-3.5 h-12 bg-[var(--bg-elevated)] hover:bg-[var(--accent)] text-[var(--text-muted)] hover:text-white border border-[var(--border)] border-r-0 rounded-l flex items-center justify-center cursor-pointer transition-colors shadow-md"
        >
          <span className="text-[10px] font-bold">{collapsed ? "‹" : "›"}</span>
        </button>
      )}

      {/* Top Header Tabs: TUNE | PRESETS (and contextual tool title if in tool mode) */}
      {!isSpecialTool && (
        <div className="h-11 border-b border-[var(--border)] flex items-center px-2 shrink-0 bg-[var(--bg-panel)]">
          <button
            onClick={() => setActiveTab("TUNE")}
            className={`
              flex-1 h-full flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer relative
              ${
                activeTab === "TUNE"
                  ? "text-[var(--accent)] font-bold"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }
            `}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 18H7.5M13.5 12h6.75m-6.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 12h6.75" />
            </svg>
            <span>Tune</span>
            {activeTab === "TUNE" && (
              <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-[var(--accent)] rounded-full" />
            )}
          </button>

          <div className="w-[1px] h-4 bg-[var(--border)]" />

          <button
            onClick={() => setActiveTab("PRESETS")}
            className={`
              flex-1 h-full flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer relative
              ${
                activeTab === "PRESETS"
                  ? "text-[var(--accent)] font-bold"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }
            `}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <span>Presets</span>
            {presetLayers.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[10px] flex items-center justify-center font-bold">
                {presetLayers.length}
              </span>
            )}
            {activeTab === "PRESETS" && (
              <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-[var(--accent)] rounded-full" />
            )}
          </button>
        </div>
      )}

      {/* Main Panel Content Scroll Area */}
      <div
        className={`flex-1 overflow-y-auto p-3.5 md:p-4 space-y-4 ${
          collapsed && !isMobileSheet ? "hidden" : "block"
        }`}
        style={{ touchAction: "pan-y" }}
      >
        {/* ======================================================== */}
        {/* 1. TUNE TAB (LIGHT, TONE, COLOR, DETAIL) */}
        {/* ======================================================== */}
        {!isSpecialTool && activeTab === "TUNE" && (
          <div className="space-y-3.5">
            {/* Active preset layers notice */}
            {presetLayers.length > 0 && (
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[var(--accent-soft)] border border-[var(--accent)]/30 text-xs">
                <span className="text-[var(--accent)] font-medium">
                  + {presetLayers.length} preset {presetLayers.length === 1 ? "layer" : "layers"} active
                </span>
                <button
                  onClick={() => setActiveTab("PRESETS")}
                  className="text-[var(--accent)] underline hover:text-white cursor-pointer text-[11px]"
                >
                  View stack
                </button>
              </div>
            )}

            {/* LIGHT: Exposure, Brightness, Contrast */}
            <div className="rounded border border-[var(--border)] overflow-hidden bg-[var(--bg-panel)]">
              <div
                onClick={() => toggleSection("light")}
                className="flex items-center justify-between px-3 py-2 bg-[var(--bg-elevated)] cursor-pointer hover:bg-[var(--bg-app)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--text-muted)]">{openSections.light ? "▼" : "▶"}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">Light</span>
                </div>
                {onResetAdjustments && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeAdjustment("exposure", 0);
                      onChangeAdjustment("brightness", 0);
                      onChangeAdjustment("contrast", 0);
                    }}
                    className="text-[11px] text-[var(--accent)] hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              {openSections.light && (
                <div className="p-3 space-y-2 bg-[var(--bg-panel)]">
                  <CompactSlider
                    label="Exposure"
                    value={adjustments.exposure}
                    min={-100}
                    max={100}
                    onChange={(v) => onChangeAdjustment("exposure", v)}
                    formatDisplay={(v) => (v / 20).toFixed(2)}
                  />
                  <CompactSlider
                    label="Brightness"
                    value={adjustments.brightness}
                    min={-100}
                    max={100}
                    onChange={(v) => onChangeAdjustment("brightness", v)}
                  />
                  <CompactSlider
                    label="Contrast"
                    value={adjustments.contrast}
                    min={-100}
                    max={100}
                    onChange={(v) => onChangeAdjustment("contrast", v)}
                  />
                </div>
              )}
            </div>

            {/* TONE: Highlights, Shadows, Whites, Blacks */}
            <div className="rounded border border-[var(--border)] overflow-hidden bg-[var(--bg-panel)]">
              <div
                onClick={() => toggleSection("tone")}
                className="flex items-center justify-between px-3 py-2 bg-[var(--bg-elevated)] cursor-pointer hover:bg-[var(--bg-app)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--text-muted)]">{openSections.tone ? "▼" : "▶"}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">Tone</span>
                </div>
                {onResetAdjustments && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeAdjustment("highlights", 0);
                      onChangeAdjustment("shadows", 0);
                      onChangeAdjustment("whites", 0);
                      onChangeAdjustment("blacks", 0);
                    }}
                    className="text-[11px] text-[var(--accent)] hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              {openSections.tone && (
                <div className="p-3 space-y-2 bg-[var(--bg-panel)]">
                  <CompactSlider
                    label="Highlights"
                    value={adjustments.highlights}
                    min={-100}
                    max={100}
                    onChange={(v) => onChangeAdjustment("highlights", v)}
                  />
                  <CompactSlider
                    label="Shadows"
                    value={adjustments.shadows}
                    min={-100}
                    max={100}
                    onChange={(v) => onChangeAdjustment("shadows", v)}
                  />
                  <CompactSlider
                    label="Whites"
                    value={adjustments.whites}
                    min={-100}
                    max={100}
                    onChange={(v) => onChangeAdjustment("whites", v)}
                  />
                  <CompactSlider
                    label="Blacks"
                    value={adjustments.blacks}
                    min={-100}
                    max={100}
                    onChange={(v) => onChangeAdjustment("blacks", v)}
                  />
                </div>
              )}
            </div>

            {/* COLOR: Temperature, Tint, Saturation, Vibrance */}
            <div className="rounded border border-[var(--border)] overflow-hidden bg-[var(--bg-panel)]">
              <div
                onClick={() => toggleSection("color")}
                className="flex items-center justify-between px-3 py-2 bg-[var(--bg-elevated)] cursor-pointer hover:bg-[var(--bg-app)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--text-muted)]">{openSections.color ? "▼" : "▶"}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">Color</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleEyedropper();
                    }}
                    className={`
                      px-2 py-0.5 text-[10px] rounded border flex items-center gap-1 transition-all cursor-pointer
                      ${
                        isEyedropperActive
                          ? "bg-[var(--accent)] text-white border-[var(--accent)] font-semibold"
                          : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)]"
                      }
                    `}
                    title="Eyedropper: Sample neutral gray on photo"
                  >
                    <span>{isEyedropperActive ? "Sampling..." : "WB"}</span>
                  </button>
                  {onResetAdjustments && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onChangeAdjustment("temperature", 0);
                        onChangeAdjustment("tint", 0);
                        onChangeAdjustment("saturation", 0);
                        onChangeAdjustment("vibrance", 0);
                      }}
                      className="text-[11px] text-[var(--accent)] hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {openSections.color && (
                <div className="p-3 space-y-2 bg-[var(--bg-panel)]">
                  <CompactSlider
                    label="Temperature"
                    value={adjustments.temperature}
                    min={-100}
                    max={100}
                    specialTrack="temperature"
                    onChange={(v) => onChangeAdjustment("temperature", v)}
                  />
                  <CompactSlider
                    label="Tint"
                    value={adjustments.tint}
                    min={-100}
                    max={100}
                    specialTrack="tint"
                    onChange={(v) => onChangeAdjustment("tint", v)}
                  />
                  <CompactSlider
                    label="Saturation"
                    value={adjustments.saturation}
                    min={-100}
                    max={100}
                    onChange={(v) => onChangeAdjustment("saturation", v)}
                  />
                  <CompactSlider
                    label="Vibrance"
                    value={adjustments.vibrance}
                    min={-100}
                    max={100}
                    onChange={(v) => onChangeAdjustment("vibrance", v)}
                  />
                </div>
              )}
            </div>

            {/* DETAIL: Clarity, Sharpness, Blur, Film Grain, Vignette */}
            <div className="rounded border border-[var(--border)] overflow-hidden bg-[var(--bg-panel)]">
              <div
                onClick={() => toggleSection("detail")}
                className="flex items-center justify-between px-3 py-2 bg-[var(--bg-elevated)] cursor-pointer hover:bg-[var(--bg-app)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--text-muted)]">{openSections.detail ? "▼" : "▶"}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">Detail</span>
                </div>
                {onResetAdjustments && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeAdjustment("clarity", 0);
                      onChangeAdjustment("sharpness", 0);
                      onChangeAdjustment("blur", 0);
                      onChangeAdjustment("grain", 0);
                      onChangeAdjustment("vignette", 0);
                    }}
                    className="text-[11px] text-[var(--accent)] hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              {openSections.detail && (
                <div className="p-3 space-y-2 bg-[var(--bg-panel)]">
                  <CompactSlider
                    label="Clarity"
                    value={adjustments.clarity ?? adjustments.structure ?? 0}
                    min={-100}
                    max={100}
                    onChange={(v) => onChangeAdjustment("clarity", v)}
                  />
                  <CompactSlider
                    label="Sharpness"
                    value={adjustments.sharpness ?? 0}
                    min={0}
                    max={100}
                    specialTrack="unipolar"
                    onChange={(v) => onChangeAdjustment("sharpness", v)}
                    formatDisplay={(v) => `${v}`}
                  />
                  <CompactSlider
                    label="Blur"
                    value={adjustments.blur ?? 0}
                    min={0}
                    max={100}
                    specialTrack="unipolar"
                    onChange={(v) => onChangeAdjustment("blur", v)}
                    formatDisplay={(v) => `${v}`}
                  />
                  <CompactSlider
                    label="Film Grain"
                    value={adjustments.grain}
                    min={0}
                    max={100}
                    specialTrack="unipolar"
                    onChange={(v) => onChangeAdjustment("grain", v)}
                    formatDisplay={(v) => `${v}%`}
                  />
                  <CompactSlider
                    label="Vignette"
                    value={adjustments.vignette}
                    min={-100}
                    max={100}
                    onChange={(v) => onChangeAdjustment("vignette", v)}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. PRESETS TAB (STACKABLE PRESET LAYERS) */}
        {/* ======================================================== */}
        {!isSpecialTool && activeTab === "PRESETS" && (
          <div className="space-y-4">
            {/* Top Section: Active Preset Layers Stack */}
            {presetLayers.length > 0 && (
              <div className="space-y-2 pb-3 border-b border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                      Active Layers
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">
                      ({presetLayers.length}/6)
                    </span>
                  </div>
                  <button
                    onClick={onClearPresetLayers}
                    className="text-[11px] text-[var(--accent)] hover:underline cursor-pointer font-medium"
                  >
                    Clear layers
                  </button>
                </div>

                {/* Layer rows, newest on top */}
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-0.5">
                  {presetLayers.map((layer) => {
                    const isSelected = selectedPresetLayerId === layer.id;
                    return (
                      <div
                        key={layer.id}
                        onClick={() => setSelectedPresetLayerId(isSelected ? null : layer.id)}
                        className={`
                          p-2 rounded bg-[var(--bg-elevated)] border transition-all cursor-pointer flex flex-col gap-1.5
                          ${
                            isSelected
                              ? "border-[var(--accent)] border-l-[3px] border-l-[var(--accent)] bg-[var(--accent-soft)]/20"
                              : "border-[var(--border)] hover:border-[var(--border-subtle)]"
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 truncate">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onTogglePresetLayerVisibility(layer.id);
                              }}
                              className="text-[var(--text-muted)] hover:text-[var(--text)] p-0.5 cursor-pointer"
                              title={layer.visible ? "Hide layer" : "Show layer"}
                            >
                              {layer.visible ? "👁" : "🚫"}
                            </button>
                            <span className={`text-xs font-medium truncate ${layer.visible ? "text-[var(--text)]" : "text-[var(--text-muted)] line-through"}`}>
                              {layer.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-[var(--text-muted)]">
                              {layer.amount}%
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeletePresetLayer(layer.id);
                              }}
                              className="w-5 h-5 flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 p-0.5 cursor-pointer text-xs"
                              title="Delete layer"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Expandable Amount Slider when Selected */}
                        {isSelected && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="pt-1.5 border-t border-[var(--border)] flex items-center gap-2"
                          >
                            <span className="text-[11px] text-[var(--text-muted)] w-12 shrink-0">
                              Amount:
                            </span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={layer.amount}
                              onChange={(e) =>
                                onUpdatePresetLayerAmount(layer.id, Number(e.target.value), false)
                              }
                              onPointerUp={() =>
                                onUpdatePresetLayerAmount(layer.id, layer.amount, true)
                              }
                              onKeyUp={() =>
                                onUpdatePresetLayerAmount(layer.id, layer.amount, true)
                              }
                              className="flex-1"
                            />
                            <span className="font-mono text-xs w-8 text-right text-[var(--text)]">
                              {layer.amount}%
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Commit Preset / Cancel Preset Action Buttons */}
                {onCommitPresets && (
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={onCommitPresets}
                      className="flex-1 py-2 bg-[var(--accent)] hover:bg-[#256ee0] text-white font-bold text-xs rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      title="Flatten active presets into base image and reset sliders"
                    >
                      <span>✓</span> Done (Flatten Preset)
                    </button>
                    <button
                      onClick={onClearPresetLayers}
                      className="px-3 py-2 bg-[var(--bg-elevated)] hover:bg-[var(--bg-app)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] text-xs rounded transition-colors cursor-pointer"
                      title="Revert and cancel preset"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Categorized Preset Grid */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                  Add Preset Look
                </span>
                {presetLayers.length >= 6 && (
                  <span className="text-[10px] text-amber-400 font-medium">
                    Max 6 layers reached
                  </span>
                )}
              </div>

              {STACKABLE_PRESET_CATEGORIES.map((cat) => {
                const catPresets = STACKABLE_PRESETS.filter((p) => p.category === cat);
                return (
                  <div key={cat} className="space-y-1.5">
                    <span className="text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                      {cat}
                    </span>

                    <div className="grid grid-cols-2 gap-1.5">
                      {catPresets.map((preset) => {
                        const isCapped = presetLayers.length >= 6;
                        return (
                          <button
                            key={preset.id}
                            disabled={!hasImage || isCapped}
                            onClick={() => {
                              onAddPresetLayer(preset.id, preset.name);
                            }}
                            className={`
                              p-2 rounded bg-[var(--bg-elevated)] border border-[var(--border)] text-left transition-all flex items-center gap-2 cursor-pointer
                              ${
                                !hasImage || isCapped
                                  ? "opacity-40 cursor-not-allowed"
                                  : "hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]/10 active:scale-98"
                              }
                            `}
                          >
                            <div
                              className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${preset.swatchGradient} shrink-0 shadow-xs`}
                            />
                            <span className="text-xs font-medium text-[var(--text)] truncate">
                              {preset.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. SELECTIVE CONTROL POINTS TOOL */}
        {/* ======================================================== */}
        {activeTool === "selective" && (
          <SelectiveTool
            points={selectivePoints}
            selectedPointId={selectedSelectivePointId}
            onSelectPoint={onSelectSelectivePoint}
            onAddPoint={onAddSelectivePoint}
            onUpdatePoint={onUpdateSelectivePoint}
            onDeletePoint={onDeleteSelectivePoint}
            onDuplicatePoint={onDuplicateSelectivePoint}
            showMarkers={showSelectiveMarkers}
            onToggleShowMarkers={onToggleSelectiveMarkers}
          />
        )}

        {/* ======================================================== */}
        {/* 4. TONE CURVES TOOL */}
        {/* ======================================================== */}
        {activeTool === "curves" && (
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-[var(--border)] pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                Tone Curves
              </span>
              <button
                onClick={() => onChangeCurves(DEFAULT_CURVES)}
                className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer transition-colors"
              >
                Reset
              </button>
            </div>
            <CurvesTool curves={curves} onChangeCurves={onChangeCurves} />
          </div>
        )}

        {/* ======================================================== */}
        {/* 5. CROP, ROTATE & STRAIGHTEN */}
        {/* ======================================================== */}
        {activeTool === "crop" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                Crop & Straighten
              </span>
              {onResetCrop && (
                <button
                  onClick={onResetCrop}
                  className="text-[11px] text-[var(--accent)] hover:underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Apply Crop Button */}
            {onApplyCrop && (
              <button
                onClick={onApplyCrop}
                className="w-full py-2 bg-[var(--accent)] hover:bg-[#256ee0] text-white font-semibold text-xs rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>✓</span> Apply Crop Selection
              </button>
            )}

            {/* Aspect Ratio Presets */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
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
                            ? "bg-[var(--accent-soft)] border-[var(--accent)]/50 text-[var(--accent)] font-semibold"
                            : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
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
            <div className="space-y-1.5 pt-2 border-t border-[var(--border)]">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-muted)]">Straighten Angle</span>
                <span className="font-mono text-xs text-[var(--text)]">
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
              <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                <span>-45°</span>
                <button
                  onClick={() => handleStraightenChange(0)}
                  className="text-[var(--accent)] hover:underline cursor-pointer"
                >
                  Reset 0°
                </button>
                <span>+45°</span>
              </div>
            </div>

            {/* Transform Rotate & Flip */}
            <div className="space-y-2 pt-2 border-t border-[var(--border)]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                Orientation
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={handleRotateCCW}
                  className="p-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded text-xs text-[var(--text)] flex items-center justify-center gap-1 cursor-pointer hover:border-[var(--border-subtle)] transition-colors"
                >
                  ↺ 90° CCW
                </button>
                <button
                  onClick={handleRotateCW}
                  className="p-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded text-xs text-[var(--text)] flex items-center justify-center gap-1 cursor-pointer hover:border-[var(--border-subtle)] transition-colors"
                >
                  ↻ 90° CW
                </button>
                <button
                  onClick={handleFlipH}
                  className={`p-2 border rounded text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                    transformState.flipH
                      ? "bg-[var(--accent-soft)] border-[var(--accent)]/50 text-[var(--accent)] font-semibold"
                      : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text)] hover:border-[var(--border-subtle)]"
                  }`}
                >
                  ⇄ Flip H
                </button>
                <button
                  onClick={handleFlipV}
                  className={`p-2 border rounded text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                    transformState.flipV
                      ? "bg-[var(--accent-soft)] border-[var(--accent)]/50 text-[var(--accent)] font-semibold"
                      : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text)] hover:border-[var(--border-subtle)]"
                  }`}
                >
                  ⇅ Flip V
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 6. TEXT OVERLAY TOOL */}
        {/* ======================================================== */}
        {activeTool === "text" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                {isTextLayerSelected ? "Edit Text Layer" : "Add Text Layer"}
              </span>
              <button
                onClick={resetTextEffects}
                className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
                title="Reset all effects and transforms"
              >
                Reset Effects
              </button>
            </div>

            {/* Text Input Content */}
            <div className="space-y-1">
              <span className="text-xs text-[var(--text-muted)] font-medium">Text Content</span>
              <input
                type="text"
                value={textInput}
                onChange={(e) => {
                  setTextInput(e.target.value);
                  pushTextUpdate({ text: e.target.value });
                }}
                className="w-full px-2.5 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] font-medium"
                placeholder="Enter text..."
              />
            </div>

            {/* Font Family & Size */}
            <div className="space-y-2">
              <div className="space-y-1">
                <span className="text-xs text-[var(--text-muted)] font-medium">Font Family</span>
                <select
                  value={selectedFont.name}
                  onChange={(e) => {
                    const font = CATEGORIZED_FONTS.find((f) => f.name === e.target.value);
                    if (font) {
                      setSelectedFont(font);
                      pushTextUpdate({ fontFamily: font.family });
                    }
                  }}
                  className="w-full px-2.5 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
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
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Size</span>
                    <span className="font-mono text-xs text-[var(--text)]">{fontSizeInput}px</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="180"
                    value={fontSizeInput}
                    onChange={(e) => {
                      const sz = Number(e.target.value);
                      setFontSizeInput(sz);
                      pushTextUpdate({ fontSize: sz });
                    }}
                    className="w-full"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Opacity</span>
                    <span className="font-mono text-xs text-[var(--text)]">{textOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={textOpacity}
                    onChange={(e) => {
                      const op = Number(e.target.value);
                      setTextOpacity(op);
                      pushTextUpdate({ opacity: op });
                    }}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Weight & Alignment */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Weight</span>
                  <div className="grid grid-cols-3 gap-1">
                    {(["normal", "bold", "bolder"] as const).map((w) => (
                      <button
                        key={w}
                        onClick={() => {
                          setTextFontWeight(w);
                          pushTextUpdate({ fontWeight: w });
                        }}
                        className={`py-1 text-[10px] rounded border capitalize cursor-pointer transition-colors ${
                          textFontWeight === w
                            ? "bg-[var(--accent)] text-white font-bold border-[var(--accent)]"
                            : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-muted)]"
                        }`}
                      >
                        {w === "bolder" ? "Black" : w}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Align</span>
                  <div className="grid grid-cols-3 gap-1">
                    {(["left", "center", "right"] as const).map((al) => (
                      <button
                        key={al}
                        onClick={() => {
                          setTextAlignState(al);
                          pushTextUpdate({ textAlign: al });
                        }}
                        className={`py-1 text-[10px] rounded border capitalize cursor-pointer transition-colors ${
                          textAlign === al
                            ? "bg-[var(--accent)] text-white font-bold border-[var(--accent)]"
                            : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-muted)]"
                        }`}
                      >
                        {al === "left" ? "⇤" : al === "center" ? "≡" : "⇥"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rotation */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Rotation</span>
                  <span className="font-mono text-xs text-[var(--text)]">{textRotation}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={textRotation}
                  onChange={(e) => {
                    const rot = Number(e.target.value);
                    setTextRotation(rot);
                    pushTextUpdate({ rotation: rot });
                  }}
                  className="w-full"
                />
              </div>
            </div>

            {/* Text Fill Color */}
            <div className="p-3 bg-[var(--bg-elevated)] border border-[var(--border)] rounded">
              <ColorSwatchPicker
                label="Fill Color"
                value={textColorInput}
                onChange={(hex) => {
                  setTextColorInput(hex);
                  pushTextUpdate({ color: hex });
                }}
              />
            </div>

            {/* STROKE & OUTLINE SUBSECTION */}
            <div className="rounded border border-[var(--border)] overflow-hidden bg-[var(--bg-panel)]">
              <div
                onClick={() => setOpenTextSections((p) => ({ ...p, stroke: !p.stroke }))}
                className="flex items-center justify-between px-3 py-2 bg-[var(--bg-elevated)] cursor-pointer hover:bg-[var(--bg-app)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {openTextSections.stroke ? "▼" : "▶"}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                    Stroke & Outline
                  </span>
                </div>
                {(textStroke || textOutline) && (
                  <span className="text-[10px] text-[var(--accent)] font-medium">Active</span>
                )}
              </div>

              {openTextSections.stroke && (
                <div className="p-3 space-y-4 bg-[var(--bg-panel)]">
                  {/* Text Stroke / Border */}
                  <div className="space-y-2">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-semibold text-[var(--text)]">Border / Stroke</span>
                      <input
                        type="checkbox"
                        checked={!!textStroke}
                        onChange={(e) => {
                          const val = e.target.checked ? { color: "#000000", width: 2 } : null;
                          setTextStroke(val);
                          pushTextUpdate({ stroke: val });
                        }}
                        className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
                      />
                    </label>

                    {textStroke && (
                      <div className="space-y-2.5 pl-2 border-l-2 border-[var(--accent)]/40">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-[var(--text-muted)]">Width</span>
                            <span className="font-mono text-xs text-[var(--text)]">{textStroke.width}px</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="20"
                            value={textStroke.width}
                            onChange={(e) => {
                              const next = { ...textStroke, width: Number(e.target.value) };
                              setTextStroke(next);
                              pushTextUpdate({ stroke: next });
                            }}
                            className="w-full"
                          />
                        </div>
                        <ColorSwatchPicker
                          label="Stroke Color"
                          value={textStroke.color}
                          onChange={(hex) => {
                            const next = { ...textStroke, color: hex };
                            setTextStroke(next);
                            pushTextUpdate({ stroke: next });
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Text Outline */}
                  <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-semibold text-[var(--text)]">Outer Outline</span>
                      <input
                        type="checkbox"
                        checked={!!textOutline}
                        onChange={(e) => {
                          const val = e.target.checked ? { color: "#ffffff", width: 4 } : null;
                          setTextOutline(val);
                          pushTextUpdate({ outline: val });
                        }}
                        className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
                      />
                    </label>

                    {textOutline && (
                      <div className="space-y-2.5 pl-2 border-l-2 border-[var(--accent)]/40">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-[var(--text-muted)]">Outline Width</span>
                            <span className="font-mono text-xs text-[var(--text)]">{textOutline.width}px</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="24"
                            value={textOutline.width}
                            onChange={(e) => {
                              const next = { ...textOutline, width: Number(e.target.value) };
                              setTextOutline(next);
                              pushTextUpdate({ outline: next });
                            }}
                            className="w-full"
                          />
                        </div>
                        <ColorSwatchPicker
                          label="Outline Color"
                          value={textOutline.color}
                          onChange={(hex) => {
                            const next = { ...textOutline, color: hex };
                            setTextOutline(next);
                            pushTextUpdate({ outline: next });
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* GLOW & SHADOW SUBSECTION */}
            <div className="rounded border border-[var(--border)] overflow-hidden bg-[var(--bg-panel)]">
              <div
                onClick={() => setOpenTextSections((p) => ({ ...p, effects: !p.effects }))}
                className="flex items-center justify-between px-3 py-2 bg-[var(--bg-elevated)] cursor-pointer hover:bg-[var(--bg-app)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {openTextSections.effects ? "▼" : "▶"}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                    Glow & Shadow
                  </span>
                </div>
                {(textGlow || textShadow) && (
                  <span className="text-[10px] text-[var(--accent)] font-medium">Active</span>
                )}
              </div>

              {openTextSections.effects && (
                <div className="p-3 space-y-4 bg-[var(--bg-panel)]">
                  {/* Text Glow */}
                  <div className="space-y-2">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-semibold text-[var(--text)]">Neon Glow</span>
                      <input
                        type="checkbox"
                        checked={!!textGlow}
                        onChange={(e) => {
                          const val = e.target.checked ? { color: "#38bdf8", blur: 12, intensity: 80 } : null;
                          setTextGlow(val);
                          pushTextUpdate({ glow: val });
                        }}
                        className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
                      />
                    </label>

                    {textGlow && (
                      <div className="space-y-2.5 pl-2 border-l-2 border-[var(--accent)]/40">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-[var(--text-muted)]">Blur</span>
                              <span className="font-mono text-xs text-[var(--text)]">{textGlow.blur}px</span>
                            </div>
                            <input
                              type="range"
                              min="2"
                              max="40"
                              value={textGlow.blur}
                              onChange={(e) => {
                                const next = { ...textGlow, blur: Number(e.target.value) };
                                setTextGlow(next);
                                pushTextUpdate({ glow: next });
                              }}
                              className="w-full"
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-[var(--text-muted)]">Intensity</span>
                              <span className="font-mono text-xs text-[var(--text)]">{textGlow.intensity}%</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="100"
                              value={textGlow.intensity}
                              onChange={(e) => {
                                const next = { ...textGlow, intensity: Number(e.target.value) };
                                setTextGlow(next);
                                pushTextUpdate({ glow: next });
                              }}
                              className="w-full"
                            />
                          </div>
                        </div>
                        <ColorSwatchPicker
                          label="Glow Color"
                          value={textGlow.color}
                          onChange={(hex) => {
                            const next = { ...textGlow, color: hex };
                            setTextGlow(next);
                            pushTextUpdate({ glow: next });
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Drop Shadow */}
                  <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-semibold text-[var(--text)]">Drop Shadow</span>
                      <input
                        type="checkbox"
                        checked={!!textShadow}
                        onChange={(e) => {
                          const val = e.target.checked
                            ? { color: "#000000", offsetX: 4, offsetY: 4, blur: 8, opacity: 75 }
                            : null;
                          setTextShadow(val);
                          pushTextUpdate({ shadow: val });
                        }}
                        className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
                      />
                    </label>

                    {textShadow && (
                      <div className="space-y-2.5 pl-2 border-l-2 border-[var(--accent)]/40">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-[var(--text-muted)]">Offset X</span>
                              <span className="font-mono text-xs text-[var(--text)]">{textShadow.offsetX}px</span>
                            </div>
                            <input
                              type="range"
                              min="-30"
                              max="30"
                              value={textShadow.offsetX}
                              onChange={(e) => {
                                const next = { ...textShadow, offsetX: Number(e.target.value) };
                                setTextShadow(next);
                                pushTextUpdate({ shadow: next });
                              }}
                              className="w-full"
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-[var(--text-muted)]">Offset Y</span>
                              <span className="font-mono text-xs text-[var(--text)]">{textShadow.offsetY}px</span>
                            </div>
                            <input
                              type="range"
                              min="-30"
                              max="30"
                              value={textShadow.offsetY}
                              onChange={(e) => {
                                const next = { ...textShadow, offsetY: Number(e.target.value) };
                                setTextShadow(next);
                                pushTextUpdate({ shadow: next });
                              }}
                              className="w-full"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-[var(--text-muted)]">Blur</span>
                              <span className="font-mono text-xs text-[var(--text)]">{textShadow.blur}px</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="40"
                              value={textShadow.blur}
                              onChange={(e) => {
                                const next = { ...textShadow, blur: Number(e.target.value) };
                                setTextShadow(next);
                                pushTextUpdate({ shadow: next });
                              }}
                              className="w-full"
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-[var(--text-muted)]">Shadow Opacity</span>
                              <span className="font-mono text-xs text-[var(--text)]">{textShadow.opacity}%</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="100"
                              value={textShadow.opacity}
                              onChange={(e) => {
                                const next = { ...textShadow, opacity: Number(e.target.value) };
                                setTextShadow(next);
                                pushTextUpdate({ shadow: next });
                              }}
                              className="w-full"
                            />
                          </div>
                        </div>

                        <ColorSwatchPicker
                          label="Shadow Color"
                          value={textShadow.color}
                          onChange={(hex) => {
                            const next = { ...textShadow, color: hex };
                            setTextShadow(next);
                            pushTextUpdate({ shadow: next });
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* TRANSFORM & WARP SUBSECTION */}
            <div className="rounded border border-[var(--border)] overflow-hidden bg-[var(--bg-panel)]">
              <div
                onClick={() => setOpenTextSections((p) => ({ ...p, transform: !p.transform }))}
                className="flex items-center justify-between px-3 py-2 bg-[var(--bg-elevated)] cursor-pointer hover:bg-[var(--bg-app)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {openTextSections.transform ? "▼" : "▶"}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                    Skew & Arc Warp
                  </span>
                </div>
                {(textSkewX !== 0 || textSkewY !== 0 || textCurl !== 0) && (
                  <span className="text-[10px] text-[var(--accent)] font-medium">Active</span>
                )}
              </div>

              {openTextSections.transform && (
                <div className="p-3 space-y-3 bg-[var(--bg-panel)]">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--text-muted)]">Skew X</span>
                      <span className="font-mono text-xs text-[var(--text)]">{textSkewX}°</span>
                    </div>
                    <input
                      type="range"
                      min="-45"
                      max="45"
                      value={textSkewX}
                      onChange={(e) => {
                        const sk = Number(e.target.value);
                        setTextSkewX(sk);
                        pushTextUpdate({ skewX: sk });
                      }}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--text-muted)]">Skew Y</span>
                      <span className="font-mono text-xs text-[var(--text)]">{textSkewY}°</span>
                    </div>
                    <input
                      type="range"
                      min="-45"
                      max="45"
                      value={textSkewY}
                      onChange={(e) => {
                        const sk = Number(e.target.value);
                        setTextSkewY(sk);
                        pushTextUpdate({ skewY: sk });
                      }}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--text-muted)]">Arc Bend / Curve</span>
                      <span className="font-mono text-xs text-[var(--text)]">{textCurl}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={textCurl}
                      onChange={(e) => {
                        const crl = Number(e.target.value);
                        setTextCurl(crl);
                        pushTextUpdate({ curl: crl });
                      }}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions: Add Text / Bake Text / Delete Text */}
            <div className="pt-2 space-y-2">
              {!isTextLayerSelected ? (
                <button
                  onClick={() => {
                    onAddTextLayer(
                      textInput,
                      fontSizeInput,
                      textColorInput,
                      selectedFont.family,
                      selectedFont.category as any,
                      collectExtraStyles()
                    );
                  }}
                  className="w-full py-2.5 bg-[var(--accent)] text-white font-bold rounded text-xs hover:bg-[#256ee0] transition-colors cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>+</span> Add Text to Canvas
                </button>
              ) : (
                <div className="space-y-2">
                  {onBakeTextLayer && selectedLayerId && (
                    <button
                      onClick={() => onBakeTextLayer(selectedLayerId)}
                      className="w-full py-2.5 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded text-xs transition-colors cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                      title="Flatten this text layer directly into the base image pixels (presets and tuning will affect it)"
                    >
                      <span>✓</span> Bake into Base Image
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (selectedLayerId) onDeleteLayer(selectedLayerId);
                    }}
                    className="w-full py-1.5 bg-red-500/15 border border-red-500/40 text-red-400 hover:bg-red-500/25 rounded text-xs transition-colors cursor-pointer"
                  >
                    Delete Text Layer
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 7. LAYERS & DOUBLE EXPOSURE */}
        {/* ======================================================== */}
        {activeTool === "layers" && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                Layers ({layers.length})
              </span>
              <button
                onClick={() => doubleExposureFileInputRef.current?.click()}
                className="px-2 py-0.5 text-[11px] rounded bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--accent)] hover:border-[var(--accent)] cursor-pointer flex items-center gap-1 transition-colors"
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
              <div className="p-3 bg-[var(--bg-elevated)] border border-[var(--accent)]/30 rounded space-y-2">
                <span className="text-xs font-bold text-[var(--accent)]">Double Exposure Blend</span>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[var(--text-muted)]">
                    <span>Opacity</span>
                    <span className="font-mono text-xs text-[var(--text)]">
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
              </div>
            )}

            {/* Layer items list with Repositioning and Locking */}
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-0.5">
              {layers.map((layer, idx) => {
                const isSelected = layer.id === selectedLayerId;
                return (
                  <div
                    key={layer.id}
                    onClick={() => onSelectLayer(layer.id)}
                    className={`
                      flex items-center justify-between p-2 rounded border text-xs cursor-pointer transition-all
                      ${
                        isSelected
                          ? "bg-[var(--accent-soft)] border-[var(--accent)]/50 text-[var(--text)] shadow-sm"
                          : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--border-subtle)]"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {/* Reorder Up/Down buttons */}
                      <div className="flex flex-col gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          disabled={idx === 0}
                          onClick={() => {
                            if (idx > 0) {
                              const next = [...layers];
                              const temp = next[idx - 1];
                              next[idx - 1] = next[idx];
                              next[idx] = temp;
                              onReorderLayers(next);
                            }
                          }}
                          className="w-4 h-3 flex items-center justify-center text-[9px] bg-[var(--bg-panel)] hover:bg-[var(--accent)] hover:text-white rounded-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Bring Forward"
                        >
                          ▲
                        </button>
                        <button
                          disabled={idx === layers.length - 1}
                          onClick={() => {
                            if (idx < layers.length - 1) {
                              const next = [...layers];
                              const temp = next[idx + 1];
                              next[idx + 1] = next[idx];
                              next[idx] = temp;
                              onReorderLayers(next);
                            }
                          }}
                          className="w-4 h-3 flex items-center justify-center text-[9px] bg-[var(--bg-panel)] hover:bg-[var(--accent)] hover:text-white rounded-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Send Backward"
                        >
                          ▼
                        </button>
                      </div>

                      <span className="font-medium truncate max-w-[110px]">{layer.name}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-[var(--bg-panel)] text-[var(--text-muted)] uppercase border border-[var(--border)] shrink-0">
                        {layer.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Lock Toggle */}
                      {onToggleLayerLock && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleLayerLock(layer.id);
                          }}
                          className={`p-1 rounded cursor-pointer transition-colors ${
                            layer.locked
                              ? "text-amber-400 bg-amber-400/10"
                              : "text-[var(--text-muted)] hover:text-[var(--text)]"
                          }`}
                          title={layer.locked ? "Unlock layer" : "Lock layer position"}
                        >
                          {layer.locked ? "🔒" : "🔓"}
                        </button>
                      )}

                      {/* Visibility Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLayerVisibility(layer.id);
                        }}
                        className="text-[var(--text-muted)] hover:text-[var(--text)] p-1 cursor-pointer transition-colors"
                        title="Toggle visibility"
                      >
                        {layer.visible ? "👁" : "🚫"}
                      </button>

                      {/* Duplicate Layer */}
                      {onDuplicateLayer && layer.type !== "image" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateLayer(layer.id);
                          }}
                          className="text-[var(--text-muted)] hover:text-white p-1 cursor-pointer transition-colors"
                          title="Duplicate layer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      )}

                      {/* Delete Layer */}
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

            {/* Selected Text Layer Bake Shortcut */}
            {selectedLayer && selectedLayer.type === "text" && onBakeTextLayer && (
              <button
                onClick={() => onBakeTextLayer(selectedLayer.id)}
                className="w-full py-2 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded text-xs transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                title="Bake this text directly into base image"
              >
                <span>✓</span> Bake Selected Text into Image
              </button>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 8. BACKGROUND ERASER */}
        {/* ======================================================== */}
        {activeTool === "eraser" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                Background Eraser
              </span>
              <button
                onClick={onResetBackgroundEraser}
                className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer transition-colors"
              >
                Reset
              </button>
            </div>

            <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
              Picks out a flat, uniform background by colour. Pixels close to the
              key colour become transparent; everything else keeps its original
              colours.
            </p>

            {/* Background Key Colour */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                Background Colour
              </span>

              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={backgroundEraser.color}
                  onChange={(e) => onChangeEraserColor(e.target.value)}
                  className="w-10 h-8 p-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded cursor-pointer shrink-0"
                  title="Pick the background colour"
                />
                <div className="flex-1 h-8 px-2.5 flex items-center bg-[var(--bg-elevated)] border border-[var(--border)] rounded font-mono text-xs text-[var(--text)] uppercase select-text min-w-0">
                  <span className="truncate">{backgroundEraser.color}</span>
                </div>
                <button
                  onClick={onToggleEraserPicker}
                  className={`
                    h-8 px-2.5 rounded text-[11px] font-semibold border flex items-center gap-1 transition-all cursor-pointer shrink-0
                    ${
                      isEraserPickerActive
                        ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                        : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)]"
                    }
                  `}
                  title="Click the photo to sample a background colour"
                >
                  {isEraserPickerActive ? "Pick…" : "Sample"}
                </button>
              </div>

              {isEraserPickerActive && (
                <p className="text-[10px] text-[var(--accent)]">
                  Click the photo to sample its colour.
                </p>
              )}
            </div>

            {/* Tolerance */}
            <div className="space-y-1.5 pt-1">
              <CompactSlider
                label="Tolerance"
                value={backgroundEraser.tolerance}
                min={0}
                max={100}
                specialTrack="unipolar"
                onChange={onChangeEraserTolerance}
                onCommit={onCommitEraser}
                formatDisplay={(v) => `${v}%`}
              />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                <span>Exact match</span>
                <span>Wide range</span>
              </div>
              <p className="text-[10px] leading-relaxed text-[var(--text-muted)]">
                Raise the tolerance if the background has noise, a gradient or
                JPEG compression artefacts. Lower it if the subject is being
                removed by mistake.
              </p>
            </div>

            {/* Apply / Revert */}
            <button
              onClick={() => onToggleBackgroundRemoval(!backgroundEraser.enabled)}
              disabled={!hasImage}
              className={`
                w-full py-2.5 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm
                ${
                  !hasImage
                    ? "bg-[var(--bg-elevated)] text-[var(--text-muted)] cursor-not-allowed"
                    : backgroundEraser.enabled
                    ? "bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)]"
                    : "bg-[var(--accent)] hover:bg-[#256ee0] text-white"
                }
              `}
            >
              <span>{backgroundEraser.enabled ? "↺" : "✂"}</span>
              {backgroundEraser.enabled ? "Restore Background" : "Remove Background"}
            </button>

            {backgroundEraser.enabled && (
              <div className="flex items-start gap-2 px-2.5 py-2 rounded bg-[var(--accent-soft)] border border-[var(--accent)]/30 text-[11px] text-[var(--accent)]">
                <span className="leading-snug">
                  Background removed. Transparency is only kept when you export
                  as PNG.
                </span>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 9. EXPORT PANEL */}
        {/* ======================================================== */}
        {activeTool === "export" && (
          <div className="space-y-4">
            <div className="border-b border-[var(--border)] pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                Export Image
              </span>
            </div>

            {backgroundEraser.enabled && exportSettings.format !== "image/png" && (
              <div className="flex items-start gap-2 px-2.5 py-2 rounded bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-400">
                <span className="leading-snug">
                  Transparency is not supported by{" "}
                  {exportSettings.format.split("/")[1].toUpperCase()}. Switch to
                  PNG to keep the removed background transparent.
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <span className="text-xs text-[var(--text-muted)]">File Format</span>
              <div className="grid grid-cols-3 gap-1.5">
                {(["image/jpeg", "image/png", "image/webp"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => onChangeExportSettings({ ...exportSettings, format: fmt })}
                    className={`
                      py-2 text-xs rounded border uppercase font-semibold cursor-pointer transition-colors
                      ${
                        exportSettings.format === fmt
                          ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                          : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
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
                  <span className="text-[var(--text-muted)]">Quality</span>
                  <span className="font-mono text-xs text-[var(--text)]">
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
              className="w-full py-2.5 bg-[var(--accent)] hover:bg-[#256ee0] text-white font-semibold rounded text-xs transition-colors cursor-pointer mt-3 shadow-md flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>Download Master Photo</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
});

export default RightPanel;
