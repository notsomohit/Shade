"use client";

import { memo } from "react";
import { SelectivePoint } from "@/types/editor";

interface SelectiveToolProps {
  points: SelectivePoint[];
  selectedPointId: string | null;
  onSelectPoint: (id: string | null) => void;
  onAddPoint: () => void;
  onUpdatePoint: (id: string, updates: Partial<SelectivePoint>) => void;
  onDeletePoint: (id: string) => void;
}

const SelectiveTool = memo(function SelectiveTool({
  points,
  selectedPointId,
  onSelectPoint,
  onAddPoint,
  onUpdatePoint,
  onDeletePoint,
}: SelectiveToolProps) {
  const activePoint = points.find((p) => p.id === selectedPointId);

  return (
    <div className="flex flex-col gap-4 font-mono select-none">
      {/* Header & Add Point */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#f0f0ec]">CONTROL POINTS</span>
          <p className="text-[10px] text-[#9a9d9a]">Click on the image or use &apos;Add Point&apos;</p>
        </div>
        <button
          onClick={onAddPoint}
          className="px-2.5 py-1 text-xs rounded bg-[#4b9fef] text-black font-bold hover:bg-[#3b8fe0] transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Point
        </button>
      </div>

      {/* List of Points */}
      {points.length === 0 ? (
        <div className="p-4 rounded-lg bg-[#18191e] border border-dashed border-[#26272b] text-center flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#4b9fef]/10 text-[#4b9fef] flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
          </div>
          <span className="text-xs text-[#9a9d9a]">No selective control points placed.</span>
          <span className="text-[11px] text-[#4b9fef]">Click anywhere on the photo to target local adjustments.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
          {points.map((pt, idx) => {
            const isSelected = pt.id === selectedPointId;
            return (
              <div
                key={pt.id}
                onClick={() => onSelectPoint(pt.id)}
                className={`
                  flex items-center justify-between p-2 rounded-md border text-xs cursor-pointer transition-all
                  ${
                    isSelected
                      ? "bg-[#4b9fef]/15 border-[#4b9fef] text-[#f0f0ec]"
                      : "bg-[#18191e] border-[#26272b] text-[#9a9d9a] hover:text-[#f0f0ec] hover:border-[#3a3d46]"
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    isSelected ? "bg-[#4b9fef] text-black" : "bg-[#26272b] text-[#f0f0ec]"
                  }`}>
                    {idx + 1}
                  </div>
                  <span>Pin #{idx + 1} ({Math.round(pt.x * 100)}%, {Math.round(pt.y * 100)}%)</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePoint(pt.id);
                    }}
                    className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                    title="Delete Point"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Point Adjustments Sliders */}
      {activePoint && (
        <div className="flex flex-col gap-3 p-3 bg-[#18191e] rounded-lg border border-[#26272b]">
          <div className="flex items-center justify-between border-b border-[#26272b] pb-2">
            <span className="text-xs font-bold text-[#4b9fef]">
              Point #{points.findIndex((p) => p.id === activePoint.id) + 1} Properties
            </span>
            <button
              onClick={() => {
                onUpdatePoint(activePoint.id, {
                  brightness: 0,
                  contrast: 0,
                  saturation: 0,
                  structure: 0,
                });
              }}
              className="text-[10px] text-[#9a9d9a] hover:text-[#f0f0ec] cursor-pointer"
            >
              Reset Values
            </button>
          </div>

          {/* Radius */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#9a9d9a]">Radius</span>
              <span className="text-[#f0f0ec] font-bold">{Math.round(activePoint.radius * 100)}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              value={Math.round(activePoint.radius * 100)}
              onChange={(e) => onUpdatePoint(activePoint.id, { radius: Number(e.target.value) / 100 })}
              className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Brightness */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#9a9d9a]">Brightness</span>
              <span className="text-[#f0f0ec] font-bold">{activePoint.brightness > 0 ? `+${activePoint.brightness}` : activePoint.brightness}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={activePoint.brightness}
              onChange={(e) => onUpdatePoint(activePoint.id, { brightness: Number(e.target.value) })}
              className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Contrast */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#9a9d9a]">Contrast</span>
              <span className="text-[#f0f0ec] font-bold">{activePoint.contrast > 0 ? `+${activePoint.contrast}` : activePoint.contrast}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={activePoint.contrast}
              onChange={(e) => onUpdatePoint(activePoint.id, { contrast: Number(e.target.value) })}
              className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Saturation */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#9a9d9a]">Saturation</span>
              <span className="text-[#f0f0ec] font-bold">{activePoint.saturation > 0 ? `+${activePoint.saturation}` : activePoint.saturation}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={activePoint.saturation}
              onChange={(e) => onUpdatePoint(activePoint.id, { saturation: Number(e.target.value) })}
              className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Structure / Texture */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#9a9d9a]">Structure / Clarity</span>
              <span className="text-[#f0f0ec] font-bold">{activePoint.structure > 0 ? `+${activePoint.structure}` : activePoint.structure}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={activePoint.structure}
              onChange={(e) => onUpdatePoint(activePoint.id, { structure: Number(e.target.value) })}
              className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
});

export default SelectiveTool;
