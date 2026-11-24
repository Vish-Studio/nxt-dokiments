import "server-only";

import { ApiError } from "@/lib/api/errors";
import { hasPushConfig } from "@/lib/push/config";
import { pushNotificationsEnabled } from "@/lib/push/feature-flag";

/**
 * Call first in every push route. While the feature flag is off the routes
 * answer 404, as if they did not exist; when the VAPID keys are missing they
 * answer 503 with a user-safe message instead of an opaque provider failure.
 */
export const assertPushNotificationsAvailable = (): void => {
  if (!pushNotificationsEnabled) {
    throw new ApiError(404, "Not found.");
  }

  if (!hasPushConfig()) {
    throw new ApiError(503, "Push notifications are not available right now.");
  }
};
