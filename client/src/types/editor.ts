export type ToolType =
  | "select"
  | "crop"
  | "adjust"
  | "selective"
  | "curves"
  | "filter"
  | "text"
  | "layers"
  | "export";

export type GridMode = "none" | "grid" | "thirds";

export interface Adjustments {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  exposure: number; // -100 to 100
  temperature: number; // -100 (Cool/Blue) to 100 (Warm/Amber)
  tint: number; // -100 (Green) to 100 (Magenta)
  structure: number; // -100 (Soft/Smooth) to 100 (High Texture/Clarity)
  vignette: number; // -100 (Lighten edges) to 100 (Darken edges)
  grain: number; // 0 to 100 (Film grain)
}

export interface SelectivePoint {
  id: string;
  x: number; // 0 to 1 normalized
  y: number; // 0 to 1 normalized
  radius: number; // 0.05 to 0.6 normalized relative to image size
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  structure: number; // -100 to 100
}

export interface CurvePoint {
  x: number; // 0 to 255
  y: number; // 0 to 255
}

export interface CurvesData {
  rgb: CurvePoint[];
  red: CurvePoint[];
  green: CurvePoint[];
  blue: CurvePoint[];
}

export interface FilterSettings {
  id: string; // e.g. 'vintage', 'sepia', 'mono', 'cyber'
  name: string;
  intensity: number; // 0 to 100
}

export interface PresetFilter {
  id: string;
  name: string;
  previewBg: string;
  adjustments?: Partial<Adjustments>;
}

export interface TextOverlay {
  id: string;
  text: string;
  fontSize: number; // px
  fontFamily: string;
  fontCategory: "standard" | "design" | "artsy" | "display" | "Standard" | "Design" | "Artsy" | "Display";
  color: string; // hex/rgb
  x: number; // normalized 0 to 1
  y: number; // normalized 0 to 1
  visible: boolean;
}

export interface DoubleExposureData {
  imageUrl: string;
  opacity: number; // 0 to 1
  blendMode: "normal" | "screen" | "multiply" | "overlay" | "soft-light";
}

export interface LayerItem {
  id: string;
  name: string;
  visible: boolean;
  type: "image" | "text" | "adjustment" | "double-exposure";
  textData?: TextOverlay;
  doubleExposureData?: DoubleExposureData;
}

export interface ImageMetaData {
  name: string;
  width: number;
  height: number;
  aspectRatio: number;
}

export interface ExportSettings {
  format: "image/png" | "image/jpeg" | "image/webp";
  quality: number; // 0.1 to 1.0
}
