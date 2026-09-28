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
  exposure: number; // -100 to 100 (maps to -5 EV to +5 EV)
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  highlights: number; // -100 to 100
  shadows: number; // -100 to 100
  whites: number; // -100 to 100
  blacks: number; // -100 to 100
  saturation: number; // -100 to 100
  vibrance: number; // -100 to 100
  temperature: number; // -100 (Cool/Blue) to 100 (Warm/Amber)
  tint: number; // -100 (Green) to 100 (Magenta)
  sharpness: number; // 0 to 100
  clarity: number; // -100 to 100
  blur: number; // 0 to 100
  grain: number; // 0 to 100
  vignette: number; // -100 (Lighten) to 100 (Darken)
  structure?: number; // legacy alias for clarity
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

export type PresetCategory =
  | "Recommended"
  | "Portrait"
  | "Product"
  | "Lifestyle"
  | "Cinematic"
  | "Black & White";

export interface PhotoPreset {
  id: string;
  name: string;
  category: PresetCategory;
  description?: string;
  tag?: string;
  previewBg?: string;
  adjustments: {
    exposure: number;
    brightness: number;
    contrast: number;
    highlights: number;
    shadows: number;
    whites: number;
    blacks: number;
    saturation: number;
    vibrance: number;
    temperature: number;
    tint: number;
    sharpness: number;
    clarity: number;
    blur: number;
    grain: number;
    vignette: number;
  };
  curves?: CurvesData;
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

export interface PresetLayer {
  id: string;
  presetId: string;
  name: string;
  amount: number; // 0 to 100, default 100
  visible: boolean;
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

