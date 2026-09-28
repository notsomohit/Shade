import { Adjustments, FilterSettings, SelectivePoint, CurvesData } from "@/types/editor";
import { generateCurveLUT } from "@/utils/curveUtils";

/**
 * Background Eraser (chroma key) settings.
 * `r`, `g`, `b` are the 0-255 components of the key color.
 */
export interface BackgroundEraserParams {
  enabled: boolean;
  r: number;
  g: number;
  b: number;
  tolerance: number; // 0 to 100
}

export interface ProcessImageMessage {
  type: "PROCESS_IMAGE";
  id: number;
  width: number;
  height: number;
  buffer: ArrayBuffer;
  adjustments: Adjustments;
  filter: FilterSettings;
  selectivePoints: SelectivePoint[];
  curves: CurvesData;
  backgroundEraser?: BackgroundEraserParams;
}

/**
 * Helper smoothstep function for smooth tonal mask blending
 */
function smoothstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

/**
 * Background Eraser constants.
 * The theoretical maximum Euclidean RGB distance is sqrt(3) * 255 (~441.67).
 * The 0-100 tolerance slider maps onto 0-220 so the usable range covers
 * near-identical colors through to strongly tinted backgrounds.
 */
const MAX_RGB_DISTANCE = Math.sqrt(3) * 255;
const TOLERANCE_SPAN = 220;
const SOFT_EDGE_START = 0.8; // fraction of maxDist where the ramp begins

/**
 * Professional Image Processing Engine
 * Computes non-destructive photometric adjustments at 60 FPS
 */
export function processPixelData(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  adj: Adjustments,
  filter: FilterSettings,
  selectivePoints: SelectivePoint[],
  curves: CurvesData,
  backgroundEraser?: BackgroundEraserParams
) {
  const len = data.length;
  const numPixels = width * height;
  if (numPixels === 0 || len === 0) return;

  // 1. Pre-generate Curves LUTs (256 entries each)
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

  // 2. Spatial Passes: Blur, Clarity, Sharpness
  // If Clarity, Sharpness, or Blur are active, create a temporary luminance / blur buffer
  const clarityVal = adj.clarity ?? adj.structure ?? 0;
  const sharpnessVal = adj.sharpness ?? 0;
  const blurVal = adj.blur ?? 0;

  const needsSpatial = clarityVal !== 0 || sharpnessVal > 0 || blurVal > 0;

  let localLum: Float32Array | null = null;
  let blurredRGB: Uint8ClampedArray | null = null;

  if (blurVal > 0) {
    // Fast 2-pass separable box blur on RGB
    blurredRGB = new Uint8ClampedArray(data);
    const radius = Math.max(1, Math.min(15, Math.round((blurVal / 100) * 12)));
    boxBlurRGBA(blurredRGB, width, height, radius);
  }

  if (clarityVal !== 0 || sharpnessVal > 0) {
    // Generate low-frequency luminance map for local contrast & unsharp detail
    localLum = new Float32Array(numPixels);
    for (let i = 0; i < numPixels; i++) {
      const idx = i << 2;
      localLum[i] = 0.2126 * data[idx] + 0.7152 * data[idx + 1] + 0.0722 * data[idx + 2];
    }
    // Low-pass smooth for local baseline comparison
    const radius = clarityVal !== 0 ? Math.max(2, Math.round(Math.min(width, height) * 0.015)) : 2;
    boxBlurLuminance(localLum, width, height, radius);
  }

  // 3. Global Adjustment Factors
  // Exposure (-100 to +100) -> maps to -3.5 EV to +3.5 EV
  const evDelta = (adj.exposure / 100) * 3.5;
  const exposureMult = Math.pow(2, evDelta);

  // Brightness (-100 to +100)
  const brightnessOffset = (adj.brightness / 100) * 35;

  // Contrast (-100 to +100) -> sigmoidal slope factor
  const contrastFactor = 1 + (adj.contrast / 100) * 0.75;

  // Highlights & Shadows (-100 to +100)
  const highlightsAmt = (adj.highlights / 100) * 45;
  const shadowsAmt = (adj.shadows / 100) * 45;

  // Whites & Blacks (-100 to +100)
  const whitesAmt = (adj.whites / 100) * 40;
  const blacksAmt = (adj.blacks / 100) * 35;

  // Saturation & Vibrance (-100 to +100)
  const satFactor = 1 + (adj.saturation / 100) * 1.0;
  const vibAmt = (adj.vibrance / 100) * 1.2;

  // White Balance Temperature (-100 to +100) & Tint (-100 to +100)
  const tempFactor = adj.temperature / 100;
  const tintFactor = adj.tint / 100;

  // Selective Adjustments prep
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
      bOffset: (p.brightness / 100) * 40,
      cFactor: 1 + (p.contrast / 100) * 0.65,
      sMult: 1 + (p.saturation / 100) * 0.75,
      strFactor: (p.structure / 100) * 0.5,
    };
  });
  const hasSelective = activePoints.length > 0;

  // Vignette parameters
  const hasVignette = adj.vignette !== 0;
  const vignetteAmt = adj.vignette / 100;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadiusSq = (centerX * centerX + centerY * centerY) * 1.15;

  // Grain parameters
  const hasGrain = adj.grain > 0;
  const grainAmt = (adj.grain / 100) * 28;

  // Background Eraser (chroma key) parameters.
  // Applied last, on the final rendered color, so the key color always matches
  // what the user sees in the canvas preview. Only the alpha channel is written,
  // so the RGB of every surviving pixel is preserved exactly.
  const eraser = backgroundEraser;
  const hasEraser = !!eraser && eraser.enabled;
  const eraserKeyR = eraser ? eraser.r : 0;
  const eraserKeyG = eraser ? eraser.g : 0;
  const eraserKeyB = eraser ? eraser.b : 0;
  // Tolerance 0 collapses to an exact-colour match rather than disabling the
  // stage, so the Remove Background button is never a no-op.
  const eraserMaxDist = hasEraser
    ? Math.min(MAX_RGB_DISTANCE, (eraser!.tolerance / 100) * TOLERANCE_SPAN)
    : 0;
  const eraserSoftStart = eraserMaxDist * SOFT_EDGE_START;

  // 4. Main Pixel Processing Loop
  for (let i = 0; i < len; i += 4) {
    const pixelIdx = i >> 2;
    const px = pixelIdx % width;
    const py = (pixelIdx / width) | 0;

    let r: number;
    let g: number;
    let b: number;

    // Apply blur blend if active
    if (blurredRGB) {
      r = blurredRGB[i];
      g = blurredRGB[i + 1];
      b = blurredRGB[i + 2];
    } else {
      r = data[i];
      g = data[i + 1];
      b = data[i + 2];
    }

    // 1. Exposure (EV-scale with highlight shoulder compression)
    if (adj.exposure !== 0) {
      if (exposureMult > 1) {
        // High exposure: soft-knee shoulder to prevent harsh blown-out clipping
        r = r * exposureMult;
        g = g * exposureMult;
        b = b * exposureMult;

        if (r > 190) r = 255 - (255 - 190) * Math.exp(-(r - 190) / 65);
        if (g > 190) g = 255 - (255 - 190) * Math.exp(-(g - 190) / 65);
        if (b > 190) b = 255 - (255 - 190) * Math.exp(-(b - 190) / 65);
      } else {
        r *= exposureMult;
        g *= exposureMult;
        b *= exposureMult;
      }
    }

    // Normalized Luminance for tonal zoning
    let lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    lum = Math.max(0, Math.min(1, lum));

    // 2. Highlights / Shadows (Independent smooth zoning without global shift)
    if (adj.highlights !== 0) {
      // Highlights mask: peaks in 0.55 - 0.95 range
      const hWeight = smoothstep(0.35, 0.9, lum);
      const hDelta = highlightsAmt * hWeight;
      r += hDelta;
      g += hDelta;
      b += hDelta;
    }

    if (adj.shadows !== 0) {
      // Shadows mask: peaks in 0.05 - 0.55 range
      const sWeight = 1.0 - smoothstep(0.05, 0.65, lum);
      const sDelta = shadowsAmt * sWeight;
      r += sDelta;
      g += sDelta;
      b += sDelta;
    }

    // 3. Whites / Blacks (Endpoint tonal shaping)
    if (adj.whites !== 0) {
      // Whites mask: top specular range (0.70 to 1.0)
      const wWeight = Math.pow(Math.max(0, (lum - 0.65) / 0.35), 1.8);
      const wDelta = whitesAmt * wWeight;
      r += wDelta;
      g += wDelta;
      b += wDelta;
    }

    if (adj.blacks !== 0) {
      // Blacks mask: deep toe range (0.0 to 0.30)
      const bWeight = Math.pow(Math.max(0, (0.35 - lum) / 0.35), 1.8);
      const bDelta = blacksAmt * bWeight;
      r += bDelta;
      g += bDelta;
      b += bDelta;
    }

    // 4. Brightness (Perceptual midtone lift)
    if (adj.brightness !== 0) {
      const midtoneWeight = 1.0 - 0.5 * Math.abs(lum - 0.5);
      const bDelta = brightnessOffset * midtoneWeight;
      r += bDelta;
      g += bDelta;
      b += bDelta;
    }

    // 5. Contrast (Sigmoidal around mid-gray 128)
    if (adj.contrast !== 0) {
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;
    }

    // 6. White Balance (Planckian Temperature & Orthogonal Tint)
    if (tempFactor !== 0) {
      if (tempFactor > 0) {
        // Warm (Amber / Golden)
        r += tempFactor * 26;
        g += tempFactor * 8;
        b -= tempFactor * 22;
      } else {
        // Cool (Atmospheric Blue)
        r += tempFactor * 18;
        g += tempFactor * 4;
        b -= tempFactor * 28;
      }
    }
    if (tintFactor !== 0) {
      if (tintFactor > 0) {
        // Magenta (boost R & B, reduce G)
        r += tintFactor * 14;
        g -= tintFactor * 20;
        b += tintFactor * 14;
      } else {
        // Green (boost G, reduce R & B)
        r += tintFactor * 14;
        g -= tintFactor * 20;
        b += tintFactor * 14;
      }
    }

    // 7. Saturation & Vibrance (with Skin Tone Protection)
    if (adj.saturation !== 0 || adj.vibrance !== 0) {
      const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const maxC = Math.max(r, Math.max(g, b));
      const minC = Math.min(r, Math.min(g, b));
      const pixelSat = maxC > 0 ? (maxC - minC) / maxC : 0;

      let effectiveVibrance = vibAmt * (1.0 - pixelSat);

      // Skin Tone Protection: if warm orange/peach hues, dampen vibrance
      if (r > g && g > b && r - b < 130 && r > 40) {
        effectiveVibrance *= 0.45;
      }

      const totalSatMult = Math.max(0, satFactor + effectiveVibrance);
      r = gray + (r - gray) * totalSatMult;
      g = gray + (g - gray) * totalSatMult;
      b = gray + (b - gray) * totalSatMult;
    }

    // 8. Clarity & Sharpness
    if (localLum) {
      const currentLum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const baseLum = localLum[pixelIdx];
      const lumDiff = currentLum - baseLum;

      // Clarity: local midtone contrast
      if (clarityVal !== 0) {
        const normL = Math.max(0, Math.min(1, currentLum / 255));
        const midtoneMask = Math.max(0, 1.0 - 4.0 * (normL - 0.5) * (normL - 0.5));
        const clarityDelta = lumDiff * (clarityVal / 100) * 0.75 * midtoneMask;
        r += clarityDelta;
        g += clarityDelta;
        b += clarityDelta;
      }

      // Sharpness: unsharp mask edge boost with halo clamp
      if (sharpnessVal > 0) {
        const edgeDetail = Math.max(-28, Math.min(28, lumDiff));
        const sharpDelta = edgeDetail * (sharpnessVal / 100) * 0.85;
        r += sharpDelta;
        g += sharpDelta;
        b += sharpDelta;
      }
    }

    // 9. Tone Curves
    if (hasCurves) {
      const cr = lutRed[Math.min(255, Math.max(0, Math.round(r)))];
      const cg = lutGreen[Math.min(255, Math.max(0, Math.round(g)))];
      const cb = lutBlue[Math.min(255, Math.max(0, Math.round(b)))];

      r = lutMaster[cr];
      g = lutMaster[cg];
      b = lutMaster[cb];
    }

    // 10. Snapseed-style Radial Selective Points
    if (hasSelective) {
      for (let j = 0; j < activePoints.length; j++) {
        const pt = activePoints[j];
        const dx = px - pt.cx;
        const dy = py - pt.cy;
        const distSq = dx * dx + dy * dy;

        if (distSq < pt.radiusSq) {
          const dist = Math.sqrt(distSq);
          const normDist = dist / pt.radiusPx;
          const weight = Math.cos((normDist * Math.PI) / 2);
          const w2 = weight * weight;

          if (pt.brightness !== 0) {
            const bDelta = pt.bOffset * w2;
            r += bDelta;
            g += bDelta;
            b += bDelta;
          }

          if (pt.contrast !== 0) {
            const localC = 1 + (pt.cFactor - 1) * w2;
            r = localC * (r - 128) + 128;
            g = localC * (g - 128) + 128;
            b = localC * (b - 128) + 128;
          }

          if (pt.saturation !== 0) {
            const localSat = 1 + (pt.sMult - 1) * w2;
            const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            r = gray + (r - gray) * localSat;
            g = gray + (g - gray) * localSat;
            b = gray + (b - gray) * localSat;
          }

          if (pt.structure !== 0) {
            const curL = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            const sDelta = (curL - 128) * pt.strFactor * w2;
            r += sDelta;
            g += sDelta;
            b += sDelta;
          }
        }
      }
    }

    // 11. Vignette (Smooth radial cosine falloff)
    if (hasVignette) {
      const dx = px - centerX;
      const dy = py - centerY;
      const dSq = dx * dx + dy * dy;
      const normD = Math.min(1.2, Math.sqrt(dSq / maxRadiusSq));

      if (normD > 0.25) {
        const vFactor = (normD - 0.25) / 0.85;
        const vWeight = vFactor * vFactor;
        if (vignetteAmt > 0) {
          // Natural optical lens darkening
          const darken = Math.max(0, 1 - vignetteAmt * 0.8 * vWeight);
          r *= darken;
          g *= darken;
          b *= darken;
        } else {
          // Soft high-key brightening
          const lighten = 1 + Math.abs(vignetteAmt) * 0.45 * vWeight;
          r *= lighten;
          g *= lighten;
          b *= lighten;
        }
      }
    }

    // 12. Photographic Film Grain (Luminance-aware organic distribution)
    if (hasGrain) {
      const curLum = Math.max(0, Math.min(1, (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255));
      // Grain is prominent in midtones and attenuates in deep blacks/specular whites
      const midtoneGrainMask = Math.sin(curLum * Math.PI);
      const hash = ((Math.sin(px * 12.9898 + py * 78.233) * 43758.5453) % 1) - 0.5;
      const grainOffset = hash * grainAmt * midtoneGrainMask;
      r += grainOffset;
      g += grainOffset;
      b += grainOffset;
    }

    // 13. Legacy Filter Preset LUT Blend (if active)
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
          const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
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

    // 14. Background Eraser (chroma key -> alpha). Colors are left untouched.
    if (hasEraser) {
      const dr = data[i] - eraserKeyR;
      const dg = data[i + 1] - eraserKeyG;
      const db = data[i + 2] - eraserKeyB;
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);

      let keep = 1;
      if (eraserMaxDist > 0) {
        // 0 -> fully transparent, 1 -> fully opaque, smooth ramp across the soft edge
        if (dist < eraserMaxDist) {
          keep = smoothstep(eraserSoftStart, eraserMaxDist, dist);
        }
      } else if (dist === 0) {
        // Tolerance 0: only pixels exactly equal to the key colour are removed
        keep = 0;
      }

      if (keep < 1) {
        data[i + 3] = Math.round(data[i + 3] * keep);
      }
    }
  }
}

/**
 * Fast 2-pass separable Box Blur on RGBA pixel buffer
 */
function boxBlurRGBA(data: Uint8ClampedArray, width: number, height: number, radius: number) {
  const temp = new Uint8ClampedArray(data.length);
  const mul = 1 / (radius + radius + 1);

  // Horizontal pass
  for (let y = 0; y < height; y++) {
    const rowStart = y * width;
    let rSum = 0;
    let gSum = 0;
    let bSum = 0;

    for (let i = -radius; i <= radius; i++) {
      const px = Math.min(width - 1, Math.max(0, i));
      const idx = (rowStart + px) << 2;
      rSum += data[idx];
      gSum += data[idx + 1];
      bSum += data[idx + 2];
    }

    for (let x = 0; x < width; x++) {
      const destIdx = (rowStart + x) << 2;
      temp[destIdx] = Math.round(rSum * mul);
      temp[destIdx + 1] = Math.round(gSum * mul);
      temp[destIdx + 2] = Math.round(bSum * mul);
      temp[destIdx + 3] = data[destIdx + 3];

      const leftX = Math.max(0, x - radius);
      const rightX = Math.min(width - 1, x + radius + 1);
      const leftIdx = (rowStart + leftX) << 2;
      const rightIdx = (rowStart + rightX) << 2;

      rSum += data[rightIdx] - data[leftIdx];
      gSum += data[rightIdx + 1] - data[leftIdx + 1];
      bSum += data[rightIdx + 2] - data[leftIdx + 2];
    }
  }

  // Vertical pass
  for (let x = 0; x < width; x++) {
    let rSum = 0;
    let gSum = 0;
    let bSum = 0;

    for (let i = -radius; i <= radius; i++) {
      const py = Math.min(height - 1, Math.max(0, i));
      const idx = (py * width + x) << 2;
      rSum += temp[idx];
      gSum += temp[idx + 1];
      bSum += temp[idx + 2];
    }

    for (let y = 0; y < height; y++) {
      const destIdx = (y * width + x) << 2;
      data[destIdx] = Math.round(rSum * mul);
      data[destIdx + 1] = Math.round(gSum * mul);
      data[destIdx + 2] = Math.round(bSum * mul);

      const topY = Math.max(0, y - radius);
      const bottomY = Math.min(height - 1, y + radius + 1);
      const topIdx = (topY * width + x) << 2;
      const bottomIdx = (bottomY * width + x) << 2;

      rSum += temp[bottomIdx] - temp[topIdx];
      gSum += temp[bottomIdx + 1] - temp[topIdx + 1];
      bSum += temp[bottomIdx + 2] - temp[topIdx + 2];
    }
  }
}

/**
 * Fast 2-pass separable Box Blur on Float32 luminance buffer
 */
function boxBlurLuminance(lum: Float32Array, width: number, height: number, radius: number) {
  const temp = new Float32Array(lum.length);
  const mul = 1 / (radius + radius + 1);

  // Horizontal pass
  for (let y = 0; y < height; y++) {
    const rowStart = y * width;
    let sum = 0;

    for (let i = -radius; i <= radius; i++) {
      const px = Math.min(width - 1, Math.max(0, i));
      sum += lum[rowStart + px];
    }

    for (let x = 0; x < width; x++) {
      temp[rowStart + x] = sum * mul;

      const leftX = Math.max(0, x - radius);
      const rightX = Math.min(width - 1, x + radius + 1);
      sum += lum[rowStart + rightX] - lum[rowStart + leftX];
    }
  }

  // Vertical pass
  for (let x = 0; x < width; x++) {
    let sum = 0;

    for (let i = -radius; i <= radius; i++) {
      const py = Math.min(height - 1, Math.max(0, i));
      sum += temp[py * width + x];
    }

    for (let y = 0; y < height; y++) {
      lum[y * width + x] = sum * mul;

      const topY = Math.max(0, y - radius);
      const bottomY = Math.min(height - 1, y + radius + 1);
      sum += temp[bottomY * width + x] - temp[topY * width + x];
    }
  }
}

// Web Worker handler
if (typeof self !== "undefined" && typeof (self as any).addEventListener === "function") {
  self.addEventListener("message", (e: MessageEvent<ProcessImageMessage>) => {
    const { id, width, height, buffer, adjustments, filter, selectivePoints, curves, backgroundEraser } = e.data;
    const data = new Uint8ClampedArray(buffer);

    processPixelData(data, width, height, adjustments, filter, selectivePoints, curves, backgroundEraser);

    // Transfer buffer back to main thread zero-copy
    (self as any).postMessage({ id, buffer }, [buffer]);
  });
}
