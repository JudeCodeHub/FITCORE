# landing module

The public marketing/portfolio-showcase page, rendered at `/` for
every visitor — logged out or logged in. See `DESIGN.md` in this same
folder for the full brainstorming record (understanding, assumptions,
decision log) written before this was built.

`LandingPage` (`pages/landing/`) composes seven sections, each its own
component under `pages/landing/components/`: `LandingHeader`,
`HeroSection`, `StatsSection`, `FeaturesSection`, `PricingSection`,
`CtaSection`, `LandingFooter`. The four feature-row visuals live under
`components/mockups/` — stylized, hardcoded-data cards (a Recharts
mini-chart, a booking card, a role-switcher, a review card), not real
screenshots or live data, since this is a marketing page, not a
dashboard.

**Auth-aware, not auth-gated:** `apps/app/page.tsx` no longer
redirects on load. `LandingHeader`, `HeroSection`, `PricingSection`,
and `CtaSection` each read `useAuth()` directly and swap their own CTA
between "Get Started"/"Sign Up" (logged out) and "Dashboard" (logged
in, linking to `ROLE_HOME[user.role]`) — there's no shared state for
this, each section just asks `useAuth()` itself, since it's cheap and
avoids prop-drilling auth state through `LandingPage`.

**`--landing-accent` and `--landing-contrast`** (in `globals.css`) are
scoped to this page only:
- `--landing-accent` — a warm amber, deliberately distinct from the
  app's cool teal `--primary`, used for every CTA/highlight on this
  page. **Every accent override on a `Button`/`buttonVariants()` link
  needs the `!` important prefix** (`!bg-landing-accent`, not
  `bg-landing-accent`) — without it, `Button`'s baked-in
  `bg-primary` wins the cascade tie, since CSS resolves same-specificity
  conflicts by stylesheet rule order, not by where the class sits in
  the `class` attribute. Caught this by comparing computed styles in a
  real browser, not by reading the code — it looked right until it
  didn't.
- `--landing-contrast` / `--landing-contrast-foreground` — a fixed
  dark-on-light pair used only by `CtaSection`'s band. It's
  deliberately identical in `:root` and `.dark` (unlike
  `--foreground`, which flips) — the closing CTA band is meant to be a
  dark high-contrast moment against the light-mode page, and using
  `--foreground` there would flip it to a jarring bright white band in
  dark mode instead.

No new state library, no query layer — this page is fully static.
Local `useState` handles the two small bits of interactivity (the
header's on-scroll solidify, `useScrollReveal`'s per-section fade-in).
