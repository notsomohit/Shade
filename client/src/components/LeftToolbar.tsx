"use client";

import { ToolType } from "@/types/editor";

interface LeftToolbarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
}

interface ToolItem {
  id: ToolType;
  label: string;
  icon: React.ReactNode;
}

export default function LeftToolbar({
  activeTool,
  onSelectTool,
}: LeftToolbarProps) {
  const tools: ToolItem[] = [
    {
      id: "select",
      label: "Select",
      icon: (
        <svg
          className="w-4 h-4"
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
      id: "move",
      label: "Move",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15"
          />
        </svg>
      ),
    },
    {
      id: "crop",
      label: "Crop",
      icon: (
        <svg
          className="w-4 h-4"
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
      label: "Adjustments",
      icon: (
        <svg
          className="w-4 h-4"
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
      label: "Filters",
      icon: (
        <svg
          className="w-4 h-4"
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
      label: "Text",
      icon: (
        <svg
          className="w-4 h-4"
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
      label: "Layers",
      icon: (
        <svg
          className="w-4 h-4"
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
  ];

  return (
    <aside className="w-[52px] border-r border-[#3a3d44] bg-[#141519] flex flex-col items-center justify-between py-4 shrink-0 font-mono">
      <div className="flex flex-col items-center gap-5 w-full">
        {tools.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              title={tool.label}
              className={`
                w-9 h-9 flex items-center justify-center transition-colors duration-100 cursor-pointer
                ${
                  isActive
                    ? "text-[#e8e8e2] bg-[#3a3d44]/40 border border-[#3a3d44]"
                    : "text-[#8f938f] hover:text-[#e8e8e2] hover:bg-[#3a3d44]/20"
                }
              `}
            >
              {tool.icon}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
