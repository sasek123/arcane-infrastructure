# Arcane Infrastructure — Design System

> Synthesized from three brand identity explorations (v1 Signal, v2 Greyscale, v3 Parchment).
> This is the single source of truth for all design decisions in this project.

---

## Brand Architecture

```
Arcane (Parent)
├── Arcane Equity
└── Arcane Infrastructure  ← this project
```

- **Entity:** Arcane Infrastructure — AI agency / AI systems integrator
- **Geography:** Slovakia · Austria · Czech Republic (Bratislava – Vienna – Prague)
- **Positioning:** "We make legacy businesses think like the future"
- **Voice:** Discrete by design, decisive by nature. Patient, precise, two steps ahead.

---

## Brand Direction Options

Three identity systems were explored. Key differences:

| Aspect | V1 — Signal | V2 — Greyscale | V3 — Parchment |
|--------|-------------|----------------|-----------------|
| **Display Font** | Space Grotesk 700 | DM Sans 200 | Syne 800 |
| **Mono Font** | Space Mono | DM Mono | Space Mono |
| **Accent** | `#C8FF00` (neon lime) | None (pure greyscale) | `#E8E0D0` (warm parchment) |
| **Wordmark Style** | `ARCANE` (highlighted A) | `Arcane` (title case) | `ARCANE` (uppercase) |
| **Weight Feel** | Bold, tech-forward | Ultra-light, luxury | Heavy, authoritative |
| **Dept Tag Style** | Light weight below | Mono tracked below | Mono + line prefix |

### Reference files
- `brand/v1-signal-accent.html` — Neon accent, Space Grotesk
- `brand/v2-greyscale.html` — Pure greyscale, DM Sans ultralight
- `brand/v3-parchment.html` — Warm accent, Syne heavy

---

## Shared Brand Constants (all versions agree)

### Identity Rules
- "Arcane" is always the dominant element — never abbreviated (no AE, AI, Arc)
- Department name always subordinate to parent: smaller, lighter, below
- Never mix Equity and Infrastructure identities in a single asset
- Icon mark: single "A" in bordered square/rounded rect

### Color Foundation
- **Void:** `#060606` – `#0A0A0A` (primary dark background)
- **Onyx:** `#111111` – `#1A1A1A` (card/surface background)
- **Carbon:** `#1A1A1A` – `#1E1E1E` (elevated surface)
- **Slate:** `#444444` – `#555555` (muted text, metadata)
- **Silver:** `#888888` – `#999999` (secondary text)
- **Bone:** `#EDEDEA` – `#F5F4F0` (light mode background / text on dark)
- **Border:** `rgba(255,255,255, 0.06–0.08)` (subtle separation)
- **Border Mid:** `rgba(255,255,255, 0.11–0.13)` (interactive borders)

### Typography Constants
- Display: large, tight letter-spacing (negative tracking)
- Body: 300–400 weight, 1.7–1.75 line-height, 45–60% opacity
- Labels/Meta: monospace, 7–10px, 0.15–0.28em tracking, uppercase
- Google Fonts only — no system fonts

### Layout & Spacing
- Generous whitespace — always
- Cards: `border-radius: 8–12px`, `border: 1px solid` with low-opacity white
- Sections numbered: `01 —`, `02 —`, etc.
- Section labels: mono, uppercase, tracked, accent color

### Restrictions (all versions)
- No gradients
- No drop shadows
- No glows or texture fills
- No stretching, tilting, or recoloring the wordmark
- Accent color never on white/light backgrounds
- Accent used sparingly — tags, line marks, CTAs only

---

## Application Patterns

### Navigation
- Logo left (wordmark + dept tag below)
- Links center (mono or sans, 8–11px, muted)
- CTA right (filled button, accent or bone)
- Border-bottom separator

### Hero Section
- Eyebrow: mono, uppercase, tracked, accent color, often with line prefix
- Headline: display weight, 30–50px, tight tracking
- Subtext: 11–13px, 30–45% opacity, max-width ~300px
- CTA row: primary (filled) + ghost (bordered)
- Optional: stats column, ghost background text

### Business Cards
- Dark background (`void`)
- Subtle border (`border-mid`)
- Logo top-left, dept tag below with line prefix
- Name + role + email bottom-left
- Decorative circles or corner arcs

### Email Signatures
- Dark card with border
- Name + role top
- Divider
- Logo lockup: icon mark + wordmark + dept tag
- Contact info in mono, very muted

---

## File Reference Paths (from brand source HTML)

```
brand/v1-signal-accent.html   → Space Grotesk + #C8FF00
brand/v2-greyscale.html       → DM Sans + pure greyscale
brand/v3-parchment.html       → Syne + #E8E0D0
```

---

*Last updated: March 2026*
