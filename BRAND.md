# ScubaTrip Brand Guidelines

> **Design Direction: Abyssal Coral** — a cinematic, dark-first aesthetic inspired by
> looking through a submersible viewport. The interface is immersive, layered, and deep.
> Information surfaces from the abyss; coral energy draws the eye to action.

---

## 1. Color Palette

ScubaTrip uses a dark-first palette built on the tension between deep navy backgrounds
and vibrant coral CTAs. Colors are defined as CSS custom properties (HSL) in `src/index.css`
and mapped to Tailwind tokens in `tailwind.config.ts`.

### Primary Colors

| Token | Dark Mode (Primary) | Hex | Usage |
|-------|-------------------|-----|-------|
| `--background` | `hsl(201 60% 6%)` | `#061219` | Page background, the deepest layer |
| `--foreground` | `hsl(210 20% 95%)` | `#EEF1F4` | Default text on dark backgrounds |
| `--card` | `hsl(201 50% 10%)` | `#0D1926` | Card surfaces, raised containers |
| `--secondary` | `hsl(201 60% 25%)` | `#193B57` | Sidebar active states, structural elements |
| `--muted` | `hsl(201 40% 15%)` | `#17263A` | Disabled backgrounds, inactive panels |
| `--border` | `hsl(201 40% 18%)` | `#1C2E42` | Subtle card/input borders |

### Accent & Action Colors

| Token | Value | Hex | Usage |
|-------|-------|-----|-------|
| Coral (CTA) | `hsl(16 99% 65%)` | `#FF7A54` | Primary CTA buttons, booking actions, focus rings |
| Coral (Stitch) | — | `#FE7E4F` | Design target from Abyssal Coral system |
| Cyan Electric | `hsl(187 100% 50%)` | `#00EFFF` | HUD data, coordinates, technical stats, active nav |
| Teal 500 | `hsl(193 100% 35%)` | `#00B3B3` | Secondary accents, gradient endpoints |
| Coral token | `hsl(0 100% 70%)` | `#FF6666` | Soft coral for badges, tags |

### Ocean Scale

A 10-step navy-to-ice scale for depth layering:

| Token | HSL | Hex | Usage |
|-------|-----|-----|-------|
| `ocean-900` | `hsl(207 63% 10%)` | `#091A27` | Deepest card backgrounds, placeholders |
| `ocean-800` | `hsl(201 80% 14%)` | `#072840` | Dark section backgrounds |
| `ocean-700` | `hsl(201 100% 20%)` | `#003E66` | Gradient deep end |
| `ocean-600` | `hsl(201 100% 28%)` | `#005A8F` | Active sidebar, gradient midpoint |
| `ocean-500` | `hsl(201 100% 36%)` | `#0071B8` | Primary ocean blue, gradient bright end |
| `ocean-400` | `hsl(201 80% 50%)` | `#1A99E6` | Links, interactive highlights |
| `ocean-300` | `hsl(201 70% 65%)` | `#6CB8DE` | Secondary text on dark |
| `ocean-200` | `hsl(201 80% 80%)` | `#9DD4F2` | Subtle labels, language switcher text |
| `ocean-100` | `hsl(201 100% 92%)` | `#D6F0FF` | Light backgrounds (light mode only) |
| `ocean-50` | `hsl(201 100% 97%)` | `#F0F9FF` | Near-white tint (light mode only) |

### Semantic Colors

| Token | Value | Hex | Usage |
|-------|-------|-----|-------|
| `success` | `hsl(160 60% 45%)` | `#2EB882` | Confirmed bookings, safe states |
| `warning` | `hsl(38 92% 50%)` | `#F5A623` | Pending bookings, attention needed |
| `destructive` | `hsl(0 62% 30%)` | `#7C1D1D` | Cancel actions, rejected states, errors |

### Gradients

| Name | Definition | Usage |
|------|-----------|-------|
| `bg-gradient-ocean` | `linear-gradient(135deg, ocean-500, teal)` | Hero sections, feature highlights |
| `bg-gradient-ocean-deep` | `linear-gradient(180deg, ocean-700, ocean-500)` | Admin headers, immersive panels |
| Abyss gradient | `linear-gradient(180deg, #000a1e, #002147)` | Landing page hero overlay |

### Shadows

| Name | Definition | Usage |
|------|-----------|-------|
| `shadow-card` | `0 1px 3px ocean/6%, 0 4px 12px ocean/4%` | Default card elevation |
| `shadow-card-hover` | `0 4px 16px ocean/10%, 0 8px 32px ocean/6%` | Card hover lift |
| `shadow-ocean` | `0 4px 20px ocean/25%` | Floating action elements |

> **Rule**: Shadows must use tinted colors (ocean-based), never pure black. This maintains
> the oceanic depth feel described in the Abyssal Coral design system.

---

## 2. Typography

Two typefaces create tension between editorial impact and technical precision.

### Font Stack

| Role | Family | Tailwind Class | Usage |
|------|--------|----------------|-------|
| Display / Headlines | Plus Jakarta Sans | `font-display`, `font-headline` | All `h1`-`h6`, hero text, page titles |
| Body / Labels | Work Sans | `font-sans`, `font-body`, `font-label` | Paragraphs, form labels, data, buttons |

> Headings are automatically set to `font-display` via the global base layer in `index.css`.

### Type Scale

| Level | Tailwind | Size | Weight | Usage |
|-------|----------|------|--------|-------|
| Display | `text-5xl` | 48px | `font-black` (900) | Landing hero headline |
| Page title | `text-4xl` | 36px | `font-black` (900) | Dashboard welcome, section heroes |
| Section title | `text-3xl` | 30px | `font-bold` (700) | Admin dashboard title |
| Card title | `text-2xl` | 24px | `font-semibold` (600) | Card headers, dialog titles |
| Subsection | `text-xl` | 20px | `font-semibold` (600) | Card titles, sub-headers |
| Large body | `text-lg` | 18px | `font-medium` (500) | Dialog titles, emphasized text |
| Body | `text-base` | 16px | `font-normal` (400) | Default paragraph text, inputs |
| UI label | `text-sm` | 14px | `font-medium` (500) | Badges, descriptions, form labels |
| Caption | `text-xs` | 12px | `font-medium` (500) | Status tags, helper text, metadata |

### Typography Rules

- **Headlines** use tight letter-spacing (`tracking-tight` or `-2%`) for a "pressed editorial" look
- **Labels and metadata** use wider letter-spacing (`tracking-wide` or `tracking-widest`) + uppercase for a HUD/instrument feel
- **Body text** uses `font-light` (300) weight per the Abyssal Coral spec for a premium editorial feel
- Pair a bold `font-display` headline with an uppercase `text-xs tracking-widest` sub-label in cyan-electric for maximum hierarchy contrast

---

## 3. Component Guidelines

### Buttons (CTAs)

| Variant | Style | Usage |
|---------|-------|-------|
| **Primary** | `bg-coral #FF7A54`, white text, `rounded-full` pill | "Book Now", "Sign Up", main actions |
| **Hero Outline** | Transparent bg, `border-white/40`, white text, `rounded-full` | Hero secondary action over images |
| **Secondary** | `bg-secondary` navy, light text | Structural actions, "View Details" |
| **Ghost** | Transparent, hover reveals `bg-accent` | Nav items, toolbar actions |
| **Destructive** | `bg-destructive` red | "Cancel Booking", "Delete" |
| **Link** | Underline on hover, coral/primary text | Inline text actions |

**Button sizes:**
- Default: `h-10 px-4 py-2`
- Small: `h-9 px-3`
- Large: `h-11 px-8`
- Icon: `h-10 w-10`

> **Rule**: Primary CTAs must always be pill-shaped (`rounded-full`). This is a core
> brand element from the Abyssal Coral system — the pill shape suggests reliability.

### Cards

- Base: `rounded-lg` (0.75rem) or `rounded-xl` for trip cards
- Background: `bg-card` token (resolves to dark navy in dark mode)
- Padding: `p-6` standard; `p-3 sm:p-4` for compact trip cards
- Elevation: `shadow-card` default, `shadow-card-hover` on hover
- **No divider lines inside cards** — use spacing (`space-y-4` or `gap-6`) to separate sections
- Hover: transition background from `card` to slightly brighter surface over `0.3s ease-out`

### Badges & Status Indicators

| Status | Background | Text | Border | Icon |
|--------|-----------|------|--------|------|
| Pending | `warning/10` | `text-warning` | `warning/20` | Clock |
| Confirmed | `success/10` | `text-success` | `success/20` | Check |
| Rejected | `destructive/10` | `text-destructive` | `destructive/20` | Ban |
| Cancelled | `muted` | `text-muted-foreground` | `muted` | — |
| Cancellation Requested | `orange-100` | `text-orange-800` | `orange-200` | — |

Badge base styling: `px-2.5 py-0.5 rounded-full text-xs font-bold`

> Badges should use the 10% opacity background pattern (`color/10`) with matching text,
> not solid-color backgrounds.

### Form Inputs

- Height: `h-10`
- Padding: `px-3 py-2`
- Border: `border-input` (subtle in dark mode)
- Focus: ring in coral/primary color with `ring-2 ring-offset-2`
- Border radius: `rounded-md`
- Minimalist style — single bottom border is preferred per the Abyssal Coral spec
- Focus glow: cyan-electric with `4px` outer blur

### Alerts

- Default: `bg-background`, standard border
- Destructive: `border-destructive/50`, `text-destructive`, explicit `dark:border-destructive`
- Always include an icon (AlertCircle, CheckCircle, etc.)

---

## 4. Spacing & Layout

### Spacing Scale

ScubaTrip uses Tailwind's default 4px base unit. The most common values in practice:

| Token | Value | Usage |
|-------|-------|-------|
| `gap-1.5` / `space-y-1.5` | 6px | Tight label groups, card header internals |
| `p-3` / `gap-3` | 12px | Compact card padding (mobile) |
| `p-4` / `gap-4` | 16px | Standard element spacing, grid gaps |
| `p-6` / `gap-6` | 24px | Card padding, section spacing, grid gaps |
| `p-8` | 32px | Large section padding |
| `p-12` | 48px | Hero section padding |

### Layout Principles

- **Max width**: `1400px` centered container with `2rem` horizontal padding
- **Card grids**: `gap-4` (compact) or `gap-6` (spacious), responsive columns
- **Asymmetric padding** is encouraged — e.g., more padding on the left than right for editorial energy
- **Bento-box layouts**: Use varying card sizes in a grid rather than uniform rows
- **Generous whitespace**: When in doubt, increase spacing to `gap-8` or `gap-12` — never crowd the interface

### Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | `calc(0.75rem - 4px)` | Small UI elements, data-dense components |
| `rounded-md` | `calc(0.75rem - 2px)` | Inputs, dropdowns |
| `rounded-lg` | `0.75rem` | Cards, dialogs, alerts |
| `rounded-xl` / `rounded-3xl` | 1rem+ | Trip cards, feature cards |
| `rounded-full` | `9999px` | Buttons, avatars, pill badges |

### Responsive Breakpoints

Standard Tailwind breakpoints with mobile-first approach:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1400px (container max-width)

---

## 5. Glassmorphism & Depth

The Abyssal Coral system treats the UI as layers of frosted glass at different ocean depths.

### Surface Hierarchy

```
Layer 0 (Floor):    --background     #061219    Page canvas
Layer 1 (Section):  --muted          #17263A    Content sections
Layer 2 (Card):     --card           #0D1926    Interactive cards
Layer 3 (Glass):    white/5-10%      + blur     Floating nav, modals
```

### Glass Panels

- Background: `rgba(255, 255, 255, 0.05)` to `rgba(255, 255, 255, 0.10)`
- Blur: `backdrop-blur-xl` (20px)
- Border: `white/10` to simulate light catching acrylic glass edges
- Use for: floating navigation bars, modal overlays, sticky headers

### Tonal Transitions (No-Line Rule)

Section boundaries are defined by background color shifts, not borders:
- Shift from `background` to `muted` or `card` to separate sections
- Use `spacing-12` or `spacing-16` between sections instead of dividers
- If a border is absolutely required for accessibility, use `outline-variant` at 10-15% opacity

---

## 6. Animation & Motion

| Name | Duration | Easing | Usage |
|------|----------|--------|-------|
| `fade-in` | 0.5s | ease-out | Content appearing on page load |
| `slide-up` | 0.6s | ease-out | Cards entering viewport |
| `accordion-down/up` | 0.2s | ease-out | Collapsible sections |
| `bubble-float` | 4s | ease-in-out, infinite | Decorative background bubbles |
| Hover transitions | 0.2-0.3s | ease-out | `transition-colors`, `transition-all` |

---

## 7. Mockup vs. Code Gap Analysis

Comparing the Stitch Abyssal Coral mockups against the live implementation:

### Resolved Alignments
- Font families match: Plus Jakarta Sans (headlines) + Work Sans (body)
- Dark navy backgrounds are consistent
- Coral/orange CTA color is consistent across Landing, Login, and key pages
- Card-based layouts with rounded corners match
- Ocean gradient usage is present in both

### Gaps to Address

| Area | Stitch Mockup (Abyssal Coral) | Live Code | Action Needed |
|------|------------------------------|-----------|---------------|
| **Dark mode primary** | Coral `#FE7E4F` is the primary CTA | Primary maps to teal-cyan `hsl(193 100% 42%)` in dark mode | Remap `--primary` in `.dark` to coral, use cyan-electric as a distinct data/accent token |
| **Hardcoded colors** | Token-based design system | `TripCard.tsx` uses hardcoded `bg-yellow-500/20`, `text-green-300`, `text-[#00f0ff]` | Replace with semantic tokens (`warning/10`, `success`, `cyan-electric`) |
| **Body font weight** | Light (300) for body text | Normal (400) default | Consider `font-light` for body text per Abyssal Coral spec |
| **Border usage** | "No-Line Rule" — no 1px borders | Cards use `border` class with `border-border` | Evaluate removing card borders in favor of tonal stacking |
| **Button roundness** | `rounded-full` pill shapes | Mix of `rounded-md` and `rounded-full` | Standardize primary CTAs to `rounded-full` |
| **Glass effects** | `backdrop-blur-xl` on nav/modals | Limited glassmorphism in production | Add glass treatment to navbar and modal overlays |
| **Spacing density** | Spacious `spacing-scale: 3` | Standard Tailwind spacing | Increase padding in key areas for editorial breathing room |
| **Status badge tokens** | Uses design system semantic colors | Mix of hardcoded Tailwind colors and tokens | Consolidate to semantic token pattern |

---

## 8. Do's and Don'ts

### Do

- **Do** use `#FF7A54` coral for all primary CTAs — it is the "life" in the deep interface
- **Do** use `#00EFFF` cyan-electric for data readouts, coordinates, and technical HUD elements
- **Do** create depth through background color shifts (tonal stacking), not borders
- **Do** use `rounded-full` for primary buttons — the pill shape is a brand signature
- **Do** use extreme typographic scale — large bold headlines paired with tiny uppercase labels
- **Do** use ocean-tinted shadows instead of generic gray/black shadows
- **Do** use `backdrop-blur` glassmorphism for overlays and floating navigation
- **Do** use the 10% opacity background pattern for status badges (`bg-success/10 text-success`)
- **Do** keep generous whitespace — increase spacing before adding dividers
- **Do** use `font-display` (Plus Jakarta Sans) for all headings, `font-sans` (Work Sans) for body

### Don't

- **Don't** use pure black (`#000000`) — always use the ocean/navy scale for darkest values
- **Don't** use 1px solid borders to separate sections — use tonal background shifts instead
- **Don't** use generic gray drop shadows — tint shadows with ocean colors
- **Don't** use `font-medium` or `font-regular` for body text — prefer `font-light` for premium feel
- **Don't** hardcode Tailwind color classes (`bg-yellow-500`, `text-green-300`) — use semantic tokens
- **Don't** use `rounded-md` for primary CTA buttons — always `rounded-full`
- **Don't** mix inline hex values (`text-[#00f0ff]`) with design tokens — use the defined classes
- **Don't** crowd the interface — if it feels busy, double the spacing before adding structure
- **Don't** use standard drop shadows (`shadow-md`, `shadow-lg`) — use the custom `shadow-card` utilities
- **Don't** use uniform grid layouts everywhere — mix card sizes for bento-box visual interest

---

## 9. Quick Reference

### Stitch Design Systems

| Name | Mode | Primary Color | Character |
|------|------|--------------|-----------|
| **Deep Current** | Light | `#002147` navy | Editorial, nautical, professional |
| **Abyssal Coral** | Dark | `#FE7E4F` coral | Cinematic, immersive, premium |

> **Abyssal Coral** is the chosen direction for ScubaTrip's dark-first brand identity.

### Key Files

| File | Purpose |
|------|---------|
| `src/index.css` | CSS custom properties (all color tokens, gradients, shadows) |
| `tailwind.config.ts` | Tailwind theme extension (font families, color mappings, animations) |
| `src/components/ui/button.tsx` | Button variants (CVA) |
| `src/components/ui/badge.tsx` | Badge variants |
| `src/components/ui/card.tsx` | Card component structure |
| `src/lib/utils.ts` | `cn()` utility for class merging |

### CSS Utility Classes

| Class | Purpose |
|-------|---------|
| `bg-gradient-ocean` | 135deg ocean-to-teal gradient |
| `bg-gradient-ocean-deep` | 180deg deep ocean gradient |
| `text-gradient-ocean` | Gradient text effect (clip-text) |
| `shadow-card` | Default card elevation |
| `shadow-card-hover` | Hover card elevation |
| `shadow-ocean` | Bold floating element shadow |
