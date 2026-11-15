import { z } from "zod";

import { ApiError, handleApiError } from "@/lib/api/errors";
import { parseBody } from "@/lib/api/validate";
import { MAX_UNANSWERED_LENGTH } from "@/lib/chatbot/unanswered";
import { logUnansweredQuestion } from "@/lib/firebase/server-chatbot";
import { hasServerFirebaseConfig } from "@/lib/firebase/server-config";

const UnansweredQuestionSchema = z.object({
  message: z.string().trim().min(1).max(MAX_UNANSWERED_LENGTH),
  path: z.string().startsWith("/").max(512),
});

/**
 * `POST /api/chatbot/unanswered`
 *
 * Records a question the chatbot could not match, so the rules can grow from what
 * people actually ask. Public, like `POST /api/newsletter`, because most questions
 * come from visitors who are not signed in. Nothing identifying is stored: no
 * user, and the message has emails and long numbers redacted.
 *
 * @returns Status `204` once stored.
 * @returns `{ error: string }` with status `400` when the body is malformed.
 * @returns `{ error: string }` with status `503` when Firestore is not configured
 *   or could not be reached.
 */
export const POST = async (request: Request): Promise<Response> => {
  try {
    if (!hasServerFirebaseConfig()) {
      throw new ApiError(503, "Question logging is not available right now.");
    }

    const question = await parseBody(request, UnansweredQuestionSchema);
    await logUnansweredQuestion(question);

    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
};
