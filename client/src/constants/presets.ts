import { PhotoPreset, Adjustments, CurvesData, PresetLayer } from "@/types/editor";
import { DEFAULT_CURVES } from "@/components/CurvesTool";

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  exposure: 0,
  brightness: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  saturation: 0,
  vibrance: 0,
  temperature: 0,
  tint: 0,
  sharpness: 0,
  clarity: 0,
  blur: 0,
  grain: 0,
  vignette: 0,
};

export interface StackablePresetItem {
  id: string;
  name: string;
  category: "BASIC" | "PORTRAIT" | "LANDSCAPE" | "MOOD & FILM" | "BLACK & WHITE";
  swatchGradient: string; // Flat color swatch or gradient chip hint
  values: Partial<Adjustments>;
}

export const STACKABLE_PRESET_CATEGORIES = [
  "BASIC",
  "PORTRAIT",
  "LANDSCAPE",
  "MOOD & FILM",
  "BLACK & WHITE",
] as const;

/**
 * Phase 3 Library:
 * Exposure in stops mapped to -100..+100 scale (where 1 stop = 20 units, e.g. +0.25 stops = +5 units).
 * All other controls are on -100..+100 scale.
 */
export const STACKABLE_PRESETS: StackablePresetItem[] = [
  // --- BASIC ---
  {
    id: "clean_and_bright",
    name: "Clean & Bright",
    category: "BASIC",
    swatchGradient: "from-sky-400 to-indigo-500",
    values: {
      exposure: 5, // +0.25 stops
      brightness: 8,
      contrast: 10,
      highlights: -20,
      shadows: 25,
      whites: 10,
      blacks: -5,
      saturation: 5,
      vibrance: 15,
    },
  },
  {
    id: "punch",
    name: "Punch",
    category: "BASIC",
    swatchGradient: "from-amber-400 to-rose-500",
    values: {
      contrast: 25,
      highlights: -15,
      shadows: 10,
      whites: 15,
      blacks: -15,
      saturation: 10,
      vibrance: 20,
    },
  },
  {
    id: "soft_matte",
    name: "Soft Matte",
    category: "BASIC",
    swatchGradient: "from-stone-400 to-stone-600",
    values: {
      exposure: 2, // +0.10 stops
      contrast: -15,
      highlights: -15,
      shadows: 20,
      whites: -10,
      blacks: 25,
      saturation: -8,
      vibrance: 5,
    },
  },

  // --- PORTRAIT ---
  {
    id: "portrait_glow",
    name: "Portrait Glow",
    category: "PORTRAIT",
    swatchGradient: "from-orange-300 to-pink-500",
    values: {
      exposure: 4, // +0.20 stops
      brightness: 5,
      contrast: -5,
      highlights: -25,
      shadows: 20,
      whites: 5,
      temperature: 8,
      tint: 3,
      saturation: -3,
      vibrance: 12,
    },
  },
  {
    id: "warm_skin",
    name: "Warm Skin",
    category: "PORTRAIT",
    swatchGradient: "from-amber-300 to-orange-500",
    values: {
      exposure: 2, // +0.10 stops
      contrast: 8,
      highlights: -15,
      shadows: 12,
      temperature: 14,
      tint: 4,
      saturation: 4,
      vibrance: 10,
    },
  },

  // --- LANDSCAPE ---
  {
    id: "vivid_landscape",
    name: "Vivid Landscape",
    category: "LANDSCAPE",
    swatchGradient: "from-emerald-400 to-teal-600",
    values: {
      contrast: 20,
      highlights: -30,
      shadows: 30,
      whites: 15,
      blacks: -20,
      temperature: -3,
      saturation: 12,
      vibrance: 30,
    },
  },
  {
    id: "golden_hour",
    name: "Golden Hour",
    category: "LANDSCAPE",
    swatchGradient: "from-yellow-400 via-amber-500 to-orange-600",
    values: {
      exposure: 3, // +0.15 stops
      contrast: 12,
      highlights: -20,
      shadows: 15,
      whites: 5,
      blacks: -8,
      temperature: 28,
      tint: 6,
      saturation: 8,
      vibrance: 18,
    },
  },

  // --- MOOD & FILM ---
  {
    id: "cinematic",
    name: "Cinematic",
    category: "MOOD & FILM",
    swatchGradient: "from-teal-500 to-slate-800",
    values: {
      contrast: 18,
      highlights: -25,
      shadows: 10,
      whites: -5,
      blacks: -15,
      temperature: -8,
      tint: -4,
      saturation: -10,
      vibrance: 8,
    },
  },
  {
    id: "vintage_fade",
    name: "Vintage Fade",
    category: "MOOD & FILM",
    swatchGradient: "from-amber-200 via-rose-300 to-slate-600",
    values: {
      exposure: 1, // +0.05 stops
      contrast: -10,
      highlights: -20,
      shadows: 25,
      whites: -15,
      blacks: 30,
      temperature: 15,
      tint: 5,
      saturation: -18,
      vibrance: -5,
    },
  },
  {
    id: "moody_dark",
    name: "Moody Dark",
    category: "MOOD & FILM",
    swatchGradient: "from-indigo-900 via-slate-800 to-zinc-950",
    values: {
      exposure: -8, // -0.40 stops
      contrast: 22,
      highlights: -30,
      shadows: -10,
      whites: -10,
      blacks: -20,
      temperature: -6,
      saturation: -12,
      vibrance: 5,
    },
  },
  {
    id: "cool_tone",
    name: "Cool Tone",
    category: "MOOD & FILM",
    swatchGradient: "from-cyan-400 to-blue-600",
    values: {
      contrast: 8,
      temperature: -22,
      tint: -3,
      vibrance: 10,
    },
  },

  // --- BLACK & WHITE ---
  {
    id: "bw_classic",
    name: "B&W Classic",
    category: "BLACK & WHITE",
    swatchGradient: "from-zinc-300 to-zinc-800",
    values: {
      saturation: -100,
      contrast: 20,
      highlights: -15,
      shadows: 10,
      whites: 10,
      blacks: -10,
    },
  },
  {
    id: "bw_high_contrast",
    name: "B&W High Contrast",
    category: "BLACK & WHITE",
    swatchGradient: "from-zinc-100 to-black",
    values: {
      saturation: -100,
      contrast: 40,
      highlights: -20,
      whites: 20,
      blacks: -30,
    },
  },
];

export const PRESET_DEFINITIONS_MAP: Record<string, Partial<Adjustments>> = STACKABLE_PRESETS.reduce(
  (acc, p) => {
    acc[p.id] = p.values;
    return acc;
  },
  {} as Record<string, Partial<Adjustments>>
);

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

/**
 * Pure function to calculate effective adjustment values from base slider values + stackable preset layers.
 * Additive composition: effective = clamp(base + sum_over_visible(presetValue * amount / 100), min, max).
 */
export function calculateEffectiveAdjustments(
  base: Adjustments,
  layers: PresetLayer[]
): Adjustments {
  if (!layers || layers.length === 0) return { ...base };

  const effective = { ...base };

  for (const layer of layers) {
    if (!layer.visible || layer.amount === 0) continue;
    const factor = layer.amount / 100;
    const presetValues = PRESET_DEFINITIONS_MAP[layer.presetId];
    if (!presetValues) continue;

    for (const [k, val] of Object.entries(presetValues)) {
      const key = k as keyof Adjustments;
      if (typeof val === "number" && effective[key] !== undefined) {
        effective[key] = (effective[key] as number) + val * factor;
      }
    }
  }

  // Strictly clamp all adjustments to their supported min/max ranges
  effective.exposure = clamp(effective.exposure, -100, 100);
  effective.brightness = clamp(effective.brightness, -100, 100);
  effective.contrast = clamp(effective.contrast, -100, 100);
  effective.highlights = clamp(effective.highlights, -100, 100);
  effective.shadows = clamp(effective.shadows, -100, 100);
  effective.whites = clamp(effective.whites, -100, 100);
  effective.blacks = clamp(effective.blacks, -100, 100);
  effective.saturation = clamp(effective.saturation, -100, 100);
  effective.vibrance = clamp(effective.vibrance, -100, 100);
  effective.temperature = clamp(effective.temperature, -100, 100);
  effective.tint = clamp(effective.tint, -100, 100);
  effective.clarity = clamp(effective.clarity ?? 0, -100, 100);
  effective.sharpness = clamp(effective.sharpness ?? 0, 0, 100);
  effective.blur = clamp(effective.blur ?? 0, 0, 100);
  effective.grain = clamp(effective.grain ?? 0, 0, 100);
  effective.vignette = clamp(effective.vignette ?? 0, -100, 100);

  return effective;
}

export const PRESET_CATEGORIES = [
  "All",
  "Recommended",
  "Portrait",
  "Product",
  "Lifestyle",
  "Cinematic",
  "Black & White",
] as const;


export const PHOTO_PRESETS: PhotoPreset[] = [
  // --- 1. RECOMMENDED ---
  {
    id: "auto_enhance",
    name: "Auto Enhance",
    category: "Recommended",
    tag: "AUTO",
    description: "Balanced dynamic range recovery with natural color vibrance",
    previewBg: "from-[#0284c7] via-[#0369a1] to-[#0c4a6e]",
    adjustments: {
      ...DEFAULT_ADJUSTMENTS,
      exposure: 5,
      contrast: 8,
      highlights: -12,
      shadows: 14,
      saturation: 4,
      whites: 6,
      blacks: -4,
      vibrance: 8,
      clarity: 4,
    },
  },
  {
    id: "clean",
    name: "Clean",
    category: "Recommended",
    tag: "CLEAN",
    description: "Neutral, true-to-life tones with gentle highlight control",
    previewBg: "from-[#3b82f6] via-[#1d4ed8] to-[#1e1b4b]",
    adjustments: {
      ...DEFAULT_ADJUSTMENTS,
      exposure: 3,
      contrast: 5,
      highlights: -8,
      shadows: 10,
      saturation: -2,
      whites: 4,
      blacks: -2,
      clarity: 4,
    },
  },
  {
    id: "vivid",
    name: "Vivid",
    category: "Recommended",
    tag: "VIVID",
    description: "Punchy color richness and boosted midtone contrast",
    previewBg: "from-[#f59e0b] via-[#ef4444] to-[#7c2d12]",
    adjustments: {
      ...DEFAULT_ADJUSTMENTS,
      exposure: 2,
      contrast: 14,
      highlights: -10,
      shadows: 8,
      saturation: 18,
      vibrance: 12,
      temperature: 2,
      clarity: 6,
      whites: 8,
    },
  },

  // --- 2. PORTRAIT ---
  {
    id: "portrait",
    name: "Portrait",
    category: "Portrait",
    tag: "SKIN",
    description: "Softened skin tones with gentle highlight preservation",
    previewBg: "from-[#fb923c] via-[#ea580c] to-[#7c2d12]",
    adjustments: {
      ...DEFAULT_ADJUSTMENTS,
      exposure: 4,
      contrast: -3,
      highlights: -12,
      shadows: 12,
      saturation: 3,
      vibrance: 8,
      temperature: 3,
      clarity: -4,
    },
  },
  {
    id: "warm_portrait",
    name: "Golden Hour Glow",
    category: "Portrait",
    tag: "GOLDEN",
    description: "Luminous amber warm tones and gentle edge vignette",
    previewBg: "from-[#d97706] via-[#b45309] to-[#451a03]",
    adjustments: {
      ...DEFAULT_ADJUSTMENTS,
      exposure: 6,
      contrast: 6,
      highlights: -10,
      shadows: 14,
      saturation: 8,
      vibrance: 14,
      temperature: 16,
      tint: 4,
      vignette: -12,
      clarity: -2,
    },
  },
  {
    id: "soft_editorial",
    name: "Soft Editorial",
    category: "Portrait",
    tag: "STUDIO",
    description: "High-end studio fashion look with lowered local contrast",
    previewBg: "from-[#f472b6] via-[#db2777] to-[#831843]",
    adjustments: {
      ...DEFAULT_ADJUSTMENTS,
      exposure: 5,
      contrast: -5,
      highlights: -15,
      shadows: 16,
      saturation: -4,
      vibrance: 6,
      temperature: 2,
      tint: 4,
      clarity: -8,
      grain: 8,
    },
  },

  // --- 3. PRODUCT ---
  {
    id: "product_clean",
    name: "Product Clean",
    category: "Product",
    tag: "COMMERCIAL",
    description: "Crisp product definition with bright specular highlights and deep blacks",
    previewBg: "from-[#10b981] via-[#047857] to-[#064e3b]",
    adjustments: {
      ...DEFAULT_ADJUSTMENTS,
      exposure: 5,
      contrast: 10,
      highlights: -15,
      shadows: 12,
      whites: 10,
      blacks: -5,
      saturation: 3,
      sharpness: 8,
      clarity: 5,
    },
  },
  {
    id: "food",
    name: "Food & Culinary",
    category: "Product",
    tag: "CULINARY",
    description: "Warm, appetizing colors with rich texture and enhanced vibrance",
    previewBg: "from-[#eab308] via-[#ca8a04] to-[#713f12]",
    adjustments: {
      ...DEFAULT_ADJUSTMENTS,
      exposure: 4,
      contrast: 12,
      highlights: -10,
      shadows: 10,
      saturation: 14,
      vibrance: 10,
      temperature: 6,
      clarity: 8,
      whites: 6,
    },
  },
  {
    id: "studio_white",
    name: "Packshot Studio",
    category: "Product",
    tag: "E-COMM",
    description: "Clean whites and sharp micro-texture for e-commerce catalog photos",
    previewBg: "from-[#94a3b8] via-[#64748b] to-[#1e293b]",
    adjustments: {
      ...DEFAULT_ADJUSTMENTS,
      exposure: 6,
      contrast: 14,
      highlights: -18,
      shadows: 10,
      whites: 14,
      blacks: -6,
      saturation: -2,
      sharpness: 12,
      clarity: 8,
    },
  },

  // --- 4. LIFESTYLE ---
  {
    id: "warm",
    name: "Warm Sunlight",
    category: "Lifestyle",
    tag: "WARM",
    description: "Comfortable amber warmth with lifted shadows",
    previewBg: "from-[#f97316] via-[#c2410c] to-[#7c2d12]",
    adjustments: {
      ...DEFAULT_ADJUSTMENTS,
      exposure: 2,
      contrast: 5,
      highlights: -8,
      shadows: 8,
      saturation: 5,
      temperature: 10,
      vibrance: 6,
    },
  },
  {
    id: "cool",
    name: "Nordic Cool",
    category: "Lifestyle",
    tag: "COOL",
    description: "Crisp atmospheric blues and modern urban tones",
    previewBg: "from-[#06b6d4] via-[#0891b2] to-[#164e63]",
    adjustments: {
      ...DEFAULT_ADJUSTMENTS,
      exposure: 1,
      contrast: 7,
      highlights: -6,
      shadows: 6,
      saturation: 2,
      temperature: -10,
    },
  },
  {
    id: "matte",
    name: "Matte Film",
    category: "Lifestyle",
    tag: "MATTE",
    description: "Raised blacks with analog film aesthetic and subtle grain",
    previewBg: "from-[#854d0e] via-[#713f12] to-[#1c1917]",
    adjustments: {
      ...DEFAULT_ADJUSTMENTS,
      exposure: 3,
      contrast: -8,
      highlights: -5,
      shadows: 12,
      whites: -6,
      blacks: 18,
      saturation: -5,
      clarity: -4,
      grain: 16,
    },
  },

  // --- 5. CINEMATIC ---
  {
    id: "cinematic",
    name: "Cinematic Teal",
    category: "Cinematic",
    tag: "CINEMA",
    description: "Dramatic high contrast movie grade with edge vignette",
    previewBg: "from-[#0d9488] via-[#115e59] to-[#042f2e]",
    adjustments: {
      ...DEFAULT_ADJUSTMENTS,
      exposure: -2,
      contrast: 18,
      highlights: -18,
      shadows: 5,
      whites: 4,
      blacks: -4,
      saturation: -4,
      temperature: -3,
      tint: 2,
      vignette: 12,
      grain: 8,
    },
  },
  {
    id: "night",
    name: "Night Vision",
    category: "Cinematic",
    tag: "NIGHT",
    description: "Optimized for low-light cityscapes and evening photography",
    previewBg: "from-[#4338ca] via-[#312e81] to-[#0f172a]",
    adjustments: {
      ...DEFAULT_ADJUSTMENTS,
      exposure: -3,
      contrast: 12,
      highlights: -20,
      shadows: 15,
      saturation: 5,
      temperature: -4,
      tint: -2,
      vignette: 8,
      clarity: 10,
    },
  },
  {
    id: "cyberpunk",
    name: "Cyber Neon",
    category: "Cinematic",
    tag: "NEON",
    description: "Vibrant neon magenta and cyan grade with stylized contrast",
    previewBg: "from-[#ec4899] via-[#8b5cf6] to-[#1e1b4b]",
    adjustments: {
      ...DEFAULT_ADJUSTMENTS,
      exposure: 2,
      contrast: 22,
      highlights: -14,
      shadows: 8,
      saturation: 25,
      vibrance: 18,
      temperature: -8,
      tint: 20,
      vignette: 18,
      clarity: 12,
    },
  },

  // --- 6. BLACK & WHITE ---
  {
    id: "bw_classic",
    name: "Black & White",
    category: "Black & White",
    tag: "B&W",
    description: "Classic high dynamic range monochrome conversion",
    previewBg: "from-[#71717a] via-[#3f3f46] to-[#09090b]",
    adjustments: {
      ...DEFAULT_ADJUSTMENTS,
      contrast: 15,
      highlights: -10,
      shadows: 10,
      whites: 8,
      blacks: -8,
      saturation: -100,
      clarity: 8,
    },
  },
  {
    id: "bw_high_contrast",
    name: "Silver Gelatin",
    category: "Black & White",
    tag: "SILVER",
    description: "Deep blacks, crisp specular whites, and analog film grain",
    previewBg: "from-[#52525b] via-[#27272a] to-[#000000]",
    adjustments: {
      ...DEFAULT_ADJUSTMENTS,
      exposure: 2,
      contrast: 28,
      highlights: -14,
      shadows: 6,
      whites: 14,
      blacks: -14,
      saturation: -100,
      sharpness: 10,
      clarity: 14,
      grain: 22,
    },
  },
  {
    id: "bw_moody",
    name: "Moody Low-Key",
    category: "Black & White",
    tag: "LOW-KEY",
    description: "Dramatic shadows and rich tonal gradients",
    previewBg: "from-[#3f3f46] via-[#18181b] to-[#000000]",
    adjustments: {
      ...DEFAULT_ADJUSTMENTS,
      exposure: -4,
      contrast: 22,
      highlights: -24,
      shadows: -4,
      whites: 6,
      blacks: -12,
      saturation: -100,
      vignette: 24,
      grain: 14,
    },
  },
];
