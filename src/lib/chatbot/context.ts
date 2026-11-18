export interface ChatContext {
  pathname: string;
  /** Mirrors `documentSharingEnabled`; injectable so tests can cover both. */
  sharingEnabled: boolean;
  signedIn: boolean;
}

/**
 * Pages where the widget would get in the way: the auth forms, where the visitor
 * is mid-task with one job to do, and the shared-document screen, where the
 * recipient is reading and signing.
 */
const HIDDEN_PATHS = [
  "/forgot-password",
  "/my-documents/shared",
  "/sign-in",
  "/sign-up",
];

const isUnder = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

export const isChatbotHidden = (pathname: string) =>
  HIDDEN_PATHS.some((path) => isUnder(pathname, path));

/**
 * The three "Get started" questions for where the user is. Visitors get the
 * questions people ask before signing up; signed-in users get the ones that fit
 * the page they are on.
 *
 * @returns Intent ids from `chatIntents`.
 */
export const getStarterIntentIds = ({
  pathname,
  sharingEnabled,
  signedIn,
}: ChatContext): string[] => {
  if (!signedIn) return ["about", "create-invoice", "plans"];

  if (isUnder(pathname, "/my-documents")) {
    return sharingEnabled
      ? ["sign-document", "download-pdf", "edit-document"]
      : ["download-pdf", "edit-document", "create-invoice"];
  }

  if (isUnder(pathname, "/marketplace") || isUnder(pathname, "/my-templates")) {
    return ["templates", "template-vs-document", "plans"];
  }

  if (isUnder(pathname, "/my-clients")) {
    return ["clients", "create-invoice", "create-quotation"];
  }

  if (isUnder(pathname, "/subscription")) {
    return ["plans", "templates", "contact"];
  }

  if (isUnder(pathname, "/settings")) {
    return ["account", "privacy", "contact"];
  }

  return [
    "create-invoice",
    sharingEnabled ? "sign-document" : "download-pdf",
    "templates",
  ];
};
