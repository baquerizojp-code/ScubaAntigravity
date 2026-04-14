# ScubaTrip — Full Project Context for Career Positioning

> **Purpose of this document:** Provide a complete, honest picture of the ScubaTrip project so that a career-focused AI agent (e.g., in a separate "JobHunt" Claude project) can help craft compelling, accurate descriptions for a CV, LinkedIn profile, portfolio, and interview talking points.

---

## 1. What Is ScubaTrip?

ScubaTrip is a **full-stack, production-deployed SaaS web application** for scuba diving trip management. It is a multi-sided marketplace platform connecting:

- **Divers** — who discover, browse, and book scuba diving trips
- **Dive Centers** — businesses that list and manage their trips, handle bookings, and communicate with divers
- **Super Admins** — platform operators who approve dive center registrations and manage the platform

The application is publicly deployed on Vercel and backed by a live Supabase PostgreSQL database. It is a real, working product — not a tutorial, not a boilerplate clone.

---

## 2. Technical Stack

| Layer | Technology |
|---|---|
| **Frontend framework** | React 18 (functional components, hooks) |
| **Build tool** | Vite (with SWC compiler plugin) |
| **Language** | TypeScript — strict mode fully enabled (`strict: true`, `noImplicitAny`, `strictNullChecks`) |
| **Routing** | React Router v6 (lazy-loaded routes, protected route wrappers) |
| **Backend / Database** | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| **Data fetching / caching** | TanStack React Query v5 |
| **Global state** | Zustand (used for i18n store only — intentionally minimal) |
| **UI component library** | shadcn/ui (Radix primitives + Tailwind CSS) |
| **Styling** | Tailwind CSS v3 with a custom design token system |
| **Forms** | React Hook Form + Zod validation schemas |
| **Testing** | Vitest + Testing Library (React) — 111 tests across 10 files |
| **Deployment** | Vercel (SPA rewrite rule, immutable asset caching headers, security headers) |
| **Analytics** | Vercel Web Analytics + Vercel Speed Insights |
| **CI/CD** | GitHub Actions — automated Claude Code Review on every PR, Claude PR Assistant |
| **i18n** | Custom Zustand-based system — English + Spanish (337 translation keys, full parity) |

---

## 3. Project Scale & Timeline

- **~449 commits** from January 2026 to April 2026 — approximately **3–4 months of active development**
- **22 database migrations** covering the full schema evolution from initial schema to production features
- **17 pages** across 3 distinct route trees (`/`, `/explore`, `/admin/*`, `/app/*`, `/super-admin/*`)
- **111 automated tests** across services, context, hooks, components, routes, and schemas
- **337 i18n translation keys** in both English and Spanish, with zero hardcoded UI strings
- **3 user roles** with completely separate UX flows and route trees
- **Custom brand design system** ("Abyssal Coral") — dual dark/light mode, 10-step ocean color scale, custom shadow utilities, glassmorphism effects

---

## 4. Architecture Decisions Worth Highlighting

### Clean Service Layer
All Supabase/database interactions are encapsulated in `src/services/` (trips, bookings, profiles). Pages never call Supabase directly — they go through custom hooks, which go through services. This was a deliberate architectural decision to separate concerns and make the codebase testable.

### Role-Based Access Control (RBAC)
The app implements a full RBAC system:
- Roles stored in a `user_roles` database table
- A `ProtectedRoute` component enforces access at the router level
- `AuthContext` exposes `role` and `diveCenterId` to the entire component tree
- Dive centers start with `pending` status and must be approved by a super admin before they can publish trips — a full approval workflow

### Database Automation with Triggers
A PostgreSQL trigger (`handle_new_user()`) fires after every new auth signup and automatically creates the user's role and profile rows. This eliminates a class of race conditions that would otherwise occur between the client and backend.

### Real-Time Features
Supabase Realtime is used for live in-app notifications. A shared `useRealtimeSubscription()` hook encapsulates channel setup and wires events to React Query cache invalidation. The `NotificationBell` component shows unread counts and supports mark-as-read for individual and all notifications.

### Session Persistence Strategy
`AuthContext` implements a custom localStorage/sessionStorage proxy. Whether the session persists beyond the browser tab is controlled by a "Remember Me" flag — a UX detail that required careful implementation at the storage layer.

### Performance Optimizations
- Vite manual chunk splitting: `vendor` chunk (React, React Router) + `ui` chunk (Radix UI) — reduces initial bundle size
- All routes are code-split with `React.lazy` + `Suspense`
- Vercel response headers set 1-year immutable cache for hashed assets
- LCP improvements applied (fetchpriority, image loading strategy)

### TypeScript Strict Mode
TypeScript strict mode was enabled as a deliberate upgrade mid-project (not from day one). This required systematically eliminating all unsafe type casts across the codebase — a multi-commit refactor tracked as a tech debt phase.

### Testing Infrastructure
A custom chainable Supabase mock (`src/test/mocks/supabase.ts`) mimics the PostgREST query-builder API, allowing full service-layer unit tests without hitting the network. A `renderWithProviders` test utility wraps React Query, AuthContext, and Router for component tests.

---

## 5. Key Features Built

### For Divers
- Trip discovery with date range filtering and search
- Trip detail page with booking flow (spot availability check, booking creation)
- Booking management (view status, request cancellation, cancel)
- Profile management (certification level, logged dives, emergency contact, avatar)
- Calendar export (ICS download + Google Calendar link generation)
- Real-time in-app notifications

### For Dive Centers (Admin)
- Full trip CRUD (create, edit, publish/unpublish/archive trips)
- Image upload to Supabase Storage with preview
- Booking management dashboard (approve, reject, handle cancellation requests)
- Center profile settings (name, description, WhatsApp, location)
- Pending approval banner (shown until super admin approves the center)

### For Super Admins
- Platform dashboard listing all registered dive centers
- Approve / reject / archive dive center registrations
- Center detail page with full center info
- Can switch into the diver or admin role view

### Platform-Wide
- Full dark mode / light mode toggle with persistent preference
- Bilingual UI (English / Spanish) with language switcher
- Mobile-responsive layouts (Navbar, admin layout, all major pages)
- Custom `PhoneInput` component with country code selector and E.164 validation
- Custom `DateRangePicker` component (built on react-day-picker)
- Error boundary wrapping the entire route tree
- Secure HTTP response headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)

---

## 6. Development Practices

- **Conventional commits** throughout (`feat:`, `fix:`, `refactor:`, `perf:`, `chore:`, `docs:`)
- **Pull-request workflow** — all significant features developed on branches with PRs merged to main
- **Automated AI code review in CI** — Claude Code Review GitHub Action runs on every PR touching `src/` or `supabase/migrations/`, providing automated review before merge
- **Claude PR Assistant** — GitHub Action that responds to `@claude` mentions in PR comments and issues, enabling AI-assisted issue resolution in the repo workflow
- **Tech debt phases** — the project went through 4 explicit tech debt cleanup phases (type safety, component decomposition, lint cleanup, strict mode enablement)
- **Design system documentation** — `BRAND.md` captures all color tokens, gradients, shadow utilities, typography rules, and component patterns
- **Zero hardcoded UI strings** — every user-facing string goes through the `t()` i18n function

---

## 7. The AI-Native Development Workflow (Key Differentiator for Target Roles)

This project was built using **Claude Code** (Anthropic's AI coding CLI) as the primary development tool throughout the entire 15-month lifecycle. This is central to the narrative for AI Solutions Engineer, Forward Deployed Engineer, and vibe coding roles.

### What "AI-native development" meant in practice on this project:

- **Claude Code as the primary development interface** — architecture decisions, feature implementation, debugging, and refactoring were all done collaboratively with Claude Code in the terminal
- **AI in the CI/CD pipeline** — two GitHub Actions workflows integrate Claude directly into the development loop: automated code review on every PR, and an `@claude` mention assistant for issues and PR comments
- **Custom AI skills for the project** — a `design-audit` skill was built specifically for ScubaTrip: a custom Claude Code skill that performs UX/UI and brand consistency audits against `BRAND.md` on demand
- **Prompt-driven iteration** — feature development, bug fixes, and tech debt cleanup were driven by natural language prompts, with the AI generating, reviewing, and refining code across the stack
- **Maintaining engineering rigor through AI collaboration** — strict TypeScript, 111 tests, service layer abstraction, and 22 DB migrations were all produced and maintained in an AI-assisted workflow, demonstrating that vibe coding does not mean sacrificing quality

### Why this matters for target roles:

| Role | Relevance |
|---|---|
| **AI Solutions Architect** | Demonstrates understanding of how to integrate AI tooling into real software development workflows at the process level, not just feature level |
| **AI Solutions Engineer** | Shows end-to-end hands-on delivery of a production system using AI-native methods — not theoretical |
| **Forward Deployed Engineer** | FDEs must ship fast, understand full-stack systems, and adapt to customer environments. This project shows all three: rapid solo delivery, full-stack ownership, and working with modern AI tooling |
| **Vibe coding / AI-first developer** | The canonical example of what vibe coding looks like when done with engineering discipline — a complete, tested, deployed product built primarily through AI collaboration |

---

## 8. What Makes This Project Stand Out

1. **Real multi-sided platform** — not a CRUD app. Approval workflows, role-based routing trees, distinct UX flows per user type.
2. **Built end-to-end by one person using AI-native methods** — design system, database schema, backend logic, frontend, testing, CI/CD, and deployment — all via AI-assisted development.
3. **Production-quality output from AI-assisted workflow** — strict TypeScript, automated testing, service layer abstraction, PR workflow, real CI/CD. Proof that AI-native development can meet professional engineering standards.
4. **Custom design system from scratch** — documented brand identity ("Abyssal Coral") with custom Tailwind tokens, dual dark/light mode, glassmorphism effects — not a template skin.
5. **Bilingual** — full EN/ES internationalization with zero hardcoded strings.
6. **Real-time** — live notification system using Supabase Realtime with React Query integration.
7. **AI integrated at the workflow level, not just the feature level** — Claude Code CLI + GitHub Actions CI = AI is embedded in every commit, every PR, every review cycle.
8. **~449 commits in 3–4 months** — demonstrates rapid, high-output delivery enabled by AI-native development methods.

---

## 9. Live URLs and Repository

- **Live application (beta):** `https://scubatrip.vercel.app`
  *(Deployed on Vercel — confirmed live and loading correctly as of April 2026. Note: `www.scubatrip.vercel.app` does NOT work — use the URL without `www`.)*
- **GitHub repository:** Currently public. The owner plans to make the source code private in the future and may maintain a separate public-facing version for portfolio purposes. The career agent should ask the user for the current GitHub URL at the time of drafting CV/LinkedIn content.

> **Note to career agent:** Verify both URLs are still active before including them in any published CV or LinkedIn content.

---

## 10. Remaining Questions the Career Agent Should Ask the User

Before creating CV/LinkedIn content, the career agent should clarify:

1. **What is the GitHub repository URL?** (Confirm current public URL before linking)
2. **What level are you applying for?** (Mid, Senior, Lead — affects how the solo delivery story is framed)
3. **What industries or company types are you targeting?** (AI labs, SaaS startups, consulting firms, enterprise)
4. **Do you want to position this as a personal project, a portfolio piece, or an indie product?**
5. **What other projects or professional experience does this sit alongside?** (So it can be framed in context and not over-indexed)
6. **Do you have a preferred way to describe your AI-native workflow?** (e.g., "vibe coding", "AI-assisted development", "LLM-augmented engineering" — the framing matters for different audiences)

---

*Document generated: April 2026. Based on codebase state as of commit `424acdd`. Development started January 2026 — the first git commit carries a bogus `2025-01-01` timestamp from the Vite/shadcn template generator; the actual project start date is January 2026.*
