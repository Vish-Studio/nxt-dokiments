/**
 * Serves a production build of the app on an HTTPS URL so a phone can reach it.
 *
 * iOS only allows service workers and push notifications on HTTPS, and a phone
 * cannot reach `localhost`, so this builds, starts `next start`, and opens a
 * Cloudflare quick tunnel to it. Open the `https://….trycloudflare.com` URL the
 * tunnel prints in Safari on the phone. See `docs/push-notifications.md`.
 *
 * Plain Node (no TypeScript step) so it runs straight from `npm run start:phone`.
 * Pass `--skip-build` to reuse the existing `.next` build. The URL changes on
 * every run, and a new URL is a new origin, so the phone must reinstall and
 * resubscribe each time.
 */
import { spawn, spawnSync } from "node:child_process";

const PORT = process.env.PORT ?? "3000";

if (!process.argv.includes("--skip-build")) {
  const build = spawnSync("npx", ["next", "build"], { stdio: "inherit" });

  if (build.status !== 0) process.exit(build.status ?? 1);
}

const children = [
  spawn("npx", ["next", "start", "-p", PORT], { stdio: "inherit" }),
  spawn("npx", ["cloudflared", "tunnel", "--url", `http://localhost:${PORT}`], {
    stdio: "inherit",
  }),
];

const stop = () => {
  for (const child of children) child.kill("SIGTERM");
};

process.on("SIGINT", stop);
process.on("SIGTERM", stop);

// If either process dies, take the other down instead of leaving it orphaned.
for (const child of children) {
  child.on("exit", (code) => {
    stop();
    process.exit(code ?? 0);
  });
}
