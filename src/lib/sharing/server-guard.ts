import "server-only";

import { ApiError } from "@/lib/api/errors";
import { documentSharingEnabled } from "@/lib/sharing/feature-flag";
import type { ShareErrorCode } from "@/types/sharing";

/** HTTP status and user-safe message for each sharing error code. */
export const shareErrorDefinitions: Record<
  ShareErrorCode,
  { message: string; status: number }
> = {
  DOCUMENT_LOCKED: {
    message: "This document has been signed and can no longer be changed.",
    status: 409,
  },
  NOT_A_RECIPIENT: {
    message: "You do not have access to this shared document.",
    status: 404,
  },
  SHARE_ALREADY_WITH_ANOTHER: {
    message:
      "This document is already shared with someone else. Sharing with more than one person is not available yet.",
    status: 409,
  },
  SHARE_LIMIT_REACHED: {
    message: "You have reached the sharing limit for your plan.",
    status: 403,
  },
  SHARE_NOT_SIGNABLE: {
    message:
      "This type of document has no recipient signature, so it cannot be shared for signing.",
    status: 400,
  },
  SHARE_SELF_NOT_ALLOWED: {
    message: "You cannot share a document with yourself.",
    status: 400,
  },
};

/** Builds the `ApiError` a route should throw for a sharing refusal. */
export const shareApiError = (code: ShareErrorCode): ApiError => {
  const { message, status } = shareErrorDefinitions[code];
  return new ApiError(status, message);
};

/**
 * Call first in every sharing route. While the feature flag is off the routes
 * answer 404, exactly as if they did not exist.
 */
export const assertDocumentSharingEnabled = (): void => {
  if (!documentSharingEnabled) {
    throw new ApiError(404, "Not found.");
  }
};
