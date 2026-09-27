import { Adjustments, FilterSettings, SelectivePoint } from "@/types/editor";
import { generateCurveLUT } from "@/utils/curveUtils";

export interface ProcessImageMessage {
  type: "PROCESS_IMAGE";
  id: number;
  width: number;
  height: number;
  buffer: ArrayBuffer;
  adjustments: Adjustments;
  filter: FilterSettings;
  selectivePoints: SelectivePoint[];
  curves: {
    rgb: { x: number; y: number }[];
    red: { x: number; y: number }[];
    green: { x: number; y: number }[];
    blue: { x: number; y: number }[];
  };
}

export function processPixelData(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  adj: Adjustments,
  filter: FilterSettings,
  selectivePoints: SelectivePoint[],
  curves: {
    rgb: { x: number; y: number }[];
    red: { x: number; y: number }[];
    green: { x: number; y: number }[];
    blue: { x: number; y: number }[];
  }
) {
  const len = data.length;
  const numPixels = width * height;

  // Pre-generate Curves LUTs (256-bytes each)
  const lutMaster = generateCurveLUT(curves?.rgb || []);
  const lutRed = generateCurveLUT(curves?.red || []);
  const lutGreen = generateCurveLUT(curves?.green || []);
  const lutBlue = generateCurveLUT(curves?.blue || []);

  const hasCurves =
    (curves?.rgb && curves.rgb.length > 2) ||
    (curves?.red && curves.red.length > 2) ||
    (curves?.green && curves.green.length > 2) ||
    (curves?.blue && curves.blue.length > 2) ||
    (curves?.rgb && (curves.rgb[0].y !== 0 || curves.rgb[1]?.y !== 255));

  // Global Factors
  const brightnessOffset = Math.round((adj.brightness / 100) * 60);
  const contrastFactor = 1 + (adj.contrast / 100) * 0.65;
  const exposureFactor = Math.pow(2, (adj.exposure / 100) * 0.6);
  const satMult = 1 + (adj.saturation / 100) * 0.75;

  // White balance factors
  const tempFactor = adj.temperature / 100; // -1 to 1
  const tintFactor = adj.tint / 100; // -1 to 1

  // Structure / Clarity (approximate via local high-pass on luminance if structure !== 0)
  let structureMap: Float32Array | null = null;
  if (adj.structure !== 0 && numPixels > 0) {
    structureMap = new Float32Array(numPixels);
    // Extract luminance
    for (let i = 0; i < numPixels; i++) {
      const idx = i * 4;
      structureMap[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    }
  }

  // Selective points in pixel coordinates
  const activePoints = (selectivePoints || []).map((p) => {
    const cx = p.x * width;
    const cy = p.y * height;
    const radiusPx = Math.max(10, p.radius * Math.min(width, height));
    return {
      ...p,
      cx,
      cy,
      radiusPx,
      radiusSq: radiusPx * radiusPx,
      bOffset: Math.round((p.brightness / 100) * 60),
      cFactor: 1 + (p.contrast / 100) * 0.65,
      sMult: 1 + (p.saturation / 100) * 0.75,
      strFactor: (p.structure / 100) * 0.5,
    };
  });

  const hasSelective = activePoints.length > 0;
  const hasVignette = adj.vignette !== 0;
  const vignetteAmt = adj.vignette / 100;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadiusSq = (centerX * centerX + centerY * centerY) * 1.1;

  const hasGrain = adj.grain > 0;
  const grainAmt = (adj.grain / 100) * 32;

  // Single fast pass over all pixels
  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    const pixelIdx = i >> 2;
    const px = pixelIdx % width;
    const py = Math.floor(pixelIdx / width);

    // 1. Exposure
    if (adj.exposure !== 0) {
      r *= exposureFactor;
      g *= exposureFactor;
      b *= exposureFactor;
    }

    // 2. White Balance (Temperature & Tint)
    if (tempFactor !== 0) {
      if (tempFactor > 0) {
        // Warm (boost Red/Amber, reduce Blue)
        r += tempFactor * 28;
        g += tempFactor * 10;
        b -= tempFactor * 24;
      } else {
        // Cool (boost Blue, reduce Red/Amber)
        r += tempFactor * 24;
        g += tempFactor * 6;
        b -= tempFactor * 32;
      }
    }
    if (tintFactor !== 0) {
      if (tintFactor > 0) {
        // Magenta (boost R & B, reduce G)
        r += tintFactor * 16;
        g -= tintFactor * 24;
        b += tintFactor * 16;
      } else {
        // Green (boost G, reduce R & B)
        r += tintFactor * 18;
        g -= tintFactor * 24;
        b += tintFactor * 18;
      }
    }

    // 3. Brightness
    if (adj.brightness !== 0) {
      r += brightnessOffset;
      g += brightnessOffset;
      b += brightnessOffset;
    }

    // 4. Contrast
    if (adj.contrast !== 0) {
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;
    }

    // 5. Saturation
    if (adj.saturation !== 0) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray + (r - gray) * satMult;
      g = gray + (g - gray) * satMult;
      b = gray + (b - gray) * satMult;
    }

    // 6. Structure / Clarity (Texture boost)
    if (structureMap && adj.structure !== 0) {
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const strDelta = (lum - 128) * (adj.structure / 100) * 0.45;
      r += strDelta;
      g += strDelta;
      b += strDelta;
    }

    // 7. Tone Curves
    if (hasCurves) {
      // Individual channels
      const cr = lutRed[Math.min(255, Math.max(0, Math.round(r)))];
      const cg = lutGreen[Math.min(255, Math.max(0, Math.round(g)))];
      const cb = lutBlue[Math.min(255, Math.max(0, Math.round(b)))];

      // Master RGB
      r = lutMaster[cr];
      g = lutMaster[cg];
      b = lutMaster[cb];
    }

    // 8. Selective Adjustments
    if (hasSelective) {
      for (let j = 0; j < activePoints.length; j++) {
        const pt = activePoints[j];
        const dx = px - pt.cx;
        const dy = py - pt.cy;
        const distSq = dx * dx + dy * dy;

        if (distSq < pt.radiusSq) {
          const dist = Math.sqrt(distSq);
          const normDist = dist / pt.radiusPx;
          // Smooth cosine falloff
          const weight = Math.cos((normDist * Math.PI) / 2);
          const w2 = weight * weight;

          // Local Brightness
          if (pt.brightness !== 0) {
            const bDelta = pt.bOffset * w2;
            r += bDelta;
            g += bDelta;
            b += bDelta;
          }

          // Local Contrast
          if (pt.contrast !== 0) {
            const localC = 1 + (pt.cFactor - 1) * w2;
            r = localC * (r - 128) + 128;
            g = localC * (g - 128) + 128;
            b = localC * (b - 128) + 128;
          }

          // Local Saturation
          if (pt.saturation !== 0) {
            const localSat = 1 + (pt.sMult - 1) * w2;
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            r = gray + (r - gray) * localSat;
            g = gray + (g - gray) * localSat;
            b = gray + (b - gray) * localSat;
          }

          // Local Structure
          if (pt.structure !== 0) {
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            const sDelta = (lum - 128) * pt.strFactor * w2;
            r += sDelta;
            g += sDelta;
            b += sDelta;
          }
        }
      }
    }

    // 9. Vignette (Darkening / Lightening edges)
    if (hasVignette) {
      const dx = px - centerX;
      const dy = py - centerY;
      const dSq = dx * dx + dy * dy;
      const normD = Math.min(1, Math.sqrt(dSq / maxRadiusSq));
      // Smooth feather
      if (normD > 0.3) {
        const vFactor = ((normD - 0.3) / 0.7);
        const vWeight = vFactor * vFactor;
        if (vignetteAmt > 0) {
          // Darken
          const darken = 1 - vignetteAmt * 0.75 * vWeight;
          r *= darken;
          g *= darken;
          b *= darken;
        } else {
          // Lighten
          const lighten = 1 + Math.abs(vignetteAmt) * 0.5 * vWeight;
          r *= lighten;
          g *= lighten;
          b *= lighten;
        }
      }
    }

    // 10. Film Grain
    if (hasGrain) {
      // Fast deterministic PRNG noise
      const noise = ((Math.sin(px * 12.9898 + py * 78.233) * 43758.5453) % 1) - 0.5;
      const gOffset = noise * grainAmt;
      r += gOffset;
      g += gOffset;
      b += gOffset;
    }

    // 11. Presets LUTs
    if (filter.id !== "original" && filter.intensity > 0) {
      const factor = filter.intensity / 100;
      let nr = r;
      let ng = g;
      let nb = b;

      switch (filter.id) {
        case "vintage":
          nr = r * 0.9 + g * 0.1;
          ng = g * 0.7 + b * 0.1;
          nb = b * 0.4 + 20;
          break;
        case "cool":
          nr = r * 0.7;
          ng = g * 0.9 + 15;
          nb = b * 1.2 + 30;
          break;
        case "mono":
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          nr = gray;
          ng = gray;
          nb = gray;
          break;
        case "warm":
          nr = r * 1.15 + 15;
          ng = g * 0.95 + 5;
          nb = b * 0.8;
          break;
        case "dramatic":
          nr = r > 128 ? Math.min(255, r * 1.2) : r * 0.8;
          ng = g > 128 ? Math.min(255, g * 1.2) : g * 0.8;
          nb = b > 128 ? Math.min(255, b * 1.2) : b * 0.8;
          break;
        case "cyber":
          nr = r * 1.2 + 20;
          ng = g * 0.6;
          nb = b * 1.3 + 30;
          break;
      }

      r = r + (nr - r) * factor;
      g = g + (ng - g) * factor;
      b = b + (nb - b) * factor;
    }

    data[i] = Math.min(255, Math.max(0, r));
    data[i + 1] = Math.min(255, Math.max(0, g));
    data[i + 2] = Math.min(255, Math.max(0, b));
  }
}

// Web Worker handler
if (typeof self !== "undefined" && typeof (self as any).addEventListener === "function") {
  self.addEventListener("message", (e: MessageEvent<ProcessImageMessage>) => {
    const { id, width, height, buffer, adjustments, filter, selectivePoints, curves } = e.data;
    const data = new Uint8ClampedArray(buffer);

    processPixelData(data, width, height, adjustments, filter, selectivePoints, curves);

    // Transfer buffer back to main thread zero-copy
    (self as any).postMessage({ id, buffer }, [buffer]);
  });
}
