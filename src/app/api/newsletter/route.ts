import { z } from "zod";

import { ApiError, handleApiError } from "@/lib/api/errors";
import { parseBody } from "@/lib/api/validate";
import { hasServerFirebaseConfig } from "@/lib/firebase/server-config";
import { subscribeToNewsletter } from "@/lib/firebase/server-newsletter";

const NewsletterSubscriptionSchema = z.object({
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
});

/**
 * `POST /api/newsletter`
 *
 * Stores a public newsletter subscription in Firestore. The email is
 * normalised and used only to derive a deterministic document ID server-side,
 * allowing repeated subscriptions to remain a single record.
 */
export const POST = async (request: Request): Promise<Response> => {
  try {
    if (!hasServerFirebaseConfig()) {
      throw new ApiError(503, "Newsletter subscriptions are not available right now.");
    }

    const { email } = await parseBody(request, NewsletterSubscriptionSchema);
    await subscribeToNewsletter(email);

    return Response.json({ status: "subscribed" });
  } catch (error) {
    return handleApiError(error);
  }
};
