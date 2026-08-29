/**
 * Runs once per server instance, before the server accepts requests.
 *
 * Next calls `register` in every runtime and bundles this file for each, so
 * Node-specific setup lives in a separate module pulled in by a dynamic import.
 * Inlining it here fails the build: Turbopack flags the `node:net` import for the
 * Edge bundle even when it sits behind a `NEXT_RUNTIME` check, since it can't
 * statically prove the branch is unreachable.
 */
export const register = async () => {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation-node");
  }
};
