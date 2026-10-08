import type { Preview } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "../src/components/commons/toaster/toaster";
import { makeStoryQueryClient } from "../src/lib/query/story-query-client";
import { useToastStore } from "../src/stores/toast-store";

import "../src/app/globals.css";

/**
 * Pin stories to the application's daisyUI theme.
 *
 * `@plugin "daisyui"` in `globals.css` takes no theme list, so daisyUI also emits
 * its built-in `dark` theme behind `@media (prefers-color-scheme: dark)`. That rule
 * targets `:root`, exactly like the custom `dokiments` theme's `default: true`
 * block, and comes later in the stylesheet — so on a machine set to dark mode it
 * won. `bg-base-200` rendered near-black instead of `#f6f6f6`, and every story
 * using theme tokens was quietly off. Anyone reviewing in light mode saw the
 * correct colours, which is why this went unnoticed.
 *
 * The application never had the problem: `src/app/layout.tsx` sets
 * `data-theme="dokiments"` on `<html>`, and `[data-theme="dokiments"]` outranks a
 * `:root` rule regardless of media query. This gives stories the same footing.
 *
 * Set on the document element rather than in a wrapping decorator so it also covers
 * anything a story renders outside its own subtree.
 */
if (typeof document !== "undefined") {
  document.documentElement.setAttribute("data-theme", "dokiments");
}

const preview: Preview = {
  decorators: [
    (Story, { parameters }) => (
      <QueryClientProvider client={makeStoryQueryClient()}>
        <Story />
        {/* Components confirm saves through the app shell's toaster; this stands
            in for it so their stories can assert on the toast. Stories that
            render their own set `parameters.toaster` to false. */}
        {parameters.toaster === false ? null : <Toaster />}
      </QueryClientProvider>
    ),
  ],
  beforeEach: () => {
    useToastStore.getState().clearToasts();
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
};

export default preview;
