"use client";

import { memo } from "react";
import { PresetFilter, Adjustments, CurvesData } from "@/types/editor";
import { DEFAULT_CURVES } from "@/components/CurvesTool";

export interface PremiumLookPreset extends PresetFilter {
  tag: string;
  category: "classic" | "film" | "portrait" | "moody";
  curvePreset?: CurvesData;
  vignette?: number;
  temperature?: number;
  tint?: number;
  structure?: number;
  grain?: number;
}

export const PRESET_LOOKS: PremiumLookPreset[] = [
  {
    id: "original",
    name: "Original",
    tag: "NATURAL",
    category: "classic",
    previewBg: "from-[#27272a] via-[#18181b] to-[#09090b]",
    adjustments: { brightness: 0, contrast: 0, saturation: 0, exposure: 0, temperature: 0, tint: 0, structure: 0, vignette: 0, grain: 0 },
    curvePreset: DEFAULT_CURVES,
  },
  {
    id: "warm_portrait",
    name: "Warm Sun",
    tag: "PORTRAIT",
    category: "portrait",
    previewBg: "from-[#c2410c] via-[#7c2d12] to-[#1c1917]",
    adjustments: { brightness: 5, contrast: 10, saturation: 15, exposure: 5, temperature: 25, tint: 5, structure: 10, vignette: -15, grain: 0 },
    curvePreset: {
      ...DEFAULT_CURVES,
      rgb: [{ x: 0, y: 0 }, { x: 70, y: 65 }, { x: 190, y: 205 }, { x: 255, y: 255 }],
    },
  },
  {
    id: "moody_cool",
    name: "Nordic Blue",
    tag: "MOODY",
    category: "moody",
    previewBg: "from-[#0369a1] via-[#0f172a] to-[#0284c7]",
    adjustments: { brightness: -5, contrast: 20, saturation: -15, exposure: -5, temperature: -30, tint: -10, structure: 25, vignette: 30, grain: 15 },
    curvePreset: {
      ...DEFAULT_CURVES,
      blue: [{ x: 0, y: 15 }, { x: 128, y: 135 }, { x: 255, y: 255 }],
      red: [{ x: 0, y: 0 }, { x: 128, y: 120 }, { x: 255, y: 245 }],
    },
  },
  {
    id: "matte_film",
    name: "Matte Film",
    tag: "ANALOG",
    category: "film",
    previewBg: "from-[#78350f] via-[#451a03] to-[#1c1917]",
    adjustments: { brightness: 0, contrast: -10, saturation: -10, exposure: 5, temperature: 15, tint: 5, structure: -5, vignette: 20, grain: 35 },
    curvePreset: {
      ...DEFAULT_CURVES,
      rgb: [{ x: 0, y: 35 }, { x: 128, y: 128 }, { x: 255, y: 235 }],
    },
  },
  {
    id: "punchy_bw",
    name: "Punchy B&W",
    tag: "MONO",
    category: "classic",
    previewBg: "from-[#52525b] via-[#27272a] to-[#000000]",
    adjustments: { brightness: 5, contrast: 35, saturation: -100, exposure: 5, temperature: 0, tint: 0, structure: 40, vignette: 25, grain: 20 },
    curvePreset: {
      ...DEFAULT_CURVES,
      rgb: [{ x: 0, y: 0 }, { x: 60, y: 40 }, { x: 195, y: 215 }, { x: 255, y: 255 }],
    },
  },
  {
    id: "golden_hour",
    name: "Golden Hour",
    tag: "GOLDEN",
    category: "portrait",
    previewBg: "from-[#d97706] via-[#b45309] to-[#451a03]",
    adjustments: { brightness: 10, contrast: 15, saturation: 20, exposure: 10, temperature: 40, tint: 10, structure: 15, vignette: -20, grain: 10 },
    curvePreset: {
      ...DEFAULT_CURVES,
      red: [{ x: 0, y: 0 }, { x: 120, y: 135 }, { x: 255, y: 255 }],
    },
  },
  {
    id: "emerald_teal",
    name: "Emerald Teal",
    tag: "CINEMA",
    category: "moody",
    previewBg: "from-[#0f766e] via-[#115e59] to-[#042f2e]",
    adjustments: { brightness: -5, contrast: 25, saturation: 10, exposure: 0, temperature: -20, tint: -25, structure: 20, vignette: 35, grain: 15 },
    curvePreset: {
      ...DEFAULT_CURVES,
      green: [{ x: 0, y: 0 }, { x: 128, y: 140 }, { x: 255, y: 255 }],
      red: [{ x: 0, y: 0 }, { x: 128, y: 115 }, { x: 255, y: 245 }],
    },
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    tag: "CYBER",
    category: "moody",
    previewBg: "from-[#0891b2] via-[#581c87] to-[#701a75]",
    adjustments: { brightness: 10, contrast: 30, saturation: 40, exposure: 5, temperature: -15, tint: 35, structure: 30, vignette: 40, grain: 25 },
    curvePreset: {
      ...DEFAULT_CURVES,
      blue: [{ x: 0, y: 20 }, { x: 128, y: 145 }, { x: 255, y: 255 }],
      red: [{ x: 0, y: 0 }, { x: 128, y: 140 }, { x: 255, y: 255 }],
    },
  },
];

interface FilterPresetsStripProps {
  selectedPresetId: string;
  onSelectPreset: (preset: PremiumLookPreset) => void;
}

const FilterPresetsStrip = memo(function FilterPresetsStrip({
  selectedPresetId,
  onSelectPreset,
}: FilterPresetsStripProps) {
  return (
    <div className="h-24 border-t border-[#26272b] bg-[#131418] px-5 flex items-center gap-5 overflow-x-auto shrink-0 select-none">
      <div className="flex flex-col gap-0.5 shrink-0">
        <span className="text-xs text-[#f0f0ec] font-mono font-bold tracking-wider">
          SNAPSEED LOOKS
        </span>
        <span className="text-[10px] text-[#9a9d9a] font-mono">
          NON-DESTRUCTIVE
        </span>
      </div>

      <div className="flex items-center gap-4 py-1">
        {PRESET_LOOKS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className="flex flex-col items-center gap-1.5 cursor-pointer group shrink-0"
            >
              <div
                className={`
                  w-20 h-13 rounded-md bg-gradient-to-br ${preset.previewBg} transition-all duration-200 border flex items-end p-1.5 relative overflow-hidden shadow-lg
                  ${
                    isSelected
                      ? "border-[#4b9fef] ring-2 ring-[#4b9fef] scale-[1.03]"
                      : "border-[#26272b] group-hover:border-[#9a9d9a] group-hover:scale-[1.02]"
                  }
                `}
              >
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/60 text-[#f0f0ec] backdrop-blur-sm tracking-wider border border-white/10">
                  {preset.tag}
                </span>

                {isSelected && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#4b9fef]" />
                )}
              </div>
              <span
                className={`text-xs font-mono transition-colors ${
                  isSelected
                    ? "text-[#4b9fef] font-bold"
                    : "text-[#9a9d9a] group-hover:text-[#f0f0ec]"
                }`}
              >
                {preset.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default FilterPresetsStrip;
