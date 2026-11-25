/**
 * Hides most of an address, for logs and for telling a user which address an
 * invite was sent to without printing it in full.
 *
 * @example
 * maskEmail("jane@example.com"); // "j***@example.com"
 */
export const maskEmail = (email: string) => {
  const [local = "", domain = ""] = email.split("@");
  return `${local.slice(0, 1)}***@${domain}`;
};
