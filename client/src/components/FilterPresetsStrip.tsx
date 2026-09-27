"use client";

import { memo } from "react";
import { PresetFilter } from "@/types/editor";

interface FilterPresetsStripProps {
  selectedPresetId: string;
  onSelectPreset: (id: string) => void;
}

export interface PremiumPresetFilter extends PresetFilter {
  tag: string;
}

export const PRESET_FILTERS: PremiumPresetFilter[] = [
  { id: "original", name: "Original", tag: "NATURAL", previewBg: "from-[#27272a] via-[#18181b] to-[#09090b]" },
  { id: "vintage", name: "Vintage", tag: "VNTG", previewBg: "from-[#78350f] via-[#451a03] to-[#1c1917]" },
  { id: "cool", name: "Cool Blue", tag: "COOL", previewBg: "from-[#0369a1] via-[#0f172a] to-[#0284c7]" },
  { id: "mono", name: "B&W Mono", tag: "MONO", previewBg: "from-[#52525b] via-[#27272a] to-[#000000]" },
  { id: "warm", name: "Warm Sun", tag: "WARM", previewBg: "from-[#c2410c] via-[#7c2d12] to-[#1c1917]" },
  { id: "dramatic", name: "Dramatic", tag: "DRAMA", previewBg: "from-[#312e81] via-[#1e1b4b] to-[#020617]" },
  { id: "cyber", name: "Cyberpunk", tag: "CYBER", previewBg: "from-[#0891b2] via-[#581c87] to-[#701a75]" },
];

const FilterPresetsStrip = memo(function FilterPresetsStrip({
  selectedPresetId,
  onSelectPreset,
}: FilterPresetsStripProps) {
  return (
    <div className="h-24 border-t border-[#26272b] bg-[#131418] px-5 flex items-center gap-5 overflow-x-auto shrink-0 select-none">
      <div className="flex flex-col gap-0.5 shrink-0">
        <span className="text-xs text-[#f0f0ec] font-mono font-bold tracking-wider">
          PRESET LUTs
        </span>
        <span className="text-[10px] text-[#9a9d9a] font-mono">
          COLOR GRADING
        </span>
      </div>

      <div className="flex items-center gap-4 py-1">
        {PRESET_FILTERS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset.id)}
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
