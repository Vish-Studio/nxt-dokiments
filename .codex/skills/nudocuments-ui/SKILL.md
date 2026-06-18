---
name: nudocuments-ui
description: Use when modifying NuDocuments frontend UI, dashboard shell, marketing components, or reusable components in this repo. Enforces component-folder structure, Storybook coverage, design-token usage, and consistent spacing.
---

# NuDocuments UI

When working in this repo:

- Reuse existing custom components before adding markup.
- New UI must live in `src/components/[component-name]/[component-file].tsx`.
- Every new component must include a colocated story in `src/components/[component-name]/stories/[component-name].stories.tsx`.
- If a UI area contains a distinct reusable subpart, create it as its own component with its own story instead of embedding the markup inline.
- Components must be written as arrow-function components. Route page files may use Next.js page conventions.
- Shared app UI state belongs in `src/stores/ui-store.ts`. Only store state that must be known across distant component hierarchy; prefer props or local React state for nearby ownership.
- Marketing website components belong under `src/components/website`.
- Main app shell pieces should stay separated: `app-shell`, `sidebar`, `topbar`, and `content-container`. Do not prefix these component names with `dashboard`.
- Use the global `dropdown` component for dropdown UI. Dropdowns must close when clicking outside and on Escape.
- The topbar user menu lives in `user-dropdown`; do not show the user email in the topbar trigger.
- The topbar lives on the dark app background above the white main content panel and aligns with the sidebar logo row.
- The topbar shows only the page title plus right-side actions. Personalized page copy such as `Hello, Anthony!` belongs in the page content inside the white panel.
- When the desktop sidebar is collapsed, clicking the logo expands it. Do not show a duplicate sidebar toggle icon in the collapsed sidebar.
- Keep collapsed sidebar logo and nav icons aligned on the same vertical centerline.
- Sidebar bottom controls are separate components: `theme-toggle` above `settings-nav-item`.
- Keep spacing consistent by sharing the same gutters between related areas. The white main content panel owns the topbar and body spacing.
- On mobile and tablet, the main content panel must take the full viewport height and width. The topbar stays fixed/sticky and exposes a navigation toggle beside the title that opens the sidebar as an off-canvas mobile nav.
- Use Tailwind tokens and DaisyUI classes from `src/app/globals.css`; avoid hardcoded colors and arbitrary spacing unless the existing design tokens cannot express the layout.
- For palette variations, adjust or use semantic tokens such as `app-chrome`, `app-panel`, `app-muted`, and `app-control` in `src/app/globals.css` instead of replacing component classes with raw palette names.
- The default dashboard palette is `classic`: Nox Noir shell, Golden Harvest active states, and a white content panel. Palette choices are app-level UI state in `src/stores/ui-store.ts` and are controlled from the Settings page General section.
- Use Phosphor icons for dashboard/navigation controls.
- Verify with `npm run lint`, `npx tsc --noEmit`, Storybook tests where affected, and a browser screenshot for layout changes.
