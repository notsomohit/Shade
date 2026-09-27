"use client";

import { PresetFilter } from "@/types/editor";

interface FilterPresetsStripProps {
  selectedPresetId: string;
  onSelectPreset: (id: string) => void;
}

export const PRESET_FILTERS: PresetFilter[] = [
  { id: "original", name: "Original", previewBg: "from-zinc-700 to-zinc-900" },
  { id: "vintage", name: "Vintage", previewBg: "from-amber-800/80 to-yellow-950" },
  { id: "cool", name: "Cool", previewBg: "from-sky-800/80 to-slate-950" },
  { id: "mono", name: "Mono", previewBg: "from-zinc-800 to-black" },
  { id: "warm", name: "Warm", previewBg: "from-orange-900/80 to-stone-950" },
  { id: "dramatic", name: "Dramatic", previewBg: "from-indigo-900/80 to-neutral-950" },
  { id: "cyber", name: "Cyber", previewBg: "from-cyan-900/80 to-fuchsia-950" },
];

export default function FilterPresetsStrip({
  selectedPresetId,
  onSelectPreset,
}: FilterPresetsStripProps) {
  return (
    <div className="h-24 border-t border-[#26272b] bg-[#131418] px-5 flex items-center gap-5 overflow-x-auto shrink-0 select-none">
      <span className="text-xs text-[#9a9d9a] uppercase tracking-wider font-mono font-semibold shrink-0">
        PRESETS:
      </span>
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
                  w-16 h-12 rounded bg-gradient-to-br ${preset.previewBg} transition-all duration-150 border
                  ${
                    isSelected
                      ? "border-[#4b9fef] ring-2 ring-[#4b9fef]"
                      : "border-[#26272b] group-hover:border-[#9a9d9a]"
                  }
                `}
              />
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
}
