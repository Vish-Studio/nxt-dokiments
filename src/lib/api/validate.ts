import "server-only";

import type { z, ZodType } from "zod";

import { ApiError } from "@/lib/api/errors";

/**
 * Parses a `Request`'s JSON body against a Zod schema, throwing a sanitized
 * `ApiError(400)` on malformed JSON or a schema mismatch.
 *
 * Every route that accepts a body should validate it here before touching
 * Firestore — request bodies are untrusted input regardless of whether the
 * caller is authenticated (see: hitting an endpoint directly via Postman).
 * Validation failure details are logged server-side only; the client only
 * ever sees a generic "invalid request" message.
 *
 * Use this for JSON request bodies (`POST`, `PUT`, `PATCH`) and only once per
 * request, since `request.json()` consumes the body stream.
 *
 * @example
 * const bodySchema = z.object({
 *   title: z.string().min(1),
 *   content: z.string().min(1),
 * });
 *
 * export const POST = withSession(async (request, _context, session) => {
 *   const body = await parseBody(request, bodySchema);
 *   return Response.json({ ownerId: session.user.id, title: body.title });
 * });
 *
 * @param request - The incoming request whose JSON body should be validated.
 * @param schema - Zod schema describing the expected body shape.
 * @returns The parsed, typed body on success.
 * @throws {ApiError} 400 when the body is not valid JSON or fails the schema.
 */
export const parseBody = async <TSchema extends ZodType>(
  request: Request,
  schema: TSchema,
): Promise<z.infer<TSchema>> => {
  const json = await request.json().catch(() => null);

  if (json === null) {
    throw new ApiError(400, "Request body must be valid JSON.");
  }

  const result = schema.safeParse(json);

  if (!result.success) {
    console.error("Request body validation failed:", result.error.issues);
    throw new ApiError(400, "Invalid request body.");
  }

  return result.data;
};

/**
 * Parses a `URLSearchParams`-like object against a Zod schema, throwing a
 * sanitized `ApiError(400)` on a schema mismatch. Intended for query-string
 * validation (e.g. `?styleId=classic&tier=free`) on `GET` routes.
 *
 * Use this for URL query parameters only; it does not read request bodies.
 *
 * @example
 * const querySchema = z.object({
 *   styleId: z.string().min(1),
 *   page: z.coerce.number().int().min(1).default(1),
 * });
 *
 * export const GET = withSession(async (request) => {
 *   const params = new URL(request.url).searchParams;
 *   const query = parseQuery(params, querySchema);
 *   return Response.json({ styleId: query.styleId, page: query.page });
 * });
 *
 * @param params - Query parameters, typically from `new URL(request.url).searchParams`.
 * @param schema - Zod schema describing the expected query shape.
 * @returns The parsed, typed query on success.
 * @throws {ApiError} 400 when the query fails the schema.
 */
export const parseQuery = <TSchema extends ZodType>(
  params: URLSearchParams,
  schema: TSchema,
): z.infer<TSchema> => {
  const result = schema.safeParse(Object.fromEntries(params));

  if (!result.success) {
    console.error("Query parameter validation failed:", result.error.issues);
    throw new ApiError(400, "Invalid query parameters.");
  }

  return result.data;
};
