---
name: Dark theme CSS-variable scope
description: Why the dark class must be on <html>, not just on AppLayout's div
---

## The rule
Always put `class="dark"` on `<html lang="en" class="dark">` in `index.html`.

## Why
CSS custom properties cascade DOWN from parent to child. If `.dark` is only on AppLayout's inner `<div>`, three things break:
1. `body { background-color: var(--background) }` resolves using `:root` (LIGHT) values — body stays white.
2. React portals (modals, toasts, SweetAlert) render as direct children of `<body>`, outside `.dark`, so they also get light variable values.
3. Pages that override the AppLayout background (e.g. `min-h-screen bg-gray-50`) can "escape" the dark context visually.

## How to apply
- `index.html`: `<html lang="en" class="dark">`
- `index.html` body: add inline `style="background-color:oklch(0.16 0.035 240);color:oklch(0.98 0.008 210)"` as a flash-of-white guard.
- Also add `html.dark { color-scheme: dark; }` and `html.dark body { background-color: var(--background) !important; }` in index.css.
- AppLayout's `.dark` class on the inner div is now redundant but harmless — keep as a safety fallback.
