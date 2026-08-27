---
name: colour-palette
description: >
  Guides color and palette selection — CSS themes, UI components, terminal configs, status bars, brand identity, and accessibility contrast.
  Use when choosing, designing, generating, or reviewing colors or color palettes for any application or design system.
---

# Colour Palette Design

Guides color selection, contrast verification, theme generation, and palette structure across CSS themes, UI components, and design systems.

## Process

1. **Understand Context**: Target aesthetic, consumption format (CSS custom properties, Hex, HSL, OKLCH), mode (light/dark/system), and existing brand constraints.
2. **Select in OKLCH**: Use OKLCH as the primary color space — it is perceptually uniform (equal lightness across hues, clean gradient interpolation, no hue drift). Convert to target output format (Hex/HSL/OKLCH). If the design system is already using a specific color format (e.g. Hex, HSL, or OKLCH), try to use the same format for the new colors.
3. **Verify Accessibility**: Ensure WCAG AA contrast (4.5:1 for normal text, 3:1 for large text/UI components). Never rely on color alone for status or state.
4. **Enforce Hierarchy**: Apply the 60-30-10 distribution rule (60% background/neutral, 30% secondary surfaces, 10% accent actions).

## Core Concepts

### OKLCH vs HSL
- **HSL flaw**: Non-perceptually uniform (yellow at 50% lightness looks far brighter than blue at 50%).
- **OKLCH (`oklch(L C H)`)**:
  - `L` (Lightness): 0–1, perceptually uniform across all hues.
  - `C` (Chroma): 0–0.37+, saturation distance from grey.
  - `H` (Hue): 0–360°.

### Tonal Scales (11-Step OKLCH Distribution)

| Step | OKLCH L | Primary Use |
|---|---|---|
| **50** | 0.97 | Subtle background / card fill |
| **100** | 0.93 | Hover state background |
| **200** | 0.87 | Active background, subtle borders |
| **300** | 0.79 | Element borders, secondary dividers |
| **400** | 0.70 | Placeholder text, disabled indicators |
| **500** | 0.60 | **Base Brand Color** / active icons |
| **600** | 0.50 | Primary text on light surfaces |
| **700** | 0.40 | Headings, strong emphasis |
| **800** | 0.31 | High-contrast text |
| **900** | 0.22 | Dark mode elevated card background |
| **950** | 0.14 | Near-black, dark mode primary background |

*Chroma Curve*: Peak chroma at mid-lightness (400–600), tapering at light tints (50–200) and dark shades (800–950).

### Color Harmonies
- **Monochromatic**: Tints/shades of 1 hue. Clean, minimalist.
- **Complementary**: 180° apart. High impact (CTAs). One hue must dominate.
- **Analogous**: 3 hues within 60° arc. Serene, natural.
- **Triadic / Split-Complementary**: 120° intervals or base + 2 adjacent complements. Vibrant variety.

### Complete Palette Structure
1. **Primary / Secondary**: 1–2 brand hues with full 11-step scale.
2. **Neutral / Greys**: Full scale with subtle brand tint (pure grey feels dead).
3. **Semantic**: Success (green), Warning (amber/yellow), Error (red), Info (blue).
4. **Dark Mode Adaptation**: Use dark greys (`#121212`–`#1E1E1E`), not pure black. Desaturate accent colors ~20% to prevent optical vibration.

### Common Mistakes
- Insufficient text contrast (<4.5:1 WCAG AA).
- Using pure `#000000` text on `#FFFFFF` background (causes eye strain; use near-black `#111827`).
- Equal color proportions (always follow 60-30-10 or 70-25-5).
- Relying on color alone for error/success states without icons or labels.
