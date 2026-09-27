export type ToolType =
  | "select"
  | "move"
  | "crop"
  | "adjust"
  | "filter"
  | "text"
  | "layers";

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
