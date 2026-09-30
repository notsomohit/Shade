"use client";

import { memo, useState } from "react";
import { SelectivePoint } from "@/types/editor";

interface SelectiveToolProps {
  points: SelectivePoint[];
  selectedPointId: string | null;
  onSelectPoint: (id: string | null) => void;
  onAddPoint: () => void;
  onUpdatePoint: (id: string, updates: Partial<SelectivePoint>) => void;
  onDeletePoint: (id: string) => void;
  onDuplicatePoint?: (id: string) => void;
  showMarkers?: boolean;
  onToggleShowMarkers?: () => void;
}

const SelectiveTool = memo(function SelectiveTool({
  points,
  selectedPointId,
  onSelectPoint,
  onAddPoint,
  onUpdatePoint,
  onDeletePoint,
  onDuplicatePoint,
  showMarkers = true,
  onToggleShowMarkers,
}: SelectiveToolProps) {
  const [activeSubTab, setActiveSubTab] = useState<"tune" | "blur">("tune");
  const activePoint = points.find((p) => p.id === selectedPointId);

  const handleResetActivePoint = () => {
    if (!activePoint) return;
    onUpdatePoint(activePoint.id, {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      structure: 0,
      exposure: 0,
      highlights: 0,
      shadows: 0,
      temperature: 0,
      tint: 0,
      vibrance: 0,
      sharpness: 0,
      hueShift: 0,
      feather: 50,
      opacity: 100,
      blur: { enabled: false, type: "gaussian", intensity: 50, invert: false },
    });
  };

  return (
    <div className="flex flex-col gap-3 font-mono select-none">
      {/* Header & Add Point */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#f0f0ec]">SELECTIVE POINTS</span>
          <p className="text-[10px] text-[#9a9d9a]">Click photo or use &apos;Add Pin&apos;</p>
        </div>
        <div className="flex items-center gap-1.5">
          {onToggleShowMarkers && (
            <button
              onClick={onToggleShowMarkers}
              className={`p-1.5 text-xs rounded border transition-colors cursor-pointer ${
                showMarkers
                  ? "bg-[#1f2330] border-[#3b82f6]/50 text-[#3b82f6]"
                  : "bg-[#18191e] border-[#26272b] text-[#9a9d9a]"
              }`}
              title={showMarkers ? "Hide pin overlays on canvas" : "Show pin overlays on canvas"}
            >
              {showMarkers ? "👁 Pins" : "🚫 Pins"}
            </button>
          )}
          <button
            onClick={onAddPoint}
            className="px-2.5 py-1 text-xs rounded bg-[#4b9fef] text-black font-bold hover:bg-[#3b8fe0] transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Pin
          </button>
        </div>
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
        <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
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
                  {pt.blur?.enabled && (
                    <span className="px-1.5 py-0.2 text-[9px] rounded bg-purple-900/60 text-purple-300 border border-purple-500/40 font-sans">
                      Blur
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {onDuplicatePoint && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicatePoint(pt.id);
                      }}
                      className="text-[#9a9d9a] hover:text-white p-1 cursor-pointer"
                      title="Duplicate Pin"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePoint(pt.id);
                    }}
                    className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                    title="Delete Pin"
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

      {/* Selected Point Controls */}
      {activePoint && (
        <div className="flex flex-col gap-3 p-3 bg-[#18191e] rounded-lg border border-[#26272b]">
          <div className="flex items-center justify-between border-b border-[#26272b] pb-2">
            <span className="text-xs font-bold text-[#4b9fef]">
              Pin #{points.findIndex((p) => p.id === activePoint.id) + 1} Properties
            </span>
            <button
              onClick={handleResetActivePoint}
              className="text-[10px] text-[#9a9d9a] hover:text-[#f0f0ec] cursor-pointer"
            >
              Reset Values
            </button>
          </div>

          {/* Sub Tabs: Tune vs Blur */}
          <div className="flex border border-[#26272b] rounded p-0.5 bg-[#121316]">
            <button
              onClick={() => setActiveSubTab("tune")}
              className={`flex-1 py-1 text-xs font-bold rounded transition-colors cursor-pointer ${
                activeSubTab === "tune"
                  ? "bg-[#4b9fef] text-black"
                  : "text-[#9a9d9a] hover:text-[#f0f0ec]"
              }`}
            >
              Local Tuning
            </button>
            <button
              onClick={() => setActiveSubTab("blur")}
              className={`flex-1 py-1 text-xs font-bold rounded transition-colors cursor-pointer ${
                activeSubTab === "blur"
                  ? "bg-[#4b9fef] text-black"
                  : "text-[#9a9d9a] hover:text-[#f0f0ec]"
              }`}
            >
              Selective Blur
            </button>
          </div>

          {/* Geometry: Radius, Feather & Strength */}
          <div className="space-y-2 pb-2 border-b border-[#26272b]">
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#9a9d9a]">Radius</span>
                <span className="text-[#f0f0ec] font-bold">{Math.round(activePoint.radius * 100)}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="75"
                value={Math.round(activePoint.radius * 100)}
                onChange={(e) => onUpdatePoint(activePoint.id, { radius: Number(e.target.value) / 100 })}
                className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded appearance-none cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#9a9d9a]">Edge Feather</span>
                <span className="text-[#f0f0ec] font-bold">{activePoint.feather !== undefined ? activePoint.feather : 50}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={activePoint.feather !== undefined ? activePoint.feather : 50}
                onChange={(e) => onUpdatePoint(activePoint.id, { feather: Number(e.target.value) })}
                className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded appearance-none cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#9a9d9a]">Strength / Opacity</span>
                <span className="text-[#f0f0ec] font-bold">{activePoint.opacity !== undefined ? activePoint.opacity : 100}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={activePoint.opacity !== undefined ? activePoint.opacity : 100}
                onChange={(e) => onUpdatePoint(activePoint.id, { opacity: Number(e.target.value) })}
                className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* TUNE SUBTAB SLIDERS */}
          {activeSubTab === "tune" && (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {/* Exposure */}
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9a9d9a]">Exposure</span>
                  <span className="text-[#f0f0ec] font-bold">
                    {(activePoint.exposure || 0) > 0 ? `+${activePoint.exposure}` : (activePoint.exposure || 0)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={activePoint.exposure || 0}
                  onChange={(e) => onUpdatePoint(activePoint.id, { exposure: Number(e.target.value) })}
                  className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded appearance-none cursor-pointer"
                />
              </div>

              {/* Brightness */}
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9a9d9a]">Brightness</span>
                  <span className="text-[#f0f0ec] font-bold">
                    {activePoint.brightness > 0 ? `+${activePoint.brightness}` : activePoint.brightness}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={activePoint.brightness}
                  onChange={(e) => onUpdatePoint(activePoint.id, { brightness: Number(e.target.value) })}
                  className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded appearance-none cursor-pointer"
                />
              </div>

              {/* Contrast */}
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9a9d9a]">Contrast</span>
                  <span className="text-[#f0f0ec] font-bold">
                    {activePoint.contrast > 0 ? `+${activePoint.contrast}` : activePoint.contrast}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={activePoint.contrast}
                  onChange={(e) => onUpdatePoint(activePoint.id, { contrast: Number(e.target.value) })}
                  className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded appearance-none cursor-pointer"
                />
              </div>

              {/* Highlights */}
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9a9d9a]">Highlights</span>
                  <span className="text-[#f0f0ec] font-bold">
                    {(activePoint.highlights || 0) > 0 ? `+${activePoint.highlights}` : (activePoint.highlights || 0)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={activePoint.highlights || 0}
                  onChange={(e) => onUpdatePoint(activePoint.id, { highlights: Number(e.target.value) })}
                  className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded appearance-none cursor-pointer"
                />
              </div>

              {/* Shadows */}
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9a9d9a]">Shadows</span>
                  <span className="text-[#f0f0ec] font-bold">
                    {(activePoint.shadows || 0) > 0 ? `+${activePoint.shadows}` : (activePoint.shadows || 0)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={activePoint.shadows || 0}
                  onChange={(e) => onUpdatePoint(activePoint.id, { shadows: Number(e.target.value) })}
                  className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded appearance-none cursor-pointer"
                />
              </div>

              {/* Warmth (Temperature) */}
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9a9d9a]">Warmth (Temp)</span>
                  <span className="text-[#f0f0ec] font-bold">
                    {(activePoint.temperature || 0) > 0 ? `+${activePoint.temperature}` : (activePoint.temperature || 0)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={activePoint.temperature || 0}
                  onChange={(e) => onUpdatePoint(activePoint.id, { temperature: Number(e.target.value) })}
                  className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded appearance-none cursor-pointer"
                />
              </div>

              {/* Tint */}
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9a9d9a]">Tint</span>
                  <span className="text-[#f0f0ec] font-bold">
                    {(activePoint.tint || 0) > 0 ? `+${activePoint.tint}` : (activePoint.tint || 0)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={activePoint.tint || 0}
                  onChange={(e) => onUpdatePoint(activePoint.id, { tint: Number(e.target.value) })}
                  className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded appearance-none cursor-pointer"
                />
              </div>

              {/* Saturation */}
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9a9d9a]">Saturation</span>
                  <span className="text-[#f0f0ec] font-bold">
                    {activePoint.saturation > 0 ? `+${activePoint.saturation}` : activePoint.saturation}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={activePoint.saturation}
                  onChange={(e) => onUpdatePoint(activePoint.id, { saturation: Number(e.target.value) })}
                  className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded appearance-none cursor-pointer"
                />
              </div>

              {/* Vibrance */}
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9a9d9a]">Vibrance</span>
                  <span className="text-[#f0f0ec] font-bold">
                    {(activePoint.vibrance || 0) > 0 ? `+${activePoint.vibrance}` : (activePoint.vibrance || 0)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={activePoint.vibrance || 0}
                  onChange={(e) => onUpdatePoint(activePoint.id, { vibrance: Number(e.target.value) })}
                  className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded appearance-none cursor-pointer"
                />
              </div>

              {/* Sharpness / Clarity */}
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9a9d9a]">Sharpness / Clarity</span>
                  <span className="text-[#f0f0ec] font-bold">
                    {activePoint.structure > 0 ? `+${activePoint.structure}` : activePoint.structure}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={activePoint.structure}
                  onChange={(e) => onUpdatePoint(activePoint.id, { structure: Number(e.target.value), sharpness: Number(e.target.value) })}
                  className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded appearance-none cursor-pointer"
                />
              </div>

              {/* Hue Shift */}
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9a9d9a]">Hue Shift</span>
                  <span className="text-[#f0f0ec] font-bold">
                    {(activePoint.hueShift || 0) > 0 ? `+${activePoint.hueShift}°` : `${activePoint.hueShift || 0}°`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={activePoint.hueShift || 0}
                  onChange={(e) => onUpdatePoint(activePoint.id, { hueShift: Number(e.target.value) })}
                  className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* BLUR SUBTAB */}
          {activeSubTab === "blur" && (
            <div className="space-y-3">
              {/* Toggle Enable Blur */}
              <label className="flex items-center justify-between p-2 rounded bg-[#121316] border border-[#26272b] cursor-pointer">
                <span className="text-xs text-[#f0f0ec] font-bold">Enable Area Blur</span>
                <input
                  type="checkbox"
                  checked={!!activePoint.blur?.enabled}
                  onChange={(e) => {
                    const currentBlur = activePoint.blur || { type: "gaussian", intensity: 50, invert: false, enabled: false };
                    onUpdatePoint(activePoint.id, {
                      blur: { ...currentBlur, enabled: e.target.checked },
                    });
                  }}
                  className="w-4 h-4 accent-[#4b9fef] cursor-pointer"
                />
              </label>

              {activePoint.blur?.enabled && (
                <>
                  {/* Blur Type Selector */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-[#9a9d9a]">Blur Type</span>
                    <div className="grid grid-cols-3 gap-1">
                      {(["gaussian", "lens", "motion"] as const).map((bType) => (
                        <button
                          key={bType}
                          onClick={() => {
                            const cur = activePoint.blur!;
                            onUpdatePoint(activePoint.id, {
                              blur: { ...cur, type: bType },
                            });
                          }}
                          className={`py-1 text-[11px] rounded border capitalize cursor-pointer transition-colors ${
                            (activePoint.blur?.type || "gaussian") === bType
                              ? "bg-[#4b9fef]/20 border-[#4b9fef] text-[#4b9fef] font-bold"
                              : "bg-[#121316] border-[#26272b] text-[#9a9d9a] hover:text-[#f0f0ec]"
                          }`}
                        >
                          {bType}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Blur Intensity Slider */}
                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#9a9d9a]">Blur Intensity</span>
                      <span className="text-[#f0f0ec] font-bold">{activePoint.blur.intensity || 50}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={activePoint.blur.intensity || 50}
                      onChange={(e) => {
                        const cur = activePoint.blur!;
                        onUpdatePoint(activePoint.id, {
                          blur: { ...cur, intensity: Number(e.target.value) },
                        });
                      }}
                      className="w-full accent-[#4b9fef] h-1.5 bg-[#26272b] rounded appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Invert (Focus effect) */}
                  <label className="flex items-center justify-between p-2 rounded bg-[#121316] border border-[#26272b] cursor-pointer">
                    <div>
                      <span className="text-xs text-[#f0f0ec] font-bold">Invert Blur</span>
                      <p className="text-[10px] text-[#9a9d9a]">Blur background, keep point in focus</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!activePoint.blur.invert}
                      onChange={(e) => {
                        const cur = activePoint.blur!;
                        onUpdatePoint(activePoint.id, {
                          blur: { ...cur, invert: e.target.checked },
                        });
                      }}
                      className="w-4 h-4 accent-[#4b9fef] cursor-pointer"
                    />
                  </label>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default SelectiveTool;
