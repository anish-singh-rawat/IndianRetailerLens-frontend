---
name: Tailwind v4 dark override approach
description: How to reliably override Tailwind utility classes for dark mode in Tailwind v4
---

## The rule
Use a combination of class selectors AND attribute selectors to catch ALL bg-white/gray variants.

## Why
In Tailwind v4, `bg-white/50` generates a CSS class named `.bg-white\/50` — a DIFFERENT class from `.bg-white`. Standard `.dark .bg-white` selector does NOT match it. You need `[class*="bg-white"]` attribute selector.

Cascade priority in Tailwind v4 (unlayered CSS wins over @layer utilities without !important):
- Unlayered `!important` > any `@layer` with `!important` (reversed — unlayered is LOWEST among !important)
- Unlayered (no !important) > `@layer utilities` (no !important) ← This order is what we rely on

Since Tailwind utilities have NO `!important`, our unlayered rules beat them even without `!important`.
But adding `!important` to unlayered rules is still safe and correct here since Tailwind utilities also have no `!important`.

## How to apply (in index.css, OUTSIDE any @layer)
```css
/* Catch standard class */
.dark .bg-white { background: color-mix(in oklab, var(--card) 72%, transparent) !important; }

/* Catch opacity variants like bg-white/50, bg-gray-50/30 */
.dark [class*="bg-white"] { background: color-mix(in oklab, var(--card) 72%, transparent) !important; }
.dark [class*="bg-gray-50/"] { background: color-mix(in oklab, var(--card) 38%, transparent) !important; }
```

WARNING: `[class*="bg-gray-5"]` is TOO BROAD — matches bg-gray-500 (intentionally dark).
Use `[class*="bg-gray-50/"]` (with slash) to only catch opacity variants of bg-gray-50.

## Arbitrary colors (bg-[#f7f8fa])
Escape brackets: `.dark .bg-\[\#f7f8fa\] { background: transparent !important; }`

## Toggle thumbs
Never use `bg-white` on UI toggle thumbs — the override makes them dark glass.
Use inline `style={{ background: "oklch(0.96 0.005 220)" }}` for a near-white color that bypasses CSS overrides.

## Shared style variables (JS string patterns)
Shared CSS class strings like `const inp = "w-full bg-white border ..."` are best replaced with CSS utility classes:
- Create `.glass-card`, `.dark-input` in index.css (unlayered) for reuse across files.
- Replace the JS string: `const inp = "dark-input px-3.5 py-2.5"`.
