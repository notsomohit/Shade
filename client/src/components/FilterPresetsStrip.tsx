"use client";

import { memo, useState } from "react";
import { PhotoPreset, PresetCategory } from "@/types/editor";
import { PHOTO_PRESETS, PRESET_CATEGORIES } from "@/constants/presets";

interface FilterPresetsStripProps {
  selectedPresetId?: string;
  onSelectPreset: (preset: PhotoPreset) => void;
}

const FilterPresetsStrip = memo(function FilterPresetsStrip({
  selectedPresetId,
  onSelectPreset,
}: FilterPresetsStripProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredPresets =
    activeCategory === "All"
      ? PHOTO_PRESETS
      : PHOTO_PRESETS.filter((p) => p.category === activeCategory);

  return (
    <div className="h-28 border-t border-[#26272b] bg-[#131418] px-4 flex flex-col justify-center gap-2 shrink-0 select-none">
      {/* Category Pills & Info */}
      <div className="flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-[#f0f0ec] font-mono font-bold tracking-wider">
            PRESETS
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#4b9fef]/10 text-[#4b9fef] font-mono font-bold border border-[#4b9fef]/20">
            NON-DESTRUCTIVE
          </span>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 shrink-0">
          {PRESET_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`
                px-2.5 py-0.5 text-[10px] font-mono rounded-full border transition-colors cursor-pointer
                ${
                  activeCategory === cat
                    ? "bg-[#4b9fef] text-black border-[#4b9fef] font-bold"
                    : "bg-[#18191e] text-[#9a9d9a] border-[#26272b] hover:text-[#f0f0ec]"
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal Presets Thumbnails Strip */}
      <div className="flex items-center gap-3 overflow-x-auto py-1 scrollbar-thin">
        {filteredPresets.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className="flex flex-col items-center gap-1 cursor-pointer group shrink-0"
              title={preset.description || preset.name}
            >
              <div
                className={`
                  w-20 h-11 rounded-md bg-gradient-to-br ${preset.previewBg || "from-slate-700 to-slate-900"} transition-all duration-200 border flex items-end p-1 relative overflow-hidden shadow-md
                  ${
                    isSelected
                      ? "border-[#4b9fef] ring-2 ring-[#4b9fef] scale-[1.03]"
                      : "border-[#26272b] group-hover:border-[#9a9d9a] group-hover:scale-[1.02]"
                  }
                `}
              >
                <span className="text-[8px] font-mono font-bold px-1 py-0.2 rounded bg-black/70 text-[#f0f0ec] backdrop-blur-sm tracking-wider border border-white/10">
                  {preset.tag || "LOOK"}
                </span>

                {isSelected && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#4b9fef]" />
                )}
              </div>
              <span
                className={`text-[11px] font-mono transition-colors truncate max-w-[84px] text-center ${
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
