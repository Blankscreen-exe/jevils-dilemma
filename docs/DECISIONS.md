# Architecture Decision Log

> Lightweight ADRs. Each entry: the decision, why, and what was rejected.
> Status: **Proposed** (not yet confirmed) · **Accepted** · **Superseded**

---

## ADR-001 — Rebuild from a clean slate

**Status:** Accepted

The previous codebase was scaffolding for a different design (free-text answers, planned
multiplayer, Redux, React Router). Rather than migrate it, we start fresh with a scope that
matches the current design ([GAME_DESIGN.md](./GAME_DESIGN.md)).

## ADR-002 — Client-only, no backend

**Status:** Accepted

Solo play with static content needs no server. This removes hosting cost, auth, and privacy
concerns (player answers never leave the device), and lets the app work fully offline.
**Trade-off:** no cross-device sync or multiplayer; revisit only if multiplayer returns.

## ADR-003 — React + Vite + TypeScript

**Status:** Accepted

- **React** — requirement.
- **Vite** — fast dev server, first-class PWA plugin, standard choice now that CRA is deprecated.
- **TypeScript** — the card data, game state, and persisted save format are all structured
  data; types catch mismatches at compile time and document the shapes.
  **Rejected:** Next.js (SSR/routing we don't need for a static offline app).

## ADR-004 — PWA via `vite-plugin-pwa`

**Status:** Accepted

Generates the web manifest and a Workbox service worker that precaches the app shell, the
card JSON, fonts, and sprites, so the game installs and runs offline.

- Icons are generated at build time from one source SVG (`public/icon.svg`) by
  `@vite-pwa/assets-generator`, so no binary icons are committed.
- Only `.woff2` fonts are precached; every browser with service worker support reads woff2.
- `registerType: 'autoUpdate'`: a new deploy replaces the old cache on next load. Saved games
  live in `localStorage`, so updates never lose progress.
  **Rejected:** hand-written service worker (more code to get caching/update logic right).

## ADR-005 — State: `useReducer` modelled as a state machine

**Status:** Accepted

The game has a small number of explicit phases (`title → playing → results`; while playing, a
card is either awaiting a pick or has a `pending` pick awaiting the "why?" step). A reducer
with discriminated-union state makes illegal states unrepresentable and is trivially unit-testable
as a pure function. A `useGame` hook owns the reducer and passes state and callbacks down as
props; the tree is shallow (one screen at a time), so a Context provider would add indirection
without removing any prop drilling.
**Rejected:** Redux Toolkit / Zustand (overkill for one screen-flow); XState (good fit, but an
extra dependency and learning curve for a machine this small — reconsider if flows grow).

Implemented in `src/game/state.ts`. Timing is passed in with each `pick` action rather than
read inside the reducer, which keeps it pure and deterministic; randomness is likewise injected
into `deal()`.

## ADR-006 — No router in v1

**Status:** Accepted

Screens are derived from the game phase, not from URLs; deep-linking into "card 7" is
meaningless. Avoids a dependency and keeps state as the single source of truth.
**Revisit** if we add pages that deserve URLs (e.g. an "about" or collection page).

## ADR-007 — Persistence in `localStorage`, versioned and validated

**Status:** Accepted

- A single key holds `{ version, current, history }` (implemented in `src/game/save.ts`).
- The run in progress stores **card ids**, not card objects, and is rebuilt from the deck on
  load; if a card has since been removed, the save is dropped rather than half-restored.
- History keeps the latest 20 finished runs.
- The run in progress also stores each card's **dealt answer order**, so a resumed run shows
  the answers exactly as they were dealt.
- **Versioning in practice:** moving from two to three answers per card bumped the save to
  v2. A v1 save fails validation and is discarded, which is the right call because its cards
  no longer exist in the deck.
- Data is **validated on load** (schema check); corrupt or old-version data is migrated or
  discarded instead of crashing the app.
- All access wrapped in `try/catch` (private mode / quota errors).
  **Rejected:** IndexedDB — unnecessary for a few KB of JSON.

## ADR-008 — Cards in a bundled JSON file, schema-validated

**Status:** Accepted

Questions live in `src/data/cards.json`, imported at build time (bundled and precached — no
fetch/loading states). A schema (e.g. Zod) validates the deck in a unit test so a malformed
card fails CI rather than production. Card IDs are stable slugs.

Implemented with **Zod**: one schema in `src/game/deck.ts` both validates the JSON and generates
the TypeScript types (`z.infer`), so the two cannot drift. The deck is parsed once at startup;
content rules about balance (e.g. enough cards with a moral edge) live in the deck tests rather
than the schema. Zod will also validate saved data from `localStorage` (ADR-007).

Uses the tree-shakable **`zod/mini`** build rather than classic `zod`: schemas are composed with
functions (`z.string().check(z.trim(), z.minLength(1))`) instead of chained methods, which let
the bundler drop unused validators. This cut the main bundle from 101.9 kB to 84.8 kB gzipped
(−17%) with no behaviour change; the existing schema tests passed unmodified.
**Rejected:** hand-written type guards (duplicated types, easy to get out of sync); JSON Schema
(needs a separate type generator step).

## ADR-009 — Result image: `html-to-image`, downloaded as a PNG

**Status:** Accepted

The SAVE IMAGE button renders the results card to PNG in the browser and downloads it.

- `html-to-image` is **loaded on demand** (dynamic `import()`), so it is a separate ~13 kB
  chunk that only players who save their result download.
- The capture target is a padded wrapper around the card, because the pixel border is drawn
  with `box-shadow` outside the element's box and would otherwise be clipped.
- The download helper takes its browser APIs (`document`, `URL`) as an injectable
  environment so it is unit-tested, and always releases the object URL, even on failure.
- **Download only, no share sheet.** An earlier version opened the Web Share API where
  supported. It was removed: the button says "save", so it should always save, with the same
  behaviour on every device. Players can share the file however they like.

**Rejected:** `html2canvas` (heavier, less accurate CSS support); server-side rendering of the
image (would need a backend, see ADR-002); Web Share API (see above).

## ADR-010 — Styling: Tailwind CSS v4 with a pixel-art theme layer

**Status:** Accepted

Tailwind keeps styling co-located with components and constrains everything to a shared scale.
The Jevil pixel look is defined **once** as a theme, not repeated ad hoc in class strings:

- **Design tokens** in the CSS-first `@theme` block: the Jevil palette (purple/violet base,
  yellow and teal accents), a spacing scale on a pixel grid, and the pixel font.
- **Custom utilities** (`@utility`) for pixel primitives: stepped "pixel borders" built from
  `box-shadow`, `image-rendering: pixelated` for sprites, and `steps()` animations for
  sprite-sheet motion.
- **No rounded corners / soft shadows** — the theme resets `rounded-*` and blur shadows so
  off-theme styles can't slip in.
- Repeated compositions become React components (`<PixelPanel>`, `<PixelButton>`), not
  `@apply` chains.
- Pixel font is **self-hosted** so it works offline.

**Rejected:** CSS Modules (fine, but no shared scale/tokens enforced by default); CSS-in-JS
(runtime styling cost and an extra dependency for no benefit here).

## ADR-011 — Quality tooling

**Status:** Accepted

- **Bun** as package manager and script runner — much faster installs, a single text lockfile
  (`bun.lock`), version pinned via `packageManager`. Vite and Vitest still run the build and
  tests, so the toolchain is standard.
- **Vitest + React Testing Library** (jsdom) — reducer, scoring, persistence, deck validation, key
  flows. Test functions are imported explicitly rather than used as globals.
- **oxlint** — the linter the current Vite React template ships with. It is Rust-based and far
  faster than ESLint, with built-in React, hooks, TypeScript, jsx-a11y and import rules.
  Warnings fail CI (`--deny-warnings`).
- **Prettier** (+ Tailwind class sorting) for formatting; `.gitattributes` and
  `.editorconfig` enforce LF line endings across Windows and Linux.
- **TypeScript** in strict mode with `noUncheckedIndexedAccess` (array/record lookups may be
  `undefined`, which matters for card decks).
- **GitHub Actions** — format, lint, typecheck, test and build on every PR into `develop` or
  `main`.
- **Deploy** to GitHub Pages from `main`. The base path comes from `BASE_PATH` so the same
  build works at a domain root or under `/<repo>/`.

**Rejected:** ESLint (slower, more config and plugins to keep in sync); npm (slower installs,
no real benefit here).

## ADR-012 — Accessibility

**Status:** Proposed

Full keyboard play (A/B hotkeys), visible focus, `aria-live` for Jevil's reactions,
`prefers-reduced-motion` respected for shakes/carousel effects, sufficient contrast on the
purple palette.

## ADR-013 — Intellectual property

**Status:** Proposed

Jevil and Deltarune belong to Toby Fox. This is a non-commercial fan project: use **original
pixel art inspired by** the character, no ripped sprites/music, and a clear fan-project
disclaimer in the README. Card text should be our own wording rather than a verbatim copy of
the commercial deck.
