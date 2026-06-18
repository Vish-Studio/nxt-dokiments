---
name: nudocuments-ui
description: Use when modifying NuDocuments frontend UI, dashboard shell, marketing components, or reusable components in this repo. Enforces component-folder structure, Storybook coverage, design-token usage, and consistent spacing.
---

# NuDocuments UI

When working in this repo:

- Reuse existing custom components before adding markup.
- New UI must live in `src/components/[component-name]/[component-file].tsx`.
- Every new component must include a colocated story in `src/components/[component-name]/stories/[component-name].stories.tsx`.
- Marketing website components belong under `src/components/website`.
- Main app shell pieces should stay separated: `app-shell`, `sidebar`, `topbar`, and `content-container`. Do not prefix these component names with `dashboard`.
- Keep spacing consistent by sharing the same gutters between related areas. The white main content panel owns the topbar and body spacing.
- On mobile and tablet, the main content panel must take the full viewport height and width. The topbar stays fixed/sticky and exposes a navigation toggle beside the title that opens the sidebar as an off-canvas mobile nav.
- Use Tailwind tokens and DaisyUI classes from `src/app/globals.css`; avoid hardcoded colors and arbitrary spacing unless the existing design tokens cannot express the layout.
- Use Phosphor icons for dashboard/navigation controls.
- Verify with `npm run lint`, `npx tsc --noEmit`, Storybook tests where affected, and a browser screenshot for layout changes.
