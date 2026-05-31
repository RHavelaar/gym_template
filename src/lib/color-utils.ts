export type RgbColor = { r: number; g: number; b: number };

export type HslColor = { h: number; s: number; l: number };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const normalizeHex = (input: string): string | null => {
  const trimmed = input.trim();
  if (!trimmed.startsWith("#")) return null;
  const hex = trimmed.slice(1);
  if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
    return `#${hex
      .split("")
      .map((c) => c + c)
      .join("")
      .toLowerCase()}`;
  }
  if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
    return `#${hex.toLowerCase()}`;
  }
  return null;
};

export const hexToRgb = (hex: string): RgbColor | null => {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;
  const value = normalized.slice(1);
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
};

export const rgbToHex = ({ r, g, b }: RgbColor): string => {
  const toHex = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const rgbToHsl = ({ r, g, b }: RgbColor): HslColor => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;

  return { h: h * 360, s: s * 100, l: l * 100 };
};

export const hslToRgb = ({ h, s, l }: HslColor): RgbColor => {
  const sn = clamp(s, 0, 100) / 100;
  const ln = clamp(l, 0, 100) / 100;
  if (sn === 0) {
    const v = ln * 255;
    return { r: v, g: v, b: v };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hn = (((h % 360) + 360) % 360) / 360;

  return {
    r: hue2rgb(p, q, hn + 1 / 3) * 255,
    g: hue2rgb(p, q, hn) * 255,
    b: hue2rgb(p, q, hn - 1 / 3) * 255,
  };
};

export const hexToHsl = (hex: string): HslColor | null => {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHsl(rgb) : null;
};

export const hslToHex = (hsl: HslColor): string => rgbToHex(hslToRgb(hsl));

export const formatRgb = (hex: string): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return "";
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
};

export const formatHsl = (hex: string): string => {
  const hsl = hexToHsl(hex);
  if (!hsl) return "";
  return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
};

export const parseHexList = (input: string): string[] => {
  const matches = input.match(/#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})\b/g) ?? [];
  return [...new Set(matches.map((m) => normalizeHex(m)).filter(Boolean) as string[])];
};

/** Sample dominant colors from an image file via canvas. */
export const extractColorsFromImage = async (file: File, count = 6): Promise<string[]> => {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const size = 64;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  ctx.drawImage(bitmap, 0, 0, size, size);
  bitmap.close();

  const { data } = ctx.getImageData(0, 0, size, size);
  const buckets = new Map<string, number>();

  for (let i = 0; i < data.length; i += 4 * 4) {
    const r = Math.round(data[i] / 32) * 32;
    const g = Math.round(data[i + 1] / 32) * 32;
    const b = Math.round(data[i + 2] / 32) * 32;
    const a = data[i + 3];
    if (a < 128) continue;
    const hex = rgbToHex({ r, g, b });
    buckets.set(hex, (buckets.get(hex) ?? 0) + 1);
  }

  return [...buckets.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([hex]) => hex);
};

export const colorInputValue = (hex: string, fallback: string): string => {
  const normalized = normalizeHex(hex);
  return normalized ?? normalizeHex(fallback) ?? "#000000";
};
