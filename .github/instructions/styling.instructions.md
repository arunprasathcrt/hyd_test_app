---
applyTo: "app/styles/**,tailwind.config.ts,app/shared/components/ui/**"
description: "Design tokens, Tailwind config, and shadcn styling rules"
---

# Styling guidelines

## Tokens come from the prototype, not from shadcn

The V63 prototype ships a complete design system (UTDS v1.0) as CSS custom
properties: surfaces, borders, text ramps, the accent palette, segment colors,
role colors, order-status colors, tier colors, shadows, radii, motion easings
and durations.

Port these **verbatim** into `app/styles/tokens.css` and map them in
`tailwind.config.ts` under `theme.extend`. Do not substitute shadcn or Tailwind
defaults for a token the prototype already defines.

## shadcn/ui is a component library, not a design system

Use its primitives — Button, Sheet, Dialog, Popover, Command, Table — for
behavior, focus management, and accessibility. Restyle them to prototype tokens.
A shadcn component still wearing slate/zinc/neutral defaults is a rewrite.

## Standing rulings

- Primary CTAs are charcoal `#1A1A1A`. No teal or gold primaries (V44/V50).
- The AA-safe deep gold is an accent only, never a primary.
- Selection controls, checkboxes, sliders, and inputs follow the charcoal system.
- `focus-visible` rings on every interactive control.
- Overlays lock body scroll and manage focus with `aria-modal`.
- Queue rows carry 96px art tiles.

## Immediate rewrites

- Colors swapped to shadcn defaults when the prototype defines its own
- Border radius changed from the prototype scale
- Font family swapped
- Spacing scale changed
- A hardcoded hex in a component when a token exists

## Tailwind

- Classes only. No CSS-in-JS, no styled-components.
- Inline `style` is allowed only for genuinely dynamic values — computed pin
  coordinates on the presentation canvas, measured sticky offsets.
- Prefer semantic token classes (`bg-surface`, `text-ink-2`) over raw palette
  classes so a token change propagates.

## Responsive

Mobile responsiveness is a later sprint, but do not paint into a corner:
44px touch targets on phone and tablet widths, no fixed pixel widths on
containers, tables scroll inside their card rather than crushing a column.
