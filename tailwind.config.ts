// Extends the "aurora" preset (templates/_ui/aurora/tailwind.preset.ts
// in the hackathon-starter skill). Tailwind v4 itself reads its design tokens from
// app/globals.css's `@theme inline` block — this is a documentation/tooling artifact.
const theme = {
  "name": "aurora",
  "mode": "dark",
  "accent": "#f59e0b",
  "accentContrast": "#1A1204",
  "surfaces": {
    "bg": "#0B0F1A",
    "surface": "rgba(255,255,255,0.06)",
    "surfaceRaised": "rgba(255,255,255,0.10)",
    "border": "rgba(255,255,255,0.12)"
  },
  "text": {
    "fg": "#F4F6FB",
    "fgMuted": "#9AA5B8"
  },
  "radii": {
    "radius": "1rem",
    "radiusSm": "0.5rem"
  },
  "shadows": {
    "shadow": "0 20px 60px -20px rgba(0,0,0,0.6)"
  },
  "font": {
    "sans": "Inter"
  },
  "typeScale": {
    "sm": "0.875rem",
    "base": "1rem",
    "lg": "1.125rem",
    "xl": "1.5rem",
    "2xl": "2rem"
  }
} as const;

export default theme;
