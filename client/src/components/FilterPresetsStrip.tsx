"use client";

import { memo, useState } from "react";
import { PhotoPreset } from "@/types/editor";
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
    <div className="h-26 border-t border-[#222227] bg-[#121215] px-4 flex flex-col justify-center gap-2 shrink-0 select-none">
      {/* Category Pills & Info */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-[#ededed]">
            PRESETS
          </span>
          <span className="text-[10px] text-[#5c5c66]">
            Non-destructive
          </span>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1 shrink-0">
          {PRESET_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`
                px-2.5 py-0.5 text-[11px] rounded-full border transition-colors cursor-pointer
                ${
                  activeCategory === cat
                    ? "bg-[#3b82f6] text-white border-[#3b82f6] font-medium"
                    : "bg-[#16161a] text-[#84848d] border-[#222227] hover:text-[#ededed] hover:border-[#2d2d34]"
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal Presets Thumbnails Strip */}
      <div className="flex items-center gap-2.5 overflow-x-auto py-0.5">
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
                  w-18 h-10 rounded bg-gradient-to-br ${preset.previewBg || "from-slate-700 to-slate-900"} transition-all duration-150 border flex items-end p-1 relative overflow-hidden shadow-sm
                  ${
                    isSelected
                      ? "border-[#3b82f6] ring-1 ring-[#3b82f6]"
                      : "border-[#222227] group-hover:border-[#2d2d34]"
                  }
                `}
              >
                <span className="text-[8px] font-medium px-1 py-0.2 rounded bg-black/70 text-[#ededed] tracking-wide border border-white/10">
                  {preset.tag || "LOOK"}
                </span>

                {isSelected && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                )}
              </div>
              <span
                className={`text-[10px] transition-colors truncate max-w-[76px] text-center ${
                  isSelected
                    ? "text-[#3b82f6] font-medium"
                    : "text-[#84848d] group-hover:text-[#ededed]"
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
