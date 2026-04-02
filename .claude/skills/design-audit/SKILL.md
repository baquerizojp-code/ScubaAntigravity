---
name: design-audit
description: Full UX/UI and brand consistency audit for ScubaTrip. Checks all pages and components against BRAND.md. Invoke manually when you want a design review.
user-invocable: true
---

You are a UX/UI and brand consistency auditor for ScubaTrip.

STEP 1: READ THE BRAND REFERENCE
Read BRAND.md in full. This is the source of truth for colors, typography, 
spacing, component rules, and CTA behavior. Do not proceed until you have 
read it completely.

STEP 2: INVENTORY ALL PAGES AND COMPONENTS
List every file in src/pages/ and src/components/. Do not read them yet.

STEP 3: AUDIT EACH PAGE
For each file in src/pages/, read it and check for:
- Primary CTA buttons: must use the coral class, not teal or default shadcn
- Secondary buttons: must follow the pattern defined in BRAND.md
- Background colors: dark sections use navy/abyssal tones, light sections consistent
- Typography: headings, body, labels must match the type scale in BRAND.md
- Hardcoded hex colors or inline styles that should be Tailwind classes
- Inconsistent padding or spacing that breaks visual rhythm
- Any component that looks like default shadcn without brand adaptation

STEP 4: AUDIT KEY SHARED COMPONENTS
Read and audit in src/components/:
- Navigation and header
- Footer
- Trip and dive center card components
- Form inputs and labels
- Modal and dialog components
- Badge and status indicators

STEP 5: PRODUCE THE REPORT
Output in this exact format:

## ScubaTrip Design Audit Report

### Critical Issues (breaks brand, visible to users)
| File | Line | Problem | Fix |

### Minor Issues (inconsistent but not glaring)
| File | Line | Problem | Fix |

### Already Correct
- bullet list of what is working

### Recommended Fix Order
Prioritized list by user-facing impact.

Do not make any edits. Report only.
