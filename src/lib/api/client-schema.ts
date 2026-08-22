import "server-only";

import { z } from "zod";

/**
 * Zod schemas for the `/api/clients` routes.
 *
 * Kept in one module rather than inline in each `route.ts` (as `documents` does with
 * its small `ValuesSchema`) because both the create and update routes need the same
 * seven fields, and a `route.ts` may only export HTTP handlers and route segment
 * config — Next.js type-checks route exports, so the collection route can't share
 * the schema with the `[clientId]` route by exporting it.
 */

/**
 * Ceiling for `address`. Generous for a street address — exists to stop a
 * deliberately oversized payload (e.g. a direct Postman request) from being
 * written, not to constrain legitimate use.
 */
const MAX_ADDRESS = 500;

/** Ceiling for `email` — the RFC 5321 address limit. */
const MAX_EMAIL = 254;

/** Ceiling for `brn` and `nationalId`. Generous for an identifier string. */
const MAX_IDENTIFIER = 100;

/** Ceiling for `name` and `companyName`. Generous for a person or company name. */
const MAX_NAME = 200;

/** Ceiling for `phone`. Generous enough for any formatting/country-code punctuation. */
const MAX_PHONE = 50;

/** An optional free-text field: absent or empty both normalise to `""`, so every
 * stored client has the same shape and readers never have to handle `undefined`. */
const optionalText = (max: number) => z.string().trim().max(max).default("");

/**
 * A complete client record, as `POST /api/clients` requires.
 *
 * Mirrors what `ClientForm` enforces in the browser: `name`, `companyName`, `email`
 * and `phone` are required; `address`, `brn` and `nationalId` are optional.
 * Re-validated server-side because a request body is untrusted regardless of
 * whether the caller is authenticated.
 */
export const ClientSchema = z.object({
  address: optionalText(MAX_ADDRESS),
  brn: optionalText(MAX_IDENTIFIER),
  companyName: z.string().trim().min(1).max(MAX_NAME),
  email: z.string().trim().email().max(MAX_EMAIL),
  name: z.string().trim().min(1).max(MAX_NAME),
  nationalId: optionalText(MAX_IDENTIFIER),
  phone: z.string().trim().min(1).max(MAX_PHONE),
});

/**
 * A partial update, as `PATCH /api/clients/:clientId` accepts.
 *
 * `.partial()` is applied to a variant without `.default("")` on the optional
 * fields — a default would make those keys always present, so every `PATCH` would
 * silently blank `address`/`brn`/`nationalId` instead of leaving them untouched.
 * At least one field must be present, so an empty body is a `400` rather than a
 * write that only bumps `updatedAt`.
 */
export const UpdateClientSchema = z
  .object({
    address: z.string().trim().max(MAX_ADDRESS),
    brn: z.string().trim().max(MAX_IDENTIFIER),
    companyName: z.string().trim().min(1).max(MAX_NAME),
    email: z.string().trim().email().max(MAX_EMAIL),
    name: z.string().trim().min(1).max(MAX_NAME),
    nationalId: z.string().trim().max(MAX_IDENTIFIER),
    phone: z.string().trim().min(1).max(MAX_PHONE),
  })
  .partial()
  .refine(
    (patch) => Object.values(patch).some((value) => value !== undefined),
    {
      message: "Provide at least one field to update.",
    },
  );
