export type GoogleFontCategory = "sans" | "serif" | "display" | "mono";

export type GoogleFontEntry = {
  family: string;
  category: GoogleFontCategory;
  weights: string;
};

/** Curated Google Fonts catalog — loaded via CDN at runtime. */
export const GOOGLE_FONTS_CATALOG: GoogleFontEntry[] = [
  { family: "Inter", category: "sans", weights: "400;500;600;700;800;900" },
  { family: "Roboto", category: "sans", weights: "400;500;700;900" },
  { family: "Open Sans", category: "sans", weights: "400;600;700;800" },
  { family: "Lato", category: "sans", weights: "400;700;900" },
  { family: "Montserrat", category: "sans", weights: "400;600;700;800;900" },
  { family: "Poppins", category: "sans", weights: "400;600;700;800;900" },
  { family: "Oswald", category: "display", weights: "400;500;600;700" },
  { family: "Raleway", category: "sans", weights: "400;600;700;800;900" },
  { family: "Nunito", category: "sans", weights: "400;600;700;800;900" },
  { family: "Work Sans", category: "sans", weights: "400;600;700;800;900" },
  { family: "Rubik", category: "sans", weights: "400;600;700;800;900" },
  { family: "Ubuntu", category: "sans", weights: "400;500;700" },
  { family: "Source Sans 3", category: "sans", weights: "400;600;700;900" },
  { family: "Noto Sans", category: "sans", weights: "400;600;700;900" },
  { family: "DM Sans", category: "sans", weights: "400;500;700;900" },
  { family: "Manrope", category: "sans", weights: "400;600;700;800" },
  { family: "Outfit", category: "sans", weights: "400;600;700;800;900" },
  { family: "Plus Jakarta Sans", category: "sans", weights: "400;600;700;800" },
  { family: "Figtree", category: "sans", weights: "400;600;700;800;900" },
  { family: "Lexend", category: "sans", weights: "400;600;700;800;900" },
  { family: "Barlow", category: "sans", weights: "400;600;700;800;900" },
  { family: "Barlow Condensed", category: "display", weights: "400;600;700;800;900" },
  { family: "Archivo", category: "sans", weights: "400;600;700;800;900" },
  { family: "Archivo Black", category: "display", weights: "400" },
  { family: "Anton", category: "display", weights: "400" },
  { family: "Bebas Neue", category: "display", weights: "400" },
  { family: "Teko", category: "display", weights: "400;500;600;700" },
  { family: "Rajdhani", category: "display", weights: "400;600;700" },
  { family: "Orbitron", category: "display", weights: "400;600;700;800;900" },
  { family: "Exo 2", category: "display", weights: "400;600;700;800;900" },
  { family: "Kanit", category: "display", weights: "400;600;700;800;900" },
  { family: "Saira", category: "display", weights: "400;600;700;800;900" },
  { family: "Saira Condensed", category: "display", weights: "400;600;700;900" },
  { family: "Chakra Petch", category: "display", weights: "400;600;700" },
  { family: "Russo One", category: "display", weights: "400" },
  { family: "Black Ops One", category: "display", weights: "400" },
  { family: "Bungee", category: "display", weights: "400" },
  { family: "Righteous", category: "display", weights: "400" },
  { family: "Passion One", category: "display", weights: "400;700;900" },
  { family: "Alfa Slab One", category: "display", weights: "400" },
  { family: "Staatliches", category: "display", weights: "400" },
  { family: "Fjalla One", category: "display", weights: "400" },
  { family: "Playfair Display", category: "serif", weights: "400;600;700;800;900" },
  { family: "Merriweather", category: "serif", weights: "400;700;900" },
  { family: "Lora", category: "serif", weights: "400;600;700" },
  { family: "Libre Baskerville", category: "serif", weights: "400;700" },
  { family: "Cormorant Garamond", category: "serif", weights: "400;600;700" },
  { family: "Crimson Text", category: "serif", weights: "400;600;700" },
  { family: "Bitter", category: "serif", weights: "400;600;700;800;900" },
  { family: "Roboto Mono", category: "mono", weights: "400;500;700" },
  { family: "Source Code Pro", category: "mono", weights: "400;600;700" },
  { family: "JetBrains Mono", category: "mono", weights: "400;600;700;800" },
  { family: "Fira Code", category: "mono", weights: "400;600;700" },
  { family: "IBM Plex Mono", category: "mono", weights: "400;600;700" },
  { family: "Space Mono", category: "mono", weights: "400;700" },
  { family: "Inconsolata", category: "mono", weights: "400;600;700;800;900" },
  { family: "Courier Prime", category: "mono", weights: "400;700" },
  { family: "PT Sans", category: "sans", weights: "400;700" },
  { family: "PT Serif", category: "serif", weights: "400;700" },
  { family: "Mulish", category: "sans", weights: "400;600;700;800;900" },
  { family: "Quicksand", category: "sans", weights: "400;600;700" },
  { family: "Karla", category: "sans", weights: "400;600;700;800" },
  { family: "Hind", category: "sans", weights: "400;600;700" },
  { family: "Cabin", category: "sans", weights: "400;600;700" },
  { family: "Titillium Web", category: "sans", weights: "400;600;700;900" },
  { family: "Josefin Sans", category: "sans", weights: "400;600;700" },
  { family: "Abel", category: "sans", weights: "400" },
  { family: "Arimo", category: "sans", weights: "400;600;700" },
  { family: "Asap", category: "sans", weights: "400;600;700" },
  { family: "Catamaran", category: "sans", weights: "400;600;700;800;900" },
  { family: "Exo", category: "display", weights: "400;600;700;800;900" },
  { family: "Heebo", category: "sans", weights: "400;600;700;800;900" },
  { family: "Overpass", category: "sans", weights: "400;600;700;800;900" },
  { family: "Red Hat Display", category: "sans", weights: "400;600;700;800;900" },
  { family: "Signika", category: "sans", weights: "400;600;700" },
  { family: "Signika Negative", category: "sans", weights: "400;600;700" },
  { family: "Syne", category: "display", weights: "400;600;700;800" },
  { family: "Urbanist", category: "sans", weights: "400;600;700;800;900" },
  { family: "Space Grotesk", category: "sans", weights: "400;600;700" },
  { family: "Sora", category: "sans", weights: "400;600;700;800" },
  { family: "Onest", category: "sans", weights: "400;600;700;800;900" },
  { family: "Geologica", category: "display", weights: "400;600;700;800;900" },
  { family: "Schibsted Grotesk", category: "sans", weights: "400;600;700;800;900" },
  { family: "Instrument Sans", category: "sans", weights: "400;600;700" },
  { family: "Albert Sans", category: "sans", weights: "400;600;700;800;900" },
  { family: "Epilogue", category: "sans", weights: "400;600;700;800;900" },
  { family: "Familjen Grotesk", category: "sans", weights: "400;600;700" },
  { family: "Golos Text", category: "sans", weights: "400;600;700;800;900" },
  { family: "Public Sans", category: "sans", weights: "400;600;700;800;900" },
  { family: "IBM Plex Sans", category: "sans", weights: "400;600;700" },
  { family: "IBM Plex Serif", category: "serif", weights: "400;600;700" },
  { family: "Newsreader", category: "serif", weights: "400;600;700;800" },
  { family: "Literata", category: "serif", weights: "400;600;700;800;900" },
  { family: "Spectral", category: "serif", weights: "400;600;700;800" },
  { family: "Alegreya", category: "serif", weights: "400;600;700;800;900" },
  { family: "Vollkorn", category: "serif", weights: "400;600;700;800;900" },
  { family: "Roboto Slab", category: "serif", weights: "400;600;700;800;900" },
  { family: "Zilla Slab", category: "serif", weights: "400;600;700" },
  { family: "Arvo", category: "serif", weights: "400;700" },
  { family: "Rokkitt", category: "serif", weights: "400;600;700;800;900" },
  { family: "Prompt", category: "sans", weights: "400;600;700;800;900" },
  { family: "M PLUS 1p", category: "sans", weights: "400;700;800;900" },
  { family: "Noto Serif", category: "serif", weights: "400;600;700" },
  { family: "Cinzel", category: "display", weights: "400;600;700;800;900" },
  { family: "Cinzel Decorative", category: "display", weights: "400;700;900" },
  { family: "Permanent Marker", category: "display", weights: "400" },
  { family: "Bangers", category: "display", weights: "400" },
  { family: "Audiowide", category: "display", weights: "400" },
  { family: "Monoton", category: "display", weights: "400" },
  { family: "Press Start 2P", category: "display", weights: "400" },
  { family: "VT323", category: "mono", weights: "400" },
  { family: "Share Tech Mono", category: "mono", weights: "400" },
  { family: "Major Mono Display", category: "mono", weights: "400" },
  { family: "Anonymous Pro", category: "mono", weights: "400;700" },
  { family: "Ubuntu Mono", category: "mono", weights: "400;700" },
  { family: "Red Hat Mono", category: "mono", weights: "400;600;700" },
  { family: "DM Mono", category: "mono", weights: "400;500" },
  { family: "Fragment Mono", category: "mono", weights: "400" },
  { family: "Azeret Mono", category: "mono", weights: "400;600;700;800;900" },
  { family: "Martian Mono", category: "mono", weights: "400;600;700;800" },
];

export const FALLBACK_FONT_PRESETS = [
  { label: "System sans-serif", value: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif" },
  { label: "System serif", value: "Georgia, Cambria, Times New Roman, serif" },
  { label: "System monospace", value: "ui-monospace, SFMono-Regular, Menlo, monospace" },
  { label: "Arial stack", value: "Arial, Helvetica, sans-serif" },
  { label: "Verdana stack", value: "Verdana, Geneva, sans-serif" },
];

export const getGoogleFontEntry = (family: string) => GOOGLE_FONTS_CATALOG.find((f) => f.family === family);

export const buildGoogleFontsUrl = (families: string[]): string | null => {
  const unique = [...new Set(families.filter((f) => f && !f.startsWith("custom:")))];
  if (!unique.length) return null;

  const params = unique
    .map((family) => {
      const entry = getGoogleFontEntry(family);
      const weights = entry?.weights ?? "400;600;700";
      const encoded = family.replace(/ /g, "+");
      return `family=${encoded}:wght@${weights}`;
    })
    .join("&");

  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
};

export const filterGoogleFonts = (query: string, category?: GoogleFontCategory): GoogleFontEntry[] => {
  const q = query.trim().toLowerCase();
  return GOOGLE_FONTS_CATALOG.filter((font) => {
    if (category && font.category !== category) return false;
    if (!q) return true;
    return font.family.toLowerCase().includes(q);
  });
};
