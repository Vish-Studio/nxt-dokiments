import { QueryClient } from "@tanstack/react-query";

/**
 * Creates a `QueryClient` for Storybook stories: retries disabled so a failed
 * fetch (e.g. no server running under Storybook) surfaces immediately instead
 * of retrying and timing out `play` functions.
 *
 * Stories still need to wrap their component in a `QueryClientProvider` using
 * this client, and typically mock `window.fetch` to return fixture data —
 * see `my-templates-view.stories.tsx` for the pattern.
 */
export const makeStoryQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
