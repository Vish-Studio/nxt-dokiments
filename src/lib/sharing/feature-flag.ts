/**
 * Master switch for document sharing. Off unless `NEXT_PUBLIC_DOCUMENT_SHARING_ENABLED`
 * is exactly `"true"`, so every sharing story can ship dark and be switched on
 * together once the end-to-end flow is complete.
 *
 * Like `NEXT_PUBLIC_DISABLE_TIER_LOCKS`, this is inlined into the client bundle at
 * build time, so flipping it needs a rebuild + redeploy, not just an env change.
 * Server routes and client components read the same constant, so they cannot
 * disagree.
 */
export const documentSharingEnabled =
  process.env.NEXT_PUBLIC_DOCUMENT_SHARING_ENABLED === "true";
