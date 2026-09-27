"use client";

import { ToolType, LayerItem } from "@/types/editor";

interface RightPanelProps {
  activeTool: ToolType;
  layers: LayerItem[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onToggleLayerVisibility: (id: string) => void;
}

export default function RightPanel({
  activeTool,
  layers,
  selectedLayerId,
  onSelectLayer,
  onToggleLayerVisibility,
}: RightPanelProps) {
  // Render panel view based on selected tool
  const renderContent = () => {
    switch (activeTool) {
      case "adjust":
        return (
          <div className="flex flex-col gap-4 text-xs font-mono">
            <div className="text-[11px] text-[#8f938f] uppercase tracking-wider font-semibold border-b border-[#3a3d44] pb-2">
              ADJUSTMENTS
            </div>
            <div className="space-y-3 text-[#8f938f]">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span>BRIGHTNESS</span>
                  <span className="text-[#e8e8e2]">0</span>
                </div>
                <div className="h-1 bg-[#3a3d44] w-full"></div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span>CONTRAST</span>
                  <span className="text-[#e8e8e2]">0</span>
                </div>
                <div className="h-1 bg-[#3a3d44] w-full"></div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span>SATURATION</span>
                  <span className="text-[#e8e8e2]">0</span>
                </div>
                <div className="h-1 bg-[#3a3d44] w-full"></div>
              </div>
            </div>
          </div>
        );

      case "filter":
        return (
          <div className="flex flex-col gap-4 text-xs font-mono">
            <div className="text-[11px] text-[#8f938f] uppercase tracking-wider font-semibold border-b border-[#3a3d44] pb-2">
              PRESET FILTERS
            </div>
            <div className="space-y-1">
              {["Normal", "B&W Mono", "Sepia Tone", "Vintage Film"].map(
                (filterName, i) => (
                  <div
                    key={filterName}
                    className={`px-2 py-1.5 cursor-pointer text-[11px] transition-colors ${
                      i === 0
                        ? "bg-[#3a3d44]/40 text-[#e8e8e2]"
                        : "text-[#8f938f] hover:text-[#e8e8e2] hover:bg-[#3a3d44]/20"
                    }`}
                  >
                    {filterName}
                  </div>
                )
              )}
            </div>
          </div>
        );

      case "crop":
        return (
          <div className="flex flex-col gap-4 text-xs font-mono">
            <div className="text-[11px] text-[#8f938f] uppercase tracking-wider font-semibold border-b border-[#3a3d44] pb-2">
              CROP & TRANSFORM
            </div>
            <div className="space-y-2 text-[11px] text-[#8f938f]">
              <div className="p-2 border border-[#3a3d44] hover:text-[#e8e8e2] cursor-pointer">
                Rotate 90° CW
              </div>
              <div className="p-2 border border-[#3a3d44] hover:text-[#e8e8e2] cursor-pointer">
                Flip Horizontal
              </div>
              <div className="p-2 border border-[#3a3d44] hover:text-[#e8e8e2] cursor-pointer">
                Flip Vertical
              </div>
            </div>
          </div>
        );

      case "layers":
      case "select":
      case "move":
      case "text":
      default:
        return (
          <div className="flex flex-col h-full text-xs font-mono">
            <div className="flex items-center justify-between text-[11px] text-[#8f938f] uppercase tracking-wider font-semibold border-b border-[#3a3d44] pb-2 mb-3">
              <span>LAYERS ({layers.length})</span>
              <button className="hover:text-[#e8e8e2] cursor-pointer text-sm">
                +
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1">
              {layers.length === 0 ? (
                <div className="text-[11px] text-[#8f938f]/60 py-4 text-center border border-dashed border-[#3a3d44]">
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
                        flex items-center justify-between px-2 py-1.5 cursor-pointer text-[11px] transition-colors border
                        ${
                          isSelected
                            ? "bg-[#3a3d44]/50 text-[#e8e8e2] border-[#3a3d44]"
                            : "text-[#8f938f] hover:text-[#e8e8e2] hover:bg-[#3a3d44]/20 border-transparent"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <svg
                          className="w-3.5 h-3.5 shrink-0"
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
                            className="w-3.5 h-3.5"
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
                            className="w-3.5 h-3.5 opacity-40"
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
    <aside className="w-52 border-l border-[#3a3d44] bg-[#141519] p-3 flex flex-col shrink-0 font-mono">
      {renderContent()}
    </aside>
  );
}
