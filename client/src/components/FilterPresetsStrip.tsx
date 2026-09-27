"use client";

import { PresetFilter } from "@/types/editor";

interface FilterPresetsStripProps {
  selectedPresetId: string;
  onSelectPreset: (id: string) => void;
}

export const PRESET_FILTERS: PresetFilter[] = [
  { id: "original", name: "Original", previewBg: "from-zinc-700 to-zinc-900" },
  { id: "vintage", name: "Vintage", previewBg: "from-amber-900/60 to-yellow-950/80" },
  { id: "cool", name: "Cool", previewBg: "from-sky-900/60 to-slate-950/80" },
  { id: "mono", name: "Mono", previewBg: "from-zinc-900 to-black" },
  { id: "warm", name: "Warm", previewBg: "from-orange-950/60 to-stone-900" },
  { id: "dramatic", name: "Dramatic", previewBg: "from-indigo-950 to-neutral-950" },
  { id: "cyber", name: "Cyber", previewBg: "from-cyan-950 to-fuchsia-950" },
];

export default function FilterPresetsStrip({
  selectedPresetId,
  onSelectPreset,
}: FilterPresetsStripProps) {
  return (
    <div className="h-20 border-t border-[#26272b] bg-[#131418] px-4 flex items-center gap-4 overflow-x-auto shrink-0 select-none">
      <span className="text-[10px] text-[#9a9d9a] uppercase tracking-wider font-mono shrink-0">
        PRESETS:
      </span>
      <div className="flex items-center gap-3">
        {PRESET_FILTERS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset.id)}
              className="flex flex-col items-center gap-1 cursor-pointer group shrink-0"
            >
              <div
                className={`
                  w-12 h-10 rounded bg-gradient-to-br ${preset.previewBg} transition-all duration-150 border
                  ${
                    isSelected
                      ? "border-[#4b9fef] ring-1 ring-[#4b9fef]"
                      : "border-[#26272b] group-hover:border-[#9a9d9a]"
                  }
                `}
              />
              <span
                className={`text-[10px] font-mono transition-colors ${
                  isSelected ? "text-[#4b9fef] font-semibold" : "text-[#9a9d9a] group-hover:text-[#f0f0ec]"
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
}
