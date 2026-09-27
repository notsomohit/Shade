import { CurvePoint } from "@/types/editor";

/**
 * Computes a 256-entry Look-Up Table (LUT) from an array of CurvePoints using Monotone Cubic Spline Interpolation.
 */
export function generateCurveLUT(points: CurvePoint[]): Uint8Array {
  const lut = new Uint8Array(256);

  if (!points || points.length === 0) {
    for (let i = 0; i < 256; i++) lut[i] = i;
    return lut;
  }

  // Sort points by X ascending
  const sorted = [...points].sort((a, b) => a.x - b.x);

  // Ensure 0 and 255 endpoints exist
  if (sorted[0].x > 0) {
    sorted.unshift({ x: 0, y: sorted[0].y });
  }
  if (sorted[sorted.length - 1].x < 255) {
    sorted.push({ x: 255, y: sorted[sorted.length - 1].y });
  }

  const n = sorted.length;
  if (n === 1) {
    const val = Math.min(255, Math.max(0, Math.round(sorted[0].y)));
    lut.fill(val);
    return lut;
  }

  const xs = sorted.map((p) => p.x);
  const ys = sorted.map((p) => p.y);

  // Slopes of secant lines
  const delta: number[] = new Array(n - 1);
  const m: number[] = new Array(n);

  for (let i = 0; i < n - 1; i++) {
    const dx = xs[i + 1] - xs[i];
    delta[i] = dx === 0 ? 0 : (ys[i + 1] - ys[i]) / dx;
  }

  m[0] = delta[0];
  for (let i = 1; i < n - 1; i++) {
    if (delta[i - 1] * delta[i] <= 0) {
      m[i] = 0;
    } else {
      m[i] = (delta[i - 1] + delta[i]) / 2;
    }
  }
  m[n - 1] = delta[n - 2];

  for (let i = 0; i < n - 1; i++) {
    if (delta[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
    } else {
      const alpha = m[i] / delta[i];
      const beta = m[i + 1] / delta[i];
      const dist = alpha * alpha + beta * beta;
      if (dist > 9) {
        const tau = 3 / Math.sqrt(dist);
        m[i] = tau * alpha * delta[i];
        m[i + 1] = tau * beta * delta[i];
      }
    }
  }

  // Interpolate for all 0..255
  let currSegment = 0;
  for (let x = 0; x < 256; x++) {
    while (currSegment < n - 2 && x > xs[currSegment + 1]) {
      currSegment++;
    }

    const x0 = xs[currSegment];
    const x1 = xs[currSegment + 1];
    const y0 = ys[currSegment];
    const y1 = ys[currSegment + 1];
    const h = x1 - x0;

    if (h === 0) {
      lut[x] = Math.min(255, Math.max(0, Math.round(y0)));
      continue;
    }

    const t = (x - x0) / h;
    const t2 = t * t;
    const t3 = t2 * t;

    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;

    const y = h00 * y0 + h10 * h * m[currSegment] + h01 * y1 + h11 * h * m[currSegment + 1];
    lut[x] = Math.min(255, Math.max(0, Math.round(y)));
  }

  return lut;
}

export const DEFAULT_CURVE_POINTS: CurvePoint[] = [
  { x: 0, y: 0 },
  { x: 255, y: 255 },
];
