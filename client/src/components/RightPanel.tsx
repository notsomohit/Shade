"use client";

import { ToolType, Adjustments, LayerItem } from "@/types/editor";

interface RightPanelProps {
  activeTool: ToolType;
  adjustments: Adjustments;
  onChangeAdjustment: (key: keyof Adjustments, value: number) => void;
  layers: LayerItem[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onToggleLayerVisibility: (id: string) => void;
}

export default function RightPanel({
  activeTool,
  adjustments,
  onChangeAdjustment,
  layers,
  selectedLayerId,
  onSelectLayer,
  onToggleLayerVisibility,
}: RightPanelProps) {
  const renderContent = () => {
    switch (activeTool) {
      case "adjust":
        return (
          <div className="flex flex-col gap-5 font-mono text-xs">
            <div className="text-[11px] text-[#9a9d9a] uppercase tracking-wider font-semibold border-b border-[#26272b] pb-2">
              ADJUSTMENTS
            </div>

            {/* Brightness Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#9a9d9a]">BRIGHTNESS</span>
                <span className="text-[#4b9fef] font-semibold">
                  {adjustments.brightness > 0 ? `+${adjustments.brightness}` : adjustments.brightness}
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

            {/* Contrast Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#9a9d9a]">CONTRAST</span>
                <span className="text-[#4b9fef] font-semibold">
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

            {/* Saturation Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#9a9d9a]">SATURATION</span>
                <span className="text-[#4b9fef] font-semibold">
                  {adjustments.saturation > 0 ? `+${adjustments.saturation}` : adjustments.saturation}
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

            {/* Exposure Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#9a9d9a]">EXPOSURE</span>
                <span className="text-[#4b9fef] font-semibold">
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
          </div>
        );

      case "crop":
        return (
          <div className="flex flex-col gap-4 font-mono text-xs">
            <div className="text-[11px] text-[#9a9d9a] uppercase tracking-wider font-semibold border-b border-[#26272b] pb-2">
              CROP & TRANSFORM
            </div>
            <div className="space-y-2 text-[11px] text-[#9a9d9a]">
              <button className="w-full p-2 border border-[#26272b] hover:text-[#f0f0ec] hover:border-[#9a9d9a] rounded text-left transition-colors cursor-pointer">
                Rotate 90° CW
              </button>
              <button className="w-full p-2 border border-[#26272b] hover:text-[#f0f0ec] hover:border-[#9a9d9a] rounded text-left transition-colors cursor-pointer">
                Flip Horizontal
              </button>
              <button className="w-full p-2 border border-[#26272b] hover:text-[#f0f0ec] hover:border-[#9a9d9a] rounded text-left transition-colors cursor-pointer">
                Flip Vertical
              </button>
            </div>
          </div>
        );

      case "filter":
        return (
          <div className="flex flex-col gap-3 font-mono text-xs">
            <div className="text-[11px] text-[#9a9d9a] uppercase tracking-wider font-semibold border-b border-[#26272b] pb-2">
              FILTER CONTROLS
            </div>
            <p className="text-[11px] text-[#9a9d9a]/70">
              Select presets from the bottom strip or adjust filter intensity.
            </p>
          </div>
        );

      case "layers":
      case "select":
      case "text":
      default:
        return (
          <div className="flex flex-col h-full font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-[#9a9d9a] uppercase tracking-wider font-semibold border-b border-[#26272b] pb-2 mb-3">
              <span>LAYERS ({layers.length})</span>
              <button className="hover:text-[#4b9fef] cursor-pointer text-sm">
                +
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5">
              {layers.length === 0 ? (
                <div className="text-[11px] text-[#9a9d9a]/50 py-4 text-center border border-dashed border-[#26272b] rounded">
                  NO LAYERS
                </div>
              ) : (
                layers.map((layer) => {
                  const isSelected = selectedLayerId === layer.id;
                  return (
                    <div
                      key={layer.id}
                      onClick={() => onSelectLayer(layer.id)}
                      className={`
                        flex items-center justify-between px-2.5 py-2 cursor-pointer text-[11px] transition-colors rounded border
                        ${
                          isSelected
                            ? "bg-[#4b9fef]/10 text-[#f0f0ec] border-[#4b9fef]/40"
                            : "text-[#9a9d9a] hover:text-[#f0f0ec] hover:bg-[#26272b]/30 border-transparent"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <svg
                          className="w-3.5 h-3.5 shrink-0 text-[#4b9fef]"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                          />
                        </svg>
                        <span className="truncate">{layer.name}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLayerVisibility(layer.id);
                        }}
                        className="hover:text-white shrink-0 p-0.5"
                      >
                        {layer.visible ? (
                          <svg
                            className="w-3.5 h-3.5 text-[#f0f0ec]"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-3.5 h-3.5 text-[#9a9d9a]/30"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <aside className="w-[210px] border-l border-[#26272b] bg-[#131418] p-3.5 flex flex-col shrink-0 font-mono select-none">
      {renderContent()}
    </aside>
  );
}
