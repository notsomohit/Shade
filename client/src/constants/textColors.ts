/** Shared color palette used for text color, stroke, glow and shadow pickers */
export interface ColorSwatch {
  name: string;
  hex: string;
  group: "popular" | "among-us";
}

export const TEXT_COLOR_SWATCHES: ColorSwatch[] = [
  // Popular named colors
  { name: "White", hex: "#FFFFFF", group: "popular" },
  { name: "Black", hex: "#000000", group: "popular" },
  { name: "Tomato", hex: "#FF6347", group: "popular" },
  { name: "Coral", hex: "#FF7F50", group: "popular" },
  { name: "Gold", hex: "#FFD700", group: "popular" },
  { name: "Hot Pink", hex: "#FF69B4", group: "popular" },
  { name: "Turquoise", hex: "#40E0D0", group: "popular" },
  { name: "Royal Blue", hex: "#4169E1", group: "popular" },
  { name: "Emerald", hex: "#50C878", group: "popular" },
  { name: "Lavender", hex: "#E6E6FA", group: "popular" },
  { name: "Crimson", hex: "#DC143C", group: "popular" },
  { name: "Sky Blue", hex: "#87CEEB", group: "popular" },

  // Among Us crewmate colors
  { name: "AU Red", hex: "#C51111", group: "among-us" },
  { name: "AU Blue", hex: "#132ED1", group: "among-us" },
  { name: "AU Green", hex: "#117F2D", group: "among-us" },
  { name: "AU Pink", hex: "#ED54BA", group: "among-us" },
  { name: "AU Orange", hex: "#EF7D0D", group: "among-us" },
  { name: "AU Yellow", hex: "#F5F557", group: "among-us" },
  { name: "AU Black", hex: "#3F474E", group: "among-us" },
  { name: "AU White", hex: "#D6E0F0", group: "among-us" },
  { name: "AU Purple", hex: "#6B2FBC", group: "among-us" },
  { name: "AU Brown", hex: "#71491E", group: "among-us" },
  { name: "AU Cyan", hex: "#38FEDC", group: "among-us" },
  { name: "AU Lime", hex: "#50EF39", group: "among-us" },
];
