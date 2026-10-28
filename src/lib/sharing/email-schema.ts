import { z } from "zod";

/** The longest address the share route accepts. */
export const MAX_SHARE_EMAIL_LENGTH = 254;

/** What counts as a shareable email address, for the dialog and the route alike. */
export const shareEmailSchema = z
  .string()
  .trim()
  .max(MAX_SHARE_EMAIL_LENGTH)
  .pipe(z.email());
