# landing page — design doc

Written before implementation, via a brainstorming session. This is the
durable record of what was decided and why; the module's own README
(once built) will document the code itself.

## Understanding Summary

- A full, multi-section marketing landing page for FitCore, rendered at
  the root `/` route for every visitor — logged out or logged in.
- Primary purpose: a portfolio showcase, proving design + engineering
  craft to reviewers, while still reading as a plausible real SaaS
  product page.
- Aesthetic direction: "Editorial / Performance Data" — extends the
  app's existing oklch token system and Space Grotesk heading font
  rather than introducing a separate visual identity; one bold accent
  color; the hero visually showcases the real analytics work via a
  stylized dashboard mockup rather than stock imagery or an icon grid.
- Structure: one long-scroll page, multiple sections — not a
  multi-page marketing site with separate `/pricing`, `/about`, etc.
- Auth-aware, not auth-gated: logged-in visitors still see the full
  page (unlike the old behavior, which silently redirected them away)
  — the header and closing CTA swap to a "Dashboard" button instead of
  Login/Sign Up.
- Sole maintainer is the project owner; content should stay simple
  enough to hand-edit later without needing a CMS.

## Assumptions

1. **Copy**: written as part of this design (see Final Design below);
   editable later, not sourced from the user.
2. **Visuals**: stylized mockup cards (fake-but-representative chart/
   dashboard UI), not real product screenshots or stock photography —
   no real screenshots exist yet, and mockups allow control over
   composition to fit the aesthetic.
3. **Layout**: a standalone marketing layout — no sidebar/topbar chrome
   from the authenticated app shell, just its own lightweight header
   and footer.
4. **Theming**: respects the app's existing light/dark mode toggle
   rather than being locked to one theme.
5. **Pricing section**: static illustrative content, not live-fetched
   from the real Plans API — avoids an empty/broken state if no plans
   exist in a given environment, and there's no live checkout since
   Payments/Stripe (Phase 3) is still deferred.
6. **Motion**: CSS-first — a small custom IntersectionObserver hook for
   scroll-reveal, no new animation library (no Framer Motion).
7. **Scope boundary**: just the landing page itself — no changes to the
   login/signup pages, no SEO/metadata strategy beyond basic
   title/description tags.
8. **Stats are honest, not fabricated**: since there are no real
   customers, the stats strip cites platform capability (role
   dashboards, module count, concurrency-tested booking, exportable
   reports) — never invented customer/usage numbers.

## Decision Log

| Decision | Alternatives considered | Why |
|---|---|---|
| Editorial/Performance-Data aesthetic | Industrial/Athletic Utilitarian, Retro-Futurist/Neon | Lowest consistency risk (extends existing tokens instead of replacing them), most portfolio-appropriate, literally showcases the analytics work as design |
| Landing page at `/` for everyone, auth-aware header/CTA | Auto-redirect logged-in users away from `/` entirely (the original behavior) | Lets a logged-in visitor revisit the marketing page (e.g. to check pricing) without being bounced; "Dashboard" becomes their one-click way back into the app |
| Full multi-section single-scroll page | Multi-page marketing site (`/pricing`, `/about`, etc.) | Matches "full marketing page" while staying simple to maintain, no routing/nav complexity |
| Stylized mockup visuals, not real screenshots | Embedding actual app screenshots | No real screenshots exist yet; mockups let composition be controlled to fit the aesthetic |
| Text wordmark, no logo asset | Commission/generate an icon mark | Matches how the app already presents its brand elsewhere (styled text in the sidebar); zero new asset dependency |
| New scoped `--landing-accent` token (warm amber/coral) | Reuse `--primary` or an existing `--chart-*` token | Keeps the landing page's bolder accent use contained — doesn't affect the authenticated app's existing look |
| CSS-first scroll-reveal via a small IntersectionObserver hook | Framer Motion | No new dependency; the design skill's guidance is CSS-first, motion sparse and purposeful |
| Stats strip cites platform capability | Fabricated customer/usage metrics | There are no real customers — inventing numbers would be dishonest, especially for a portfolio piece |
| Static pricing content, no live Stripe checkout | Wire pricing cards to the real Plans API | Stripe/Payments is still Phase 3, deliberately deferred; static avoids an empty-state risk too |
| Headline: "Run your gym on real numbers." | "Every class, every member, every dollar — accounted for."; "The gym platform that actually tells you what's working." | Shortest, hits hardest at large display scale, ties directly to the analytics differentiator |

## Final Design

### Design System Snapshot

- **Typography**: Space Grotesk (already in the project) as the
  expressive display font, pushed harder than elsewhere in the app
  (larger scale, tighter tracking, heavier weight contrast vs. body).
  Geist Sans stays as the restrained body font. Zero new font
  dependencies.
- **Color**: extends the existing oklch token system. One new scoped
  token, `--landing-accent` (warm amber/coral), used sparingly and
  consistently — CTA buttons, the hero chart's line, key numerals in
  the stats strip. Background/foreground/muted stay as the app's
  existing tokens.
- **Spacing rhythm**: generous vertical breathing room between
  sections (~120–160px desktop, scaling down on mobile). Content stays
  in a constrained reading-width column even on wide screens.
- **Motion**: one deliberate entrance sequence on the hero (headline →
  subhead → CTAs → floating chart card, staggered fade+rise on load),
  plus a lightweight scroll-reveal per section via a small custom
  IntersectionObserver hook. Feature cards get a subtle lift + accent
  border glow on hover. Nothing decorative or looping.

### Sections

1. **Header** — sticky, minimal, transparent-over-hero solidifying on
   scroll. Wordmark left. Right side is auth-aware: logged out shows
   "Login" (text) + "Sign Up" (filled accent button); logged in shows
   a single "Dashboard" button linking to `ROLE_HOME[user.role]`.

2. **Hero** — asymmetric two-column split (~58/40, not centered).
   Left: small uppercase eyebrow tag in the accent color, headline
   ("Run your gym on real numbers."), one-to-two-sentence subhead
   ("Booking, billing policy, staff, and the analytics to back every
   decision — one platform, built for how gyms actually run."), two
   CTAs (filled accent primary — "Get Started" or "Go to Dashboard"
   depending on auth; plain-text secondary — "Login" or "See how it
   works," scroll-anchored to Features). Right: a floating card with a
   stylized MRR line chart (Recharts, matching the app's real chart
   styling), subtle shadow, slight rotation so it reads as "placed."
   A second, smaller stat chip floats partially behind/beside it for
   layered depth — the one intentional overlap/asymmetry move in the
   hero. Background: one large, soft, low-opacity accent-colored blur
   behind the visual, nothing busier.

3. **Feature Highlights** — four features, alternating left/right
   layout (not an icon grid):
   - *Analytics that actually run the business* — small multi-metric
     dashboard mockup (MRR trend + churn rate + fill-rate bar).
     Revenue by plan, churn trend, class attendance, peak hours —
     exportable to CSV/PDF.
   - *Booking that never double-books* — a class card showing a seat
     auto-promoting from waitlisted to booked. Concurrency-safe
     booking with automatic waitlist promotion.
   - *Every role, its own dashboard* — a role-switcher chip row
     (Admin / Trainer / Front Desk / Member) with a preview card that
     changes per role. Four purpose-built experiences, one platform.
   - *Members who stick around* — a star-rating card + a progress
     chart snippet. Post-session reviews, progress tracking, and a
     freeze/cancellation policy that's actually enforced.

4. **Stats Strip** — four bold numbers (Space Grotesk, large,
   accent-colored numerals, small muted label beneath): "4 role-based
   dashboards," "12+ feature modules," "0 overbooked seats —
   concurrency-tested booking," "4 exportable analytics reports."

5. **Pricing Teaser** — 2-3 static illustrative plan cards (Individual,
   Annual, Family/Group), price + a few feature bullets + one CTA per
   card, styled to match the aesthetic.

6. **Closing CTA** — full-width high-contrast band, dark background
   with accent details, one short headline ("Ready to see it in
   action?") and a single button, auth-aware like the header.

7. **Footer** — minimal single row on desktop (stacked on mobile):
   wordmark + short tagline left, a few links right (Login, Sign Up),
   copyright line beneath.

### Route Behavior

`apps/web/src/app/page.tsx` no longer redirects on load. It always
renders the landing page. The header and closing CTA read auth state
(`useAuth()`) to decide which CTA to show — no more blank "Loading…"
flash for logged-out visitors.
