// Color extraction and dynamic theme engine for album and track artwork

export interface SongTheme {
  primary: string; // hex
  primaryRgb: string; // "r, g, b"
  secondary: string; // hex
  secondaryRgb: string; // "r, g, b"
  accent: string;
  glow: string;
  bgGradient: string;
  cardBg: string;
}

const DEFAULT_THEME: SongTheme = {
  primary: '#FA243C',
  primaryRgb: '250, 36, 60',
  secondary: '#D4A017',
  secondaryRgb: '212, 160, 23',
  accent: '#FA243C',
  glow: 'rgba(250, 36, 60, 0.35)',
  bgGradient: 'radial-gradient(circle at 50% 20%, rgba(250, 36, 60, 0.18), transparent 70%), radial-gradient(circle at 80% 80%, rgba(212, 160, 23, 0.14), transparent 60%)',
  cardBg: 'rgba(255, 255, 255, 0.85)',
};

const themeCache = new Map<string, SongTheme>();

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: h * 360, s, l };
}

/**
 * Extracts dominant vibrant colors from an image URL using in-memory HTML5 Canvas.
 * Blazing fast (<15ms), zero external dependencies, robust with fallback on CORS/errors.
 */
export function extractCoverTheme(imageUrl?: string | null): Promise<SongTheme> {
  if (!imageUrl) {
    return Promise.resolve(DEFAULT_THEME);
  }

  if (themeCache.has(imageUrl)) {
    return Promise.resolve(themeCache.get(imageUrl)!);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const fallback = () => {
      themeCache.set(imageUrl, DEFAULT_THEME);
      resolve(DEFAULT_THEME);
    };

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return fallback();

        // Sample down to 40x40 for instant color quantization
        const width = 40;
        const height = 40;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height).data;
        const colorBuckets: Array<{ r: number; g: number; b: number; count: number; weight: number }> = [];

        // 12 hue bins (0-30, 30-60, ... 330-360)
        const bins: Array<{ rTotal: number; gTotal: number; bTotal: number; count: number; maxSat: number }> = Array.from(
          { length: 12 },
          () => ({ rTotal: 0, gTotal: 0, bTotal: 0, count: 0, maxSat: 0 })
        );

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          if (a < 128) continue; // Skip transparency

          const { h, s, l } = rgbToHsl(r, g, b);

          // Discard washed-out whites, greys, and near-blacks
          if (l < 0.12 || l > 0.90 || s < 0.15) continue;

          const binIdx = Math.min(11, Math.floor(h / 30));
          const bin = bins[binIdx];
          bin.rTotal += r;
          bin.gTotal += g;
          bin.bTotal += b;
          bin.count += 1;
          if (s > bin.maxSat) bin.maxSat = s;
        }

        // Rank bins by vibrancy and pixel density
        for (const bin of bins) {
          if (bin.count > 0) {
            const r = Math.round(bin.rTotal / bin.count);
            const g = Math.round(bin.gTotal / bin.count);
            const b = Math.round(bin.bTotal / bin.count);
            // Higher saturation and solid presence gives best theme colors
            const weight = bin.count * (1 + bin.maxSat * 2);
            colorBuckets.push({ r, g, b, count: bin.count, weight });
          }
        }

        colorBuckets.sort((a, b) => b.weight - a.weight);

        if (colorBuckets.length === 0) {
          // If the image was entirely monochrome/greyscale
          return fallback();
        }

        const top = colorBuckets[0];
        const second = colorBuckets[1] || {
          r: Math.min(255, Math.round(top.r * 0.8 + 40)),
          g: Math.min(255, Math.round(top.g * 0.7 + 30)),
          b: Math.min(255, Math.round(top.b * 1.1 + 50)),
        };

        const primaryHex = rgbToHex(top.r, top.g, top.b);
        const secondaryHex = rgbToHex(second.r, second.g, second.b);
        const primaryRgb = `${top.r}, ${top.g}, ${top.b}`;
        const secondaryRgb = `${second.r}, ${second.g}, ${second.b}`;

        const theme: SongTheme = {
          primary: primaryHex,
          primaryRgb,
          secondary: secondaryHex,
          secondaryRgb,
          accent: primaryHex,
          glow: `rgba(${primaryRgb}, 0.38)`,
          bgGradient: `radial-gradient(circle at 40% 25%, rgba(${primaryRgb}, 0.22), transparent 65%), radial-gradient(circle at 75% 75%, rgba(${secondaryRgb}, 0.18), transparent 60%)`,
          cardBg: 'rgba(255, 255, 255, 0.90)',
        };

        themeCache.set(imageUrl, theme);
        resolve(theme);
      } catch (err) {
        fallback();
      }
    };

    img.onerror = fallback;
    img.src = imageUrl;
  });
}

/**
 * Injects CSS variables onto document.documentElement so the whole website / player
 * can seamlessly morph with the active song theme!
 */
export function applyGlobalSongTheme(theme: SongTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--song-theme-primary', theme.primary);
  root.style.setProperty('--song-theme-primary-rgb', theme.primaryRgb);
  root.style.setProperty('--song-theme-secondary', theme.secondary);
  root.style.setProperty('--song-theme-secondary-rgb', theme.secondaryRgb);
  root.style.setProperty('--song-theme-glow', theme.glow);
}
