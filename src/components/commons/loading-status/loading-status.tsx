export type LoadingStatusProps = {
  message: string;
};

/**
 * Visually-hidden `role="status"` announcement for a loading skeleton.
 * The shimmer itself is `aria-hidden` (decorative), so this is the one
 * signal screen readers get instead of parsing skeleton markup.
 */
export const LoadingStatus = ({ message }: LoadingStatusProps) => (
  <span
    className="sr-only"
    role="status"
  >
    {message}
  </span>
);
