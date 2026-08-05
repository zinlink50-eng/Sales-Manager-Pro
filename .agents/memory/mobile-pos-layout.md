---
name: Mobile POS Layout
description: How the POS product grid and UI behaves across breakpoints
---

## Product Grid Breakpoints
- `< sm (640px)`: Single-column horizontal cards. 72×72 image left, name+price+stock middle, 48×48 add button right. When in cart: shows –/qty/+ inline.
- `sm – lg (640–1024px)`: 2-column vertical grid with `aspect-square` images.
- `lg+ (1024px+)`: 3-column vertical grid.

**Why:** Mobile POS cashiers need large, clear tap targets. Single-column makes each product prominent; 48×48 buttons are safely above the 44px touch target minimum.

## Modals / Dialogs on mobile
All Dialogs that contain forms use these classes for mobile fullscreen:
```
max-sm:fixed max-sm:inset-0 max-sm:w-full max-sm:h-full max-sm:max-w-none
max-sm:max-h-none max-sm:rounded-none max-sm:[transform:none] max-sm:border-0
```

## Bottom Nav
- Height: 68px (`h-[68px]`) with `padding-bottom: env(safe-area-inset-bottom)`
- Active state: pill background `bg-primary/10` + `h-6 w-6` icon (inactive: `h-5 w-5`)
- Max 5 tabs (role-filtered) + logout icon at far right
- Hidden on desktop (`lg:hidden`)
