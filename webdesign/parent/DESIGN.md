---
name: Mùhé Academic (沐禾)
colors:
  surface: '#fbf9f7'
  surface-dim: '#dcdad7'
  surface-bright: '#fbf9f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f1'
  surface-container: '#f0edeb'
  surface-container-high: '#eae8e6'
  surface-container-highest: '#e4e2e0'
  on-surface: '#1b1c1b'
  on-surface-variant: '#434843'
  inverse-surface: '#30302f'
  inverse-on-surface: '#f3f0ee'
  outline: '#747873'
  outline-variant: '#c4c8c1'
  surface-tint: '#546256'
  primary: '#525f54'
  on-primary: '#ffffff'
  primary-container: '#6a786c'
  on-primary-container: '#f6fff4'
  inverse-primary: '#bccabc'
  secondary: '#6e5b48'
  on-secondary: '#ffffff'
  secondary-container: '#f9dec6'
  on-secondary-container: '#75614e'
  tertiary: '#6d5659'
  on-tertiary: '#ffffff'
  tertiary-container: '#876e71'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e6d7'
  primary-fixed-dim: '#bccabc'
  on-primary-fixed: '#121e15'
  on-primary-fixed-variant: '#3d4a3f'
  secondary-fixed: '#f9dec6'
  secondary-fixed-dim: '#dcc2ab'
  on-secondary-fixed: '#26190a'
  on-secondary-fixed-variant: '#554332'
  tertiary-fixed: '#fadbde'
  tertiary-fixed-dim: '#ddbfc2'
  on-tertiary-fixed: '#28171a'
  on-tertiary-fixed-variant: '#574144'
  background: '#fbf9f7'
  on-background: '#1b1c1b'
  surface-variant: '#e4e2e0'
typography:
  h1:
    fontFamily: Noto Serif TC
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Noto Serif TC
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Noto Serif TC
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  display-italic:
    fontFamily: Noto Serif TC
    fontSize: inherit
    fontWeight: '400'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  xxl: 80px
  gutter: 24px
  container-max: 1200px
---

## Brand & Style

The brand identity is "Architectural Mentorship"—a blend of academic precision and organic elegance. It targets high-achieving students and discerning parents who value a sophisticated, "quiet luxury" approach to education. 

The visual style is **Modern Minimalist with Organic Textures**. It avoids the aggressive, high-energy tropes of typical "ed-tech" in favor of a serene, gallery-like atmosphere. The UI relies on expansive whitespace, editorial typography, and a "Tonal Layering" approach that mimics natural materials like stone, cream paper, and moss. The emotional response should be one of calm confidence, intellectual clarity, and premium craftsmanship.

## Colors

The palette is rooted in a "Sage and Stone" aesthetic. 
- **Primary (Sage):** #7D8B7E is used for primary actions, navigation states, and structural accents. It represents growth and stability.
- **Secondary (Clay/Oat):** #A9927D and #F4F1EA provide warmth and a paper-like tactile feel, contrasting the cooler green tones.
- **Neutral (Parchment):** The background is not pure white but a soft #fbf9f7 to reduce eye strain and feel more like high-quality stationery.
- **Typography:** Uses a near-black #1b1c1b for high legibility, with #434843 for secondary descriptions to maintain visual hierarchy without losing softness.

## Typography

The typography system follows an editorial "Serif-meets-Sans" pairing. 
- **Headlines:** Use **Noto Serif TC** to evoke authority, tradition, and elegance. Italics are used strategically within headlines to highlight emotional keywords or "the human touch."
- **Body & Interface:** Use **Manrope** for its clean, geometric but approachable proportions. It ensures clarity in dense information like application processes.
- **Captions & Labels:** Small-caps with generous letter-spacing (0.1em+) are used for "meta-information" (e.g., section headers, numbers) to create a sense of organized, premium indexing.

## Layout & Spacing

The system uses a **Fixed-Width Centered Grid** (1200px max) to maintain the readability of an editorial spread. 
- **Vertical Rhythm:** Sections are separated by large "breathable" gaps (xxl: 80px) to prevent the user from feeling overwhelmed.
- **Bento Grid Logic:** For information-dense areas (like the Philosophy section), a 12-column grid is utilized where cards span variable widths (8/4 or 5/7) to create visual interest and focal points.
- **Padding:** Internal card padding is generous (12: 48px) to reinforce the premium, "un-crowded" brand feel.

## Elevation & Depth

Hierarchy is achieved through **Tonal Elevation** rather than traditional drop shadows.
- **Surface Tiers:** Background levels shift from #fbf9f7 (Level 0) to #F4F1EA (Level 1) and #E9E5DB (Level 2).
- **Shadow Character:** When used (e.g., on featured images), shadows are extremely soft and tinted with the primary green hue: `rgba(125, 139, 126, 0.08)` with a high blur (30px).
- **Structural Lines:** Fine 1px borders in #E9E5DB are used to define boundaries without adding visual weight.
- **Depth via Imagery:** Overlapping elements and "cut-out" layouts create a physical, collage-like depth.

## Shapes

The shape language is primarily **Rectilinear with subtle softening**. 
- **Base Components:** Buttons and form fields use a very small radius (0.125rem) to maintain an architectural, "drawn-with-a-ruler" precision.
- **Image Assets:** Large images should remain sharp or use a minimal 0.25rem radius.
- **Iconography:** Use "Material Symbols Outlined" with a light weight (300) to match the thin-stroke aesthetic of the typography.
- **Accents:** Occasional full-circle avatars provide a point of focus against the predominantly square layout.

## Components

- **Buttons:** 
  - *Primary:* Solid #7D8B7E with white label-caps text. No rounding or very minimal (2px).
  - *Secondary:* Ghost style with 1px primary-colored border.
  - *Hover States:* Subtle opacity shifts or background color shifts to Level 1 surface.
- **Input Fields:** Bottom-border only or very light background tint (#F4F1EA). Placeholder text should be light grey with Manrope body-md sizing.
- **Cards (Bento Style):** No shadows. Defined by background color changes (Surface-Container) and 1px borders. Content within should be heavily inset.
- **Navigation:** Top-aligned, thin 1px bottom border. Active states denoted by a 2px bottom border in primary sage.
- **Quotes:** Large italicized serif text, often paired with a 4px left-side accent border in primary color and a large quote icon.
- **Progress Markers:** Numerical indicators (01, 02) should use H3 serif styling in primary color to guide the user through workflows.