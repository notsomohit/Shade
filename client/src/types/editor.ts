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
  previewBg: string;
}

export interface TextOverlay {
  id: string;
  text: string;
  fontSize: number; // px
  color: string; // hex/rgb
  x: number; // normalized 0 to 1
  y: number; // normalized 0 to 1
  visible: boolean;
}

export interface LayerItem {
  id: string;
  name: string;
  visible: boolean;
  type: "image" | "text" | "adjustment";
  textData?: TextOverlay;
}

export interface ImageMetaData {
  name: string;
  width: number;
  height: number;
  aspectRatio: number;
}
