import type { Preview } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";

import { makeStoryQueryClient } from "../src/lib/query/story-query-client";

import "../src/app/globals.css";

const preview: Preview = {
  decorators: [
    (Story) => (
      <QueryClientProvider client={makeStoryQueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
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
