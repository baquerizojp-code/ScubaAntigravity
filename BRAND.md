# ScubaTrip Brand Guidelines

> **Design Direction: Abyssal Coral** — a cinematic, dark-first aesthetic inspired by
> looking through a submersible viewport. The interface is immersive, layered, and deep.
> Information surfaces from the abyss; coral energy draws the eye to action.

---

## 1. Color Palette

ScubaTrip uses a dual-mode palette. CSS custom properties (HSL) are defined in `src/index.css`
and mapped to Tailwind tokens in `tailwind.config.ts`. **Dark mode is the primary aesthetic;
light mode is the clean, professional alternative.** Both modes share the same coral primary.

### Primary Semantic Tokens

| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| `--background` | `hsl(201 60% 6%)` `#061219` | `hsl(206 50% 98%)` `#F4F8FB` | Page canvas |
| `--foreground` | `hsl(210 20% 95%)` `#EEF1F4` | `hsl(202 15% 11%)` `#171F26` | Default text |
| `--card` | `hsl(201 50% 10%)` `#0D1926` | `hsl(0 0% 100%)` `#FFFFFF` | Card surfaces |
| `--muted` | `hsl(201 40% 15%)` `#17263A` | `hsl(206 18% 93%)` `#EAF0F4` | Subtle backgrounds |
| `--muted-foreground` | `hsl(210 15% 60%)` `#8B9CB0` | `hsl(224 5% 48%)` `#737585` | Secondary text |
| `--border` | `hsl(201 40% 18%)` `#1C2E42` | `hsl(229 11% 79%)` `#C4C6D6` | Borders |
| `--secondary` | `hsl(201 60% 25%)` `#193B57` | `hsl(212 100% 14%)` `#002147` | Structural dark elements |
| `--accent` | `hsl(193 80% 30%)` `#0B8FA6` | `hsl(212 100% 14%)` `#002147` | Active state highlights |

### Accent & Action Colors (Mode-Independent)

| Token | Tailwind Class | Hex | Usage |
|-------|----------------|-----|-------|
| Coral / `--primary` | `text-primary`, `bg-primary` | `#FF7A54` (`hsl(16 99% 65%)`) | **Primary CTA buttons — the single most important brand color** |
| Cyan Electric | `text-cyan-electric`, `bg-cyan-electric` | `#00EFFF` (`hsl(187 100% 50%)`) | HUD data labels, dive site names, active accents |
| Teal 500 | `text-teal-500`, `bg-teal-500` | `#00B3B3` (`hsl(193 100% 35%)`) | Gradient endpoints, secondary accents |
| Coral (soft) | `text-coral`, `bg-coral` | `#FF6666` (`hsl(0 100% 70%)`) | Soft coral badges, decorative tags |

> **Critical rule**: `--primary` resolves to `hsl(16 99% 65%)` in **both** light and dark mode.
> This means coral CTAs look consistent across themes. Do NOT change this for any screen.

### Ocean Scale

A 10-step navy-to-ice scale for depth layering — defined in both `:root` and `.dark`:

| Token | HSL | Hex | Usage |
|-------|-----|-----|-------|
| `ocean-900` | `hsl(207 63% 10%)` | `#091A27` | Deepest bg (TripCard overlay, placeholders) |
| `ocean-800` | `hsl(201 80% 14%)` | `#072840` | Dark section backgrounds |
| `ocean-700` | `hsl(201 100% 20%)` | `#003E66` | Gradient deep end |
| `ocean-600` | `hsl(201 100% 28%)` | `#005A8F` | Gradient midpoints |
| `ocean-500` | `hsl(201 100% 36%)` | `#0071B8` | Primary ocean blue, gradient bright end |
| `ocean-400` | `hsl(201 80% 50%)` | `#1A99E6` | Links, footer headings, interactive highlights |
| `ocean-300` | `hsl(201 70% 65%)` | `#6CB8DE` | Secondary metadata on dark surfaces |
| `ocean-200` | `hsl(201 80% 80%)` | `#9DD4F2` | Subtle labels, footer body text |
| `ocean-100` | `hsl(201 100% 92%)` | `#D6F0FF` | Light backgrounds (light mode only) |
| `ocean-50` | `hsl(201 100% 97%)` | `#F0F9FF` | Near-white tint (light mode only) |

### Semantic Status Colors

| Token | Value | Hex | Usage |
|-------|-------|-----|-------|
| `success` | `hsl(160 60% 45%)` | `#2EB882` | Confirmed bookings, safe states |
| `warning` | `hsl(38 92% 50%)` | `#F5A623` | Pending bookings, attention needed |
| `destructive` (dark) | `hsl(0 62% 30%)` | `#7C1D1D` | Cancel, reject, errors in dark mode |
| `destructive` (light) | `hsl(0 75% 42%)` | `#B52020` | Cancel, reject, errors in light mode |

### Gradients

| Name / Class | CSS Definition | Usage |
|---|---|---|
| `bg-gradient-ocean` | `linear-gradient(135deg, hsl(201 100% 36%), hsl(193 100% 42%))` | Feature icon circles, step indicators |
| `bg-gradient-ocean-deep` | `linear-gradient(180deg, hsl(201 100% 20%), hsl(201 100% 36%))` | Admin headers, immersive panels |
| `text-gradient-ocean` | Same as above, applied via `bg-clip-text text-transparent` | Gradient text effects |
| Hero overlay | `bg-gradient-to-b from-transparent via-secondary/60 to-secondary` | Landing page hero image darkening |

### Custom Shadow Utilities

| Class | CSS Value | Usage |
|-------|-----------|-------|
| `shadow-card` | `0 1px 3px ocean-500/6%, 0 4px 12px ocean-500/4%` | Default card elevation |
| `shadow-card-hover` | `0 4px 16px ocean-500/10%, 0 8px 32px ocean-500/6%` | Card hover lift |
| `shadow-ocean` | `0 4px 20px ocean-500/25%` | Floating action elements |

> **Rule**: Shadows must use ocean-tinted colors, never pure black. This maintains
> the oceanic depth feel of the Abyssal Coral system.

---

## 2. Typography

Two typefaces create tension between editorial impact and technical precision.
Both fonts are loaded via `<link>` tags in `index.html` (non-render-blocking).

### Font Stack

| Role | Family | Tailwind Token | Applied To |
|------|--------|----------------|------------|
| Display / Headlines | **Plus Jakarta Sans** | `font-display`, `font-headline` | All `h1`–`h6` (via global base layer in `index.css`) |
| Body / Labels | **Work Sans** | `font-sans`, `font-body`, `font-label` | Default body text, form labels, data, buttons |

> Headings automatically use `font-display` via the global `@layer base` rule in `index.css`.
> Body text is globally set to `font-light` (weight 300) — this is confirmed in production (not a gap).

### Type Scale in Practice

| Level | Tailwind | Size | Weight | Used In |
|-------|----------|------|--------|---------|
| Display | `text-5xl` to `text-[5.5rem]` | 48–88px | `font-extrabold` / `font-black` | Landing hero H1 |
| Page title | `text-4xl`, `text-5xl` | 36–48px | `font-extrabold` | Dashboard welcome, section heroes |
| Section title | `text-2xl`, `text-3xl`, `text-4xl` | 24–36px | `font-bold` | Feature section headings |
| Card title | `text-lg`, `text-xl` | 18–20px | `font-semibold` / `font-bold` | Card headers, trip titles |
| Body | `text-base` | 16px | `font-normal` / `font-light` | Paragraph text (globally `font-light`) |
| UI label | `text-sm` | 14px | `font-medium` | Badges, descriptions, form labels |
| Caption / HUD | `text-xs`, `text-[10px]` | 10–12px | `font-bold` + `uppercase tracking-widest` | Status tags, dive site HUD labels, metadata |

### Typography Rules

- **Headlines** use `tracking-tight` (`-2%`) for a "pressed editorial" look
- **HUD labels** (dive site, metadata) use `uppercase tracking-widest text-xs font-bold` for the instrument/coordinates feel
- **Coral CTA labels** on hero buttons use `font-headline font-bold` to match the display weight energy
- **Footer links** use `text-sm font-semibold uppercase tracking-widest`
- **Body text** is globally `font-light` (300 weight) per the Abyssal Coral spec — applied in `index.css` `body` rule

---

## 3. Component Guidelines

### Buttons (CTAs)

| Variant | Style | Usage |
|---------|-------|-------|
| **Primary** | `bg-primary` coral, `text-primary-foreground` white, `rounded-full` | "Book Now", "Explore Trips", main actions |
| **Hero Outline** | `bg-white/5 backdrop-blur-lg border-white/20 text-white rounded-full` | Hero secondary action over dark image |
| **Outline (light sections)** | `border-primary/20 text-foreground hover:bg-primary/5 rounded-full` | Secondary CTAs on light-bg sections |
| **Secondary** | `bg-secondary` navy, white text | Structural actions |
| **Ghost** | Transparent, `hover:bg-muted hover:text-foreground` | Nav items, sidebar items (inactive) |
| **Destructive** | `bg-destructive text-destructive-foreground` | Confirmation dialogs, cancel actions |

**Hover pattern:**
- Primary: `hover:brightness-110` (not `hover:opacity-90`) — brightness shift feels more dynamic
- Also add `shadow-lg shadow-primary/20` to primary buttons for depth

> **Rule**: Primary CTAs **must always** be `rounded-full`. The pill shape is a core brand
> signature from the Abyssal Coral system. Icon-only buttons use `rounded-full` too.

### Cards

- Base radius: `rounded-xl` for trip cards; `rounded-2xl`/`rounded-3xl` for feature cards
- Background: `bg-card` (dark navy in dark, white in light mode)
- Padding: `p-5`/`p-6` standard; `p-3 sm:p-4` or `p-4 sm:p-5` for compact inner panels
- Elevation: `shadow-card` default → `shadow-card-hover` on hover, with `transition-all duration-300`
- **No-Line Rule**: Section-level cards have no border — use `shadow-card` only. For glassmorphism inner panels, use `border-white/10`
- Hover: lift with `hover:-translate-y-2` + brightness or shadow increase

### TripCard Pattern

The `TripCard` component is the canonical production reference for the image-overlay glassmorphism card.

| Layer | Classes | Purpose |
|-------|---------|---------|
| Card root (Link) | `rounded-xl overflow-hidden shadow-xl aspect-[4/5] sm:aspect-[3/4]` | Shape, clip, aspect ratio |
| Hover lift | `hover:-translate-y-2 transition-transform duration-500` | Card lift on hover |
| Image fill | `absolute inset-0 w-full h-full object-cover group-hover:scale-110 duration-700` | Full-bleed + parallax zoom |
| No-image fallback | `bg-ocean-900` | Solid dark fill when no trip image |
| Image overlay | `bg-gradient-to-t from-background/95 via-background/40 to-transparent` | Depth vignette over image |
| Info panel | `bg-ocean-900/85 backdrop-blur-lg rounded-xl border border-white/10 shadow-2xl` | Frosted glass bottom panel |
| Dive site label | `text-cyan-electric text-[10px] font-bold uppercase tracking-widest` | HUD-style location label |
| Card title | `font-headline font-bold line-clamp-1 text-lg sm:text-xl` | Single line, consistent height |
| Price label | `text-xs text-ocean-200` + `text-xl font-black text-white` | "from $X" pricing display |
| Center name badge | `bg-white/10 text-xs text-ocean-200` with `bg-cyan-electric` dot | Center attribution |
| Metadata icons | `text-ocean-300 text-[10px] uppercase tracking-tighter font-bold` | Time, spots, date |
| Date pill | `bg-white/10 border-white/5 rounded-full text-white uppercase tracking-widest` | Date stamp |
| Action icon (heart) | `bg-white/10 backdrop-blur-md rounded-full border-white/10` | Frosted glass icon button |

### Badges & Status Indicators

All status badges use the `bg-{token}/10 text-{token} border-{token}/20` opacity pattern.
The canonical source is `src/lib/statusColors.ts` — **always import from there, never duplicate**.

**Booking status** (`BOOKING_STATUS_CLASSES` / `BOOKING_STATUS_CLASSES_WITH_BORDER`):

| Status | Classes |
|--------|---------|
| `pending` | `bg-warning/10 text-warning` (+ `border-warning/20` with border variant) |
| `confirmed` | `bg-success/10 text-success` (+ `border-success/20`) |
| `rejected` | `bg-destructive/10 text-destructive` (+ `border-destructive/20`) |
| `cancellation_requested` | `bg-warning/10 text-warning` (+ `border-warning/20`) |
| `cancelled` | `bg-muted text-muted-foreground` (+ `border-muted`) |

**Trip status** (`TRIP_STATUS_CLASSES`):

| Status | Classes |
|--------|---------|
| `draft` | `bg-muted text-muted-foreground` |
| `published` | `bg-primary/10 text-primary` |
| `completed` | `bg-muted text-muted-foreground` |
| `cancelled` | `bg-destructive/10 text-destructive` |

Badge base: `px-2.5 py-0.5 rounded-full text-xs font-bold border`

### Form Inputs

- Height: `h-10`
- Padding: `px-3 py-2`
- Border: `border-input` (resolves to border token for mode)
- Focus ring: `ring-2 ring-ring` — ring resolves to coral (`hsl(16 99% 65%)`) in both modes
- Border radius: `rounded-md`

### Destructive Confirmations

- Always use `AlertDialog` (Radix/shadcn) — never `window.confirm()`
- Destructive confirm button: `variant="destructive"` (maps to `bg-destructive text-destructive-foreground`)

---

## 4. Spacing & Layout

### Container & Max Width

- Container: `max-w-container` centered, `padding: 2rem` horizontal (Tailwind `container` config)
- Max width: `1400px` at `2xl` breakpoint
- Page sections frequently use `max-w-4xl` or `max-w-7xl mx-auto` with `px-5 sm:px-6`

### Spacing Scale (Common Values)

| Token | Value | Used For |
|-------|-------|---------|
| `gap-1.5` / `space-y-1.5` | 6px | Tight label groups, metadata rows |
| `p-3` / `gap-3` | 12px | Compact mobile padding |
| `p-4` / `gap-4` | 16px | Standard element spacing |
| `p-5`–`p-6` / `gap-5`–`gap-6` | 20–24px | Card padding, section grid gaps |
| `py-16` / `py-24` | 64–96px | Section vertical padding |
| `py-24` / `py-32` | 96–128px | Hero/focal section padding |

### Layout Principles

- **Generous whitespace first** — double spacing before adding structural dividers
- **Bento-box layouts** — vary card sizes in grids rather than uniform rows
- **Tonal separation** — sections are divided by `bg-background` → `bg-muted/50` → `bg-secondary` shifts, not horizontal rules
- **Mobile-first responsive** — `sm:` breakpoint (640px) for most phased expansions; `lg:` (1024px) for layout switches

### Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | `calc(0.75rem - 4px)` | Small utility elements |
| `rounded-md` | `calc(0.75rem - 2px)` | Inputs, dropdowns |
| `rounded-lg` | `0.75rem` | Dialogs, alerts, standard cards |
| `rounded-xl` | `~1rem` | Trip cards, feature panels |
| `rounded-2xl` / `rounded-3xl` | `1.5rem+` | Landing feature cards |
| `rounded-full` | `9999px` | CTAs, avatars, pill badges, date stamps |

---

## 5. Glassmorphism & Depth

The Abyssal Coral system treats the UI as layers of frosted glass at different ocean depths.

### Surface Hierarchy

```
Layer 0 (Floor):    --background   Page canvas
Layer 1 (Section):  --muted        Content section backgrounds
Layer 2 (Card):     --card         Interactive card surfaces
Layer 3 (Glass):    white/5-10%    Floating nav, modal overlays, card inner panels
```

### Glass Recipe

- Background: `bg-white/5` to `bg-white/10` (subtle), or `bg-ocean-900/85` (opaque glass over images)
- Blur: `backdrop-blur-lg` (16px) for inner panels; `backdrop-blur-xl` (24px) for floating navigation
- Border: `border border-white/10` to simulate light catching acrylic glass edges
- Shadow: `shadow-2xl` when the glass surface is elevated above content

### Canonical Glass Implementations

| Surface | Classes | File |
|---------|---------|------|
| TripCard info overlay | `bg-ocean-900/85 backdrop-blur-lg rounded-xl border border-white/10 shadow-2xl` | `src/components/TripCard.tsx` |
| Admin mobile header | `bg-card/80 backdrop-blur-xl border-b border-white/10` | `src/components/AdminLayout.tsx` |
| Hero primary CTA overlay | `shadow-xl shadow-primary/20` (glow, not blur) | `src/pages/Landing.tsx` |
| Hero outline CTA | `bg-white/5 backdrop-blur-lg border-white/20 rounded-full` | `src/pages/Landing.tsx` |
| Notification dropdown | `bg-card border border-border rounded-xl shadow-lg` | `src/components/NotificationBell.tsx` |

> Use `ocean-900/85` (not pure `white/10`) when the surface sits **over an image** — it maintains
> readability in both dark and light mode by anchoring to the ocean palette.

### Tonal Transitions (No-Line Rule)

Section boundaries are defined by background color shifts, not borders:
- `bg-background` → `bg-muted/50` → `bg-secondary` for progressive darkening
- Use `py-16`/`py-24` between sections instead of `<hr>` dividers
- If a border is needed for accessibility/structure, use `border-white/10` (dark) or `border-border` (light)

---

## 6. Animation & Motion

All animations are defined in `tailwind.config.ts` under `keyframes` + `animation`.

| Name / Class | Duration | Easing | Usage |
|---|---|---|---|
| `animate-fade-in` | 0.5s | ease-out | Content appearing on page load; applied with `style={{ animationDelay }}` for staggered reveals |
| `animate-slide-up` | 0.6s | ease-out | Cards and sections entering viewport; staggered with `animationDelay` |
| `animate-accordion-down/up` | 0.2s | ease-out | Collapsible sections (Radix Accordion) |
| `animate-bubble-float` | 4s | ease-in-out infinite | Decorative background bubbles (if used) |
| Hover transitions | 0.2–0.3s | ease-out | `transition-colors`, `transition-all` on interactive elements |
| Card hover lift | 0.5s | — | `hover:-translate-y-2 transition-transform duration-500` |
| Image zoom | 0.7s | — | `group-hover:scale-110 transition-transform duration-700` |

> **Animation pattern**: Use `animate-slide-up` with `style={{ animationDelay: \`${i * 0.08}s\` }}`
> on grid items for a staggered cascade effect. This is the pattern used on Landing feature cards.

---

## 7. Page-Level Design Patterns

### Landing Page (`/`)

- **Hero**: Full-viewport (`h-screen min-h-[800px]`), `bg-secondary` base, WebP hero image at `opacity-50 mix-blend-luminosity`, `bg-gradient-to-b from-transparent via-secondary/60 to-secondary` overlay
- **Navbar**: Transparent (`/`) via `<Navbar transparent />` prop
- **Feature cards**: `rounded-2xl bg-card shadow-card` with No-Line Rule (no border), icon circles use `bg-gradient-ocean`
- **"How It Works" section**: `bg-muted/50` background, 3-column grid, ocean gradient icon circles
- **Connection section**: Asymmetric 2-column layout, image left + text + CTAs right
- **Footer**: `bg-secondary` dark navy, ocean-colored text hierarchy

### Admin Layout (`/admin/*`)

- **Sidebar**: `w-64 bg-muted` — uses tonal shift, no `border-r` (No-Line Rule). Active nav item: `bg-primary text-primary-foreground`; inactive: `text-muted-foreground hover:bg-muted hover:text-foreground`
- **Mobile header**: `bg-card/80 backdrop-blur-xl border-b border-white/10` — glassmorphism header with ThemeToggle + NotificationBell
- **Main content**: `bg-background`, padding `p-4 md:p-6 lg:p-8`

### Diver Layout (`/app/*`)

- Bottom-tab navigation on mobile; sidebar on desktop
- Same coral primary accent for active states

### Public Explore (`/explore`, `/explore/:id`)

- Full public-facing pages, accessible without login
- Same design language as Landing

---

## 8. Key Files Quick Reference

| File | Purpose |
|------|---------|
| `src/index.css` | All CSS custom properties (color tokens, gradients, shadow values, base layer) |
| `tailwind.config.ts` | Tailwind theme: font families, color mappings, animations, border-radius |
| `src/lib/statusColors.ts` | **Source of truth** for all booking & trip status badge classes |
| `src/lib/constants.ts` | Named constants (magic number elimination) |
| `src/components/ui/button.tsx` | Button CVA variants |
| `src/components/ui/badge.tsx` | Badge variants |
| `src/components/ui/card.tsx` | Card base structure |
| `src/lib/utils.ts` | `cn()` utility for class merging |
| `src/components/TripCard.tsx` | **Canonical reference** for glassmorphism image-overlay card |
| `src/components/AdminLayout.tsx` | **Canonical reference** for mobile glassmorphism header + tonal sidebar |
| `src/pages/Landing.tsx` | **Canonical reference** for hero section, CTA patterns, footer |
| `src/components/NotificationBell.tsx` | Notification dropdown pattern |

---

## 9. CSS Utility Class Reference

| Class | Purpose |
|-------|---------|
| `bg-gradient-ocean` | 135° ocean-to-teal gradient (feature icons, step circles) |
| `bg-gradient-ocean-deep` | 180° deep ocean gradient (admin headers) |
| `text-gradient-ocean` | Gradient text via `bg-clip-text text-transparent` |
| `shadow-card` | Default card elevation (ocean-tinted) |
| `shadow-card-hover` | Hover card elevation |
| `shadow-ocean` | Bold floating element shadow |

---

## 10. Do's and Don'ts

### Do

- **Do** use `hsl(16 99% 65%)` coral (`bg-primary`) for all primary CTAs — it is the "life" in the deep interface
- **Do** use `text-cyan-electric` for dive sites, coordinates, and HUD data labels
- **Do** create depth through background color shifts (tonal stacking), not border lines
- **Do** use `rounded-full` for **all** primary action buttons — the pill is a brand signature
- **Do** use the extreme typographic scale — large bold headline + tiny uppercase HUD caption
- **Do** use ocean-tinted shadows (`shadow-card`, `shadow-ocean`) instead of gray/black shadows
- **Do** use `backdrop-blur` glassmorphism for overlays, floating nav, and card inner panels over images
- **Do** use the `bg-{token}/10 text-{token} border-{token}/20` pattern for all status badges
- **Do** import status classes from `src/lib/statusColors.ts` — never duplicate them
- **Do** add `shadow-primary/20` glow on primary CTA buttons for depth
- **Do** stagger `animate-slide-up` items with increasing `animationDelay` for grid entrances

### Don't

- **Don't** use pure black (`#000000`) — use the ocean/navy scale for darkest values
- **Don't** use `border-r` or horizontal `<hr>` to separate layout sections — use tonal background shifts
- **Don't** use generic gray drop shadows — tint shadows with ocean colors
- **Don't** hardcode Tailwind color classes like `bg-yellow-500` or `text-green-300` — use semantic tokens
- **Don't** use `rounded-md` for primary CTA buttons — always `rounded-full`
- **Don't** use inline hex values (`text-[#00f0ff]`) — use `text-cyan-electric`
- **Don't** crowd the interface — when in doubt, double the gap before adding structural elements
- **Don't** use `shadow-md` or `shadow-lg` — use `shadow-card` or `shadow-card-hover`
- **Don't** define status badge classes inline in components — import from `statusColors.ts`
- **Don't** set different `--primary` values for light vs dark — coral must stay consistent across themes

---

## 11. Design System Status

All major design gaps have been resolved as of April 2026:

| Area | Status | Detail |
|------|--------|--------|
| **Primary CTA color (dark mode)** | ✅ Resolved | `--primary` = coral `hsl(16 99% 65%)` in both modes |
| **Body font weight** | ✅ Resolved | `font-light` applied globally in `index.css` `body` rule |
| **HUD label tokens** | ✅ Resolved | Replaced `text-[#00f0ff]` → `text-cyan-electric`, `text-slate-300` → `text-ocean-200/300` |
| **Button roundness** | ✅ Resolved | All primary CTAs use `rounded-full` |
| **Status badge tokens** | ✅ Resolved | Consolidated in `statusColors.ts`; `bg-{token}/10 text-{token}` pattern throughout |
| **Glass effects** | ✅ Resolved | TripCard overlay, AdminLayout mobile header, hero CTAs |
| **Shadow system** | ✅ Resolved | `shadow-card`/`shadow-card-hover` used consistently |
| **No-Line Rule** | ✅ Resolved | Admin sidebar uses tonal shift; Landing feature cards use shadow-only |
| **Card border refinement** | ✅ Resolved | `border-white/10` for glass panels; no-border on tonal-stack sections |

**Remaining open items (low priority):**

| Area | Detail |
|------|--------|
| Mutation error handling | Some mutations lack `onError` toast — UX consistency item, not brand |
| Accessibility (a11y) | No `jsx-a11y` ESLint plugin; some ARIA improvements possible |
