export type ToolType =
  | "select"
  | "crop"
  | "adjust"
  | "filter"
  | "text"
  | "layers";

export interface Adjustments {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  exposure: number; // -100 to 100
}

export interface PresetFilter {
  id: string;
  name: string;
  previewBg: string; // Tailwind gradient or CSS string for thumbnail preview
}

export interface LayerItem {
  id: string;
  name: string;
  visible: boolean;
  type: "image" | "text" | "adjustment";
}

export interface ImageMetaData {
  name: string;
  width: number;
  height: number;
  aspectRatio: number;
}
