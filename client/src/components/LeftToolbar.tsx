"use client";

import { memo } from "react";
import { ToolType } from "@/types/editor";

interface LeftToolbarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  isMobileBottomBar?: boolean;
}

interface ToolItem {
  id: ToolType;
  name: string;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
}

const LeftToolbar = memo(function LeftToolbar({
  activeTool,
  onSelectTool,
  isMobileBottomBar = false,
}: LeftToolbarProps) {
  const tools: ToolItem[] = [
    {
      id: "select",
      name: "Select / Move",
      label: "Select",
      shortcut: "V",
      icon: (
        <svg
          className="w-5 h-5"
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
      id: "adjust",
      name: "Tune Image",
      label: "Tune",
      shortcut: "A",
      icon: (
        <svg
          className="w-5 h-5"
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
      id: "selective",
      name: "Selective Points",
      label: "Selective",
      shortcut: "S",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="8" strokeDasharray="3 3" />
          <circle cx="12" cy="12" r="2.5" fill="currentColor" />
          <path strokeLinecap="round" d="M12 2v2m0 16v2M2 12h2m16 0h2" />
        </svg>
      ),
    },
    {
      id: "curves",
      name: "Tone Curves",
      label: "Curves",
      shortcut: "K",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 19c3-1 6-13 10-13s4 11 6 13"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3v18h18"
            strokeWidth="1.2"
          />
        </svg>
      ),
    },
    {
      id: "crop",
      name: "Crop & Straighten",
      label: "Crop",
      shortcut: "C",
      icon: (
        <svg
          className="w-5 h-5"
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
      id: "filter",
      name: "Preset Looks",
      label: "Presets",
      shortcut: "F",
      icon: (
        <svg
          className="w-5 h-5"
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
      name: "Text Overlay",
      label: "Text",
      shortcut: "T",
      icon: (
        <svg
          className="w-5 h-5"
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
      label: "Layers",
      shortcut: "L",
      icon: (
        <svg
          className="w-5 h-5"
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
      name: "Export",
      label: "Export",
      shortcut: "E",
      icon: (
        <svg
          className="w-5 h-5"
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

  // Mobile horizontal toolbar rendering (< 640px)
  if (isMobileBottomBar) {
    return (
      <nav
        className="w-full bg-[var(--bg-panel)] border-t border-[var(--border)] flex items-center overflow-x-auto pb-[env(safe-area-inset-bottom)] scrollbar-none snap-x select-none z-30 shrink-0"
        style={{ touchAction: "pan-x" }}
      >
        <div className="flex items-center gap-1 px-2 py-1.5 min-w-full justify-around sm:justify-start">
          {tools.map((tool) => {
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => onSelectTool(tool.id)}
                className={`
                  flex flex-col items-center justify-center min-w-[56px] h-12 rounded px-1.5 transition-colors cursor-pointer relative shrink-0
                  ${
                    isActive
                      ? "text-[var(--accent)] bg-[var(--accent-soft)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text)] active:bg-[var(--bg-elevated)]"
                  }
                `}
              >
                {isActive && (
                  <div className="absolute top-0 left-2 right-2 h-[2px] bg-[var(--accent)] rounded-full" />
                )}
                <div className="w-5 h-5 flex items-center justify-center">{tool.icon}</div>
                <span className="text-[10px] font-medium tracking-tight mt-0.5">{tool.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  // Desktop (~76px width) & Tablet / Landscape slim vertical toolbar
  return (
    <aside className="w-14 lg:w-[76px] border-r border-[var(--border)] bg-[var(--bg-panel)] flex flex-col items-center justify-between py-3 shrink-0 select-none z-20">
      <div className="flex flex-col items-center gap-1.5 w-full">
        {tools.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <div key={tool.id} className="relative group w-full flex justify-center">
              <button
                onClick={() => onSelectTool(tool.id)}
                className={`
                  w-11 h-11 lg:w-12 lg:h-12 rounded flex flex-col items-center justify-center transition-all duration-150 cursor-pointer relative
                  ${
                    isActive
                      ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm font-semibold"
                      : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]"
                  }
                `}
                title={`${tool.name} (${tool.shortcut})`}
              >
                {/* 3px blue bar on left edge for active tool */}
                {isActive && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[var(--accent)] rounded-r" />
                )}

                <div className="w-5 h-5 flex items-center justify-center">{tool.icon}</div>
                <span className="text-[9px] font-medium tracking-tight hidden lg:block mt-0.5">
                  {tool.label}
                </span>
              </button>

              {/* Desktop Hover Tooltip */}
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover:block pointer-events-none whitespace-nowrap px-2 py-1 bg-[var(--bg-elevated)] text-[var(--text)] border border-[var(--border)] text-[11px] font-sans rounded shadow-xl">
                {tool.name} <span className="text-[var(--accent)] font-mono font-bold">({tool.shortcut})</span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
});

export default LeftToolbar;
