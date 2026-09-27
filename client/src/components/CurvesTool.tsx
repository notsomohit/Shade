"use client";

import { memo, useState, useRef, useCallback, useEffect } from "react";
import { CurvePoint, CurvesData } from "@/types/editor";
import { generateCurveLUT } from "@/utils/curveUtils";

interface CurvesToolProps {
  curves: CurvesData;
  onChangeCurves: (newCurves: CurvesData) => void;
}

type CurveChannel = "rgb" | "red" | "green" | "blue";

const CHANNEL_COLORS: Record<CurveChannel, { stroke: string; fill: string; activeBg: string; text: string }> = {
  rgb: { stroke: "#f0f0ec", fill: "#ffffff", activeBg: "bg-white/15 border-white/40", text: "text-[#f0f0ec]" },
  red: { stroke: "#ef4444", fill: "#ef4444", activeBg: "bg-red-500/15 border-red-500/40", text: "text-red-400" },
  green: { stroke: "#22c55e", fill: "#22c55e", activeBg: "bg-green-500/15 border-green-500/40", text: "text-green-400" },
  blue: { stroke: "#3b82f6", fill: "#3b82f6", activeBg: "bg-blue-500/15 border-blue-500/40", text: "text-blue-400" },
};

export const DEFAULT_CURVES: CurvesData = {
  rgb: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
  red: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
  green: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
  blue: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
};

const CURVE_PRESETS = [
  {
    name: "Linear",
    points: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
  },
  {
    name: "S-Curve (Contrast)",
    points: [{ x: 0, y: 0 }, { x: 64, y: 48 }, { x: 192, y: 208 }, { x: 255, y: 255 }],
  },
  {
    name: "Matte / Lift Shadows",
    points: [{ x: 0, y: 35 }, { x: 128, y: 128 }, { x: 255, y: 235 }],
  },
  {
    name: "High Key (Bright)",
    points: [{ x: 0, y: 0 }, { x: 100, y: 135 }, { x: 255, y: 255 }],
  },
  {
    name: "Deep Shadows",
    points: [{ x: 0, y: 0 }, { x: 80, y: 55 }, { x: 255, y: 255 }],
  },
];

const CurvesTool = memo(function CurvesTool({
  curves,
  onChangeCurves,
}: CurvesToolProps) {
  const [activeChannel, setActiveChannel] = useState<CurveChannel>("rgb");
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const currentPoints = curves[activeChannel] || DEFAULT_CURVES[activeChannel];

  // Generate smooth spline path from 256 LUT
  const lut = generateCurveLUT(currentPoints);
  let pathD = "M 0 " + (255 - lut[0]);
  for (let x = 1; x < 256; x++) {
    pathD += ` L ${x} ${255 - lut[x]}`;
  }

  // Pointer helpers
  const getCoordsFromEvent = useCallback((e: MouseEvent | TouchEvent) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const x = Math.min(255, Math.max(0, Math.round(((clientX - rect.left) / rect.width) * 255)));
    const y = Math.min(255, Math.max(0, Math.round((1 - (clientY - rect.top) / rect.height) * 255)));
    return { x, y };
  }, []);

  const handlePointPointerDown = (index: number, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedPointIndex(index);
    setDraggingIndex(index);
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingIndex !== null) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = Math.min(255, Math.max(0, Math.round(((e.clientX - rect.left) / rect.width) * 255)));
    const y = Math.min(255, Math.max(0, Math.round((1 - (e.clientY - rect.top) / rect.height) * 255)));

    // Check if clicked close to existing point
    const existingIdx = currentPoints.findIndex(
      (p) => Math.abs(p.x - x) < 12 && Math.abs(p.y - y) < 12
    );
    if (existingIdx !== -1) {
      setSelectedPointIndex(existingIdx);
      return;
    }

    // Add new point
    const newPoints = [...currentPoints, { x, y }].sort((a, b) => a.x - b.x);
    const addedIndex = newPoints.findIndex((p) => p.x === x && p.y === y);
    onChangeCurves({
      ...curves,
      [activeChannel]: newPoints,
    });
    setSelectedPointIndex(addedIndex);
  };

  const handleDeletePoint = (index: number) => {
    if (index === 0 || index === currentPoints.length - 1) return; // Cannot delete endpoints
    const newPoints = currentPoints.filter((_, i) => i !== index);
    onChangeCurves({
      ...curves,
      [activeChannel]: newPoints,
    });
    setSelectedPointIndex(null);
  };

  const handleResetChannel = () => {
    onChangeCurves({
      ...curves,
      [activeChannel]: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
    });
    setSelectedPointIndex(null);
  };

  const handleResetAll = () => {
    onChangeCurves(DEFAULT_CURVES);
    setSelectedPointIndex(null);
  };

  const applyPreset = (presetPoints: CurvePoint[]) => {
    onChangeCurves({
      ...curves,
      [activeChannel]: presetPoints,
    });
    setSelectedPointIndex(null);
  };

  useEffect(() => {
    if (draggingIndex === null) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const coords = getCoordsFromEvent(e);
      if (!coords) return;

      const pts = [...currentPoints];
      const isFirst = draggingIndex === 0;
      const isLast = draggingIndex === pts.length - 1;

      // Lock X coordinate for endpoints
      const newX = isFirst ? 0 : isLast ? 255 : coords.x;
      const newY = coords.y;

      pts[draggingIndex] = { x: newX, y: newY };
      onChangeCurves({
        ...curves,
        [activeChannel]: pts,
      });
    };

    const handlePointerUp = () => {
      setDraggingIndex(null);
      // Re-sort points ascending by X on release
      const sorted = [...currentPoints].sort((a, b) => a.x - b.x);
      onChangeCurves({
        ...curves,
        [activeChannel]: sorted,
      });
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("touchend", handlePointerUp);

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [draggingIndex, currentPoints, curves, activeChannel, onChangeCurves, getCoordsFromEvent]);

  const channelStyle = CHANNEL_COLORS[activeChannel];

  return (
    <div className="flex flex-col gap-4 select-none font-mono">
      {/* Channel Switcher */}
      <div className="flex items-center justify-between gap-1 p-1 bg-[#18191e] rounded-lg border border-[#26272b]">
        {(["rgb", "red", "green", "blue"] as CurveChannel[]).map((ch) => (
          <button
            key={ch}
            onClick={() => {
              setActiveChannel(ch);
              setSelectedPointIndex(null);
            }}
            className={`
              flex-1 py-1 text-xs rounded font-bold uppercase transition-all duration-150 border cursor-pointer
              ${
                activeChannel === ch
                  ? `${CHANNEL_COLORS[ch].activeBg} ${CHANNEL_COLORS[ch].text}`
                  : "border-transparent text-[#9a9d9a] hover:text-[#f0f0ec] hover:bg-[#26272b]/30"
              }
            `}
          >
            {ch === "rgb" ? "RGB" : ch[0]}
          </button>
        ))}
      </div>

      {/* Interactive SVG Curve Box */}
      <div className="relative aspect-square w-full bg-[#121316] rounded-lg border border-[#26272b] p-2 overflow-hidden shadow-inner flex items-center justify-center">
        <svg
          ref={svgRef}
          viewBox="0 0 255 255"
          className="w-full h-full cursor-crosshair overflow-visible touch-none"
          onClick={handleSvgClick}
        >
          {/* Grid lines */}
          <line x1="0" y1="64" x2="255" y2="64" stroke="#26272b" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1="128" x2="255" y2="128" stroke="#33353d" strokeWidth="1" />
          <line x1="0" y1="192" x2="255" y2="192" stroke="#26272b" strokeWidth="1" strokeDasharray="3 3" />

          <line x1="64" y1="0" x2="64" y2="255" stroke="#26272b" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="128" y1="0" x2="128" y2="255" stroke="#33353d" strokeWidth="1" />
          <line x1="192" y1="0" x2="192" y2="255" stroke="#26272b" strokeWidth="1" strokeDasharray="3 3" />

          {/* Diagonal Reference */}
          <line x1="0" y1="255" x2="255" y2="0" stroke="#3a3d46" strokeWidth="1" strokeDasharray="4 4" />

          {/* Spline Curve Path */}
          <path
            d={pathD}
            fill="none"
            stroke={channelStyle.stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Control Points */}
          {currentPoints.map((pt, idx) => {
            const isSelected = selectedPointIndex === idx;
            const svgX = pt.x;
            const svgY = 255 - pt.y;

            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseDown={(e) => handlePointPointerDown(idx, e)}
                onTouchStart={(e) => handlePointPointerDown(idx, e)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleDeletePoint(idx);
                }}
              >
                {/* Hit target */}
                <circle cx={svgX} cy={svgY} r="14" fill="transparent" />

                {/* Point ring & center */}
                <circle
                  cx={svgX}
                  cy={svgY}
                  r={isSelected ? "6" : "4.5"}
                  fill={channelStyle.fill}
                  stroke="#121316"
                  strokeWidth="2"
                  className="transition-transform duration-100 hover:scale-125"
                />
                {isSelected && (
                  <circle
                    cx={svgX}
                    cy={svgY}
                    r="9"
                    fill="none"
                    stroke={channelStyle.stroke}
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating coordinates indicator */}
        {selectedPointIndex !== null && currentPoints[selectedPointIndex] && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-sm border border-white/10 rounded text-[10px] text-[#f0f0ec]">
            In: {currentPoints[selectedPointIndex].x} / Out: {currentPoints[selectedPointIndex].y}
          </div>
        )}
      </div>

      {/* Action Controls & Presets */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-[11px] text-[#9a9d9a]">
          Click line to add point. Double click to delete.
        </span>
        <button
          onClick={handleResetChannel}
          className="text-[11px] text-[#4b9fef] hover:underline cursor-pointer"
        >
          Reset {activeChannel.toUpperCase()}
        </button>
      </div>

      {/* Curve Presets */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] text-[#9a9d9a] uppercase font-bold tracking-wider">
          Curve Presets
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {CURVE_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p.points)}
              className="px-2.5 py-1.5 text-[11px] text-left rounded bg-[#18191e] border border-[#26272b] text-[#f0f0ec] hover:border-[#4b9fef]/60 hover:bg-[#4b9fef]/10 transition-colors cursor-pointer truncate"
            >
              {p.name}
            </button>
          ))}
          <button
            onClick={handleResetAll}
            className="px-2.5 py-1.5 text-[11px] text-left rounded bg-[#18191e] border border-red-500/30 text-red-400 hover:bg-red-500/15 transition-colors cursor-pointer"
          >
            Reset All Curves
          </button>
        </div>
      </div>
    </div>
  );
});

export default CurvesTool;
