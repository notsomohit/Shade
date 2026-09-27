"use client";

import { memo } from "react";
import { ToolType } from "@/types/editor";

interface LeftToolbarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
}

interface ToolItem {
  id: ToolType;
  name: string;
  shortcut: string;
  icon: React.ReactNode;
}

const LeftToolbar = memo(function LeftToolbar({
  activeTool,
  onSelectTool,
}: LeftToolbarProps) {
  const tools: ToolItem[] = [
    {
      id: "select",
      name: "Select",
      shortcut: "V",
      icon: (
        <svg
          className="w-4.5 h-4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 6.913 6.913-3.238.411z"
          />
        </svg>
      ),
    },
    {
      id: "crop",
      name: "Crop",
      shortcut: "C",
      icon: (
        <svg
          className="w-4.5 h-4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 3.75v12a2.25 2.25 0 002.25 2.25h12M16.5 20.25v-12A2.25 2.25 0 0014.25 6h-12"
          />
        </svg>
      ),
    },
    {
      id: "adjust",
      name: "Adjustments",
      shortcut: "A",
      icon: (
        <svg
          className="w-4.5 h-4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 18H7.5M13.5 12h6.75m-6.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 12h6.75"
          />
        </svg>
      ),
    },
    {
      id: "filter",
      name: "Filters",
      shortcut: "F",
      icon: (
        <svg
          className="w-4.5 h-4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
          />
        </svg>
      ),
    },
    {
      id: "text",
      name: "Text",
      shortcut: "T",
      icon: (
        <svg
          className="w-4.5 h-4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 8.25h9m-9 3.75h9m-9 3.75h5.25"
          />
        </svg>
      ),
    },
    {
      id: "layers",
      name: "Layers",
      shortcut: "L",
      icon: (
        <svg
          className="w-4.5 h-4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L12 6.75l5.571 3m0 0l4.179-2.25L12 2.25 2.25 7.5l4.179 2.25m11.142 0l4.179 2.25-9.6 5.166-9.6-5.166"
          />
        </svg>
      ),
    },
    {
      id: "export",
      name: "Export Settings",
      shortcut: "E",
      icon: (
        <svg
          className="w-4.5 h-4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-[52px] border-r border-[#26272b] bg-[#131418] flex flex-col items-center justify-between py-5 shrink-0 font-mono select-none">
      <div className="flex flex-col items-center gap-5 w-full">
        {tools.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <div key={tool.id} className="relative group">
              <button
                onClick={() => onSelectTool(tool.id)}
                className={`
                  w-9 h-9 rounded flex items-center justify-center transition-colors duration-150 cursor-pointer
                  ${
                    isActive
                      ? "bg-[#4b9fef]/15 text-[#4b9fef]"
                      : "text-[#9a9d9a] hover:text-[#f0f0ec] hover:bg-[#26272b]/50"
                  }
                `}
              >
                {tool.icon}
              </button>

              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover:block pointer-events-none whitespace-nowrap px-2 py-1 bg-[#131418] text-[#f0f0ec] border border-[#26272b] text-[10px] rounded shadow-md">
                {tool.name} <span className="text-[#4b9fef]">({tool.shortcut})</span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
});

export default LeftToolbar;
