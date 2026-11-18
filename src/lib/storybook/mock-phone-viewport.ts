import { phoneMediaQuery } from "@/hooks/use-media-query";

/**
 * Storybook `beforeEach` that makes {@link phoneMediaQuery} match, so a story
 * renders the phone variant (a bottom-sheet `Modal` instead of a popover or
 * centred modal) whatever the test runner's viewport is. Other queries still go to
 * the real `matchMedia`. Returns the cleanup that restores it.
 *
 * Story-only: never import it from application code.
 *
 * @example
 * export const OnPhone: Story = { beforeEach: mockPhoneViewport };
 */
export const mockPhoneViewport = () => {
  const realMatchMedia = window.matchMedia.bind(window);

  window.matchMedia = (query: string) =>
    query === phoneMediaQuery
      ? ({
          addEventListener: () => {},
          addListener: () => {},
          dispatchEvent: () => false,
          matches: true,
          media: query,
          onchange: null,
          removeEventListener: () => {},
          removeListener: () => {},
        } satisfies MediaQueryList)
      : realMatchMedia(query);

  return () => {
    window.matchMedia = realMatchMedia;
  };
};
