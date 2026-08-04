export type LoadingStatusProps = {
  message: string;
};

/**
 * Visually-hidden `role="status"` announcement for a loading skeleton.
 * The shimmer itself is `aria-hidden` (decorative), so this is the one
 * signal screen readers get instead of parsing skeleton markup.
 *
 * `aria-label` is required here, not just visible text content — `status` is
 * not on ARIA's "name from content" allowlist, so without it the element's
 * accessible name is empty and `getByRole("status", { name })` queries (and
 * real assistive tech) can't match it by message.
 */
export const LoadingStatus = ({ message }: LoadingStatusProps) => (
  <span
    aria-label={message}
    className="sr-only"
    role="status"
  >
    {message}
  </span>
);
