import "server-only";

import { z } from "zod";

import { MAX_PUSH_DEVICE_LABEL, MAX_PUSH_ENDPOINT } from "@/types/push";

/**
 * Zod schemas for `/api/push/subscriptions`. In their own module because a
 * `route.ts` may only export HTTP handlers, so a schema declared there could
 * not be tested.
 */

/**
 * Push services are always HTTPS. Requiring it stops a crafted endpoint from
 * making the server send requests to an arbitrary plain-HTTP address.
 */
const endpoint = z
  .string()
  .trim()
  .max(MAX_PUSH_ENDPOINT)
  .refine((value) => {
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  });

/** A browser subscription to store for the signed-in user. */
export const SubscribePushSchema = z.object({
  deviceLabel: z.string().trim().max(MAX_PUSH_DEVICE_LABEL).optional(),
  endpoint,
  keys: z.object({
    auth: z.string().trim().min(1).max(256),
    p256dh: z.string().trim().min(1).max(256),
  }),
});

/** Identifies the device subscription to remove. */
export const UnsubscribePushSchema = z.object({ endpoint });
